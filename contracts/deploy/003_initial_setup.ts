import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;

  const contracts = {
    Stampost: await ethers.getContract("Stampost"),
    STAMP: await ethers.getContract("STAMP"),
  };

  console.log("contracts.STAMP.address", contracts.STAMP.address);
  console.log("set stampost.stamp");
  await contracts.Stampost.setStampToken(contracts.STAMP.address);

  console.log("set stamp.stampost");
  await contracts.STAMP.setStampost(contracts.Stampost.address);
};

export default func;
func.tags = ["Stampost"];
