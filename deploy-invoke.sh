#!/bin/bash
output=$(starknet deploy --contract compiled/contract.json --network alpha-goerli)
echo $output
deploy_tx_id=$(echo $output | sed -r "s/.*Transaction ID: (\w*).*/\1/")
address=$(echo $output | sed -r "s/.*Contract address: (\w*).*/\1/")
echo "Address: $address"
echo "tx_id: $deploy_tx_id"
starknet invoke --function increase_balance --inputs 10 20 --network alpha-goerli --address $address --abi starknet-artifacts/contracts/contract.cairo/contract_abi.json
starknet tx_status --id $deploy_tx_id --network alpha-goerli
starknet call --function get_balance --network alpha-goerli --address $address --abi starknet-artifacts/contracts/contract.cairo/contract_abi.json
