import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import Authereum from "authereum";
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";

import * as common from './utils/common.js'
import * as currentContract from './contract.js'


const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: "c334bb4b45a444979057f0fb8a0c9d1b" // required
        }
    },
    authereum: {
        package: Authereum, // required
        options: {}
    },
    burnerconnect: {
        package: BurnerConnectProvider, // required
        options: {}
    },
    fortmatic: {
        package: Fortmatic, // required
        options: {
          key: "pk_live_190B10CE18F47DCD" // required
        }
    }
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

async function init() {
	//try catch for checking cancel dialog
	const provider = await web3Modal.connect();

	const web3 = new Web3(provider);
	window.web3 = web3;
    window.web3provider = web3;

	await currentContract.init();
    var default_account = (await web3.eth.getAccounts())[0];
    currentContract.contract.default_account = default_account;

	await common.update_fee_info();
	currentContract.contract.initializedContracts = true;

}

export default init;