<template>
	<div>
		<img 
			:src="publicPath + 'hourglass-start-solid.svg'" 
			class='icon small'
			v-show='vote.timeLeft > 0'
		> {{ formatTime }}
	</div>
</template>

<script>
	import { formatDayTimeToHuman } from '../../../utils/helpers'

	export default {
		props: ['vote'],

		data: function() {
			return {
				interval: null,
			}
		},

		watch: {
			voteNumber: {
				handler(val) {
					this.startTimer()
				},
				immediate: true,
			}
		},

		computed: {
			voteNumber() {
				return this.vote.voteNumber
			},
			days() {
				return Math.floor(this.vote.timeLeft / (60 * 60 * 24))
			},
			hours() {
				return Math.floor((this.vote.timeLeft % ( 60 * 60 * 24)) / (60 * 60))
			},
			minutes() {
				return Math.floor((this.vote.timeLeft % ( 60 * 60)) / (60))
			},
			seconds() {
				return Math.floor((this.vote.timeLeft % (60)) )
			},
			formatTime() {
				let str = ''
				if(this.days > 0)
					str += String(this.days).padStart(2, '0') + 'D:'
				if(this.hours > 0)
					str += String(this.hours).padStart(2, '0') + 'H:'
				if(this.minutes >= 0)
					str += String(this.minutes).padStart(2, '0') + 'M:'
				if(this.seconds >= 0)
					str += String(this.seconds).padStart(2, '0') + 'S'
				return str
			},
			publicPath() {
				return process.env.BASE_URL
			},
		},

		methods: {
			startTimer() {
				if(this.vote.timeLeft > 0 && !this.vote.executed && this.interval === null) {
					this.interval = setInterval(() => {
						this.vote.timeLeft -= 1
						if(this.vote.timeLeft < 0) clearInterval(this.interval)
					}, 1000)
				}
			},
		},

		beforeDestroy() {
			clearInterval(this.interval)
		},
	}
</script>

<style scoped>
	img {
		margin-right: 0.4em;
	}
</style>