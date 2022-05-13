/* eslint-disable import/no-extraneous-dependencies */
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { BigNumber } = require('ethers')
const hre = require('hardhat')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const STAMP = await hre.ethers.getContractFactory('STAMP')
  const stamp_contract = await STAMP.deploy(BigNumber.from('1000000000000000000000'))
  await stamp_contract.deployed()
  console.log('stamp_contract deployed to:', stamp_contract.address)

  const Stampost = await hre.ethers.getContractFactory('Stampost')
  const stampost_contract = await Stampost.deploy()
  await stampost_contract.deployed()
  console.log('stampost_contract deployed to:', stampost_contract.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
