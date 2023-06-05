import hardhat from "hardhat";
import { getOZAccount } from "../test/util";
import { setTimeout } from "timers/promises";

async function main() {
    const account = await getOZAccount();

    const balanceETH = await hardhat.starknet.getBalance(account.address);
    console.log(`Account ${account.address} has a balance of ${balanceETH} wei`);

    // const routerImplementationFactory = await hardhat.starknet.getContractFactory("Router");
    // await account.declare(routerImplementationFactory);
    // console.log("declare router");

    // await setTimeout(5000);

    // const routerImplementationClassHash = await routerImplementationFactory.getClassHash();
    // console.log("check >>>> ", routerImplementationClassHash);

    // await setTimeout(10000);

    const proxyFactory = await hardhat.starknet.getContractFactory("RouterProxy");
    await account.declare(proxyFactory);
    console.log("declare proxy router");
    await setTimeout(10000);

    const proxy = await account.deploy(proxyFactory, {
        implementation_hash: "0x3fc291fd52b8ba14d6d60e92835f1d6b69b66603695328f29226548320e1d34",
        factory: process.env.PROXY_FACTORY_ADDRESS,
        proxy_admin: process.env.PROXY_ADMIN_ADDRESS
    });
    console.log("Deployed proxy router to", proxy.address);

    // proxy.setImplementation(factoryImplementationFactory);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
