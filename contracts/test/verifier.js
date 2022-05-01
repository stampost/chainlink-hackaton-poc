const { expect } = require('chai')
const { ethers } = require('hardhat')
require('@nomiclabs/hardhat-waffle')

describe('Stampost', () => {
  let contract
  let accounts

  beforeEach(async () => {
    const Stampost = await ethers.getContractFactory('Stampost')
    const stampost = await Stampost.deploy()
    contract = await stampost.deployed()
    accounts = await ethers.getSigners()
  })

  it('Should save and retrieve key in storage', async () => {
    const pubKey = 'testPublicKey'

    console.log(accounts[1].address)
    const saveKeyTx = await contract.requestPublicKey(1337, accounts[1].address, 2, pubKey)
    await saveKeyTx.wait()

    const response = await contract.getAcceptedPublicKey(accounts[0].address)
    console.log({ response })
    expect(response).to.equal(pubKey)
  })
})
