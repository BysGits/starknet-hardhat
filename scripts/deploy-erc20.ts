import hardhat from "hardhat";
import { getOZAccount } from "../test/util";
import { Account, Contract, Provider, ec, uint256 } from "starknet";
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
    const account = await getOZAccount();

    // Deploy an ERC20 contract
    console.log("Deployment Tx - ERC20 Contract to Starknet...");
    // const compiledErc20mintable = json.parse(
    //     fs
    //         .readFileSync(
    //             "starknet-artifacts/contracts/tokens/erc20/erc20Mintable.cairo/erc20Mintable.json"
    //         )
    //         .toString("ascii")
    // );
    // const ERC20mintableClassHash =
    //     "0x795be772eab12ee65d5f3d9e8922d509d6672039978acc98697c0a563669e8";
    // // (await account0.declare(compiledErc20mintable)).class_hash;
    // const initialTk = { low: 100, high: 0 };

    // const ERC20ConstructorCallData = stark.compileCalldata({
    //     name: shortString.encodeShortString("MyToken"),
    //     symbol: shortString.encodeShortString("MTK"),
    //     decimals: "18",
    //     initial_supply: { type: "struct", low: initialTk.low, high: initialTk.high },
    //     recipient: account0.address,
    //     owner: account0.address
    // });
    // console.log("constructor=", ERC20ConstructorCallData);

    // const deployERC20Response = await account0.declareDeploy({
    //     classHash: ERC20mintableClassHash,
    //     contract: compiledErc20mintable,
    //     constructorCalldata: ERC20ConstructorCallData
    // });

    // console.log("ERC20 deployed at address: ", deployERC20Response.deploy.contract_address);

    const contractFactory = await hardhat.starknet.getContractFactory("erc20Mintable");
    const tx = await account.declare(contractFactory);
    console.log(tx);
    const contract = await account.deploy(contractFactory, {
        name: hardhat.starknet.shortStringToBigInt("Test"),
        symbol: hardhat.starknet.shortStringToBigInt("Test"),
        decimals: 18,
        initial_supply: { low: 1000, high: 0 },
        recipient: account.address,
        owner: account0.address
    });
    console.log("Deployed to:", contract.address);

    // Get the erc20 contract address
    // const erc20Address = deployERC20Response.deploy.contract_address;
    const erc20Address = contract.address;

    const { abi: testAbi } = await provider.getClassAt(erc20Address);
    if (testAbi === undefined) {
        throw new Error("no abi.");
    }
    // Create a new erc20 contract object
    const erc20 = new Contract(testAbi, erc20Address, provider);
    erc20.connect(account0);

    // Check balance - should be 100
    console.log("Calling Starknet for account balance...");
    const balanceInitial = await erc20.balanceOf(account0.address);
    console.log(
        "account0 has a balance of :",
        uint256.uint256ToBN(balanceInitial.balance).toString()
    );
    console.log("✅ Script completed.");

    // const account = await getOZAccount();
    // const balance = await hardhat.starknet.getBalance(account.address);
    // console.log(`Account ${account.address} has a balance of ${balance} wei`);
    // const contractFactory = await hardhat.starknet.getContractFactory("erc20");
    // const tx = await account.declare(contractFactory);
    // console.log(tx);
    // const contract = await account.deploy(contractFactory, {
    //     name: hardhat.starknet.shortStringToBigInt("Test"),
    //     symbol: hardhat.starknet.shortStringToBigInt("Test"),
    //     decimals: 18,
    //     initial_supply: { low: 1000, high: 0 },
    //     recipient: account.address
    // });
    // console.log("Deployed to:", contract.address);
    // const { res: balanceBefore } = await contract.call("balanceOf", {
    //     account: account.address
    // });
    // console.log("Balance before invoke: ", balanceBefore);
    // await account.invoke(contract, "mint", {
    //     to: account.address,
    //     amount: { low: 100, high: 0 }
    // });
    // const { res: balanceAfter } = await contract.call("balanceOf", {
    //     account: account.address
    // });
    // console.log("Balance after invoke:", balanceAfter);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
