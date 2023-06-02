import hardhat from "hardhat";
import { Account, Contract, Provider, ec, stark, uint256 } from "starknet";
// import fs from "fs";

async function main() {
    // initialize provider
    const provider = new Provider({ sequencer: { baseUrl: "https://alpha4.starknet.io" } });
    // initialize existing pre-deployed account 0 of Devnet
    const privateKey =
        "0x189319015665933196653334217366076354013949034844833818116353818416794168361";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const accountAddress = "0x27e53f7278ad33f592b320c65f4b0ebcb029dc04025120e315232c2ebab2cc0";

    const account0 = new Account(provider, accountAddress, starkKeyPair);

    const balance = await hardhat.starknet.getBalance(account0.address);
    console.log(`Account ${account0.address} has a balance of ${balance} wei`);

    // Get the erc20 contract address
    // const erc20Address = deployERC20Response.deploy.contract_address;
    const erc20Address = "0xdea288824da3b230eda8d83c2e880ecc37e23b9b712e3f7533f521edc2f2f3";
    const receiver = "0x044d89e94f5D7a289B7Fb2233F2aB295dC03259A38D3DeCc81e8B4c1618d4776";

    const { abi: testAbi } = await provider.getClassAt(erc20Address);
    if (testAbi === undefined) {
        throw new Error("no abi.");
    }
    // Create a new erc20 contract object
    const erc20 = new Contract(testAbi, erc20Address, provider);
    erc20.connect(account0);

    // Check balance - should be 1100
    console.log("Calling Starknet for account balance...");
    const balanceBeforeTransfer = await erc20.balanceOf(account0.address);
    console.log(
        "account0 has a balance of :",
        uint256.uint256ToBN(balanceBeforeTransfer.balance).toString()
    );

    // Execute tx transfer of 10 tokens
    console.log("Invoke Tx - Transfer 10 tokens back to erc20 contract...");
    const toTransferTk: uint256.Uint256 = uint256.bnToUint256("100000000000000000000");
    const transferCallData = stark.compileCalldata({
        recipient: receiver,
        initial_supply: { type: "struct", low: toTransferTk.low, high: toTransferTk.high }
    });

    const { transaction_hash: transferTxHash } = await account0.execute(
        {
            contractAddress: erc20Address,
            entrypoint: "transfer",
            calldata: transferCallData
        },
        undefined,
        { maxFee: 900_000_000_000_000 }
    );

    // Wait for the invoke transaction to be accepted on Starknet
    console.log("Waiting for Tx to be Accepted on Starknet - Transfer...");
    await provider.waitForTransaction(transferTxHash);

    // Check balance after transfer - should be 1090
    console.log("Calling Starknet for account balance...");
    const balanceAfterTransfer = await erc20.balanceOf(account0.address);
    console.log(
        "account0 has a balance of :",
        uint256.uint256ToBN(balanceAfterTransfer.balance).toString()
    );
    console.log("✅ Script completed.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
