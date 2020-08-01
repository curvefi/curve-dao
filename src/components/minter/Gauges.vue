<template>
	<div>
		
	</div>
</template>

<script>
	import { contract, getters } from '../../contract'
	import allabis from '../../allabis'

	export default {
		data: () => ({

		}),

		async created() {
			this.$watch(() => contract.default_account, (val, oldval) => {
				if(!val || !oldval)
					return
				if(oldval.toLowerCase() != val.toLowerCase() || !this.loaded)
					this.mounted()
			}, {
				immediate: true
			})
		},

		async mounted() {
			if(contract.default_account)
				this.mounted()
		},

		methods: {
			async mounted() {

			},
		},
	}
</script>

<style scoped>
	
</style>