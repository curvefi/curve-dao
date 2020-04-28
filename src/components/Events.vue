<template>
	<div class='white window'>
		<fieldset>
			<legend>Events</legend>
			<div id='poolselect'>
				<input id='compoundpool' type='checkbox' value='compound' v-model='pools'/>
				<label for='compoundpool'>Compound</label>

				<input id='usdtpool' type='checkbox' value='usdt' v-model='pools'/>
				<label for='usdtpool'>usdt</label>

				<input id='ypool' type='checkbox' value='iearn' v-model='pools'/>
				<label for='ypool'>Y</label>

				<input id='busdpool' type='checkbox' value='busd' v-model='pools'/>
				<label for='busdpool'>bUSD</label>

				<input id='susdpool' type='checkbox' value='susdv2' v-model='pools'/>
				<label for='susdpool'>sUSD</label>

				<button @click="selectPools">Select</button>

				<table class="tui-table">
				    <thead>
				        <tr>
				        	<th>Block #</th>
				            <th>Swap</th>
				            <th>tokens_sold</th>
				            <th>tokens_bought</th>
				            <th>Pool</th>
				            <th>Event</th>
				        </tr>
				    </thead>
				    <tbody>
				        <tr v-for='event in paginatedExchanges'>
				        	<td>
				        		<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				        			{{ event.blockNumber }}
				        		</a>
				        	</td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ getCurrency(event, 0) }}➔{{ getCurrency(event, 1) }}
				            	</a>
				            </td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ formatAmount(event, 0) | toFixed2}}
				            	</a>
				            </td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ formatAmount(event, 1) | toFixed2}}
				            	</a>
				            </td>
				            <td>
				            	{{ getPool(event) }}
				            </td>
				            <td> 
				            	{{ event.event }}
		            	 	</td>
				        </tr>
				    </tbody>
				</table>
				<div id='pages'>
					<button @click='page--'>Prev</button>
					Page: {{page}} (of {{pages}})
					<button @click='page++'>Next</button>
					<label for='gotopage'> Go to: </label>
					<input id='gotopage' type='text' v-model='gotopage'>
					<button @click='page = gotopage'>Go</button>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script>
	import { contract, allCurrencies, getters } from '../contract'
	import allabis from '../allabis'

	import * as helpers from '../utils/helpers'

	export default {
		data: () => ({
			allPools: ['compound', 'usdt', 'iearn', 'busd', 'susdv2'],
			pools: ['compound', 'usdt', 'iearn', 'busd', 'susdv2'],
			//compound first block
			fromBlock: '0x91c86f',
			contracts: [],
			exchanges: [
				/*{
					buyer: '',
					sold_id: '',
					tokens_sold: '',
					bought_id: '',
					tokens_bought: '',
				}*/
			],
			page: 0,
			perPage: 10,
			gotopage: 0,
			subscriptions: [],
			rates: {
				compound: [],
				usdt: [],
				iearn: [],
				busd: [],
				susdv2: [],
			},
		}),
		computed: {
			...getters,
			allAddresses() {
				return Object.keys(allabis).filter(pool => this.allPools.includes(pool)).map(pool => ({pool, address: allabis[pool].swap_address}))
			},
			addresses() {
				return Object.keys(allabis).filter(pool => this.pools.includes(pool)).map(pool => allabis[pool].swap_address)
			},
			tokenExchangeEvent() {
				return web3.utils.sha3('TokenExchange(address,int128,uint256,int128,uint256)')
			},
			tokenExchangeUnderlyingEvent() {
				return web3.utils.sha3('TokenExchangeUnderlying(address,int128,uint256,int128,uint256)')
			},
			allCurrencies() {
				return allCurrencies
			},
			pages() {
				return this.exchanges.length && Math.ceil(this.exchanges.length / this.perPage) - 1
			},
			paginatedExchanges() {
				let start = this.page*this.perPage
				return this.exchanges.slice(start, start + this.perPage)
			}
		},
		created() {
			this.$watch(() => contract.web3, val => {
				if(val)
					this.mounted()
			})
		},
		mounted() {
			contract.web3 && this.mounted();
		},
		methods: {
			async selectPools() {
				for(let subscription of this.subscriptions) subscription.unsubscribe()
				this.exchanges = []
				let fetchpools = this.pools.map(pool => pool == 'iearn' ? 'y' : pool == 'susdv2' ? 'susd' : pool)
				let requests = await Promise.all(fetchpools.map(pool => fetch(`https://beta.curve.fi/raw-stats/${pool}-1m.json`)))
				let jsons = await Promise.all(requests.map(request => request.json()))
				for(let [i, data] of jsons.entries()) {
					let pool = fetchpools[i]
					//really have to change everything to use the same names!
					this.rates[pool == 'y' ? 'iearn' : pool == 'susd' ? 'susdv2' : pool] = data[0].rates
				}
				this.subscriptions = []
				this.page = 0
				this.gotopage = 0
				let results = this.pools.map(pool => {
					return [
						this.contracts[this.allPools.indexOf(pool)].getPastEvents(this.tokenExchangeUnderlyingEvent, { fromBlock: this.fromBlock }),
						this.contracts[this.allPools.indexOf(pool)].getPastEvents(this.tokenExchangeEvent, { fromBlock: this.fromBlock }),
					]
				})
				results = await Promise.all(results.flat())
				this.exchanges = results.flat().sort((a, b) => b.blockNumber - a.blockNumber)
				//listen for new events
				this.pools.forEach(pool => {
					let subscription = this.contracts[this.allPools.indexOf(pool)]
						.events.TokenExchangeUnderlying()
						.on('data', event => {
							if(this.exchanges.findIndex(prevEvent => prevEvent.transactionHash == event.transactionHash) !== -1) return;
							this.exchanges.unshift(event)
						})
					this.subscriptions.push(subscription)
					subscription = this.contracts[this.allPools.indexOf(pool)]
						.events.TokenExchange()
						.on('data', event => {
							if(this.exchanges.findIndex(prevEvent => prevEvent.transactionHash == event.transactionHash) !== -1) return;
							this.exchanges.push(event)
						})
					this.subscriptions.push(subscription)
				})
			},
			async mounted() {
				this.contracts = Object.keys(allabis)
					.filter(pool => this.pools.includes(pool))
					.map(pool => new web3.eth.Contract(allabis[pool].swap_abi, allabis[pool].swap_address))
				this.selectPools()
			},
			getCurrency(event, type) {
				//type == 0 for sold
				//type == 1 for bought
				let i = type == 0 ? event.returnValues.sold_id : event.returnValues.bought_id
				let contractAddress = event.address
				let pool = this.allAddresses.find(v => v.address.toLowerCase() == contractAddress.toLowerCase()).pool
				if(event.event == 'TokenExchange') return Object.values(allCurrencies[pool])[i]
				return Object.keys(allCurrencies[pool])[i].toUpperCase()
			},
			formatAmount(event, type) {
				//type == 0 for sold
				//type == 1 for bought
				let i = type == 0 ? event.returnValues.sold_id : event.returnValues.bought_id
				let contractAddress = event.address
				let amount = type == 0 ? event.returnValues.tokens_sold : event.returnValues.tokens_bought
				let pool = this.allAddresses.find(v => v.address.toLowerCase() == contractAddress.toLowerCase()).pool
				if(event.event == 'TokenExchange') return amount / allabis[pool].wrapped_precisions[i] * (this.rates[pool][i] / 1e18)
				return amount / allabis[pool].coin_precisions[i]
			},
			getPool(event) {
				let pool = this.allAddresses.find(v => v.address.toLowerCase() == event.address.toLowerCase()).pool
				return pool == 'iearn' ? 'y' : pool
			}

		}
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	button {
		box-shadow: none;
		margin-left: 10px;
	}
	label:nth-of-type(1) {
		margin-left: 0;
	}
	label {
		margin-left: 1em;
	}
	table {
		width: 100%;
		margin-top: 1em;
	}
	tbody tr td a {
		display: inline-block;
		min-height: 100%;
		width: 100%;
		padding-top: 10px;
		font-weight: normal;
	}
	thead tr {
		border-bottom: 1px solid #a8a8a8;
	}
	thead tr th {
		color: #202020;
	}
	tbody tr td {
		padding: 0;
		color: black;
	}
	#pages {
		text-align: center;
		margin-top: 1em;
	}
	#pages button {
		margin-left: 0;
	}
	#gotopage {
		width: 3em;
	}
	#gotopage + button {
		margin-left: 0.5em;
	}



	.tui-table {
	  border: 2px solid #a8a8a8;
	  padding: 5px;
	  border-collapse: collapse; }
	  .tui-table.hovered-blue tbody tr:hover {
	    background-color: blue !important;
	    color: black; }
	  .tui-table.hovered-green tbody tr:hover {
	    background-color: lime !important;
	    color: black; }
	  .tui-table.hovered-cyan tbody tr:hover {
	    background-color: cyan !important;
	    color: black; }
	  .tui-table.hovered-red tbody tr:hover {
	    background-color: red !important;
	    color: white; }
	  .tui-table.hovered-purple tbody tr:hover {
	    background-color: magenta !important;
	    color: white; }
	  .tui-table.hovered-yellow tbody tr:hover {
	    background-color: yellow !important;
	    color: black; }
	  .tui-table.hovered-white tbody tr:hover {
	    background-color: white !important;
	    color: black; }
	  .tui-table.hovered-orange tbody tr:hover {
	    background-color: #ffa800 !important;
	    color: black; }
	  .tui-table.hovered tbody tr:hover {
	    background-color: cyan !important;
	    color: black; }
	  .tui-table.striped-blue tbody tr:nth-child(even) {
	    background-color: #0000a8; }
	  .tui-table.striped-green tbody tr:nth-child(even) {
	    background-color: #00a800; }
	  .tui-table.striped-cyan tbody tr:nth-child(even) {
	    background-color: #00a8a8; }
	  .tui-table.striped-red tbody tr:nth-child(even) {
	    background-color: #a80000; }
	  .tui-table.striped-purple tbody tr:nth-child(even) {
	    background-color: #a800a8; }
	  .tui-table.striped-yellow tbody tr:nth-child(even) {
	    background-color: #a8a800; }
	  .tui-table.striped-white tbody tr:nth-child(even) {
	    background-color: #a8a8a8;
	    color: black; }
	  .tui-table.striped-orange tbody tr:nth-child(even) {
	    background-color: #a85600; }

	.tui-table tbody {
	  background-color: inherit;
	  color: white; }

	.tui-table tbody tr td {
	  border-right: 2px solid #a8a8a8;
	  padding: 0px 2px; }

	.tui-table thead {
	  background-color: inherit;
	  color: yellow;
	  text-align: center; }

	.tui-table tfoot {
	  background-color: inherit;
	  color: yellow;
	  text-align: center; }

	.tui-table-grid {
	  border-collapse: collapse;
	  width: 100%; }

	.tui-table-grid thead tr td,
	.tui-table-grid tbody tr td,
	.tui-table-grid thead tr th,
	.tui-table-grid tbody tr th {
	  border: 2px solid black;
	  padding: 10px;
	  vertical-align: top; }
  
</style>