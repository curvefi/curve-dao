<template>
	<div v-show='votesLength > 0' class='pagination'>
		<div>
			<button class='simplebutton' @click='prev' :disabled='page == 0'>Prev</button>
			<span> {{ page }} (of {{ pages }}) </span>
			<button class='simplebutton' @click='next' :disabled='page == this.pages'>Next</button>
		</div>
		<div class='perpage'>
			Per page:
			<select class='tvision' v-model='perPage'>
				<option v-for='perPageNum in perPageOptions'>
					{{ perPageNum }}
				</option>
			</select>
		</div>

	</div>
</template>

<script>
	import { getAllVotes, state, getters, changeFilter } from '../voteStore'
	
	export default {
		data: () => ({
			perPageOptions: [10, 20, 30, 50, 100],
		}),

		computed: {
			...getters,
			perPage: {
				get() {
					return state.pagination.perPage
				},
				set(val) {
					state.pagination.perPage = val
				},
			},
			votesLength() {
				return this.customFilterVotes.length
			},
			page() {
				return state.pagination.page
			},
			pages() {
				return this.customFilterVotes.length && Math.ceil(this.customFilterVotes.length / state.pagination.perPage) - 1
			},
		},

		methods: {
			prev() {
				if(this.page == 0) return;
				state.pagination.page -= 1
			},
			next() {
				if(this.page < this.pages)
				state.pagination.page += 1
			},
		},

	}
</script>

<style scoped>
	.pagination {
		margin-top: 0.4em;
		display: flex;
	}
	select.tvision {
		box-shadow: none;
	}
	.perpage {
		margin-left: 3em;
	}
</style>