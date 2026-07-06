import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: process.env.ARC_TESTNET_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY ? [process.env.ARC_TESTNET_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || ""] : []
    }
  }
};

export default config;
