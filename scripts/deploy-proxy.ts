import hardhat from "hardhat";
import { getOZAccount } from "../test/util";
import { setTimeout } from "timers/promises";

async function main() {
    const account = await getOZAccount();

    const implementationFactory = await hardhat.starknet.getContractFactory("contract");
    const imp = await account.declare(implementationFactory);
    console.log(imp);
    const implementationClassHash = await implementationFactory.getClassHash();
    console.log(implementationClassHash);

    await setTimeout(5000);

    // uses delegate proxy defined in contracts/delegate_proxy.cairo
    const proxyFactory = await hardhat.starknet.getContractFactory("delegate_proxy");
    await account.declare(proxyFactory);
    const proxy = await account.deploy(proxyFactory, {
        implementation_hash_: implementationClassHash
    });
    console.log("Deployed proxy to", proxy.address);

    proxy.setImplementation(implementationFactory);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
