<template>
	<div class='CHIcontainer'>
		<span v-show='!showCHIbutton && chiUser > 0'>
			Using <img class='icon small' :src="publicPath + 'tokens/chi.png'"> CHI
		</span>
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
			chiUser: 0,
		}),

		computed: {
			publicPath() {
                return process.env.BASE_URL
            },
		},

		async created() {
			this.$watch(()=>currentContract.initializedContracts, val => {
                if(val) this.mounted();
            }, {
            	immediate: true
            })
		},

		methods: {
			async mounted() {
				if(!['ren','sbtc'].includes(currentContract.currentContract)) return;
				let calls = [	
					[CHI_address, currentContract.chi.methods.balanceOf(allabis[currentContract.currentContract].adapterAddress).encodeABI()],
					[CHI_address, currentContract.chi.methods.balanceOf(currentContract.default_account).encodeABI()],
					[CHI_address, currentContract.chi.methods.allowance(currentContract.default_account, 
						allabis[currentContract.currentContract].adapterAddress).encodeABI()]
				]
				let aggcalls = await currentContract.multicall.methods.aggregate(calls).call()
				let decoded = aggcalls[1].map(hex => currentContract.web3.eth.abi.decodeParameter('uint256', hex))
				let chiAdapter = +decoded[0]
				this.chiUser = +decoded[1]
				let chiAllowance = +decoded[2]
				if(chiAdapter > 20 || this.chiUser == 0) {
					this.showCHIbutton = false
					return;
				}

                if (BN(chiAllowance).gt(currentContract.max_allowance))
                    this.showCHIbutton = false;
                else
                    this.showCHIbutton = true;
			},

			async approveCHI() {
				await common.approveAmount(currentContract.chi, currentContract.max_allowance, 
											currentContract.default_account, allabis[currentContract.currentContract].adapterAddress, true)
				this.showCHIbutton = false
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