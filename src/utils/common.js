import Vue from "vue";
import BigNumber from 'bignumber.js'
import { contract as currentContract } from '../contract.js'
import * as abis from '../abis'
import allabis from '../allabis'
import Web3 from "web3";


var cBN = (val) => new BigNumber(val);

export function approve(contract, amount, account, toContract) {
    if(!toContract) toContract = currentContract.swap_address
    return new Promise(resolve => {
                contract.methods.approve(toContract, cBN(amount).toFixed(0,1))
                .send({from: account, gas: 100000})
                .once('transactionHash', function(hash) {resolve(true);});
            });
}


export function approve_to_migrate(amount, account) {
    return new Promise(resolve => {
                currentContract.old_swap_token.methods.approve(currentContract.migration_address, amount)
                .send({from: account, gas: 100000})
                .once('transactionHash', function(hash) {resolve(true);});
            });
}

export async function ensure_allowance_zap_out(amount) {
    var default_account = (await web3.eth.getAccounts())[0];
    let fromContract = currentContract.swap_token;
    let toContract = allabis[currentContract.currentContract].deposit_address
    let allowance = await currentContract.swap_token.methods.allowance(default_account, toContract).call()

    if(allowance > 0) await approve(fromContract, 0, default_account, toContract)
    await approve(fromContract, amount, default_account, toContract)
}

export async function ensure_allowance(amounts, plain = false, withdrawplain = false) {
    var default_account = (await web3.eth.getAccounts())[0];
    var allowances = new Array(currentContract.N_COINS);
    let coins = currentContract.coins;
    let swap = currentContract.swap_address;
    if(plain) {
        coins = currentContract.underlying_coins;
        swap = allabis[currentContract.currentContract].deposit_address;
    }
    let fromContract = coins
    if(withdrawplain) fromContract = currentContract.deposit_zap
    for (let i=0; i < currentContract.N_COINS; i++)
        allowances[i] = await coins[i].methods.allowance(default_account, swap).call();

    if (amounts) {
        // Non-infinite
        for (let i=0; i < currentContract.N_COINS; i++) {
            if (cBN(allowances[i]).isLessThan(amounts[i])) {
                if (allowances[i] > 0)
                    await approve(coins[i], 0, default_account, swap);
                await approve(coins[i], amounts[i], default_account, swap);
            }
        }
    }
    else {
        // Infinite
        for (let i=0; i < currentContract.N_COINS; i++) {
            if (cBN(allowances[i]).isLessThan(max_allowance.div(cBN(2)))) {
                if (allowances[i] > 0)
                    await approve(coins[i], 0, default_account, swap);
                await approve(coins[i], max_allowance, default_account, swap);
            }
        }
    }
}

export async function ensure_underlying_allowance(i, _amount, underlying_coins = [], toContract) {
    if(!underlying_coins.length) underlying_coins = currentContract.underlying_coins;
    var default_account = (await web3.eth.getAccounts())[0];
    var amount = cBN(_amount);
    var current_allowance = cBN(await underlying_coins[i].methods.allowance(default_account, currentContract.swap_address).call());

    if (current_allowance.isEqualTo(amount))
        return false;
    if ((cBN(_amount).isEqualTo(currentContract.max_allowance)) & (current_allowance.isGreaterThan(currentContract.max_allowance.div(cBN(2)))))
        return false;  // It does get spent slowly, but that's ok

    if ((current_allowance.isGreaterThan(cBN(0))) & (current_allowance.isLessThan(amount)))
        await approve(underlying_coins[i], 0, default_account, toContract);
    return await approve(underlying_coins[i], cBN(amount).toFixed(0,1), default_account, toContract);
}

