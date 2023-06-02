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

    const balance = await hardhat.starknet.getBalance(account0.address);
    console.log(`Account ${account0.address} has a balance of ${balance} wei`);

    const routerAddress = "0x02bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965";

    const tokenA = "0xdea288824da3b230eda8d83c2e880ecc37e23b9b712e3f7533f521edc2f2f3";
    const tokenB = "0x15a688dce04e2d121ecae6503e1f3515759fcef63243a5e0f4c272a85dfb02e";
    const liquidity: uint256.Uint256 = uint256.bnToUint256("132455532033675865398");
    const amountAMin: uint256.Uint256 = uint256.bnToUint256("0");
    const amountBMin: uint256.Uint256 = uint256.bnToUint256("0");
    const to = account0.address;
    const deadline = (Math.floor(Date.now() / 1000) + 5000).toString();

    const compiledRouter = json.parse(
        fs
            .readFileSync("starknet-artifacts/contracts/jediswap/Router.cairo/Router.json")
            .toString("ascii")
    );

    const router = new Contract(compiledRouter.abi, routerAddress, provider);
    router.connect(account0);

    const factoryAddress = "0x".concat((await router.call("factory"))[0].toString(16));
    console.log("Factory : ", factoryAddress);

    const compiledFactory = json.parse(
        fs
            .readFileSync("starknet-artifacts/contracts/jediswap/Factory.cairo/Factory.json")
            .toString("ascii")
    );

    const factory = new Contract(compiledFactory.abi, factoryAddress, provider);
    factory.connect(account0);

    const pairAddress = "0x".concat((await factory.get_pair(tokenA, tokenB))[0].toString(16));
    console.log("Pair :", pairAddress);

    const { transaction_hash: approveATxHash } = await account0.execute(
        {
            contractAddress: pairAddress,
            entrypoint: "approve",
            calldata: stark.compileCalldata({
                spender: routerAddress,
                amount: { type: "struct", low: liquidity.low, high: liquidity.high }
            })
        },
        undefined,
        { maxFee: 900_000_000_000_000 }
    );
    console.log("Waiting for approve LP");
    await provider.waitForTransaction(approveATxHash);

    const { transaction_hash: mintTxHash } = await router.remove_liquidity(
        tokenA,
        tokenB,
        liquidity,
        amountAMin,
        amountBMin,
        to,
        deadline
    );

    // Wait for the invoke transaction to be accepted on Starknet
    console.log("Waiting for Tx to be Accepted on Starknet - Remove liquidity...");
    await provider.waitForTransaction(mintTxHash);

    const compiledPair = json.parse(
        fs
            .readFileSync("starknet-artifacts/contracts/jediswap/Pair.cairo/Pair.json")
            .toString("ascii")
    );
    const pair = new Contract(compiledPair.abi, pairAddress, provider);
    pair.connect(account0);

    // Check balance - should be 1100
    console.log("Calling Starknet for account balance...");
    const balanceBeforeTransfer = await pair.balanceOf(account0.address);
    console.log(
        "account0 has a LP balance of :",
        uint256.uint256ToBN(balanceBeforeTransfer.balance).toString()
    );

    const decimals = await pair.decimals();
    console.log("Decimals: ", decimals.toString());

    console.log("✅ Script completed.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
