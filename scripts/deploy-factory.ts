import hardhat from "hardhat";
import { getOZAccount } from "../test/util";
import { setTimeout } from "timers/promises";

async function main() {
    const account = await getOZAccount();

    const balanceETH = await hardhat.starknet.getBalance(account.address);
    console.log(`Account ${account.address} has a balance of ${balanceETH} wei`);

    // const pairImplementationFactory = await hardhat.starknet.getContractFactory("Pair");
    // await account.declare(pairImplementationFactory);
    // console.log("declare pair");

    // await setTimeout(5000);

    // const pairImplementationClassHash = await pairImplementationFactory.getClassHash();
    // console.log("check1 >>>> ", pairImplementationClassHash);
    // await setTimeout(10000);

    // const pairProxyImplementationFactory = await hardhat.starknet.getContractFactory("PairProxy");
    // await account.declare(pairProxyImplementationFactory);
    // console.log("declare proxy pair");
    // await setTimeout(5000);

    // const pairProxyImplementationClassHash = await pairProxyImplementationFactory.getClassHash();
    // console.log("check2 >>>> ", pairProxyImplementationClassHash);

    // await setTimeout(10000);

    // const factoryImplementationFactory = await hardhat.starknet.getContractFactory("Factory");
    // await account.declare(factoryImplementationFactory);
    // console.log("declare factory");

    // await setTimeout(5000);

    // const factoryImplementationClassHash = await factoryImplementationFactory.getClassHash();
    // console.log("check3 >>>> ", factoryImplementationClassHash);

    // await setTimeout(10000);

    const proxyFactory = await hardhat.starknet.getContractFactory("FactoryProxy");
    await account.declare(proxyFactory);
    console.log("declare proxy factory");
    await setTimeout(10000);

    const proxy = await account.deploy(proxyFactory, {
        implementation_hash: "0x6b9b9176a33a201ce547bf59a934f53c35e0c30531affead5a6ded864c87564",
        pair_proxy_contract_class_hash:
            "0x3d39c26e2bda486f8ac19674e3edece8c77a7876ba1178b03ba4f22cdaf79c2",
        pair_contract_class_hash:
            "0x53e55268b5ed3715bf4b12eac0a0dedaafd4257597d1d86e6d04686810f6864",
        fee_to_setter: process.env.FEE_TO_SETTER_ADDRESS
    });
    console.log("Deployed proxy factory to", proxy.address);

    // proxy.setImplementation(factoryImplementationFactory);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