// XXX not needed anymore
// Keeping for old withdraw, to be removed whenever the chance is
export async function ensure_token_allowance() {
    var default_account = (await web3.eth.getAccounts())[0];
    if (parseInt(await currentContract.swap_token.methods.allowance(default_account, currentContract.swap_address).call()) == 0)
        return new Promise(resolve => {
            currentContract.swap_token.methods.approve(currentContract.swap_address, cBN(currentContract.max_allowance).toFixed(0))
            .send({from: default_account})
            .once('transactionHash', function(hash) {resolve(true);});
        })
    else
        return false;
}

export function init_menu() {
    $("div.top-menu-bar a").toArray().forEach(function(el) {
        if (el.href == window.location.href)
            el.classList.add('selected')
    })
    $('#poolsdropdown .dropdown a').toArray().forEach(function(el) {
        if(el.href.slice(0,-1) == window.location.origin)
            el.classList.add('selected')
    })
}

export async function update_rates(version = 'new') {
    for (let i = 0; i < currentContract.N_COINS; i++) {
        /*
        rate: uint256 = cERC20(self.coins[i]).exchangeRateStored()
        supply_rate: uint256 = cERC20(self.coins[i]).supplyRatePerBlock()
        old_block: uint256 = cERC20(self.coins[i]).accrualBlockNumber()
        rate += rate * supply_rate * (block.number - old_block) / 10 ** 18
        */

        if(allabis[currentContract.currentContract].tethered && allabis[currentContract.currentContract].tethered[i] &&
            allabis[currentContract.currentContract].use_lending && !allabis[currentContract.currentContract].use_lending[i]) {

            Vue.set(currentContract.c_rates, i, 1 / currentContract.coin_precisions[i]);
        }
        else if(['iearn', 'busd'].includes(currentContract.currentContract)) { 
            var rate = parseInt(await currentContract.coins[i].methods.getPricePerFullShare().call()) / 1e18 / currentContract.coin_precisions[i];
            Vue.set(currentContract.c_rates, i, rate);

        }
        else {
            var rate = parseInt(await currentContract.coins[i].methods.exchangeRateStored().call()) / 1e18 / currentContract.coin_precisions[i];
            var supply_rate = parseInt(await currentContract.coins[i].methods.supplyRatePerBlock().call());
            var old_block = parseInt(await currentContract.coins[i].methods.accrualBlockNumber().call());
            var block = await web3.eth.getBlockNumber();
            Vue.set(currentContract.c_rates, i, rate * (1 + supply_rate * (block - old_block) / 1e18));
        }
    }
    var swap_stats = currentContract.swap;
    if(version == 'old') swap_stats = currentContract.old_swap;
    currentContract.fee = parseInt(await swap_stats.methods.fee().call()) / 1e10;
}

export async function update_fee_info(version = 'new') {
    var swap_abi_stats = abis.swap_abi;
    var swap_address_stats = currentContract.swap_address;
    var swap_stats = currentContract.swap;
    var swap_token_stats = currentContract.swap_token;
    if(version == 'old') {
        swap_abi_stats = abis.old_swap_abi;
        swap_address_stats = currentContract.old_swap_address;
        swap_stats = currentContract.old_swap;
        swap_token_stats = currentContract.old_swap_token;
    }

    await update_rates();
    var promises = [];
    let infuraProvider = new Web3(currentContract.infura_url)
    let swapInfura = new infuraProvider.eth.Contract(swap_abi_stats, swap_address_stats);
    for (let i = 0; i < currentContract.N_COINS; i++) {
        promises.push(swapInfura.methods.balances(i).call())
/*        balances[i] = parseInt(await swap.methods.balances(i).call());
        $(bal_info[i]).text((balances[i] * c_rates[i]).toFixed(2));
        total += balances[i] * c_rates[i];*/
    }
    let resolves = await Promise.all(promises)
    let balances = []
    currentContract.total = 0;
    resolves.forEach((balance, i) => {
        Vue.set(currentContract.balances, i, balance)
        balances[i] = +balance;
        Vue.set(currentContract.bal_info, i, balances[i] * currentContract.c_rates[i]);
        currentContract.total += balances[i] * currentContract.c_rates[i];
    })
    currentContract.fee = parseInt(await swap_stats.methods.fee().call()) / 1e10;
    currentContract.admin_fee = parseInt(await swap_stats.methods.admin_fee().call()) / 1e10;

    var default_account = (await web3.eth.getAccounts())[0];
    if (default_account) {
        var token_balance = parseInt(await swap_token_stats.methods.balanceOf(default_account).call());
        if (token_balance > 0) {
            var token_supply = parseInt(await swap_token_stats.methods.totalSupply().call());
            currentContract.totalShare = 0;
            for (let i=0; i < currentContract.N_COINS; i++) {
                var val = balances[i] * currentContract.c_rates[i] * token_balance / token_supply;
                currentContract.totalShare += val;
                Vue.set(currentContract.l_info, i, val)
            }
            currentContract.showShares = true;
        }
        else {
            currentContract.totalShare = 0;
            currentContract.showShares = false;
            //no need to set other values as v-show check is done based on totalShare
        }
    }
}

