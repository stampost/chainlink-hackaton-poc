const { expect } = require('chai')
const { ethers } = require('hardhat')
require('@nomiclabs/hardhat-waffle')

describe('Verifier', () => {
  let contract
  let owner

  beforeEach(async () => {
    const Verifier = await ethers.getContractFactory('Verifier')
    const verifier = await Verifier.deploy()
    contract = await verifier.deployed()
    ;[owner] = await ethers.getSigners()
  })

  it('Should return correct signer address from signed message', async () => {
    const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123'
    const publicAddress = '0x14791697260E4c9A71f18484C9f997B308e59325'
    const missionId = '1'
    const wallet = new ethers.Wallet(privateKey)
    const signature = await wallet.signMessage(missionId)

    const sig = ethers.utils.splitSignature(signature)
    console.log('splitted signature', sig)

    const contract_response = await contract.completeMission(missionId, sig.v, sig.r, sig.s)

    console.log({ contract_response })
    expect(await contract_response).to.equal(publicAddress)

    // const setGreetingTx = await greseter.setGreeting('Hola, mundo!')

    // // wait until the transaction is mined
    // await setGreetingTx.wait()

    // expect(await greeter.greet()).to.equal('Hola, mundo!')
  })
})
