<template>
	<div class='window white'>
		<fieldset>
			<legend>Emergency Members</legend>
			<p class='info-message gentle-message'>
				Curve Emergency DAO has 9 members and 59.999% support and 51% quorum
				<br>
				<br>
				Curve Emergency DAO can act when there's a danger of loss of funds and call the kill_me function of Curve Pool contracts
				which disables all functionality except for withdrawals. Curve pools can be reenabled back by either Emergency DAO or Curve DAO
				<br>
				<br>
				The Emergency DAO is controlled by Curve DAO which can add or remove Emergency members
			</p>
			<table class='tui-table'>
				<thead>
					<tr>
						<th>Name</th>
						<th>Twitter</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><a href="https://twitter.com/Rewkang">Andrew Kang</a></td>
						<td><a href="https://twitter.com/Rewkang">@Rewkang</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/angelangel0v" rel='noopener noreferrer'>Angel</a></td>
						<td><a href="https://twitter.com/angelangel0v">@angelangel0v</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/BrownieEth">Ben</a></td>
						<td><a href="https://twitter.com/BrownieEth">@BrownieEth</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/bneiluj">Julien</a></td>
						<td><a href="https://twitter.com/bneiluj">@bneiluj</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/kaiynne">Kain</a></td>
						<td><a href="https://twitter.com/kaiynne">@kaiynne</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/tom_ding">Lei</a></td>
						<td><a href="https://twitter.com/tom_ding">@tom_ding</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/mervynchng89">Mervyn</a></td>
						<td><a href="https://twitter.com/mervynchng89">@mervynchng89</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/StaniKulechkov">Stani</a></td>
						<td><a href="https://twitter.com/StaniKulechkov">@StaniKulechkov</a></td>
					</tr>
					<tr>
						<td><a href="https://twitter.com/CurveFinance">Curve Finance</a></td>
						<td><a href="https://twitter.com/CurveFinance">@CurveFinance</a></td>
					</tr>
				</tbody>
			</table>
		</fieldset>
	</div>
</template>

<script>
	import { contract } from '../../../contract'
	import allabis from '../../../allabis'

	import * as daoabis from '../allabis'

	import { TokenManager } from '@aragon/connect-thegraph-tokens'



	let emergencyToken_address = '0x4c0947b16fb1f755a2d32ec21a0c4181f711c500'
	let emergencyTokenManager_address = '0xc96ca8785ba0eeb8ab56bc5d4855a5e871f82e5d'

	const tokenManager = new TokenManager(
	  emergencyTokenManager_address,
	  'https://api.thegraph.com/subgraphs/name/aragon/aragon-tokens-mainnet'
	)

	export default {
		data: () => ({
			addresses: [],
		}),

		async created() {
			this.$watch(() => contract.default_account, val => {
				if(val) this.mounted()
			}, {
				immediate: true,
			})
		},

		computed: {
			
		},

		methods: {
			async mounted() {
				let tokenholders = await tokenManager._connector.tokenHolders(emergencyToken_address, 1000, 0)
				this.addresses = tokenholders.map(tokenholder => tokenholder.address)
			},

			shortenAddress(address) {
				if(!address) return ''
				return address.slice(0,6) + '...' + address.slice(-6)
			},
		},
	}
</script>

<style scoped>
	legend {
		text-align: center;
	}
	select.tvision {
		box-shadow: none
	}
	.actions {
		margin-top: 1em;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		grid-gap: 1em;
	}
	.actions > div {
		flex: 1;
	}
	.input {
		margin-top: 1em;
	}
	.input input {
		margin-top: 0.4em;
	}
	.actions > div button {
		margin-top: 1em;
	}

	table {

		width: 100%;
		margin: 0 auto;
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
		padding-left: 1em;
		color: black;
	}
	tbody tr td:nth-child(5) a, tbody tr td:nth-child(6) a {
		font-weight: normal;
	}

</style>