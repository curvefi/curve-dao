<template>
	<div class='window white'>
		<div class='buttons'>
			<button @click='showLP' :class="{'simplebutton': showvesting == 1}">LP vesting</button>
			<button @click='showEmployee' :class="{'simplebutton': showvesting == 2}">Employee vesting</button>
		</div>
		<vesting :address='address' class='vesting'></vesting>
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
	import daoabis from '../dao/allabis'

	import Vesting from './Vesting'

	export default {
		components: {
			Vesting,
		},

		data: () => ({
			vbalance: 0,
			evbalance: 0,

			address: null,
			showvesting: 1,
		}),

		async created() {
			this.address = daoabis.vesting_address

			this.$watch(() => contract.default_account && contract.multicall, (val, oldval) => {
				if(val != null && oldval != null)
					this.mounted()
			}, {
				immediate: true
			})
		},

		async mounted() {
			if(contract.default_account && contract.multicall)
				this.mounted()
		},

		computed: {
			vaddress() {
				return daoabis.vesting_address
			},

			evaddress() {
				return daoabis.vesting_address
			},
		},

		methods: {
			async mounted() {
				this.vesting = new web3.eth.Contract(daoabis.vesting_abi, daoabis.vesting_address)
				this.evesting = new web3.eth.Contract(daoabis.vesting_abi, daoabis.vesting_address)

				let calls = [
					[this.vesting._address, this.vesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.evesting._address, this.evesting.methods.vestedOf(contract.default_account).encodeABI()],
				]

				let aggcalls = await contract.multicall.methods.aggregate(calls).call()

				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))

				this.vbalance = decoded[0]
				this.evbalance = decoded[1]
			},

			showLP() {
				this.showvesting = 1
				this.address = daoabis.vesting_address
			},

			showEmployee() {
				this.showvesting = 2
				this.address = daoabis.vesting_address + "1"
			},
		},
	}
</script>

<style scoped>
	button {
		margin-right: 1em;
	}

	.vesting {
		margin-top: 1em;
	}
</style>