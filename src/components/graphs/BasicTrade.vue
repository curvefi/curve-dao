<template>
	<div class = 'tradeview window white'>
		<fieldset id='onesplit'>
			<legend class='text-center'>Swap using all Curve pools</legend>
			<one-split />
		</fieldset>
	</div>
</template>

<script>
	import OneSplit from './OneSplit.vue'
	
	import { contract, init } from '../../contract'
	import { updatePoolInfo} from './tradeStore'
	

	export default {
		data: () => ({
			unwatch: null,
		}),
		async created() {
			this.unwatch = this.$watch(()=>contract.initializedContracts, async (val) => {
				Promise.all(['compound','usdt','iearn','busd','susdv2'].map(p=>{
					return init(contract.contracts[p])
				}))
				this.unwatch()
			})
		},
		components: {
			OneSplit,
		}
	}
</script>

<style scoped>
	#select_pool {
		margin-bottom: 10px;
	}
	>>>.exchange {
		width: 80%;
	}
	>>>.trade-buttons {
		margin: 0;
	}
</style>