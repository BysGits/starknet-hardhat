import { Account, Contract, Provider, ec, stark, uint256, json } from "starknet";
import fs from "fs";
import hardhat from "hardhat";

async function main() {
    // initialize provider
    const provider = new Provider({ sequencer: { baseUrl: "https://alpha4.starknet.io" } });
    // initialize existing pre-deployed account 0 of Devnet
    const privateKey =
        "0x189319015665933196653334217366076354013949034844833818116353818416794168361";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const accountAddress = "0x27e53f7278ad33f592b320c65f4b0ebcb029dc04025120e315232c2ebab2cc0";

    const account0 = new Account(provider, accountAddress, starkKeyPair);

    const balanceETH = await hardhat.starknet.getBalance(account0.address);
    console.log(`Account ${account0.address} has a balance of ${balanceETH} wei`);

    // const routerAddress = "0x02bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965";
    const routerAddress = process.env.PROXY_ROUTER_ADDRESS;
    if (routerAddress === undefined) {
        throw new Error("require router");
    }

    const amountIn: uint256.Uint256 = uint256.bnToUint256("120000000000000000");
    const amountOutMin: uint256.Uint256 = uint256.bnToUint256("0");
    const path = [
        "0xdea288824da3b230eda8d83c2e880ecc37e23b9b712e3f7533f521edc2f2f3",
        "0x15a688dce04e2d121ecae6503e1f3515759fcef63243a5e0f4c272a85dfb02e"
    ];
    const to = account0.address;
    const deadline = (Math.floor(Date.now() / 1000) + 5000).toString();

    const compiledRouter = json.parse(
        fs
            .readFileSync("starknet-artifacts/contracts/jediswap/Router.cairo/Router.json")
            .toString("ascii")
    );

    const router = new Contract(compiledRouter.abi, routerAddress, provider);
    router.connect(account0);

    const { transaction_hash: approveATxHash } = await account0.execute(
        {
            contractAddress: path[0],
            entrypoint: "approve",
            calldata: stark.compileCalldata({
                spender: routerAddress,
                amount: { type: "struct", low: amountIn.low, high: amountIn.high }
            })
        },
        undefined,
        { maxFee: 900_000_000_000_000 }
    );
    console.log("Waiting for approve token in");
    await provider.waitForTransaction(approveATxHash);

    const { transaction_hash: mintTxHash } = await router.swap_exact_tokens_for_tokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline
    );

    // Wait for the invoke transaction to be accepted on Starknet
    console.log("Waiting for Tx to be Accepted on Starknet - Swap Exact token for token...");
    await provider.waitForTransaction(mintTxHash);

    const { abi: tokenInAbi } = await provider.getClassAt(path[0]);
    if (tokenInAbi === undefined) {
        throw new Error("no abi.");
    }
    const tokenIn = new Contract(tokenInAbi, path[0], provider);
    tokenIn.connect(account0);

    // Check balance - should be 1100
    console.log("Calling Starknet for account balance...");
    let balance = await tokenIn.balanceOf(account0.address);
    console.log(
        "account0 has token IN with a balance of :",
        uint256.uint256ToBN(balance.balance).toString()
    );

    const { abi: tokenOutAbi } = await provider.getClassAt(path[1]);
    if (tokenOutAbi === undefined) {
        throw new Error("no abi.");
    }
    const tokenOut = new Contract(tokenOutAbi, path[1], provider);
    tokenOut.connect(account0);

    // Check balance - should be 1100
    console.log("Calling Starknet for account balance...");
    balance = await tokenOut.balanceOf(account0.address);
    console.log(
        "account0 has token OUT with a balance of :",
        uint256.uint256ToBN(balance.balance).toString()
    );

    console.log("✅ Script completed.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
