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
            this.nullifyAmounts()
            this.mounted();
        })
    },
    mounted() {
        this.$watch(()=>currentContract.default_account, (val, oldval) => {
            if(!oldval) return;
            if(val.toLowerCase() != oldval.toLowerCase()) {
                this.cancel = true;
                setTimeout(()=>{
                    this.cancel = false;
                    this.nullifyAmounts();
                    this.clearCache();
                    this.mounted();
                }, 300);
            }
        })
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
    },
    methods: {
        nullifyAmounts() {
            this.deposits = -1
            this.withdrawals = -1
            this.available = -1
        },
        clearCache() {
            localStorage.removeItem(this.currentPool + 'dversion');
            localStorage.removeItem(this.currentPool + 'lastDepositBlock');
            localStorage.removeItem(this.currentPool + 'dlastAddress');
            localStorage.removeItem(this.currentPool + 'wlastAddress');
            localStorage.removeItem(this.currentPool + 'lastDeposits');
            localStorage.removeItem(this.currentPool + 'wversion');
            localStorage.removeItem(this.currentPool + 'lastWithdrawalBlock');
            localStorage.removeItem(this.currentPool + 'lastWithdrawals');
        },
    }
}