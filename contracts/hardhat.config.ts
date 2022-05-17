import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { node_url, accounts } from "./utils/network";

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  paths: {
    artifacts: "../frontend/artifact",
  },
  namedAccounts: {
    deployer: 0,
    alice: 1,
    bob: 2,
    dan: 3,
    eve: 4,
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    goerli: {
      url: node_url("goerli"),
      accounts: accounts("goerli"),
    },
  },
};
export default config;
