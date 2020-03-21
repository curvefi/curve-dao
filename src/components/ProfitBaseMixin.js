import Vue from 'vue'
import * as common from '../utils/common.js'
import { getters, contract as currentContract } from '../contract'
import * as helpers from '../utils/helpers'
import Web3 from "web3";

import BigNumber from 'bignumber.js'

export default {
    created() {
        this.$watch(()=>currentContract.initializedContracts, val => {
            if(val) this.mounted();
        })
        this.$watch(()=>currentContract.currentContract, val => {
            this.deposits = -1
            this.withdrawals = -1
            this.available = -1
            this.mounted();
        })
    },
    mounted() {
        if(currentContract.initializedContracts) this.mounted();
    },
	data: () => ({
		deposits: -1,
		withdrawals: -1,
		available: -1,
		profit: '',
		BN: '',
		priceData: '',
		ADDRESSES: {},
		CURVE: '',
		CURVE_TOKEN: '',
		TRANSFER_TOPIC: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        cancel: false,
	}),
    computed: {
      ...getters,
      version() {
        return process.env.VUE_APP_VERSION
      }
    },
    beforeDestroy() {
        this.cancel = true;
    }
}