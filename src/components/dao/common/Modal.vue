<template>
	<div>
		<slot name='activate' :show = 'show'></slot>
		<div id='modal' class='modal' v-show='showModal' @click.self='showModal = false'>
			<div class='modal-content window white'>
				<fieldset>
					<div class='legend2 hoverpointer' @click='showModal = false'>
						[<span class='greentext'>■</span>]
					</div>
					<legend>
						<slot name='title'></slot>
					</legend>
					<div>
						<slot></slot>
					</div>
					<button>
						<slot name='submit'></slot>
					</button>
				</fieldset>
			</div>
		</div>
	</div>
</template>

<script>
	import { state } from '../voteStore'

	export default {
		data: () => ({

		}),

		computed: {
			showModal: {
        		get() {
        			return state.showModal
        		},
        		set(value) {
        			state.showModal = value
        		},
        	},
		},

		methods: {
			show() {
				this.showModal = true
			},
			hide() {
				this.showModal = false
			},
		}
	}
</script>

<style scoped>
	#modal {
		z-index: 3;
	}
	.modal-content {
		text-align: center;
		padding: 0;
		border: none;
		width: 460px;
	}
	.modal-content fieldset {
		color: white;
		font-weight: bolder;
		border: 6px double white;
		padding-block-start: 1em;
		padding-block-end: 1em;
	}
	.modal-content button {
		margin-top: 0.6em;
		padding: 0 2em;
	}
	.legend2 {
	  position: absolute;
	  top: 0;
	  left: 2em;
	  background: #c0c0c0;
	  line-height:1.2em;
	}
	.greentext {
		color: green;
	}
	.legend2 .greentext {
		display: inline-block;
		transform: translate3d(0,-0.1em,10em);
	}
	.legend2 .greentext:hover {
		transform: none;
	}
	.hoverpointer {
		cursor: pointer;
	}
</style>