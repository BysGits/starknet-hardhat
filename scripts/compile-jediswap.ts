import hardhat from "hardhat";

async function main() {
    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/jediswap/Factory.cairo"]
    });

    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/jediswap/FactoryProxy.cairo"]
    });

    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/jediswap/Pair.cairo"]
    });

    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/jediswap/PairProxy.cairo"]
    });

    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/jediswap/Router.cairo"]
    });

    await hardhat.run("starknet-compile-deprecated", {
        paths: ["contracts/jediswap/RouterProxy.cairo"]
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
