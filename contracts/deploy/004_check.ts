import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;

  const contracts = {
    Stampost: await ethers.getContract("Stampost"),
    STAMP: await ethers.getContract("STAMP"),
  };

  const stampost_stamptoken = await contracts.Stampost.stamp_token_address();
  console.log({ stampost_stamptoken });
};

export default func;
func.tags = ["Stampost"];
