import { Account, Contract, Provider, ec, uint256 } from "starknet";
// import fs from "fs";

async function main() {
    // initialize provider
    const provider = new Provider({ sequencer: { baseUrl: "https://alpha4.starknet.io" } });
    // initialize existing pre-deployed account 0 of Devnet
    const privateKey =
        "0x189319015665933196653334217366076354013949034844833818116353818416794168361";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const accountAddress = "0x44d89e94f5d7a289b7fb2233f2ab295dc03259a38d3decc81e8b4c1618d4776";

    const account0 = new Account(provider, accountAddress, starkKeyPair);

    // Get the erc20 contract address
    // const erc20Address = deployERC20Response.deploy.contract_address;
    const erc20Address = "0xdea288824da3b230eda8d83c2e880ecc37e23b9b712e3f7533f521edc2f2f3";

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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
