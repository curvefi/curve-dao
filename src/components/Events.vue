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

				<button @click="selectPoolsHandler">Select</button>

				<table class="tui-table">
				    <thead>
				        <tr>
				        	<th>Block #</th>
				            <th>Swap</th>
				            <th>tokens_sold</th>
				            <th>tokens_bought</th>
				            <th>Pool</th>
				            <th>Event</th>
				            <th>Virtual price</th>
				        </tr>
				    </thead>
				    <tbody>
				    	<tr v-show='!exchanges.length' class='loadingtr'>
				    		<td v-for='n in 7'><span class='loading line'></span></td>
				    	</tr>
				        <tr v-for='event in paginatedExchanges'>
				        	<td>
				        		<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				        			{{ event.blockNumber }}
				        		</a>
				        	</td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ event.fromCurrency }}➔{{ event.toCurrency }}
				            	</a>
				            </td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ event.soldAmount | toFixed2}}
				            	</a>
				            </td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ event.boughtAmount | toFixed2}}
				            	</a>
				            </td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ getPool(event) }}
				            	</a>
				            </td>
				            <td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
				            		{{ event.event }}
				            	</a>
		            	 	</td>
		            	 	<td>
				            	<a :href="`https://etherscan.io/tx/${event.transactionHash}`">
		            	 			{{ event.virtual_price.toFixed(4)}}
		            	 		</a>
		            	 	</td>
				        </tr>
				    </tbody>
				</table>
				<div>
					<button id='loadmore' @click='loadMore' v-show='page == pages && exchanges.length'>Load more</button>
				</div>
				<div id='pages'>
					<button @click='page > 0 && page--'>Prev</button>
					Page: {{page}} (of {{pages}})
					<button @click='page < pages && page++'>Next</button>
					<label for='gotopage'> Go to: </label>
					<input id='gotopage' type='text' v-model='gotopage'>
					<button @click='goTo'>Go</button>
					<label for='perpage'>Per page:</label>
					<select class='tvision' v-model='perPage' id='perpage'>
						<option value='10'>10</option>
						<option value='20'>20</option>
						<option value='50'>50</option>
						<option value='100'>100</option>
						<option value='300'>300</option>
					</select>
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
			swapContracts: [],
			exchanges: [
				/*{
					buyer: '',
					sold_id: '',
					tokens_sold: '',
					bought_id: '',
					tokens_bought: '',
				}*/
			],
			page: -1,
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
			c_rates: {
				compound: [],
				usdt: [],
				iearn: [],
				busd: [],
				susdv2: [],
			},
			jsons: [],
			latestblock: null,
			numBlocks: 1000,
			paginatedExchanges: [],
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
			changePagination() {
				return this.page, this.perPage, Date.now()
			}

		},
		watch: {
			changePagination() {
				this.paginate()
			},
		},
		created() {
			this.$watch(() => contract.multicall, val => {
				if(val)
					this.mounted()
			})
		},
		mounted() {
			contract.multicall && this.mounted();
		},
		methods: {
			getEvents(block, numBlocks) {
				return this.pools.map(pool => {
					return [
						this.swapContracts[this.allPools.indexOf(pool)]
						.getPastEvents(this.tokenExchangeUnderlyingEvent, 
							{ fromBlock: block - numBlocks }
						),
						this.swapContracts[this.allPools.indexOf(pool)]
						.getPastEvents(this.tokenExchangeEvent, 
							{ fromBlock: block - numBlocks }
						),
					]
				})
			},
			selectPoolsHandler() {
				this.exchanges = []
				this.selectPools()
			},
			async loadMore() {
				let lastBlock = this.exchanges[this.exchanges.length-1].blockNumber
				this.loadEvents(lastBlock)
			},
			async loadEvents(block) {
				let length = 0
				let i = 0;
				while(length < 500) {
					let results
					let numTries = 5
					let numBlocks = this.numBlocks;
					while(true) {
						try {
							results = await Promise.all(this.getEvents(block, numBlocks).flat())
							break;
						}
						catch(err) {
							numTries--;
							numBlocks /= 2;
							if(numTries == 0) throw err
						}
					}
					length += results.flat().length
					results = results.flat()
						.sort((a, b) => b.blockNumber - a.blockNumber)
					this.exchanges.push(...results)
					if(i == 0) this.paginate()
					i++
				}
			},
			//change pagination on first load, on change page, per page and on new events
			async paginate() {
				let start = this.page*this.perPage
				let exchanges = this.exchanges.slice(start, start + this.perPage)
				exchanges = await Promise.all(exchanges.map(event => {
					if(!event.fromCurrency) return this.formatEvent(event)
					return event;
				}))
				this.paginatedExchanges = exchanges
			},
			async selectPools() {
				this.latestblock = await web3.eth.getBlockNumber();
				for(let subscription of this.subscriptions) subscription.unsubscribe()
				this.exchanges = []
				//get historic rates
				let fetchpools = this.pools.map(pool => pool == 'iearn' ? 'y' : pool == 'susdv2' ? 'susd' : pool)
				let requests = await Promise.all(fetchpools.map(pool => fetch(`${window.domain}/raw-stats/${pool}-30m.json`)))
				let jsons = await Promise.all(requests.map(request => request.json()))
				this.jsons = jsons
				for(let [i, data] of jsons.entries()) {
					let pool = fetchpools[i]
					//really have to change everything to use the same names!
					this.rates[pool == 'y' ? 'iearn' : pool == 'susd' ? 'susdv2' : pool] = data[data.length-1].rates
				}
				this.subscriptions = []
				this.page = 0
				this.gotopage = 0
				await this.loadEvents(this.latestblock)
				//listen for new events
				this.pools.forEach(pool => {
					let subscription = this.swapContracts[this.allPools.indexOf(pool)]
						.events.TokenExchangeUnderlying()
						.on('data', event => {
							if(this.exchanges.findIndex(prevEvent => prevEvent.transactionHash == event.transactionHash) !== -1) return;
							this.latestblock = event.blockNumber
							this.getRates()
							this.exchanges.unshift(event)
							this.paginate()
						})
					this.subscriptions.push(subscription)
					subscription = this.swapContracts[this.allPools.indexOf(pool)]
						.events.TokenExchange()
						.on('data', event => {
							if(this.exchanges.findIndex(prevEvent => prevEvent.transactionHash == event.transactionHash) !== -1) return;
							this.latestblock = event.blockNumber
							this.getRates()
							this.exchanges.unshift(event)
							this.paginate()
						})
					this.subscriptions.push(subscription)
				})
			},
			//gets current rates
			async getRates(blockNumber) {
				let calls = []
				let pools = ['usdt', 'iearn', 'compound']
				for(let [i, pool] of pools.entries()) {
					let abi = allabis[pool]
					for(let j = 0; j < abi.N_COINS; j++) {
						let address = abi.coins[j]
						let rate;
						if(this.isPlain(j, abi, pool)) {
							rate = 1 / abi.coin_precisions[j]
							this.c_rates[pool][j] = rate
						}
						else if(['iearn', 'busd'].includes(pool)) {
							calls.push([
								address,
								//getPricePerFullShare()
								'0x77c7b8fc'
							])
						}
						else {
							calls.push(
								[
									address,
									//exchangeRateStored()
									'0x182df0f5'
								],
								[
									address,
									//supplyRatePerBlock()
									'0xae9d70b0'
								],
								[
									address,
									//accrualBlockNumber()
									'0x6c540baf'
								]
							)
						}
					}
				}
				let aggcalls = await contract.multicall.methods.aggregate(calls).call(null, blockNumber)
				let block = aggcalls[0];
				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))
				console.log(decoded)
				for(let [i, pool] of pools.entries()) {
					let abi = allabis[pool]
					//usdt in usdt pool and susdv2 pool are already in the array, no need to calculate
					if(pool == 'susdv2') continue;
					else if(['iearn', 'busd'].includes(pool)) {
						let calls = decoded.slice(0,4)
						for(let j = 0; j < 4; j++) {
							let rate = +calls[j]
							this.c_rates[pool][j] = rate / 1e18 / abi.coin_precisions[j]
						}
						decoded = decoded.slice(4)
					}
					else {
						let calls = decoded.slice(0,6)
						for(let j = 0; j < 2; j++) {
							let rate = +calls[j*3] / 1e18 / abi.coin_precisions[j]
							let supplyRate = +calls[j*3+1]
							let oldBlock = +calls[j*3+2]

							let calcRate = rate * (1 + supplyRate * (block - oldBlock) / 1e18)

							this.c_rates[pool][j] = calcRate;
						}
						decoded = decoded.slice(6)
					}
				}
			},
			async mounted() {
				this.swapContracts = Object.keys(allabis)
					.filter(pool => this.pools.includes(pool))
					.map(pool => new web3.eth.Contract(allabis[pool].swap_abi, allabis[pool].swap_address))

				//get rates
				await this.getRates();
				this.selectPools()
			},
			isPlain(i, abi, pool) {
				return abi.tethered && abi.tethered[i] && abi.use_lending && !abi.use_lending[i] || pool == 'susdv2';
			},
			getCurrency(event, type) {
				//type == 0 for sold
				//type == 1 for bought
				let i = type == 0 ? event.returnValues.sold_id : event.returnValues.bought_id
				let contractAddress = event.address
				let pool = this.allAddresses.find(v => v.address.toLowerCase() == contractAddress.toLowerCase()).pool
				if(event.event == 'TokenExchange') return Object.values(allCurrencies[pool])[i]
				if(pool == 'susdv2' && i == 3) return 'sUSD'
				return Object.keys(allCurrencies[pool])[i].toUpperCase()
			},
			// getVirtualPrice(event) {
			// 	let pool = this.allAddresses.find(v => v.address.toLowerCase() == contractAddress.toLowerCase()).pool
			// 	let poolIdx = this.pools.indexOf(pool);
			// 	if(event.blockNumber > this.latestblock - 4) {
			// 		return await this.swapContracts[poolIdx].methods.get_virtual_price().call()
			// 	}
			// 	else {

			// 	}
			// },
			async formatEvent(event) {
				event.fromCurrency = this.getCurrency(event, 0)
				//call formatAmount once
				let contractAddress = event.address
				let pool = this.allAddresses.find(v => v.address.toLowerCase() == contractAddress.toLowerCase()).pool
				let getBlock = await web3.eth.getBlock(event.blockNumber)
				let timestamp = await this.getTimestamp(event.blockNumber)
				event.timestamp = timestamp
				let poolIdx = this.pools.indexOf(pool);
				let virtual_price, poolInfo
				if(event.blockNumber > this.latestblock - 120) {
					await this.getRates(event.blockNumber)
					virtual_price = (await this.swapContracts[poolIdx].methods.get_virtual_price().call(null, event.blockNumber)) / 1e18
				}
				else {
					poolInfo = this.interpolatePoint(timestamp, poolIdx)
					virtual_price = poolInfo.virtual_price / 1e18
				}
				event.soldAmount = this.formatAmount(event, 0, poolInfo)
				event.boughtAmount = this.formatAmount(event, 1, poolInfo)
				event.toCurrency = this.getCurrency(event, 1)
				event.virtual_price = virtual_price
				return event
			},
			async getTimestamp(blockNumber) {
				return (await web3.eth.getBlock(blockNumber)).timestamp
			},
			findClosest(timestamp, pool) {
				let poolData = this.jsons[pool]
			    let data = poolData.find(d=>d.timestamp - timestamp > 0);
			    //check if timestamp was before recording, this is only for when timestamp > latest recorded, get latest recorded
			    if(timestamp < poolData[0].timestamp) {
			    	return poolData[0];
			    }
			    if(data === undefined) {
			    	return poolData[poolData.length-1]
			    }
			    return data;
			},
			interpolatePoint(timestamp, poolidx) {
				let poolData = this.jsons[poolidx]
				let prev = poolData.find(p=>timestamp - p.timestamp > 0 && p.virtual_price > 0)
				let next = poolData.find(p=>p.timestamp - timestamp > 0 && p.virtual_price > 0)
				if(prev === undefined) prev = poolData[0]
				if(next === undefined) next = poolData[poolData.length-1]
				if(prev.timestamp == next.timestamp) return next;

				let point = {}

				let interpolator = helpers.interpolate(timestamp, prev.timestamp, next.timestamp)
				point.virtual_price = interpolator(prev.virtual_price, next.virtual_price)
				point.rates = prev.rates.map((r, i) => interpolator(r, next.rates[i]))
				return point
			},
			formatAmount(event, type, poolInfo) {
				let contractAddress = event.address
				let pool = this.allAddresses.find(v => v.address.toLowerCase() == contractAddress.toLowerCase()).pool

				let i = type == 0 ? event.returnValues.sold_id : event.returnValues.bought_id
				let amount = type == 0 ? event.returnValues.tokens_sold : event.returnValues.tokens_bought
				let precisions = 1e18 * allabis[pool].coin_precisions[i]
				let rate

				if(event.blockNumber > this.latestblock - 120) {
					rate = this.c_rates[pool][i] * precisions
				}
				else {
					rate = poolInfo.rates[i] / precisions
				}
				if(event.event == 'TokenExchange') {
					amount = amount * rate
				}
				else amount = amount / allabis[pool].coin_precisions[i]
				return amount
			},
			getPool(event) {
				let pool = this.allAddresses.find(v => v.address.toLowerCase() == event.address.toLowerCase()).pool
				return pool == 'iearn' ? 'y' : pool
			},
			goTo() {
				if(+this.gotopage >= 0 && +this.gotopage <= this.pages)
					this.page = this.gotopage
				else
					this.page = 0
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
	tbody tr td:nth-child(5) a, tbody tr td:nth-child(6) a {
		font-weight: normal;
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

	select.tvision {
		box-shadow: none;
		margin-left: 10px;
	}

	.loadingtr td {
		text-align: center;
	}

	#loadmore {
		margin-left: 0;
		margin-top: 10px;
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