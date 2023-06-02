import { HardhatUserConfig } from "hardhat/types";
import "@shardlabs/starknet-hardhat-plugin";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
    solidity: "0.6.12",
    // paths: {
    //     cairoPaths: ["~/cairo_venv/lib/python3.8/site-packages"]
    // },
    starknet: {
        dockerizedVersion: "0.11.0.2", // alternatively choose one of the two venv options below
        // uses (my-venv) defined by `python -m venv path/to/my-venv`
        // venv: "~/cairo_venv/",

        // uses the currently active Python environment (hopefully with available Starknet commands!)
        // venv: "active",
        recompile: false,

        // the directory containing Cairo 1 compiler binaries
        // cairo1BinDir: "~/cairo_venv/bin",
        network: "testnet",
        wallets: {
            OpenZeppelin: {
                accountName: "OpenZeppelin",
                modulePath: "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
                accountPath: "~/.starknet_accounts"
            }
        },
        requestTimeout: 300_000 // ms
    },
    networks: {
        testnet: {
            url: "https://alpha4.starknet.io"
        },
        devnet: {
            url: "http://127.0.0.1:5050"
        },
        integration: {
            url: "https://external.integration.starknet.io",
            // url: "https://alpha4.starknet.io",
            venv: "active"
        },
        integratedDevnet: {
            url: "http://127.0.0.1:5050",
            venv: "active",
            // dockerizedVersion: "<DEVNET_VERSION>",
            args: [
                // Uncomment the lines below to activate Devnet features in your integrated-devnet instance
                // Read about Devnet options here: https://0xSpaceShard.github.io/starknet-devnet/docs/guide/run
                //
                // *Account predeployment*
                // "--seed",
                // "42",
                // "--accounts",
                // "1",
                // "--initial-balance", <VALUE>
                //
                // *Forking*
                // "--fork-network",
                // "alpha-goerli2"
                // "--fork-block", <VALUE>
                //
                // *Chain ID*
                // "--chain-id", <VALUE>
                //
                // *Gas price*
                // "--gas-price", <VALUE>
            ]
        },
        hardhat: {}
    }
};

export default config;
