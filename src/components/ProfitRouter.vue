<template>
	<component :is='currentProfit'></component>
</template>

<script>
    import { getters, contract as currentContract } from '../contract'

    import Profit from './Profit.vue'
    import yProfit from './yProfit.vue'

	export default {
		components: {
			Profit,
			yProfit,
		},
		computed: {
			...getters,
			currentProfit() {
				if(['compound', 'usdt'].includes(this.currentPool)) return 'Profit'
				return 'yProfit';
			}
		}
	}
</script>

<style>
	
</style>