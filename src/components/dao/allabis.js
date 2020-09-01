export let poolproxy_abi = [{"name":"CommitAdmins","inputs":[{"type":"address","name":"ownership_admin","indexed":false},{"type":"address","name":"parameter_admin","indexed":false},{"type":"address","name":"emergency_admin","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyAdmins","inputs":[{"type":"address","name":"ownership_admin","indexed":false},{"type":"address","name":"parameter_admin","indexed":false},{"type":"address","name":"emergency_admin","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddBurner","inputs":[{"type":"address","name":"burner","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"name":"commit_set_admins","outputs":[],"inputs":[{"type":"address","name":"_o_admin"},{"type":"address","name":"_p_admin"},{"type":"address","name":"_e_admin"}],"stateMutability":"nonpayable","type":"function","gas":108937},{"name":"apply_set_admins","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":111286},{"name":"set_burner","outputs":[],"inputs":[{"type":"address","name":"_token"},{"type":"address","name":"_burner"}],"stateMutability":"nonpayable","type":"function","gas":96865},{"name":"withdraw_admin_fees","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":57985},{"name":"burn","outputs":[],"inputs":[{"type":"address","name":"_burner"}],"stateMutability":"nonpayable","type":"function","gas":57330},{"name":"burn_coin","outputs":[],"inputs":[{"type":"address","name":"_coin"}],"stateMutability":"nonpayable","type":"function","gas":58287},{"name":"burn_eth","outputs":[],"inputs":[],"stateMutability":"payable","type":"function","gas":92172},{"name":"kill_me","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":59060},{"name":"unkill_me","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":59937},{"name":"commit_transfer_ownership","outputs":[],"inputs":[{"type":"address","name":"_pool"},{"type":"address","name":"new_owner"}],"stateMutability":"nonpayable","type":"function","gas":59174},{"name":"apply_transfer_ownership","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":58195},{"name":"revert_transfer_ownership","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":59180},{"name":"commit_new_parameters","outputs":[],"inputs":[{"type":"address","name":"_pool"},{"type":"uint256","name":"amplification"},{"type":"uint256","name":"new_fee"},{"type":"uint256","name":"new_admin_fee"}],"stateMutability":"nonpayable","type":"function","gas":59255},{"name":"apply_new_parameters","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":58285},{"name":"revert_new_parameters","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":59270},{"name":"commit_new_fee","outputs":[],"inputs":[{"type":"address","name":"_pool"},{"type":"uint256","name":"new_fee"},{"type":"uint256","name":"new_admin_fee"}],"stateMutability":"nonpayable","type":"function","gas":59330},{"name":"apply_new_fee","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":58375},{"name":"ramp_A","outputs":[],"inputs":[{"type":"address","name":"_pool"},{"type":"uint256","name":"_future_A"},{"type":"uint256","name":"_future_time"}],"stateMutability":"nonpayable","type":"function","gas":59390},{"name":"stop_ramp_A","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":59390},{"name":"set_aave_referral","outputs":[],"inputs":[{"type":"address","name":"_pool"},{"type":"uint256","name":"referral_code"}],"stateMutability":"nonpayable","type":"function","gas":59435},{"name":"donate_admin_fees","outputs":[],"inputs":[{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":59450},{"name":"ownership_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1781},{"name":"parameter_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1811},{"name":"emergency_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1841},{"name":"future_ownership_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1871},{"name":"future_parameter_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1901},{"name":"future_emergency_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1931},{"name":"burners","outputs":[{"type":"address","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":2115}]
export let poolproxy_natspec = {
  "methods": {
    "commit_set_admins(address,address,address)": {
      "notice": "Set ownership admin `@address(_o_admin, 'to')`, parameter admin `@address(_p_admin, 'to')` and emergency admin `@address(_e_admin, 'to')`",
      "signature": "0x8cb16c8a"
    },
    "apply_set_admins()": {
      "notice": "Apply set admins",
      "signature": "0x5dc409d9",
    },
    "set_burner(address,address)": {
      "notice": "Set burner of `_token` `@address(_burner, 'to')` address",
      "signature": "0x1198c785"
    },
    "withdraw_admin_fees(address)": {
      "notice": "Withdraw admin fees `@address(_pool, 'from')`",
      "signature": "0xe4e67c0f"
    },
    "burn(address)": {
      "notice": "Burn CRV tokens using `@address(_burner)` contract",
      "signature": "0x89afcb44"
    },
    "burn_coin(address)": {
      "notice": "Burn CRV tokens and buy `@address(_coin)`",
      "signature": "0x580b2a84"
    },
    "burn_eth()": {
      "notice": "Burn ETH",
      "signature": "0x2f4e2ec4"
    },
    "kill_me(address)": {
      "notice": "Pause a `@address(_pool)` pool, remove_liquidity will be able to be called only",
      "signature": "0xb01f275f"
    },
    "unkill_me(address)": {
      "notice": "Unpause `@address(_pool)` pool and enable back all functionality",
      "signature": "0x1cfbc236"
    },
    "commit_transfer_ownership(address,address)": {
      "notice": "Transfer ownership `@address(_pool, 'for')` pool `@address(new_owner, 'to')` address",
      "signature": "0x3ea1c6f4"
    },
    "apply_transfer_ownership(address)": {
      "notice": "Apply transferring ownership `@address(_pool, 'of')`",
      "signature": "0x5f608d1e"
    },
    "revert_transfer_ownership(address)": {
      "notice": "Revert commited transferring ownership `@address(_pool, 'for')`",
      "signature": "0xa352c2eb"
    },
    "commit_new_parameters(address,uint256,uint256,uint256)": {
      "notice": "Commit new parameters `@address(_pool, 'for')`, `@param(amplification, 'A')`, `@param(new_fee, 'new fee')` and `@param(new_admin_fee, 'new admin fee')`",
      "signature": "0x85273a22"
    },
    "apply_new_parameters(address)": {
      "notice": "Apply new parameters `@address(_pool, 'for')` pool",
      "signature": "0xcf56a4d8"
    },
    "revert_new_parameters(address)": {
      "notice": "Revert comitted new parameters `@address(_pool, 'for')` pool",
      "signature": "0x5082b389"
    },
    "commit_new_fee(address,uint256,uint256)": {
      "notice": "Commit new fees `@address(_pool, 'for')` pool, `@param(new_fee, 'new fee')` and `@param(new_admin_fee, 'new admin fee')`",
      "signature": "0xcfca0bdb"
    },
    "apply_new_fee(address)": {
      "notice": "Apply new fees `@address(_pool, 'for')` pool",
      "signature": "0xe8d64d6c"
    },
    "ramp_A(address,uint256,uint256)": {
      "notice": "Start gradually increasing A `@address(_pool, 'of')` reaching `@param(_future_A, '_future_A')` at `@param(_future_time, '_future_time')` time",
      "signature": "0x9d4a4380"
    },
    "stop_ramp_A(address)": {
      "notice": "Stop gradually increasing A `@address(_pool, 'of')`",
      "signature": "0x53f79b2b"
    },
    "set_aave_referral(address,uint256)": {
      "notice": "Set Aave referral for undelying tokens `@address(_pool, 'of')` to `@param(referral_code, 'referral_code')`",
      "signature": "0xdda3c543"
    },
    "donate_admin_fees(address)": {
      "notice": "Donate admin fees `@address(_pool, 'of')` pool",
      "signature": "0xdb0a8406"
    }
  }
}
export let poolproxy_address = '0x6e8f6D1DA6232d5E40b0B8758A0145D6C5123eB7' //'0x57ECf8e21BD855Bd18B7b37211945d7ccd4f3493'

export let votingescrow_abi = [{"name":"CommitOwnership","inputs":[{"type":"address","name":"admin","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyOwnership","inputs":[{"type":"address","name":"admin","indexed":false}],"anonymous":false,"type":"event"},{"name":"Deposit","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256","name":"value","indexed":false},{"type":"uint256","name":"locktime","indexed":true},{"type":"int128","name":"type","indexed":false},{"type":"uint256","name":"ts","indexed":false}],"anonymous":false,"type":"event"},{"name":"Withdraw","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256","name":"value","indexed":false},{"type":"uint256","name":"ts","indexed":false}],"anonymous":false,"type":"event"},{"name":"Supply","inputs":[{"type":"uint256","name":"prevSupply","indexed":false},{"type":"uint256","name":"supply","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"address","name":"token_addr"},{"type":"string","name":"_name"},{"type":"string","name":"_symbol"},{"type":"string","name":"_version"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"commit_transfer_ownership","outputs":[],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"nonpayable","type":"function","gas":37597},{"name":"apply_transfer_ownership","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":38497},{"name":"commit_smart_wallet_checker","outputs":[],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"nonpayable","type":"function","gas":36307},{"name":"apply_smart_wallet_checker","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":37095},{"name":"get_last_user_slope","outputs":[{"type":"int128","name":""}],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"view","type":"function","gas":2569},{"name":"user_point_history__ts","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_addr"},{"type":"uint256","name":"_idx"}],"stateMutability":"view","type":"function","gas":1672},{"name":"locked__end","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_addr"}],"stateMutability":"view","type":"function","gas":1593},{"name":"checkpoint","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":37052342},{"name":"deposit_for","outputs":[],"inputs":[{"type":"address","name":"_addr"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":74279891},{"name":"create_lock","outputs":[],"inputs":[{"type":"uint256","name":"_value"},{"type":"uint256","name":"_unlock_time"}],"stateMutability":"nonpayable","type":"function","gas":74281465},{"name":"increase_amount","outputs":[],"inputs":[{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":74280830},{"name":"increase_unlock_time","outputs":[],"inputs":[{"type":"uint256","name":"_unlock_time"}],"stateMutability":"nonpayable","type":"function","gas":74281578},{"name":"withdraw","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":37223566},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"view","type":"function"},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"addr"},{"type":"uint256","name":"_t"}],"stateMutability":"view","type":"function"},{"name":"balanceOfAt","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"addr"},{"type":"uint256","name":"_block"}],"stateMutability":"view","type":"function","gas":514333},{"name":"totalSupply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function"},{"name":"totalSupply","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"t"}],"stateMutability":"view","type":"function"},{"name":"totalSupplyAt","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_block"}],"stateMutability":"view","type":"function","gas":812560},{"name":"changeController","outputs":[],"inputs":[{"type":"address","name":"_newController"}],"stateMutability":"nonpayable","type":"function","gas":36907},{"name":"token","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1841},{"name":"supply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1871},{"name":"locked","outputs":[{"type":"int128","name":"amount"},{"type":"uint256","name":"end"}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":3359},{"name":"epoch","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1931},{"name":"point_history","outputs":[{"type":"int128","name":"bias"},{"type":"int128","name":"slope"},{"type":"uint256","name":"ts"},{"type":"uint256","name":"blk"}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":5550},{"name":"user_point_history","outputs":[{"type":"int128","name":"bias"},{"type":"int128","name":"slope"},{"type":"uint256","name":"ts"},{"type":"uint256","name":"blk"}],"inputs":[{"type":"address","name":"arg0"},{"type":"uint256","name":"arg1"}],"stateMutability":"view","type":"function","gas":6079},{"name":"user_point_epoch","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":2175},{"name":"slope_changes","outputs":[{"type":"int128","name":""}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":2166},{"name":"controller","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2081},{"name":"transfersEnabled","outputs":[{"type":"bool","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2111},{"name":"name","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":8543},{"name":"symbol","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":7596},{"name":"version","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":7626},{"name":"decimals","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2231},{"name":"future_smart_wallet_checker","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2261},{"name":"smart_wallet_checker","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2291},{"name":"admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2321},{"name":"future_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":2351}]
export let votingescrow_natspec = {
  "methods": {
    "commit_transfer_ownership(address)": {
      "notice": "Commit transfer ownership of VotingEscrow contract `@address(addr, 'to')`",
      "signature": "0x6b441a40"
    },
    "apply_transfer_ownership()": {
      "notice": "Apply transfer ownership of VotingEscrow contract",
      "signature": "0x6a1c05ae"
    },
    "commit_smart_wallet_checker(address)": {
      "notice": "Commit VotingEscrow smart wallet checker to be `@address(addr, '')`",
      "signature": "0x57e55c32"
    },
    "apply_smart_wallet_checker()": {
      "notice": "Apply VotingEscrow smart wallet checker",
      "signature": "0x8c2fa83b"
    },
    "add_to_whitelist(address)": {
      "notice": "Add address to whitelist smart contract depositors `@address(addr)`",
      "signature": "0xac25f266"
    },
    "remove_from_whitelist(address)": {
      "notice": "Remove a smart contract address from whitelist",
      "signature": "0x90fad1e6"
    },
    "deposit_for(address,uint256)": {
      "notice": "Anyone can deposit for someone else, but cannot extend their locktime",
      "signature": "0x3a46273e"
    },
    "deposit(uint256)": {
      "notice": "Deposit `value` or extend locktime If previous lock is expired but hasn't been taken - use that",
      "signature": "0xb6b55f25"
    },
    "withdraw()": {
      "notice": "Withdraw `value` if it's withdrawable",
      "signature": "0x3ccfd60b"
    }
  }
}
export let votingescrow_address = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2' //'0x17b3b360979cf2FecfFE7B0c3AfdDD8d8671a5AD'

export let gaugecontroller_abi = [
  {
    "name": "CommitOwnership",
    "inputs": [
      {
        "type": "address",
        "name": "admin",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "ApplyOwnership",
    "inputs": [
      {
        "type": "address",
        "name": "admin",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "AddType",
    "inputs": [
      {
        "type": "string",
        "name": "name",
        "indexed": false
      },
      {
        "type": "int128",
        "name": "type_id",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "NewTypeWeight",
    "inputs": [
      {
        "type": "int128",
        "name": "type_id",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "time",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "weight",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "total_weight",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "NewGaugeWeight",
    "inputs": [
      {
        "type": "address",
        "name": "gauge_address",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "time",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "weight",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "total_weight",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "VoteForGauge",
    "inputs": [
      {
        "type": "uint256",
        "name": "time",
        "indexed": false
      },
      {
        "type": "address",
        "name": "user",
        "indexed": false
      },
      {
        "type": "address",
        "name": "gauge_addr",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "weight",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "NewGauge",
    "inputs": [
      {
        "type": "address",
        "name": "addr",
        "indexed": false
      },
      {
        "type": "int128",
        "name": "gauge_type",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "weight",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "_token"
      },
      {
        "type": "address",
        "name": "_voting_escrow"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "name": "commit_transfer_ownership",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 37597
  },
  {
    "name": "apply_transfer_ownership",
    "outputs": [],
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 38497
  },
  {
    "name": "gauge_types",
    "outputs": [
      {
        "type": "int128",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "_addr"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 1625
  },
  // {
  //   "name": "add_gauge",
  //   "outputs": [],
  //   "inputs": [
  //     {
  //       "type": "address",
  //       "name": "addr"
  //     },
  //     {
  //       "type": "int128",
  //       "name": "gauge_type"
  //     }
  //   ],
  //   "stateMutability": "nonpayable",
  //   "type": "function"
  // },
  {
    "name": "add_gauge",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      },
      {
        "type": "int128",
        "name": "gauge_type"
      },
      {
        "type": "uint256",
        "name": "weight"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "checkpoint",
    "outputs": [],
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 18033784416
  },
  {
    "name": "checkpoint_gauge",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 18087678795
  },
  {
    "name": "gauge_relative_weight_write",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "gauge_relative_weight_write",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      },
      {
        "type": "uint256",
        "name": "time"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "gauge_relative_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "name": "gauge_relative_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      },
      {
        "type": "uint256",
        "name": "time"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // {
  //   "name": "add_type",
  //   "outputs": [],
  //   "inputs": [
  //     {
  //       "type": "string",
  //       "name": "_name"
  //     }
  //   ],
  //   "stateMutability": "nonpayable",
  //   "type": "function"
  // },
  {
    "name": "add_type",
    "outputs": [],
    "inputs": [
      {
        "type": "string",
        "name": "_name"
      },
      {
        "type": "uint256",
        "name": "weight"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "change_type_weight",
    "outputs": [],
    "inputs": [
      {
        "type": "int128",
        "name": "type_id"
      },
      {
        "type": "uint256",
        "name": "weight"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 36246310050
  },
  {
    "name": "change_gauge_weight",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      },
      {
        "type": "uint256",
        "name": "weight"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 36354170809
  },
  {
    "name": "vote_for_gauge_weights",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "_gauge_addr"
      },
      {
        "type": "uint256",
        "name": "_user_weight"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 18142052127
  },
  {
    "name": "get_gauge_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2974
  },
  {
    "name": "get_type_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "int128",
        "name": "type_id"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2977
  },
  {
    "name": "get_total_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2693
  },
  {
    "name": "get_weights_sum_per_type",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "int128",
        "name": "type_id"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 3109
  },
  {
    "name": "admin",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1841
  },
  {
    "name": "future_admin",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1871
  },
  {
    "name": "token",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1901
  },
  {
    "name": "voting_escrow",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1931
  },
  {
    "name": "n_gauge_types",
    "outputs": [
      {
        "type": "int128",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1961
  },
  {
    "name": "n_gauges",
    "outputs": [
      {
        "type": "int128",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1991
  },
  {
    "name": "gauge_type_names",
    "outputs": [
      {
        "type": "string",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "int128",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 8628
  },
  {
    "name": "gauges",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2160
  },
  {
    "name": "vote_user_slopes",
    "outputs": [
      {
        "type": "uint256",
        "name": "slope"
      },
      {
        "type": "uint256",
        "name": "power"
      },
      {
        "type": "uint256",
        "name": "end"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      },
      {
        "type": "address",
        "name": "arg1"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 5020
  },
  {
    "name": "vote_user_power",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2265
  },
  {
    "name": "last_user_vote",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      },
      {
        "type": "address",
        "name": "arg1"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2449
  },
  {
    "name": "points_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": "bias"
      },
      {
        "type": "uint256",
        "name": "slope"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      },
      {
        "type": "uint256",
        "name": "arg1"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 3859
  },
  {
    "name": "time_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2355
  },
  {
    "name": "points_sum",
    "outputs": [
      {
        "type": "uint256",
        "name": "bias"
      },
      {
        "type": "uint256",
        "name": "slope"
      }
    ],
    "inputs": [
      {
        "type": "int128",
        "name": "arg0"
      },
      {
        "type": "uint256",
        "name": "arg1"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 3970
  },
  {
    "name": "time_sum",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2370
  },
  {
    "name": "points_total",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2406
  },
  {
    "name": "time_total",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2321
  },
  {
    "name": "points_type_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "int128",
        "name": "arg0"
      },
      {
        "type": "uint256",
        "name": "arg1"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2671
  },
  {
    "name": "time_type_weight",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2490
  }
]
export let gaugecontroller_natspec = {
  "methods": {
    "commit_transfer_ownership(address)": {
      "notice": "Commit transfer ownership of GaugeController `@address(addr, 'to')`",
      "signature": "0xf0350c04"
    },
    "apply_transfer_ownership()": {
      "notice": "Apply transfer ownership of GaugeController",
      "signature": "0x5f608d1e"
    },
    "add_gauge(address,int128,uint256)": {
      "notice": "Add gauge `@address(addr, '')` of `@param(gauge_type, 'gauge_type')` with `@param(weight, 'weight')`",
      "signature": "0x3a04f900"
    },
    // "add_type(address,int128)": {
    //   "notice": "Add gauge `@address(addr, '')` of `@param(gauge_type, 'gauge_type')` with `@param(weight, 'weight')`",
    //   "signature": "0x0fbb8bfb"
    // },
    "gauge_relative_weight_write(address)": {
      "notice": "Same as gauge_relative_weight(), but also fill all the unfilled values for type and gauge records",
      "signature": "0x95cfcec3"
    },
    "add_type(string,uint256)": {
      "notice": "Add gauge type with `@param(_name, 'name')` and `@param(weight, 'weight')`",
      "signature": "0x26e56d5e"
    },
    "change_type_weight(int128,uint256)": {
      "notice": "Change gauge `@param(type_id, 'type')` `@param(weight, 'weight to')`",
      "signature": "0xdb1ca260"
    },
    "change_gauge_weight(int128,uint256)": {
      "notice": "Change gauge `@address(addr, '')` `@param(weight, 'weight to')`",
      "signature": "0x52372603"
    },
    "vote_for_gauge_weights(int128,int128)": {
      "notice": "Allocate voting power for changing pool weights",
      "signature": "0xd60df7bd"
    }
  }
}
export let gaugecontroller_address = '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB' //'0xf418b4D5605EB92F673b7e5DD7297198CBCC964C'

export let pool_abi = [{"name":"TokenExchange","inputs":[{"type":"address","name":"buyer","indexed":true},{"type":"int128","name":"sold_id","indexed":false},{"type":"uint256","name":"tokens_sold","indexed":false},{"type":"int128","name":"bought_id","indexed":false},{"type":"uint256","name":"tokens_bought","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenExchangeUnderlying","inputs":[{"type":"address","name":"buyer","indexed":true},{"type":"int128","name":"sold_id","indexed":false},{"type":"uint256","name":"tokens_sold","indexed":false},{"type":"int128","name":"bought_id","indexed":false},{"type":"uint256","name":"tokens_bought","indexed":false}],"anonymous":false,"type":"event"},{"name":"AddLiquidity","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256[4]","name":"token_amounts","indexed":false},{"type":"uint256[4]","name":"fees","indexed":false},{"type":"uint256","name":"invariant","indexed":false},{"type":"uint256","name":"token_supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidity","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256[4]","name":"token_amounts","indexed":false},{"type":"uint256[4]","name":"fees","indexed":false},{"type":"uint256","name":"token_supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"RemoveLiquidityImbalance","inputs":[{"type":"address","name":"provider","indexed":true},{"type":"uint256[4]","name":"token_amounts","indexed":false},{"type":"uint256[4]","name":"fees","indexed":false},{"type":"uint256","name":"invariant","indexed":false},{"type":"uint256","name":"token_supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"CommitNewAdmin","inputs":[{"type":"uint256","name":"deadline","indexed":true,"unit":"sec"},{"type":"address","name":"admin","indexed":true}],"anonymous":false,"type":"event"},{"name":"NewAdmin","inputs":[{"type":"address","name":"admin","indexed":true}],"anonymous":false,"type":"event"},{"name":"CommitNewParameters","inputs":[{"type":"uint256","name":"deadline","indexed":true,"unit":"sec"},{"type":"uint256","name":"A","indexed":false},{"type":"uint256","name":"fee","indexed":false},{"type":"uint256","name":"admin_fee","indexed":false}],"anonymous":false,"type":"event"},{"name":"NewParameters","inputs":[{"type":"uint256","name":"A","indexed":false},{"type":"uint256","name":"fee","indexed":false},{"type":"uint256","name":"admin_fee","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"address[4]","name":"_coins"},{"type":"address[4]","name":"_underlying_coins"},{"type":"address","name":"_pool_token"},{"type":"uint256","name":"_A"},{"type":"uint256","name":"_fee"}],"constant":false,"payable":false,"type":"constructor"},{"name":"get_virtual_price","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":1535185},{"name":"calc_token_amount","outputs":[{"type":"uint256","name":"out"}],"inputs":[{"type":"uint256[4]","name":"amounts"},{"type":"bool","name":"deposit"}],"constant":true,"payable":false,"type":"function","gas":6067881},{"name":"add_liquidity","outputs":[],"inputs":[{"type":"uint256[4]","name":"amounts"},{"type":"uint256","name":"min_mint_amount"}],"constant":false,"payable":false,"type":"function","gas":9327083},{"name":"get_dy","outputs":[{"type":"uint256","name":"out"}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"}],"constant":true,"payable":false,"type":"function","gas":3454227},{"name":"get_dx","outputs":[{"type":"uint256","name":"out"}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dy"}],"constant":true,"payable":false,"type":"function","gas":3454232},{"name":"get_dy_underlying","outputs":[{"type":"uint256","name":"out"}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"}],"constant":true,"payable":false,"type":"function","gas":3454087},{"name":"get_dx_underlying","outputs":[{"type":"uint256","name":"out"}],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dy"}],"constant":true,"payable":false,"type":"function","gas":3454093},{"name":"exchange","outputs":[],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256","name":"min_dy"}],"constant":false,"payable":false,"type":"function","gas":7030208},{"name":"exchange_underlying","outputs":[],"inputs":[{"type":"int128","name":"i"},{"type":"int128","name":"j"},{"type":"uint256","name":"dx"},{"type":"uint256","name":"min_dy"}],"constant":false,"payable":false,"type":"function","gas":7050194},{"name":"remove_liquidity","outputs":[],"inputs":[{"type":"uint256","name":"_amount"},{"type":"uint256[4]","name":"min_amounts"}],"constant":false,"payable":false,"type":"function","gas":240409},{"name":"remove_liquidity_imbalance","outputs":[],"inputs":[{"type":"uint256[4]","name":"amounts"},{"type":"uint256","name":"max_burn_amount"}],"constant":false,"payable":false,"type":"function","gas":9326310},{"name":"commit_new_parameters","outputs":[],"inputs":[{"type":"uint256","name":"amplification"},{"type":"uint256","name":"new_fee"},{"type":"uint256","name":"new_admin_fee"}],"constant":false,"payable":false,"type":"function","gas":145867},{"name":"apply_new_parameters","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","gas":133482},{
    "name": "ramp_A",
    "outputs": [],
    "inputs": [
      {
        "type": "uint256",
        "name": "_future_A"
      },
      {
        "type": "uint256",
        "unit": "sec",
        "name": "_future_time"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 151937
  },
  {
    "name": "stop_ramp_A",
    "outputs": [],
    "inputs": [],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 148697
  },
  {
    "name": "commit_new_fee",
    "outputs": [],
    "inputs": [
      {
        "type": "uint256",
        "name": "new_fee"
      },
      {
        "type": "uint256",
        "name": "new_admin_fee"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 110521
  },
  {
    "name": "apply_new_fee",
    "outputs": [],
    "inputs": [],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 97220
  },{"name":"revert_new_parameters","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","gas":21805},{"name":"commit_transfer_ownership","outputs":[],"inputs":[{"type":"address","name":"_owner"}],"constant":false,"payable":false,"type":"function","gas":74482},{"name":"apply_transfer_ownership","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","gas":60538},{"name":"revert_transfer_ownership","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","gas":21895},{"name":"withdraw_admin_fees","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","gas":22667},{"name":"kill_me","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","gas":37848},{"name":"unkill_me","outputs":[],"inputs":[],"constant":false,"payable":false,"type":"function","gas":21985},{"name":"coins","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"int128","name":"arg0"}],"constant":true,"payable":false,"type":"function","gas":2160},{"name":"underlying_coins","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"int128","name":"arg0"}],"constant":true,"payable":false,"type":"function","gas":2190},{"name":"balances","outputs":[{"type":"uint256","name":"out"}],"inputs":[{"type":"int128","name":"arg0"}],"constant":true,"payable":false,"type":"function","gas":2220},{"name":"A","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2051},{"name":"fee","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2081},{"name":"admin_fee","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2111},{"name":"owner","outputs":[{"type":"address","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2141},{"name":"admin_actions_deadline","outputs":[{"type":"uint256","unit":"sec","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2171},{"name":"transfer_ownership_deadline","outputs":[{"type":"uint256","unit":"sec","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2201},{"name":"future_A","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2231},{"name":"future_fee","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2261},{"name":"future_admin_fee","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2291},{"name":"future_owner","outputs":[{"type":"address","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":2321}]

export let pool_natspec = {
	"methods": {
		"commit_new_parameters(uint256,uint256,uint256)": {
			"notice": "Commit new parameters `@param(amplification, 'A')`, `@param(new_fee, 'new fee')` and `@param(new_admin_fee, 'new admin fee')`",
			"signature": "0xee11f5b6"
		},
		"apply_new_parameters()": {
			"notice": "Apply new parameters",
			"signature": "0x2a7dd7cd"
		},
		"revert_new_parameters()": {
			"notice": "Revert new parameters",
			"signature": "0x226840fb"
		},
		"commit_transfer_ownership(address)": {
			"notice": "Transfer ownership `@address(_owner, 'to')` address",
			"signature": "0x6b441a40"
		},
		"apply_transfer_ownership()": {
			"notice": "Apply transfer ownership",
			"signature": "0x6a1c05ae"
		},
		"revert_transfer_ownership()": {
			"notice": "Revert transfer ownership",
			"signature": "0x86fbf193"
		},
		"withdraw_admin_fees()": {
			"notice": "Withdraw admin fees",
			"signature": "0x30c54085"
		},
		"kill_me()": {
			"notice": "Pause pool, remove_liquidity will be able to be called only",
			"signature": "0xe3698853"
		},
		"unkill_me()": {
			"notice": "Unpause pool and enable back all functionality",
			"signature": "0x3046f972"
		},
		"ramp_A(uint256, timestamp)": {
			"notice": "Start gradually `@param(_future_A, 'increasing A to')` `@param(_future_time, 'at')` time",
			"signature": "0x20d35c68"
		},
		"stop_ramp_A()": {
			"notice": "Stop gradually increasing A",
			"signature": "0x551a6588"
		},
			"commit_new_fee(uint256, uint256)": {
			"notice": "Commit new fees for pool, fee: `@param(new_fee, 'new fee')` and `@param(new_admin_fee, 'new admin fee')`",
			"signature": "0x7e337272"
		},
		"apply_new_fee()": {
			"notice": "Apply new fees for pool",
			"signature": "0x4f12fe97"
		}
	}
}

export let agent_abi = [{"constant":true,"inputs":[],"name":"ADD_PROTECTED_TOKEN_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"hasInitialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ERC1271_INTERFACE_ID","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_operator","type":"address"},{"name":"_from","type":"address"},{"name":"_tokenId","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"onERC721Received","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_hash","type":"bytes32"},{"name":"_signature","type":"bytes"}],"name":"isValidSignature","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ERC1271_RETURN_INVALID_SIGNATURE","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TRANSFER_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_data","type":"bytes"},{"name":"_signature","type":"bytes"}],"name":"isValidSignature","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getProtectedTokensLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_script","type":"bytes"}],"name":"getEVMScriptExecutor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getRecoveryVault","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"RUN_SCRIPT_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"SAFE_EXECUTE_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"REMOVE_PROTECTED_TOKEN_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_value","type":"uint256"}],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"isDepositable","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_hash","type":"bytes32"}],"name":"presignHash","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"DESIGNATE_SIGNER_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"}],"name":"removeProtectedToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"EXECUTE_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"}],"name":"addProtectedToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"allowRecoverability","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"appId","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"protectedTokens","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getInitializationBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ERC1271_RETURN_VALID_SIGNATURE","outputs":[{"name":"","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"}],"name":"transferToVault","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_sender","type":"address"},{"name":"_role","type":"bytes32"},{"name":"_params","type":"uint256[]"}],"name":"canPerform","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEVMScriptRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_designatedSigner","type":"address"}],"name":"setDesignatedSigner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"designatedSigner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_target","type":"address"},{"name":"_data","type":"bytes"}],"name":"safeExecute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"PROTECTED_TOKENS_CAP","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ADD_PRESIGNED_HASH_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"isPresigned","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_target","type":"address"},{"name":"_ethValue","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"execute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_sender","type":"address"},{"name":"_evmScript","type":"bytes"}],"name":"canForward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"kernel","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evmScript","type":"bytes"}],"name":"forward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"isPetrified","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_token","type":"address"}],"name":"balance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isForwarder","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":true,"name":"target","type":"address"},{"indexed":false,"name":"data","type":"bytes"}],"name":"SafeExecute","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":true,"name":"target","type":"address"},{"indexed":false,"name":"ethValue","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Execute","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"token","type":"address"}],"name":"AddProtectedToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"token","type":"address"}],"name":"RemoveProtectedToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":true,"name":"hash","type":"bytes32"}],"name":"PresignHash","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":true,"name":"oldSigner","type":"address"},{"indexed":true,"name":"newSigner","type":"address"}],"name":"SetDesignatedSigner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"token","type":"address"},{"indexed":true,"name":"operator","type":"address"},{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"tokenId","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"ReceiveERC721","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"token","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"VaultTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"token","type":"address"},{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"VaultDeposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"executor","type":"address"},{"indexed":false,"name":"script","type":"bytes"},{"indexed":false,"name":"input","type":"bytes"},{"indexed":false,"name":"returnData","type":"bytes"}],"name":"ScriptResult","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"vault","type":"address"},{"indexed":true,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"RecoverToVault","type":"event"}]

export let tokenmanager_abi = [{"constant":true,"inputs":[],"name":"hasInitialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MAX_VESTINGS_PER_ADDRESS","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_holder","type":"address"}],"name":"spendableBalanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_receiver","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_start","type":"uint64"},{"name":"_cliff","type":"uint64"},{"name":"_vested","type":"uint64"},{"name":"_revokable","type":"bool"}],"name":"assignVested","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_script","type":"bytes"}],"name":"getEVMScriptExecutor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getRecoveryVault","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_recipient","type":"address"},{"name":"_vestingId","type":"uint256"}],"name":"getVesting","outputs":[{"name":"amount","type":"uint256"},{"name":"start","type":"uint64"},{"name":"cliff","type":"uint64"},{"name":"vesting","type":"uint64"},{"name":"revokable","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_receiver","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"onTransfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_holder","type":"address"},{"name":"_time","type":"uint256"}],"name":"transferableBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_token","type":"address"}],"name":"allowRecoverability","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"appId","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ISSUE_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getInitializationBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"vestingsLengths","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"}],"name":"transferToVault","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_holder","type":"address"},{"name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_sender","type":"address"},{"name":"_role","type":"bytes32"},{"name":"_params","type":"uint256[]"}],"name":"canPerform","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEVMScriptRegistry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ASSIGN_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"BURN_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_receiver","type":"address"},{"name":"_amount","type":"uint256"}],"name":"assign","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_sender","type":"address"},{"name":"","type":"bytes"}],"name":"canForward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kernel","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evmScript","type":"bytes"}],"name":"forward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"onApprove","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"isPetrified","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_transferable","type":"bool"},{"name":"_maxAccountTokens","type":"uint256"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MINT_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxAccountTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"REVOKE_VESTINGS_ROLE","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"","type":"address"}],"name":"proxyPayment","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_holder","type":"address"},{"name":"_vestingId","type":"uint256"}],"name":"revokeVesting","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isForwarder","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"receiver","type":"address"},{"indexed":false,"name":"vestingId","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"NewVesting","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"receiver","type":"address"},{"indexed":false,"name":"vestingId","type":"uint256"},{"indexed":false,"name":"nonVestedAmount","type":"uint256"}],"name":"RevokeVesting","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"executor","type":"address"},{"indexed":false,"name":"script","type":"bytes"},{"indexed":false,"name":"input","type":"bytes"},{"indexed":false,"name":"returnData","type":"bytes"}],"name":"ScriptResult","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"vault","type":"address"},{"indexed":true,"name":"token","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"RecoverToVault","type":"event"}]

export let tokenmanager_natspec = {
  methods: {
    "mint(address,uint256)": {
      notice: "Mint `@param(_amount)` tokens for `@address(_receiver)`",
      signature: '0x40c10f19',
    },
    "burn(address,uint256)": {
      notice: "Burn `@param(_amount)` tokens from `@address(_holder)`",
      signature: '0x9dc29fac',
    },
  }
}

export let CRV_abi = [{"name":"Transfer","inputs":[{"type":"address","name":"_from","indexed":true},{"type":"address","name":"_to","indexed":true},{"type":"uint256","name":"_value","indexed":false}],"anonymous":false,"type":"event"},{"name":"Approval","inputs":[{"type":"address","name":"_owner","indexed":true},{"type":"address","name":"_spender","indexed":true},{"type":"uint256","name":"_value","indexed":false}],"anonymous":false,"type":"event"},{"name":"UpdateMiningParameters","inputs":[{"type":"uint256","name":"time","indexed":false},{"type":"uint256","name":"rate","indexed":false},{"type":"uint256","name":"supply","indexed":false}],"anonymous":false,"type":"event"},{"name":"SetMinter","inputs":[{"type":"address","name":"minter","indexed":false}],"anonymous":false,"type":"event"},{"name":"SetAdmin","inputs":[{"type":"address","name":"admin","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"string","name":"_name"},{"type":"string","name":"_symbol"},{"type":"uint256","name":"_decimals"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"update_mining_parameters","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":148701},{"name":"start_epoch_time_write","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":149556},{"name":"available_supply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":3958},{"name":"mintable_in_timeframe","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"start"},{"type":"uint256","name":"end"}],"stateMutability":"view","type":"function","gas":2216111},{"name":"set_minter","outputs":[],"inputs":[{"type":"address","name":"_minter"}],"stateMutability":"nonpayable","type":"function","gas":38668},{"name":"set_admin","outputs":[],"inputs":[{"type":"address","name":"_admin"}],"stateMutability":"nonpayable","type":"function","gas":37807},{"name":"totalSupply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1391},{"name":"allowance","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_owner"},{"type":"address","name":"_spender"}],"stateMutability":"view","type":"function","gas":1729},{"name":"transfer","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":75109},{"name":"transferFrom","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":111403},{"name":"approve","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_spender"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":39258},{"name":"mint","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":227923},{"name":"burn","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"uint256","name":"_value"}],"stateMutability":"nonpayable","type":"function","gas":74969},{"name":"set_name","outputs":[],"inputs":[{"type":"string","name":"_name"},{"type":"string","name":"_symbol"}],"stateMutability":"nonpayable","type":"function","gas":178240},{"name":"name","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":8033},{"name":"symbol","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":7086},{"name":"decimals","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1691},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":1875},{"name":"minter","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1751},{"name":"admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1781},{"name":"mining_epoch","outputs":[{"type":"int128","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1811},{"name":"start_epoch_time","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1841},{"name":"rate","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1871}]
export let CRV_address = '0xD533a949740bb3306d119CC777fa900bA034cd52'

export let registry_abi = [{"name": "CommitNewAdmin", "inputs": [{"type": "uint256", "name": "deadline", "indexed": true}, {"type": "address", "name": "admin", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "NewAdmin", "inputs": [{"type": "address", "name": "admin", "indexed": true}], "anonymous": false, "type": "event"}, {"name": "TokenExchange", "inputs": [{"type": "address", "name": "buyer", "indexed": true}, {"type": "address", "name": "pool", "indexed": true}, {"type": "address", "name": "token_sold", "indexed": false}, {"type": "address", "name": "token_bought", "indexed": false}, {"type": "uint256", "name": "amount_sold", "indexed": false}, {"type": "uint256", "name": "amount_bought", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "PoolAdded", "inputs": [{"type": "address", "name": "pool", "indexed": true}, {"type": "bytes", "name": "rate_method_id", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "PoolRemoved", "inputs": [{"type": "address", "name": "pool", "indexed": true}], "anonymous": false, "type": "event"}, {"outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {"stateMutability": "payable", "type": "fallback"}, {"name": "find_pool_for_coins", "outputs": [{"type": "address", "name": ""}], "inputs": [{"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}], "stateMutability": "view", "type": "function"}, {"name": "find_pool_for_coins", "outputs": [{"type": "address", "name": ""}], "inputs": [{"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "i"}], "stateMutability": "view", "type": "function"}, {"name": "get_pool_coins", "outputs": [{"type": "tuple", "name": "", "components": [{"type": "address[8]", "name": "coins"}, {"type": "address[8]", "name": "underlying_coins"}, {"type": "uint256[8]", "name": "decimals"}, {"type": "uint256[8]", "name": "underlying_decimals"}]}], "inputs": [{"type": "address", "name": "_pool"}], "stateMutability": "view", "type": "function", "gas": 45137}, {"name": "get_pool_info", "outputs": [{"type": "tuple", "name": "", "components": [{"type": "uint256[8]", "name": "balances"}, {"type": "uint256[8]", "name": "underlying_balances"}, {"type": "uint256[8]", "name": "decimals"}, {"type": "uint256[8]", "name": "underlying_decimals"}, {"type": "address", "name": "lp_token"}, {"type": "uint256", "name": "A"}, {"type": "uint256", "name": "future_A"}, {"type": "uint256", "name": "fee"}, {"type": "uint256", "name": "future_fee"}, {"type": "uint256", "name": "future_admin_fee"}, {"type": "address", "name": "future_owner"}, {"type": "uint256", "name": "initial_A"}, {"type": "uint256", "name": "initial_A_time"}, {"type": "uint256", "name": "future_A_time"}]}], "inputs": [{"type": "address", "name": "_pool"}], "stateMutability": "view", "type": "function", "gas": 78550}, {"name": "get_pool_rates", "outputs": [{"type": "uint256[8]", "name": ""}], "inputs": [{"type": "address", "name": "_pool"}], "stateMutability": "view", "type": "function", "gas": 39622}, {"name": "estimate_gas_used", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "_pool"}, {"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}], "stateMutability": "view", "type": "function", "gas": 49357}, {"name": "get_exchange_amount", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "_pool"}, {"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "_amount"}], "stateMutability": "view", "type": "function", "gas": 44386}, {"name": "exchange", "outputs": [{"type": "bool", "name": ""}], "inputs": [{"type": "address", "name": "_pool"}, {"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "_amount"}, {"type": "uint256", "name": "_expected"}], "stateMutability": "payable", "type": "function", "gas": 199155}, {"name": "get_input_amount", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "_pool"}, {"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "_amount"}], "stateMutability": "nonpayable", "type": "function", "gas": 125103}, {"name": "get_exchange_amounts", "outputs": [{"type": "uint256[100]", "name": ""}], "inputs": [{"type": "address", "name": "_pool"}, {"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256[100]", "name": "_amounts"}], "stateMutability": "nonpayable", "type": "function", "gas": 128329}, {"name": "add_pool", "outputs": [], "inputs": [{"type": "address", "name": "_pool"}, {"type": "int128", "name": "_n_coins"}, {"type": "address", "name": "_lp_token"}, {"type": "address", "name": "_calculator"}, {"type": "bytes32", "name": "_rate_method_id"}, {"type": "bytes32", "name": "_decimals"}, {"type": "bytes32", "name": "_underlying_decimals"}, {"type": "bool", "name": "_has_initial_A"}], "stateMutability": "nonpayable", "type": "function", "gas": 10332537}, {"name": "add_pool_without_underlying", "outputs": [], "inputs": [{"type": "address", "name": "_pool"}, {"type": "int128", "name": "_n_coins"}, {"type": "address", "name": "_lp_token"}, {"type": "address", "name": "_calculator"}, {"type": "bytes32", "name": "_rate_method_id"}, {"type": "bytes32", "name": "_decimals"}, {"type": "bytes32", "name": "_use_rates"}, {"type": "bool", "name": "_has_initial_A"}], "stateMutability": "nonpayable", "type": "function", "gas": 10305285}, {"name": "remove_pool", "outputs": [], "inputs": [{"type": "address", "name": "_pool"}], "stateMutability": "nonpayable", "type": "function", "gas": 317792223380}, {"name": "set_pool_gas_estimates", "outputs": [], "inputs": [{"type": "address[5]", "name": "_addr"}, {"type": "uint256[2][5]", "name": "_amount"}], "stateMutability": "nonpayable", "type": "function", "gas": 354697}, {"name": "set_coin_gas_estimates", "outputs": [], "inputs": [{"type": "address[10]", "name": "_addr"}, {"type": "uint256[10]", "name": "_amount"}], "stateMutability": "nonpayable", "type": "function", "gas": 356693}, {"name": "set_gas_estimate_contract", "outputs": [], "inputs": [{"type": "address", "name": "_pool"}, {"type": "address", "name": "_estimator"}], "stateMutability": "nonpayable", "type": "function", "gas": 36881}, {"name": "set_calculator", "outputs": [], "inputs": [{"type": "address", "name": "_pool"}, {"type": "address", "name": "_calculator"}], "stateMutability": "nonpayable", "type": "function", "gas": 36989}, {"name": "get_calculator", "outputs": [{"type": "address", "name": ""}], "inputs": [{"type": "address", "name": "_pool"}], "stateMutability": "view", "type": "function", "gas": 1923}, {"name": "commit_transfer_ownership", "outputs": [], "inputs": [{"type": "address", "name": "_new_admin"}], "stateMutability": "nonpayable", "type": "function", "gas": 74422}, {"name": "apply_transfer_ownership", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 60560}, {"name": "revert_transfer_ownership", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 21835}, {"name": "claim_token_balance", "outputs": [], "inputs": [{"type": "address", "name": "_token"}], "stateMutability": "nonpayable", "type": "function", "gas": 6290}, {"name": "claim_eth_balance", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 36696}, {"name": "admin", "outputs": [{"type": "address", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1871}, {"name": "pool_list", "outputs": [{"type": "address", "name": ""}], "inputs": [{"type": "uint256", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 2010}, {"name": "pool_count", "outputs": [{"type": "uint256", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1931}]
export let registry_natspec = {
  "methods": {
    "__init__()": {
      "notice": "Constructor function"
    },
    "find_pool_for_coins(address,address)": {
      "notice": "Find an available pool for exchanging two coins"
    },
    "get_pool_coins(address)": {
      "notice": "Get information on coins in a pool"
    },
    "get_pool_info(address)": {
      "notice": "Get information on a pool"
    },
    "get_pool_rates(address)": {
      "notice": "Get rates between coins and underlying coins"
    },
    "estimate_gas_used(address,address,address)": {
      "notice": "Estimate the gas used in an exchange."
    },
    "get_exchange_amount(address,address,address,uint256)": {
      "notice": "Get the current number of coins received in an exchange"
    },
    "exchange(address,address,address,uint256,uint256)": {
      "notice": "Perform an exchange."
    },
    "get_input_amount(address,address,address,uint256)": {
      "notice": "Get the current number of coins required to receive the given amount in an exchange"
    },
    "get_exchange_amounts(address,address,address,uint256[100])": {
      "notice": "Get the current number of coins received in exchanges of varying amounts"
    },
    "add_pool(address,int128,address,address,bytes32,bytes32,bytes32,bool)": {
      "notice": "Add a pool to the registry"
    },
    "add_pool_without_underlying(address,int128,address,address,bytes32,bytes32,bytes32,bool)": {
      "notice": "Add a pool to the registry"
    },
    "remove_pool(address)": {
      "notice": "Remove a pool to the registry"
    },
    "set_pool_gas_estimates(address[5],uint256[2][5])": {
      "notice": "Set gas estimate amounts"
    },
    "set_coin_gas_estimates(address[10],uint256[10])": {
      "notice": "Set gas estimate amounts"
    },
    "set_gas_estimate_contract(address,address)": {
      "notice": "Set gas estimate contract"
    },
    "set_calculator(address,address)": {
      "notice": "Set calculator contract"
    },
    "commit_transfer_ownership(address)": {
      "notice": "Initiate a transfer of contract ownership"
    },
    "apply_transfer_ownership()": {
      "notice": "Finalize a transfer of contract ownership"
    },
    "revert_transfer_ownership()": {
      "notice": "Revert a transfer of contract ownership"
    },
    "claim_token_balance(address)": {
      "notice": "Transfer any ERC20 balance held by this contract"
    },
    "claim_eth_balance()": {
      "notice": "Transfer ether balance held by this contract"
    }
  }
}

export let registry_address = '0xe8ad138c70D798669e5b939c6A154bc23F06BBFf' //'0x7002B727Ef8F5571Cb5F9D70D13DBEEb4dFAe9d1'

export let vesting_abi = [{"name":"Fund","inputs":[{"type":"address","name":"recipient","indexed":true},{"type":"uint256","name":"amount","indexed":false}],"anonymous":false,"type":"event"},{"name":"Claim","inputs":[{"type":"uint256","name":"claimed","indexed":false}],"anonymous":false,"type":"event"},{"name":"ToggleDisable","inputs":[{"type":"address","name":"recipient","indexed":false},{"type":"bool","name":"disabled","indexed":false}],"anonymous":false,"type":"event"},{"name":"CommitOwnership","inputs":[{"type":"address","name":"admin","indexed":false}],"anonymous":false,"type":"event"},{"name":"ApplyOwnership","inputs":[{"type":"address","name":"admin","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"address","name":"_token"},{"type":"uint256","name":"_start_time"},{"type":"uint256","name":"_end_time"},{"type":"bool","name":"_can_disable"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"fund","outputs":[],"inputs":[{"type":"address[10]","name":"_recipients"},{"type":"uint256[10]","name":"_amounts"}],"stateMutability":"nonpayable","type":"function","gas":481837},{"name":"toggle_disable","outputs":[],"inputs":[{"type":"address","name":"_recipient"}],"stateMutability":"nonpayable","type":"function","gas":40250},{"name":"disable_can_disable","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":21265},{"name":"vestedSupply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":4348},{"name":"lockedSupply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":5345},{"name":"vestedOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_recipient"}],"stateMutability":"view","type":"function","gas":5043},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_recipient"}],"stateMutability":"view","type":"function","gas":6155},{"name":"lockedOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_recipient"}],"stateMutability":"view","type":"function","gas":6185},{"name":"claim","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function"},{"name":"claim","outputs":[],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"nonpayable","type":"function"},{"name":"commit_transfer_ownership","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"addr"}],"stateMutability":"nonpayable","type":"function","gas":37972},{"name":"apply_transfer_ownership","outputs":[{"type":"bool","name":""}],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":38872},{"name":"token","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1541},{"name":"start_time","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1571},{"name":"end_time","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1601},{"name":"initial_locked","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":1785},{"name":"total_claimed","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":1815},{"name":"initial_locked_supply","outputs":[{"type":"uint256","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1691},{"name":"can_disable","outputs":[{"type":"bool","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1721},{"name":"disabled_at","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":1905},{"name":"admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1781},{"name":"future_admin","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1811}]
export let vesting_natspec = {
  methods: {
    "fund_individual(address,uint256,uint256,uint256,bool)": {
      notice: "Fund recepient `@address(_recipient)` with `@param(_amount)` starting from `@param(_start_time)` until `@param(_time)` `@param(_can_disable)`",
    },
    "toggle_disable(address)": {
      notice: "Toggle disabling vesting for `@address(_recipient)`",
    },
    "disable_can_disable()": {
      notice: "Disable disabling vesting for `@address(_recipient)`",
    },
  }
}
export let vesting_address = '0x575ccd8e2d300e2377b43478339e364000318e2c' //'0xbf732715ce0d8cefc3b6c3f62775f59beac1f920'

export let liquiditygauge_abi = [{"name": "Deposit", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "Withdraw", "inputs": [{"type": "address", "name": "provider", "indexed": true}, {"type": "uint256", "name": "value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "UpdateLiquidityLimit", "inputs": [{"type": "address", "name": "user", "indexed": false}, {"type": "uint256", "name": "original_balance", "indexed": false}, {"type": "uint256", "name": "original_supply", "indexed": false}, {"type": "uint256", "name": "working_balance", "indexed": false}, {"type": "uint256", "name": "working_supply", "indexed": false}], "anonymous": false, "type": "event"}, {"outputs": [], "inputs": [{"type": "address", "name": "lp_addr"}, {"type": "address", "name": "_minter"}], "stateMutability": "nonpayable", "type": "constructor"}, {"name": "user_checkpoint", "outputs": [{"type": "bool", "name": ""}], "inputs": [{"type": "address", "name": "addr"}], "stateMutability": "nonpayable", "type": "function", "gas": 2079152}, {"name": "claimable_tokens", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "addr"}], "stateMutability": "view", "type": "function", "gas": 1998318}, {"name": "claimable_reward", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "addr"}], "stateMutability": "view", "type": "function", "gas": 1998318}, {"name": "kick", "outputs": [], "inputs": [{"type": "address", "name": "addr"}], "stateMutability": "nonpayable", "type": "function", "gas": 2084532}, {"name": "set_approve_deposit", "outputs": [], "inputs": [{"type": "address", "name": "addr"}, {"type": "bool", "name": "can_deposit"}], "stateMutability": "nonpayable", "type": "function", "gas": 35766}, {"name": "deposit", "outputs": [], "inputs": [{"type": "uint256", "name": "_value"}], "stateMutability": "nonpayable", "type": "function"}, {"name": "deposit", "outputs": [], "inputs": [{"type": "uint256", "name": "_value"}, {"type": "address", "name": "addr"}], "stateMutability": "nonpayable", "type": "function"}, {"name": "withdraw", "outputs": [], "inputs": [{"type": "uint256", "name": "_value"}], "stateMutability": "nonpayable", "type": "function", "gas": 2208318}, {"name": "claim_rewards", "outputs": [], "inputs": [{"type": "address", "name": "addr"}], "stateMutability": "nonpayable", "type": "function"}, {"name": "integrate_checkpoint", "outputs": [{"type": "uint256", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2297}, {"name": "minter", "outputs": [{"type": "address", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1421}, {"name": "crv_token", "outputs": [{"type": "address", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1451}, {"name": "lp_token", "outputs": [{"type": "address", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1481}, {"name": "controller", "outputs": [{"type": "address", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1511}, {"name": "voting_escrow", "outputs": [{"type": "address", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1541}, {"name": "balanceOf", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 1725}, {"name": "totalSupply", "outputs": [{"type": "uint256", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1601}, {"name": "future_epoch_time", "outputs": [{"type": "uint256", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1631}, {"name": "approved_to_deposit", "outputs": [{"type": "bool", "name": ""}], "inputs": [{"type": "address", "name": "arg0"}, {"type": "address", "name": "arg1"}], "stateMutability": "view", "type": "function", "gas": 1969}, {"name": "working_balances", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 1845}, {"name": "working_supply", "outputs": [{"type": "uint256", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1721}, {"name": "period", "outputs": [{"type": "int128", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1751}, {"name": "period_timestamp", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "uint256", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 1890}, {"name": "integrate_inv_supply", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "uint256", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 1920}, {"name": "integrate_inv_supply_of", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 1995}, {"name": "integrate_checkpoint_of", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 2025}, {"name": "integrate_fraction", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 2055}, {"name": "inflation_rate", "outputs": [{"type": "uint256", "name": ""}], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1931}, {"name": "claimed_rewards_for", "outputs": [{"type": "uint256", "name": ""}], "inputs": [{"type": "address", "name": "arg0"}], "stateMutability": "view", "type": "function", "gas": 2355}]

export let liquiditygaugerewards_abi = [
  {
    "name": "Deposit",
    "inputs": [
      {
        "type": "address",
        "name": "provider",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "value",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "Withdraw",
    "inputs": [
      {
        "type": "address",
        "name": "provider",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "value",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "UpdateLiquidityLimit",
    "inputs": [
      {
        "type": "address",
        "name": "user",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "original_balance",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "original_supply",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "working_balance",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "working_supply",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "lp_addr"
      },
      {
        "type": "address",
        "name": "_minter"
      },
      {
        "type": "address",
        "name": "_reward_contract"
      },
      {
        "type": "address",
        "name": "_rewarded_token"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "name": "user_checkpoint",
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 2311984
  },
  {
    "name": "claimable_tokens",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 2231138
  },
  {
    "name": "claimable_reward",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 7300
  },
  {
    "name": "kick",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 2317383
  },
  {
    "name": "set_approve_deposit",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      },
      {
        "type": "bool",
        "name": "can_deposit"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function",
    "gas": 35826
  },
  {
    "name": "deposit",
    "outputs": [],
    "inputs": [
      {
        "type": "uint256",
        "name": "_value"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "deposit",
    "outputs": [],
    "inputs": [
      {
        "type": "uint256",
        "name": "_value"
      },
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "withdraw",
    "outputs": [],
    "inputs": [
      {
        "type": "uint256",
        "name": "_value"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "withdraw",
    "outputs": [],
    "inputs": [
      {
        "type": "uint256",
        "name": "_value"
      },
      {
        "type": "bool",
        "name": "claim_rewards"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "claim_rewards",
    "outputs": [],
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "claim_rewards",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "integrate_checkpoint",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2387
  },
  {
    "name": "minter",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1511
  },
  {
    "name": "crv_token",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1541
  },
  {
    "name": "lp_token",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1571
  },
  {
    "name": "controller",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1601
  },
  {
    "name": "voting_escrow",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1631
  },
  {
    "name": "balanceOf",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 1815
  },
  {
    "name": "totalSupply",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1691
  },
  {
    "name": "future_epoch_time",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1721
  },
  {
    "name": "approved_to_deposit",
    "outputs": [
      {
        "type": "bool",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      },
      {
        "type": "address",
        "name": "arg1"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2059
  },
  {
    "name": "working_balances",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 1935
  },
  {
    "name": "working_supply",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1811
  },
  {
    "name": "period",
    "outputs": [
      {
        "type": "int128",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 1841
  },
  {
    "name": "period_timestamp",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 1980
  },
  {
    "name": "integrate_inv_supply",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2010
  },
  {
    "name": "integrate_inv_supply_of",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2085
  },
  {
    "name": "integrate_checkpoint_of",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2115
  },
  {
    "name": "integrate_fraction",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2145
  },
  {
    "name": "inflation_rate",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2021
  },
  {
    "name": "reward_contract",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2051
  },
  {
    "name": "rewarded_token",
    "outputs": [
      {
        "type": "address",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2081
  },
  {
    "name": "reward_integral",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [],
    "stateMutability": "view",
    "type": "function",
    "gas": 2111
  },
  {
    "name": "reward_integral_for",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2295
  },
  {
    "name": "rewards_for",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2325
  },
  {
    "name": "claimed_rewards_for",
    "outputs": [
      {
        "type": "uint256",
        "name": ""
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "arg0"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "gas": 2355
  }
]

export let minter_abi = [{"name":"Minted","inputs":[{"type":"address","name":"recipient","indexed":true},{"type":"address","name":"gauge","indexed":false},{"type":"uint256","name":"minted","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"address","name":"_token"},{"type":"address","name":"_controller"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"mint","outputs":[],"inputs":[{"type":"address","name":"gauge_addr"}],"stateMutability":"nonpayable","type":"function","gas":100038},{"name":"mint_many","outputs":[],"inputs":[{"type":"address[8]","name":"gauge_addrs"}],"stateMutability":"nonpayable","type":"function","gas":408502},{"name":"mint_for","outputs":[],"inputs":[{"type":"address","name":"gauge_addr"},{"type":"address","name":"_for"}],"stateMutability":"nonpayable","type":"function","gas":101219},{"name":"toggle_approve_mint","outputs":[],"inputs":[{"type":"address","name":"minting_user"}],"stateMutability":"nonpayable","type":"function","gas":36726},{"name":"token","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1301},{"name":"controller","outputs":[{"type":"address","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":1331},{"name":"minted","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"arg0"},{"type":"address","name":"arg1"}],"stateMutability":"view","type":"function","gas":1669},{"name":"allowed_to_mint_for","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"arg0"},{"type":"address","name":"arg1"}],"stateMutability":"view","type":"function","gas":1699}]

export let minter_address = '0xd061D61a4d941c39E5453435B6345Dc261C2fcE0' //'0x6f7A42E1f6C64C992B68815511f4aBFb648AEC6D'

export default {
	poolproxy_abi,
	poolproxy_address,
	poolproxy_natspec,

	votingescrow_abi,
	votingescrow_natspec,
	votingescrow_address,

	gaugecontroller_abi,
	gaugecontroller_natspec,
	gaugecontroller_address,

	pool_abi,
	pool_natspec,

	agent_abi,

	CRV_abi,
	CRV_address,

  tokenmanager_abi,
  tokenmanager_natspec,

  registry_abi,
  registry_natspec,
  registry_address,

  vesting_abi,
  vesting_natspec,
  vesting_address,

  liquiditygauge_abi,
  liquiditygaugerewards_abi,

  minter_abi,
  minter_address,

}