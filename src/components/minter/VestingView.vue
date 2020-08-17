<template>
	<div class='window white'>
		<div class='buttons'>
			<button @click='showOwner' v-show='obalance > 0' :class="{'simplebutton': showvesting == 1}">Founder vesting</button>
			<button @click='showInvestor' v-show='ibalance > 0' :class="{'simplebutton': showvesting == 2}">Investor vesting</button>
			<button @click='showAdvisor' v-show='abalance > 0' :class="{'simplebutton': showvesting == 3}">Advisor vesting</button>
			<button @click='showLP' v-show='vbalance > 0' :class="{'simplebutton': showvesting == 4}">LP vesting</button>
			<button @click='showEmployee' v-show='evbalance > 0' :class="{'simplebutton': showvesting == 5}">Employee vesting</button>

			<button @click='showFactory' v-show='factorybalance > 0' :class="{'simplebutton': showvesting == 6}">Advisor vesting</button>
			<button @click='showFactory2' v-show='factorybalance2 > 0' :class="{'simplebutton': showvesting == 7}">Advisor vesting</button>
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
			obalance: 0,
			ibalance: 0,
			abalance: 0,
			vbalance: 0,
			evbalance: 0,

			factorybalance: 0,

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
				return '0x679FCB9b33Fc4AE10Ff4f96caeF49c1ae3F8fA67'
			},
		},

		methods: {
			async mounted() {
				this.ovesting = new web3.eth.Contract(daoabis.vesting_abi, '0xd2D43555134dC575BF7279F4bA18809645dB0F1D')
				this.ivesting = new web3.eth.Contract(daoabis.vesting_abi, '0x2A7d59E327759acd5d11A8fb652Bf4072d28AC04')
				this.avesting = new web3.eth.Contract(daoabis.vesting_abi, '0xf7dBC322d72C1788a1E37eEE738e2eA9C7Fa875e')
				this.vesting = new web3.eth.Contract(daoabis.vesting_abi, daoabis.vesting_address)
				this.evesting = new web3.eth.Contract(daoabis.vesting_abi, '0x679FCB9b33Fc4AE10Ff4f96caeF49c1ae3F8fA67')

				this.factoryvesting = new web3.eth.Contract(daoabis.vesting_abi, '0x81930d767a75269dc0e9b83938884e342c1fa5f6')
				this.factoryvesting2 = new web3.eth.Contract(daoabis.vesting_abi, '0x629347824016530fcd9a1990a30658ed9a04c834')

				let calls = [
					[this.ovesting._address, this.ovesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.ivesting._address, this.ivesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.avesting._address, this.avesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.vesting._address, this.vesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.evesting._address, this.evesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.factoryvesting._address, this.factoryvesting.methods.vestedOf(contract.default_account).encodeABI()],
					[this.factoryvesting2._address, this.factoryvesting2.methods.vestedOf(contract.default_account).encodeABI()],
				]

				let aggcalls = await contract.multicall.methods.aggregate(calls).call()

				let decoded = aggcalls[1].map(hex => web3.eth.abi.decodeParameter('uint256', hex))

				this.obalance = decoded[0]
				this.ibalance = decoded[1]
				this.abalance = decoded[2]
				this.vbalance = decoded[3]
				this.evbalance = decoded[4]

				this.factorybalance = decoded[5]
				this.factorybalance2 = decoded[6]

				let vestings = [this.obalance, this.ibalance, this.abalance, this.vbalance, this.evbalance, this.factorybalance, this.factorybalance2]
				let vestingAddresses = [
					this.ovesting._address,
					this.ivesting._address,
					this.avesting._address,
					this.vesting._address,
					this.evesting._address,
					this.factoryvesting._address,
					this.factoryvesting2._address,
				]
				this.address = vestingAddresses[vestings.findIndex(v => v > 0)]
				//test
			},

			showOwner() {
				this.showvesting = 1
				this.address = '0xd2D43555134dC575BF7279F4bA18809645dB0F1D'
			},

			showInvestor() {
				this.showvesting = 2
				this.address = '0x2A7d59E327759acd5d11A8fb652Bf4072d28AC04'
			},

			showAdvisor() {
				this.showvesting = 3
				this.address = '0xf7dBC322d72C1788a1E37eEE738e2eA9C7Fa875e'
			},

			showLP() {
				this.showvesting = 4
				this.address = daoabis.vesting_address
			},

			showEmployee() {
				this.showvesting = 5
				this.address = '0x679FCB9b33Fc4AE10Ff4f96caeF49c1ae3F8fA67'
			},

			showFactory() {
				this.showvesting = 6
				this.address = '0x81930d767a75269dc0e9b83938884e342c1fa5f6'
			},

			showFactory2() {
				this.showvesting = 7
				this.address = '0x629347824016530fcd9a1990a30658ed9a04c834'
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