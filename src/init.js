import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Fortmatic from "fortmatic";
import Authereum from "authereum";
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider";

import Onboard from 'bnc-onboard'

import * as common from './utils/common.js'
import * as currentContract from './contract.js'
import { infura_url } from './allabis.js'


/*const providerOptions = {
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
};*/

/*const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});*/

const onboard = Onboard({
  dappId: '4d8f5839-dd6d-4ced-8d7c-e3d332b90b4e',       // [String] The API key created by step one above
  networkId: 1,  // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
       window.web3 = new Web3(wallet.provider)
       localStorage.setItem('selectedWallet', wallet.name)
    }
  },
  walletSelect: {
      wallets: [
        { walletName: "metamask" },
        {
          walletName: "trezor",
          appUrl: "localhost",
          email: "test@example.com",
          rpcUrl:
            "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b"
        },
        {
          walletName: "ledger",
          rpcUrl:
            "https://mainnet.infura.io/v3/c334bb4b45a444979057f0fb8a0c9d1b"
        },
        { walletName: "dapper" },
        { walletName: "coinbase" },
        { walletName: "status" },
        {
          walletName: "portis",
          apiKey: "d7d72646-709a-45ab-aa43-8de5307ae0df"
        },
        { walletName: "fortmatic", apiKey: "pk_live_190B10CE18F47DCD" },
        { walletName: "torus" },
        { walletName: "squarelink", apiKey: "87288b677f8cfb09a986" },
        { walletName: "authereum" },
        { walletName: "trust" },
        {
          walletName: "walletConnect",
          infuraKey: "c334bb4b45a444979057f0fb8a0c9d1b"
        },
        { walletName: "opera" },
        { walletName: "operaTouch" }
      ]
    },

});

async function init() {
	//try catch for checking cancel dialog
	//const provider = await web3Modal.connect();

	/*const web3 = new Web3(provider);
	window.web3 = web3;
  window.web3provider = web3;*/
  try {
    let userSelectedWallet = await onboard.walletSelect(localStorage.getItem('selectedWallet'));
    if(userSelectedWallet) await onboard.walletCheck();
    else window.web3 = new Web3(infura_url)

    await currentContract.init();
    var default_account = (await web3.eth.getAccounts())[0];
    currentContract.contract.default_account = default_account;

  	await common.update_fee_info();
  	currentContract.contract.initializedContracts = true;
  }
  catch(err) {
    console.error(err, "THE ERROR")
  }

}

export default init;