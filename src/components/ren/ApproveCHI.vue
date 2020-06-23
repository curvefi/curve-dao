<template>
	<div class='CHIcontainer'>
		<span>
		 	<button @click='approveCHI' v-show='showCHIbutton'>
				Approve
		 		<img class='icon small' :src="publicPath + 'tokens/chi.png'"> CHI
			</button>
		</span>
	</div>
</template>

<script>
    import * as common from '../../utils/common.js'
    import { getters, contract as currentContract, gas as contractGas} from '../../contract'
    import allabis, { ERC20_abi, CHI_address } from '../../allabis'

	export default {
		data: () => ({
			chi: null,
			showCHIbutton: false,
		}),

		computed: {
			publicPath() {
                return process.env.BASE_URL
            },
		},

		async created() {
			this.$watch(()=>currentContract.initializedContracts, val => {
				console.log("HERERERE")
                if(val) this.mounted();
                console.timeEnd('initswap')
            })
		},

		methods: {
			async mounted() {
				if(currentContract.currentContract != 'sbtc') return;
				this.chi = new web3.eth.Contract(ERC20_abi, CHI_address)
				let calls = [
					[CHI_address, chi.methods.balanceOf(allabis.sbtc.adapterAddress).encodeABI()],
					[CHI_address, chi.methods.balanceOf(currentContract.default_account).encodeABI()],
					[CHI_address, chi.methods.allowance(currentContract.default_account, allabis.sbtc.adapterAddress).encodeABI()]
				]
				let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => currentContract.web3.eth.abi.decodeParameter('uint256', hex))
				let chiAdapter = +decoded[0]
				let chiUser = +decoded[1]
				let chiAllowance = +decoded[2]
				if(chiAdapter > 20 || chiUser == 0) {
					this.showCHIbutton = false
					return;
				}

                if (BN(chiAllowance).gt(maxAllowance))
                    this.showCHIbutton = false;
                else
                    this.showCHIbutton = true;
			},

			async approveCHI() {
				console.log("APPROVE CHI")
				await common.approveAmount(this.chi, currentContract.max_allowance, 
											currentContract.default_account, allabis.sbtc.adapterAddress, true)
			},
		}
	}
</script>

<style scoped>
	.CHIcontainer {
		margin-top: 1em;
		text-align: center;
	}

	button {
		padding-bottom: 0.1em;
	}

	button img {
		width: 1.2em;
		height: 1.2em;
		vertical-align: middle;
	}
</style>