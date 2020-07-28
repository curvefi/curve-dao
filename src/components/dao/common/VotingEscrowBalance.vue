<template>
	<div>
		<p v-show='hasvecrv'>
			<div>
				CRV <img class='icon small' :src="publicPath + 'logo.png'"> balance: {{ crvBalanceText }}
			</div>
			<div>
				Balance in Voting Escrow: {{ vecrvBalanceText }} veCRV
			</div>
			<div>
				<img :src="publicPath + 'lock-solid.svg'" class='icon small'> Locked until: {{ lockTimeText }}
			</div>
		</p>
	</div>
</template>

<script>
	import { contract } from '../../../contract'

	import * as helpers from '../../../utils/helpers'

	import { getCRV } from '../voteStore'

	import BN from 'bignumber.js'

	export default {
		data: () => ({
			crvBalance: BN(0),
			vecrvBalance: BN(0),
			lockTime: Date.now(),
		}),

		async created() {
			this.$watch(() => contract.default_account && contract.multicall, val => {
				if(val)
					this.mounted()
			}, {
				immediate: true,
			})
		},

		computed: {
			crvBalanceText() {
				return this.crvBalance.div(1e18).toFixed(2,1)
			},
			vecrvBalanceText() {
				return this.vecrvBalance.div(1e18).toFixed(2,1)
			},
			lockTimeText() {
				return helpers.formatDateToHuman(this.lockTime)
			},
			hasvecrv() {
				return this.vecrvBalance.gt(0)
			},
			publicPath() {
				return process.env.BASE_URL
			},
		},

		methods: {
			async mounted() {
				let decoded = await getCRV()
				this.vecrvBalance = BN(decoded[0])
				this.lockTime = +decoded[1]
				this.crvBalance = BN(decoded[2])
			},
		}
	}
</script>

<style scoped>
	p div {
		margin-top: 0.4em;
	}
</style>