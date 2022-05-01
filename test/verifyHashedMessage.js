const { expect } = require('chai')
const { ethers } = require('hardhat')
require('@nomiclabs/hardhat-waffle')

describe('VerifySignature', () => {
  let contract
  let owner

  beforeEach(async () => {
    const Verifier = await ethers.getContractFactory('VerifySignature')
    const verifier = await Verifier.deploy()
    contract = await verifier.deployed()
    ;[owner] = await ethers.getSigners()
  })

  it('Should return true on correct signature', async () => {
    const privateKey = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

    const landId = 1234
    const avatarId = 1
    const missionId = 1

    const hash = await contract.getMessageHash(landId, avatarId, missionId)

    console.log('hash', hash)

    const wallet = new ethers.Wallet(privateKey)
    console.log({ wallet })
    const signature = await wallet.signMessage(ethers.utils.arrayify(hash))

    const splittedSignature = ethers.utils.splitSignature(signature)

    console.log({ walletAddress: wallet.address, signature })

    const isSignatureValid = await contract.verify(
      wallet.address,
      landId,
      avatarId,
      missionId,
      splittedSignature.v,
      splittedSignature.r,
      splittedSignature.s,
    )

    console.log({ isSignatureValid })

    expect(isSignatureValid).to.equal(true)

    // const setGreetingTx = await greseter.setGreeting('Hola, mundo!')

    // // wait until the transaction is mined
    // await setGreetingTx.wait()

    // expect(await greeter.greet()).to.equal('Hola, mundo!')
  })
})
