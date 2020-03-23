<template>
	<div>
		<div class="error window half-width info" id="error-window" v-show='error'>
          {{error}}
        </div>

	    <total-balances/>

		<div class="window white" v-for='(currency, i) in Object.keys(allCurrencies)'>
		      <p class='text-center'>
		      	<router-link :to="currency" v-show="currency != 'susd'">{{currency == 'iearn' ? 'y' : currency}}.curve.fi</router-link>
		      	<a href='https://iearn.finance/pool' v-show="currency == 'susd'">susd</a>
		      </p>
		      <stats :pool= 'currency'/>
		      <balances-info 
			      :bal_info = 'bal_infos[currency]'
			      :total = 'totals[i]'
			      :l_info = 'l_infos[currency]'
			      :totalShare = 'totalShares[i]'
			      :fee = 'fees[i]'
			      :admin_fee = 'admin_fees[i]'
			      :pool = 'currency'
			      :currencies = 'allCurrencies[currency]'
			      />
	  	</div>
	</div>
</template>

<script>
	import Stats from '../Stats.vue'
	import BalancesInfo from '../BalancesInfo.vue'
	import Web3 from 'web3'
	import TotalBalances from './TotalBalances.vue'

    import { getters, contract as currentContract, allCurrencies } from '../../contract'
    import * as allabis from '../../allabis'
    let contracts = allabis.default;

	export default {
		metaInfo: {
	      title: 'Curve.fi - Stats',
	      meta: [
	      	{'property': 'og:url', 'content': 'https://curve.fi/combinedstats'},
	      	{'name': 'twitter:url', 'content': 'https://curve.fi/combinedstats'},
	      ]
	    },
		components: {
			Stats,
			BalancesInfo,
			TotalBalances,
		},
		data: () => ({
			contracts: [],
			web3contracts: {},
			all_coins: {},
			all_underlying_coins: {},
			all_c_rates: {},
			all_fees: {},
			totals: [],
			bal_infos: {},
			l_infos: {},
			totalShares: [],
			fees: [],
			admin_fees: [],
		}),
		created() {
            this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            })
            this.$watch(()=>currentContract.currentContract, val => {
            	if(currentContract.initializedContracts) this.mounted();
            })
        },
        computed: {
          allCurrencies() {
          	return Object.assign(allCurrencies, {
          		susd: {
          			susd: 'sUSD',
          			ycurve: 'yCurve'
          		}
          	})
          },
          error() {
          	return currentContract.error
          },
        },
        mounted() {
            if(currentContract.initializedContracts) this.mounted();
        },
		methods: {
			async mounted() {
				this.fees = Array.from(4).fill(0)
				this.admin_fees = Array.from(4).fill(0)
				this.admin_fees = Array.from(4).fill(0)
				this.admin_fees = Array.from(4).fill(0)
				await this.init_contracts();
				await this.update_fee_info();
			},
			poolLink(pool) {
				if(pool == 'iearn') return 'y'
				if(pool == 'susd') return 'https://iearn.finance/pool'
				return pool
			},
			async init_contracts() {
			    for(let [key, contract] of Object.entries(contracts)) {
			    	this.web3contracts[key] = {};
				    this.web3contracts[key].swap = new web3.eth.Contract(contract.swap_abi, contract.swap_address);
				    this.web3contracts[key].swap_token = new web3.eth.Contract(contract.ERC20_abi, contract.token_address);

			        this.all_coins[key] = {}
			        this.all_coins[key].coins = [];
			        this.all_underlying_coins[key] = {}
			        this.all_underlying_coins[key].underlying_coins = [];
				    for (let i = 0; i < contract.N_COINS; i++) {
				        var addr = await this.web3contracts[key].swap.methods.coins(i).call();

				        let cabi = ['iearn','busd', 'susd'].includes(key) ? contract.yERC20_abi : contract.cERC20_abi;
				        if(key == 'susd' && i == 1) {
				        	cabi = contracts.iearn.swap_abi;
				        	addr = contracts.iearn.swap_address
				        }
				        this.all_coins[key].coins[i] = new web3.eth.Contract(cabi, addr);
				        var underlying_addr = await this.web3contracts[key].swap.methods.underlying_coins(i).call();
				        this.all_underlying_coins[key].underlying_coins[i] = new web3.eth.Contract(contract.ERC20_abi, underlying_addr);
				    }
			    }
			},

			async update_rates() {
			    for(let [key, contract] of Object.entries(contracts)) {
			    	this.all_fees[key] = [];
			     	this.all_c_rates[key] = {}
			        this.all_c_rates[key].c_rates = [];

				    for (let i = 0; i < contract.N_COINS; i++) {
				        /*
				        rate: uint256 = cERC20(self.coins[i]).exchangeRateStored()
				        supply_rate: uint256 = cERC20(self.coins[i]).supplyRatePerBlock()
				        old_block: uint256 = cERC20(self.coins[i]).accrualBlockNumber()
				        rate += rate * supply_rate * (block.number - old_block) / 10 ** 18
				        */
			         	if (contract.tethered && contract.tethered[i] && contract.use_lending && !contract.use_lending[i]) {
			            	this.all_c_rates[key].c_rates[i] = 1 / contract.coin_precisions[i]
			         	}
			         	else {
			         		if(key == 'iearn' || key == 'busd' || (key == 'susd' && i == 0)) {
					            var rate = parseInt(await this.all_coins[key].coins[i].methods.getPricePerFullShare().call()) / 1e18 / contract.coin_precisions[i];
			            		this.all_c_rates[key].c_rates[i] = rate;
			         		}
			         		else if(key == 'susd' && i == 1) {
			         			var rate = +(await this.all_coins[key].coins[i].methods.get_virtual_price().call()) / 1e36;
			            		this.all_c_rates[key].c_rates[i] = rate;
			         		}
			         		else {     			
						        let values = await Promise.all([
						        	this.all_coins[key].coins[i].methods.exchangeRateStored().call(),
						        	this.all_coins[key].coins[i].methods.supplyRatePerBlock().call(),
						        	this.all_coins[key].coins[i].methods.accrualBlockNumber().call(),
						        	web3.eth.getBlockNumber(),
						        ])
						        let rate = +values[0] / 1e18 / contract.coin_precisions[i];
						        let [supply_rate, old_block]  = [values[1], values[2]]
						        let block = values[3]
						        this.all_c_rates[key].c_rates[i] = rate * (1 + supply_rate * (block - old_block) / 1e18);
						    	this.all_fees[i] = parseInt(await this.web3contracts[key].swap.methods.fee().call()) / 1e10;
			         		}
					    }
				    }
				}
			},

			async update_fee_info(version = 'new') {
				for(let [key, contract] of Object.entries(contracts)) {
					this.bal_infos[key] = []
					this.l_infos[key] = []
					var balances = new Array(contract.N_COINS);

				    var swap_abi_stats = contract.swap_abi;
				    var swap_address_stats = contract.swap_address;
				    var swap_stats = this.web3contracts[key].swap;
				    var swap_token_stats = this.web3contracts[key].swap_token;

				    try {
				    	await this.update_rates();	
				    }
				    catch(err) {
				    	console.error(err)
				    }
				    var total = 0;
				    var promises = [];
				    let infuraProvider = new Web3(allabis.infura_url)
				    let swapInfura = new infuraProvider.eth.Contract(swap_abi_stats, swap_address_stats);
				    for (let i = 0; i < contract.N_COINS; i++) {
				        promises.push(swapInfura.methods.balances(i).call())
				/*        balances[i] = parseInt(await swap.methods.balances(i).call());
				        $(bal_info[i]).text((balances[i] * c_rates[i]).toFixed(2));
				        total += balances[i] * c_rates[i];*/
				    }
				    let resolves = await Promise.all(promises)
				    resolves.forEach((balance, i) => {
				        balances[i] = +balance;
				        let share = balances[i] * this.all_c_rates[key].c_rates[i];
				        this.bal_infos[key].push(share);
				        total += share;
				    })
				    this.totals.push(total);
				    this.fees.push(parseInt(await swap_stats.methods.fee().call()) / 1e10);
				    this.admin_fees.push(parseInt(await swap_stats.methods.admin_fee().call()) / 1e10);

				    var default_account = (await web3.eth.getAccounts())[0];
				    if (default_account) {
				        var token_balance = parseInt(await swap_token_stats.methods.balanceOf(default_account).call());
				        if (token_balance > 0) {
				            var token_supply = parseInt(await swap_token_stats.methods.totalSupply().call());
				            total = 0;
				            for (let i=0; i < contract.N_COINS; i++) {
				                var val = balances[i] * this.all_c_rates[key].c_rates[i] * token_balance / token_supply;
				                this.l_infos[key].push(val)
				                total += val;
				            }
				            this.totalShares.push(total)
				        }
				        else {
				        	this.totalShares.push(0)
				        }
				    }
				}
			},


		}
	}
</script>