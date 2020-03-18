//just pcompound2 for initial testing
export let migration_abi = [
 {
  "outputs": [],
  "inputs": [
   {
    "type": "address",
    "name": "_old"
   },
   {
    "type": "address",
    "name": "_old_token"
   },
   {
    "type": "address",
    "name": "_new"
   },
   {
    "type": "address",
    "name": "_new_token"
   },
   {
    "type": "address[2]",
    "name": "_coins"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "constructor"
 },
 {
  "name": "migrate",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 106812
 },
 {
  "name": "coins",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "arg0"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 1380
 }
]

export let swap_abi = [
 {
  "name": "TokenExchange",
  "inputs": [
   {
    "type": "address",
    "name": "buyer",
    "indexed": true
   },
   {
    "type": "int128",
    "name": "sold_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_sold",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "bought_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_bought",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "TokenExchangeUnderlying",
  "inputs": [
   {
    "type": "address",
    "name": "buyer",
    "indexed": true
   },
   {
    "type": "int128",
    "name": "sold_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_sold",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "bought_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_bought",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "AddLiquidity",
  "inputs": [
   {
    "type": "address",
    "name": "provider",
    "indexed": true
   },
   {
    "type": "uint256[2]",
    "name": "token_amounts",
    "indexed": false
   },
   {
    "type": "uint256[2]",
    "name": "fees",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "invariant",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "token_supply",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "RemoveLiquidity",
  "inputs": [
   {
    "type": "address",
    "name": "provider",
    "indexed": true
   },
   {
    "type": "uint256[2]",
    "name": "token_amounts",
    "indexed": false
   },
   {
    "type": "uint256[2]",
    "name": "fees",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "token_supply",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "RemoveLiquidityImbalance",
  "inputs": [
   {
    "type": "address",
    "name": "provider",
    "indexed": true
   },
   {
    "type": "uint256[2]",
    "name": "token_amounts",
    "indexed": false
   },
   {
    "type": "uint256[2]",
    "name": "fees",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "invariant",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "token_supply",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "CommitNewAdmin",
  "inputs": [
   {
    "type": "uint256",
    "name": "deadline",
    "indexed": true,
    "unit": "sec"
   },
   {
    "type": "address",
    "name": "admin",
    "indexed": true
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "NewAdmin",
  "inputs": [
   {
    "type": "address",
    "name": "admin",
    "indexed": true
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "CommitNewParameters",
  "inputs": [
   {
    "type": "uint256",
    "name": "deadline",
    "indexed": true,
    "unit": "sec"
   },
   {
    "type": "uint256",
    "name": "A",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "fee",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "admin_fee",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "NewParameters",
  "inputs": [
   {
    "type": "uint256",
    "name": "A",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "fee",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "admin_fee",
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
    "type": "address[2]",
    "name": "_coins"
   },
   {
    "type": "address[2]",
    "name": "_underlying_coins"
   },
   {
    "type": "address",
    "name": "_pool_token"
   },
   {
    "type": "uint256",
    "name": "_A"
   },
   {
    "type": "uint256",
    "name": "_fee"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "constructor"
 },
 {
  "name": "get_virtual_price",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 1084167
 },
 {
  "name": "calc_token_amount",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "uint256[2]",
    "name": "amounts"
   },
   {
    "type": "bool",
    "name": "deposit"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 4239939
 },
 {
  "name": "add_liquidity",
  "outputs": [],
  "inputs": [
   {
    "type": "uint256[2]",
    "name": "amounts"
   },
   {
    "type": "uint256",
    "name": "min_mint_amount"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 6479997
 },
 {
  "name": "get_dy",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2543681
 },
 {
  "name": "get_dx",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dy"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2543687
 },
 {
  "name": "get_dy_underlying",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2543506
 },
 {
  "name": "get_dx_underlying",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dy"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2543512
 },
 {
  "name": "exchange",
  "outputs": [],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   },
   {
    "type": "uint256",
    "name": "min_dy"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 5184573
 },
 {
  "name": "exchange_underlying",
  "outputs": [],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   },
   {
    "type": "uint256",
    "name": "min_dy"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 5200817
 },
 {
  "name": "remove_liquidity",
  "outputs": [],
  "inputs": [
   {
    "type": "uint256",
    "name": "_amount"
   },
   {
    "type": "uint256[2]",
    "name": "min_amounts"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 153898
 },
 {
  "name": "remove_liquidity_imbalance",
  "outputs": [],
  "inputs": [
   {
    "type": "uint256[2]",
    "name": "amounts"
   },
   {
    "type": "uint256",
    "name": "max_burn_amount"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 6479708
 },
 {
  "name": "commit_new_parameters",
  "outputs": [],
  "inputs": [
   {
    "type": "uint256",
    "name": "amplification"
   },
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
  "gas": 146105
 },
 {
  "name": "apply_new_parameters",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 133512
 },
 {
  "name": "revert_new_parameters",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 21835
 },
 {
  "name": "commit_transfer_ownership",
  "outputs": [],
  "inputs": [
   {
    "type": "address",
    "name": "_owner"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 74512
 },
 {
  "name": "apply_transfer_ownership",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 60568
 },
 {
  "name": "revert_transfer_ownership",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 21925
 },
 {
  "name": "withdraw_admin_fees",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 12831
 },
 {
  "name": "kill_me",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 37878
 },
 {
  "name": "unkill_me",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 22015
 },
 {
  "name": "coins",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "arg0"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2190
 },
 {
  "name": "underlying_coins",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "arg0"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2220
 },
 {
  "name": "balances",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "arg0"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2250
 },
 {
  "name": "A",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2081
 },
 {
  "name": "fee",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2111
 },
 {
  "name": "admin_fee",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2141
 },
 {
  "name": "owner",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2171
 },
 {
  "name": "admin_actions_deadline",
  "outputs": [
   {
    "type": "uint256",
    "unit": "sec",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2201
 },
 {
  "name": "transfer_ownership_deadline",
  "outputs": [
   {
    "type": "uint256",
    "unit": "sec",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2231
 },
 {
  "name": "future_A",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2261
 },
 {
  "name": "future_fee",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2291
 },
 {
  "name": "future_admin_fee",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2321
 },
 {
  "name": "future_owner",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2351
 }
]



export let old_swap_abi = [
 {
  "name": "TokenExchange",
  "inputs": [
   {
    "type": "address",
    "name": "buyer",
    "indexed": true
   },
   {
    "type": "int128",
    "name": "sold_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_sold",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "bought_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_bought",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "TokenExchangeUnderlying",
  "inputs": [
   {
    "type": "address",
    "name": "buyer",
    "indexed": true
   },
   {
    "type": "int128",
    "name": "sold_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_sold",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "bought_id",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "tokens_bought",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "AddLiquidity",
  "inputs": [
   {
    "type": "address",
    "name": "provider",
    "indexed": true
   },
   {
    "type": "uint256[2]",
    "name": "token_amounts",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "invariant",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "token_supply",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "RemoveLiquidity",
  "inputs": [
   {
    "type": "address",
    "name": "provider",
    "indexed": true
   },
   {
    "type": "uint256[2]",
    "name": "token_amounts",
    "indexed": false
   },
   {
    "type": "uint256[2]",
    "name": "fees",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "invariant",
    "indexed": false
   },
   {
    "type": "uint256",
    "name": "token_supply",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "CommitNewAdmin",
  "inputs": [
   {
    "type": "uint256",
    "name": "deadline",
    "indexed": true,
    "unit": "sec"
   },
   {
    "type": "address",
    "name": "admin",
    "indexed": true
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "NewAdmin",
  "inputs": [
   {
    "type": "address",
    "name": "admin",
    "indexed": true
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "CommitNewParameters",
  "inputs": [
   {
    "type": "uint256",
    "name": "deadline",
    "indexed": true,
    "unit": "sec"
   },
   {
    "type": "int128",
    "name": "A",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "fee",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "admin_fee",
    "indexed": false
   }
  ],
  "anonymous": false,
  "type": "event"
 },
 {
  "name": "NewParameters",
  "inputs": [
   {
    "type": "int128",
    "name": "A",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "fee",
    "indexed": false
   },
   {
    "type": "int128",
    "name": "admin_fee",
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
    "type": "address[2]",
    "name": "_coins"
   },
   {
    "type": "address[2]",
    "name": "_underlying_coins"
   },
   {
    "type": "address",
    "name": "_pool_token"
   },
   {
    "type": "int128",
    "name": "_A"
   },
   {
    "type": "int128",
    "name": "_fee"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "constructor"
 },
 {
  "name": "get_virtual_price",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 1083195
 },
 {
  "name": "add_liquidity",
  "outputs": [],
  "inputs": [
   {
    "type": "uint256[2]",
    "name": "amounts"
   },
   {
    "type": "uint256",
    "unit": "sec",
    "name": "deadline"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 2266965
 },
 {
  "name": "get_dy",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2540055
 },
 {
  "name": "get_dy_underlying",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2540024
 },
 {
  "name": "exchange",
  "outputs": [],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   },
   {
    "type": "uint256",
    "name": "min_dy"
   },
   {
    "type": "uint256",
    "unit": "sec",
    "name": "deadline"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 1000000
 },
 {
  "name": "exchange_underlying",
  "outputs": [],
  "inputs": [
   {
    "type": "int128",
    "name": "i"
   },
   {
    "type": "int128",
    "name": "j"
   },
   {
    "type": "uint256",
    "name": "dx"
   },
   {
    "type": "uint256",
    "name": "min_dy"
   },
   {
    "type": "uint256",
    "unit": "sec",
    "name": "deadline"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 1000000
 },
 {
  "name": "remove_liquidity",
  "outputs": [],
  "inputs": [
   {
    "type": "uint256",
    "name": "_amount"
   },
   {
    "type": "uint256",
    "unit": "sec",
    "name": "deadline"
   },
   {
    "type": "uint256[2]",
    "name": "min_amounts"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 1220465
 },
 {
  "name": "remove_liquidity_imbalance",
  "outputs": [],
  "inputs": [
   {
    "type": "uint256[2]",
    "name": "amounts"
   },
   {
    "type": "uint256",
    "unit": "sec",
    "name": "deadline"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 2346381
 },
 {
  "name": "commit_new_parameters",
  "outputs": [],
  "inputs": [
   {
    "type": "int128",
    "name": "amplification"
   },
   {
    "type": "int128",
    "name": "new_fee"
   },
   {
    "type": "int128",
    "name": "new_admin_fee"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 146017
 },
 {
  "name": "apply_new_parameters",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 133362
 },
 {
  "name": "revert_new_parameters",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 21685
 },
 {
  "name": "commit_transfer_ownership",
  "outputs": [],
  "inputs": [
   {
    "type": "address",
    "name": "_owner"
   }
  ],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 74362
 },
 {
  "name": "apply_transfer_ownership",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 60418
 },
 {
  "name": "revert_transfer_ownership",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 21775
 },
 {
  "name": "withdraw_admin_fees",
  "outputs": [],
  "inputs": [],
  "constant": false,
  "payable": false,
  "type": "function",
  "gas": 12403
 },
 {
  "name": "coins",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "arg0"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2040
 },
 {
  "name": "underlying_coins",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "arg0"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2070
 },
 {
  "name": "balances",
  "outputs": [
   {
    "type": "uint256",
    "name": "out"
   }
  ],
  "inputs": [
   {
    "type": "int128",
    "name": "arg0"
   }
  ],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2100
 },
 {
  "name": "A",
  "outputs": [
   {
    "type": "int128",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 1931
 },
 {
  "name": "fee",
  "outputs": [
   {
    "type": "int128",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 1961
 },
 {
  "name": "admin_fee",
  "outputs": [
   {
    "type": "int128",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 1991
 },
 {
  "name": "owner",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2021
 },
 {
  "name": "admin_actions_deadline",
  "outputs": [
   {
    "type": "uint256",
    "unit": "sec",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2051
 },
 {
  "name": "transfer_ownership_deadline",
  "outputs": [
   {
    "type": "uint256",
    "unit": "sec",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2081
 },
 {
  "name": "future_A",
  "outputs": [
   {
    "type": "int128",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2111
 },
 {
  "name": "future_fee",
  "outputs": [
   {
    "type": "int128",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2141
 },
 {
  "name": "future_admin_fee",
  "outputs": [
   {
    "type": "int128",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2171
 },
 {
  "name": "future_owner",
  "outputs": [
   {
    "type": "address",
    "name": "out"
   }
  ],
  "inputs": [],
  "constant": true,
  "payable": false,
  "type": "function",
  "gas": 2201
 }
];

export let ERC20_abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
];
export let cERC20_abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x06fdde03"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x095ea7b3"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "repayAmount",
                "type": "uint256"
            }
        ],
        "name": "repayBorrow",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x0e752702"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "reserveFactorMantissa",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x173b9904"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "account",
                "type": "address"
            }
        ],
        "name": "borrowBalanceCurrent",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x17bfdfbc"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x18160ddd"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "exchangeRateStored",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x182df0f5"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "src",
                "type": "address"
            },
            {
                "name": "dst",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x23b872dd"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "borrower",
                "type": "address"
            },
            {
                "name": "repayAmount",
                "type": "uint256"
            }
        ],
        "name": "repayBorrowBehalf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x2608f818"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "pendingAdmin",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x26782247"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x313ce567"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "balanceOfUnderlying",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x3af9e669"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getCash",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x3b1d21a2"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newComptroller",
                "type": "address"
            }
        ],
        "name": "_setComptroller",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x4576b5db"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalBorrows",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x47bd3718"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "comptroller",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x5fe3b567"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "reduceAmount",
                "type": "uint256"
            }
        ],
        "name": "_reduceReserves",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x601a0bf1"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "initialExchangeRateMantissa",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x675d972c"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "accrualBlockNumber",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x6c540baf"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "underlying",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x6f307dc3"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x70a08231"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "totalBorrowsCurrent",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x73acee98"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "redeemAmount",
                "type": "uint256"
            }
        ],
        "name": "redeemUnderlying",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x852a12e3"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalReserves",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x8f840ddd"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x95d89b41"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "account",
                "type": "address"
            }
        ],
        "name": "borrowBalanceStored",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x95dd9193"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "mintAmount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xa0712d68"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "accrueInterest",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xa6afed95"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "dst",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xa9059cbb"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "borrowIndex",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xaa5af0fd"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "supplyRatePerBlock",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xae9d70b0"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "liquidator",
                "type": "address"
            },
            {
                "name": "borrower",
                "type": "address"
            },
            {
                "name": "seizeTokens",
                "type": "uint256"
            }
        ],
        "name": "seize",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xb2a02ff1"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newPendingAdmin",
                "type": "address"
            }
        ],
        "name": "_setPendingAdmin",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xb71d1a0c"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "exchangeRateCurrent",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xbd6d894d"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "account",
                "type": "address"
            }
        ],
        "name": "getAccountSnapshot",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xc37f68e2"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "borrowAmount",
                "type": "uint256"
            }
        ],
        "name": "borrow",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xc5ebeaec"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "redeemTokens",
                "type": "uint256"
            }
        ],
        "name": "redeem",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xdb006a75"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "owner",
                "type": "address"
            },
            {
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xdd62ed3e"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "_acceptAdmin",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xe9c714f2"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newInterestRateModel",
                "type": "address"
            }
        ],
        "name": "_setInterestRateModel",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xf2b3abbd"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "interestRateModel",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xf3fdb15a"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "borrower",
                "type": "address"
            },
            {
                "name": "repayAmount",
                "type": "uint256"
            },
            {
                "name": "cTokenCollateral",
                "type": "address"
            }
        ],
        "name": "liquidateBorrow",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xf5e3c462"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xf851a440"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "borrowRatePerBlock",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xf8f9da28"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "newReserveFactorMantissa",
                "type": "uint256"
            }
        ],
        "name": "_setReserveFactor",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xfca7820b"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "isCToken",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xfe9c44ae"
    },
    {
        "inputs": [
            {
                "name": "underlying_",
                "type": "address"
            },
            {
                "name": "comptroller_",
                "type": "address"
            },
            {
                "name": "interestRateModel_",
                "type": "address"
            },
            {
                "name": "initialExchangeRateMantissa_",
                "type": "uint256"
            },
            {
                "name": "name_",
                "type": "string"
            },
            {
                "name": "symbol_",
                "type": "string"
            },
            {
                "name": "decimals_",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor",
        "signature": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "interestAccumulated",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "borrowIndex",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "totalBorrows",
                "type": "uint256"
            }
        ],
        "name": "AccrueInterest",
        "type": "event",
        "signature": "0x875352fb3fadeb8c0be7cbbe8ff761b308fa7033470cd0287f02f3436fd76cb9"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "minter",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "mintAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "mintTokens",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event",
        "signature": "0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "redeemer",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "redeemAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "redeemTokens",
                "type": "uint256"
            }
        ],
        "name": "Redeem",
        "type": "event",
        "signature": "0xe5b754fb1abb7f01b499791d0b820ae3b6af3424ac1c59768edb53f4ec31a929"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "borrower",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "borrowAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "accountBorrows",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "totalBorrows",
                "type": "uint256"
            }
        ],
        "name": "Borrow",
        "type": "event",
        "signature": "0x13ed6866d4e1ee6da46f845c46d7e54120883d75c5ea9a2dacc1c4ca8984ab80"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "payer",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "borrower",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "repayAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "accountBorrows",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "totalBorrows",
                "type": "uint256"
            }
        ],
        "name": "RepayBorrow",
        "type": "event",
        "signature": "0x1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b0355478d6f5c362a1"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "liquidator",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "borrower",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "repayAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "cTokenCollateral",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "seizeTokens",
                "type": "uint256"
            }
        ],
        "name": "LiquidateBorrow",
        "type": "event",
        "signature": "0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "oldPendingAdmin",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "newPendingAdmin",
                "type": "address"
            }
        ],
        "name": "NewPendingAdmin",
        "type": "event",
        "signature": "0xca4f2f25d0898edd99413412fb94012f9e54ec8142f9b093e7720646a95b16a9"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "oldAdmin",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "NewAdmin",
        "type": "event",
        "signature": "0xf9ffabca9c8276e99321725bcb43fb076a6c66a54b7f21c4e8146d8519b417dc"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "oldComptroller",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "newComptroller",
                "type": "address"
            }
        ],
        "name": "NewComptroller",
        "type": "event",
        "signature": "0x7ac369dbd14fa5ea3f473ed67cc9d598964a77501540ba6751eb0b3decf5870d"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "oldInterestRateModel",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "newInterestRateModel",
                "type": "address"
            }
        ],
        "name": "NewMarketInterestRateModel",
        "type": "event",
        "signature": "0xedffc32e068c7c95dfd4bdfd5c4d939a084d6b11c4199eac8436ed234d72f926"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "oldReserveFactorMantissa",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "newReserveFactorMantissa",
                "type": "uint256"
            }
        ],
        "name": "NewReserveFactor",
        "type": "event",
        "signature": "0xaaa68312e2ea9d50e16af5068410ab56e1a1fd06037b1a35664812c30f821460"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "admin",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "reduceAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "newTotalReserves",
                "type": "uint256"
            }
        ],
        "name": "ReservesReduced",
        "type": "event",
        "signature": "0x3bad0c59cf2f06e7314077049f48a93578cd16f5ef92329f1dab1420a99c177e"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "error",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "info",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "detail",
                "type": "uint256"
            }
        ],
        "name": "Failure",
        "type": "event",
        "signature": "0x45b96fe442630264581b197e84bbada861235052c5a1aadfff9ea4e40a969aa0"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event",
        "signature": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event",
        "signature": "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"
    }
];
