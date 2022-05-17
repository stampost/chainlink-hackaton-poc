import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer, alice, bob, carol, dan } = await getNamedAccounts();

  await deploy("STAMP", {
    from: deployer,
    args: [BigNumber.from("1000000000000000000000")],
    log: true,
  });
};

export default func;
func.tags = ["STAMP"];
