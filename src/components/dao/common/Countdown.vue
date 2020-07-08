<template>
	<div>
		<img 
			:src="publicPath + 'hourglass-start-solid.svg'" 
			class='icon small'
			v-show='timestamp1 > 0'
		> {{ formatTime }}
	</div>
</template>

<script>
	import { OWNERSHIP_VOTE_TIME } from '../voteStore'
	import { formatDayTimeToHuman } from '../../../utils/helpers'

	export default {
		props: ['timestamp'],

		data: function() {
			return {
				interval: null,
				timestamp1: null,
			}
		},

		created() {
			this.timestamp1 = OWNERSHIP_VOTE_TIME - ((new Date().getTime() / 1000) - this.timestamp)
			if(this.timestamp1 > 0) {
				this.interval = setInterval(() => {
					this.timestamp1 -= 1
					if(this.timestamp1 < 0) clearInterval(this.interval)
				}, 1000)
			}
		},

		computed: {
			days() {
				return Math.floor(this.timestamp1 / (60 * 60 * 24))
			},
			hours() {
				return Math.floor((this.timestamp1 % ( 60 * 60 * 24)) / (60 * 60))
			},
			minutes() {
				return Math.floor((this.timestamp1 % ( 60 * 60)) / (60))
			},
			seconds() {
				return Math.floor((this.timestamp1 % (60)) )
			},
			formatTime() {
				let str = ''
				if(this.days > 0)
					str += this.days + ' D:'
				if(this.hours > 0)
					str += this.hours + 'H:'
				if(this.minutes > 0)
					str += this.minutes + 'M:'
				if(this.seconds > 0)
					str += this.seconds + 'S'
				return str
			},
			publicPath() {
				return process.env.BASE_URL
			},
		},
	}
</script>

<style scoped>
	
</style>