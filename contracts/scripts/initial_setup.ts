import {
  ethers,
  deployments,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";

async function main() {
  const contracts = {
    Stampost: await deployments.get("Stampost"),
    STAMP: await deployments.get("STAMP"),
  };


  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
