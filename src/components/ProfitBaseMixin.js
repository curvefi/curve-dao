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
      this.$watch(()=>currentContract.currentContract, (val, oldval) => {
          this.nullifyAmounts()
          if(val.toLowerCase() != oldval.toLowerCase()) {
              this.cancel = true;
              setTimeout(()=>{
                  this.cancel = false;
                  this.nullifyAmounts();
                  this.mounted();
              }, 1000);
          }
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
    account: null,
		deposits: -1,
		withdrawals: -1,
		available: -1,
    profit: -1,
		profit: '',
    depositsUSD: -1,
    withdrawalsUSD: -1,
    availableUSD: -1,
    profitUSD: -1,
    showinUSD: true,
		BN: '',
		priceData: '',
    priceData5m: '',
		ADDRESSES: {},
		CURVE: '',
		CURVE_TOKEN: '',
		TRANSFER_TOPIC: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    notinpricedata: false,
    cancel: false,
	}),
    computed: {
      ...getters,
      version() {
        return process.env.VUE_APP_VERSION
      },
      showDeposits() {
      if(this.showinUSD) return this.depositsUSD;
        return (this.deposits / 100)
      },
      showWithdrawals() {
      if(this.showinUSD) return this.withdrawalsUSD;
        return (this.withdrawals / 100)
      },
      showAvailable() {
      if(this.showinUSD) return this.availableUSD;
        return (this.available / 100)
      },
      showStakedBalance() {
      if(!['susdv2', 'sbtc'].includes(this.currentPool)) return 0
      if(this.showinUSD) return this.getStakedBalanceUSD;
        return (this.getStakedBalance / 100); 
      },
      showProfit() {
        return ((+this.showAvailable + +this.showStakedBalance) + +this.showWithdrawals - +this.showDeposits) || 0
      },
    },
    beforeDestroy() {
        this.cancel = true;
    },
    methods: {
        toFixed(num, precisions = 2, round = 4) {
            if(num == 0) return 0
            if(num == '' || num === null || num === undefined) return ''
            if(precisions == 2 && ['tbtc', 'ren', 'sbtc'].includes(this.currentPool)) precisions = 8
            if(this.showinUSD) precisions = 2
            let rounded = helpers.formatNumber(num, precisions)
            return rounded
        },
        nullifyAmounts() {
          this.deposits = -1
          this.withdrawals = -1
          this.available = -1
          this.depositsUSD = -1
          this.withdrawalsUSD = -1
          this.availableUSD = -1
        },
        clearCache() {
            localStorage.removeItem(this.currentPool + 'dversion');
            localStorage.removeItem(this.currentPool + 'lastDepositBlock');
            localStorage.removeItem(this.currentPool + 'dlastAddress');
            localStorage.removeItem(this.currentPool + 'wlastAddress');
            localStorage.removeItem(this.currentPool + 'lastDeposits');
            localStorage.removeItem(this.currentPool + 'lastDepositsUSD');
            localStorage.removeItem(this.currentPool + 'wversion');
            localStorage.removeItem(this.currentPool + 'lastWithdrawalBlock');
            localStorage.removeItem(this.currentPool + 'lastWithdrawals');
            localStorage.removeItem(this.currentPool + 'lastWithdrawalsUSD');
        },
    }
}