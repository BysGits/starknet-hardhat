import hardhat from "hardhat";
import { getOZAccount } from "../test/util";

async function main() {
    const account = await getOZAccount();

    const implementationFactory = await hardhat.starknet.getContractFactory("contract");
    // const imp = await account.declare(implementationFactory);
    // console.log(imp);
    // const implementationClassHash = await implementationFactory.getClassHash();
    // console.log(implementationClassHash);

    // uses delegate proxy defined in contracts/delegate_proxy.cairo
    const proxyFactory = await hardhat.starknet.getContractFactory("delegate_proxy");
    await account.declare(proxyFactory);
    const proxy = await account.deploy(proxyFactory, {
        implementation_hash_: "0x3e6a61ac2f52d377509436ecefebe09f86172fc13f63a65cd122ae28e1fd734"
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
