import { expect } from "./chai-setup";

import { setupUsers, setupUser } from "./utils";

import {
  ethers,
  deployments,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";

async function setup() {
  await deployments.fixture(["STAMP"]);
  await deployments.fixture(["Stampost"]);

  const contracts = {
    Token: await ethers.getContract("STAMP"),
  };

  const { tokenOwner } = await getNamedAccounts();

  // These object allow you to write things like `users[0].Token.transfer(....)`
  const users = await setupUsers(await getUnnamedAccounts(), contracts);
  return {
    ...contracts,
    users,
    tokenOwner: await setupUser(tokenOwner, contracts),
  };
}

describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    await deployments.fixture(["STAMP"]);
    const { tokenOwner } = await getNamedAccounts();
    const STAMP = await ethers.getContract("STAMP");
    const ownerBalance = await STAMP.balanceOf(tokenOwner);
    const supply = await STAMP.totalSupply();
    expect(ownerBalance).to.equal(supply);
  });
});
