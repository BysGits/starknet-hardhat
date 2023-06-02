import hardhat from "hardhat";

async function main() {
    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/tokens/erc20/erc20.cairo"]
    });

    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/tokens/erc20/erc20Mintable.cairo"]
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