export async function handle_migrate_new(page) {
    var default_account = (await web3.eth.getAccounts())[0];
    let migration = new web3.eth.Contract(abis.migration_abi, currentContract.migration_address);
    let old_balance = await currentContract.old_swap_token.methods.balanceOf(default_account).call();
    var allowance = parseInt(await currentContract.old_swap_token.methods.allowance(default_account, currentContract.migration_address).call());
    if(allowance < old_balance) {
        if (allowance > 0)
            await approve_to_migrate(0, default_account);
        await approve_to_migrate(old_balance, default_account);
    }
    await migration.methods.migrate().send({
        from: default_account,
        gas: 1500000
    });

    await update_balances();
    update_fee_info(page);
}

export async function calc_slippage(values, deposit, zap_values, to_currency) {
    //var real_values = [...$("[id^=currency_]")].map((x,i) => +($(x).val()));
    let slippage = 0;
    var token_amount;
    var real_values = Array(currentContract.N_COINS).fill(0)
    var virtual_price = await currentContract.swap.methods.get_virtual_price().call();
    if(to_currency !== undefined) {
        let precision = allabis[currentContract.currentContract].coin_precisions[to_currency]
        real_values[to_currency] = zap_values[to_currency].div(precision)
        zap_values[to_currency] = zap_values[to_currency].times(1e18/precision)
        var Sr = zap_values[to_currency]
        zap_values[to_currency] = zap_values[to_currency].div(1e18).div(currentContract.c_rates[to_currency]).toFixed(0);
        token_amount = (await currentContract.swap.methods.calc_token_amount(zap_values, to_currency).call()) / 1e18

        slippage = Sr / (virtual_price * token_amount)
    }
    else {
        real_values = values.map(v=>+v);
        var Sr = real_values.reduce((a,b) => a+b, 0);

        var values = real_values.map((x,i) => cBN(Math.floor(x / currentContract.c_rates[i]).toString()).toFixed(0,1));
        token_amount = (await currentContract.swap.methods.calc_token_amount(values, deposit).call()) / 1e18
    }
    var Sv = virtual_price * token_amount / 1e18;
    for(let i = 0; i < currentContract.N_COINS; i++) {
        let coin_balance = parseInt(await currentContract.swap.methods.balances(i).call()) * currentContract.c_rates[i];
        if(!deposit) {
            if(coin_balance < real_values[i]) {
                currentContract.showNoBalance = true;
                currentContract.noBalanceCoin = i;
            }
            else
                currentContract.showNoBalance = false;
        }
    }
    if (deposit)
        slippage = Sv / Sr
    else if(to_currency === undefined)
        slippage = Sr / Sv;
    slippage = slippage - 1;
    slippage = slippage || 0
    console.log(slippage)
    currentContract.slippage = slippage;
    currentContract.showSlippage = true;
}