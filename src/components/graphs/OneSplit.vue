<template>
	<div>
		<div style="display: table; margin: auto">
            <fieldset style="float: left">
                <legend>From:</legend>
                <div class='maxbalance' @click='set_max_balance'>Max: <span>{{maxBalance}}</span> </div>
                <ul>
                    <li>
                        <input type="text" id="from_currency" :disabled='disabled' name="from_currency" value='0.00'
                        :style = "{backgroundColor: fromBgColor}"
                        @input='set_to_amount'
                        v-model='fromInput'>
                    </li>
                    <li v-for='(currency, i) in Object.keys(currencies)'>
                        <input type="radio" :id="'from_cur_'+i" name="from_cur" :value='i' v-model='from_currency'>
                        <label :for="'from_cur_'+i">{{currency | capitalize}}</label>
                    </li>
                </ul>
            </fieldset>
        </div>
	</div>
</template>

<script>
	export default {
		data: () => ({
			maxBalance: '0.00',
		}),
		methods: {
			set_max_balance() {

			},
		}
	}
</script>

<style>
	
</style>