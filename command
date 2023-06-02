create:
	python3.9 -m venv ~/cairo_venv

activate:
	source ~/.bashrc
	source ~/cairo_venv/bin/activate

format:
	cairo-format -i *.cairo

setup:
	export STARKNET_NETWORK=alpha-goerli
	export STARKNET_WALLET=starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount

tx_status:
	starknet tx_status --hash 0x72ecbda87d3660979032338d89d578c97a2d6c4c9d95bd4d3bc9520d2e6809e

compile_voting:
	starknet-compile voting.cairo --output voting_compiled.json --abi voting_abi.json

compile_recorder:
	starknet-compile recorder.cairo --output recorder_compiled.json --abi recorder_abi.json


declare_voting:
	starknet declare --contract voting_compiled.json

declare_recorder:
	starknet declare --contract recorder_compiled.json

deploy_voting:
	starknet deploy --class_hash 0x64c7076f93c59d445913e3f4b23451936bac219d240a46a7f67d2335d05547b --inputs 0x005303af703096b525a765df0971274dd00d80d61810fbb86790b7744c89a98f

deploy_recorder:
	starknet deploy --class_hash 0x8945e9a692657c518f73ddaabb3fd7e81d34327fd06f7ee2f7b93ed1a5ea65


init_poll:
	starknet invoke --address 0x01f4606cb55b51eb0aaa957e9a87f7b32e4e49715365a8f915e69ad6485acb35 --abi voting_abi.json --function init_poll --inputs 1 0x05f34fbc5184b3f76a1ba1053273741df235e5d45fe5240b76e57861e3a1addc


check_poll_owner:
	starknet call --address 0x01f4606cb55b51eb0aaa957e9a87f7b32e4e49715365a8f915e69ad6485acb35 --abi voting_abi.json --function get_poll_owner_public_key --inputs 1