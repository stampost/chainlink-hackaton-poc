import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import StampostArtifact from './artifact/contracts/Stampost.sol/Stampost.json'

const stampostContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const _intializeContract = async init => {
  const contract = new ethers.Contract(resourceAddress, StampostArtifact.abi, init)
  return contract
}

export default function ConnectWallet() {
  const [error, setError] = useState()
  const [contract, setContract] = useState()

  const connectWallet = async () => {
    e.preventDefault()
    try {
      if (!window.ethereum) throw new Error('No crypto wallet found. Please install it.')

      // this call is for Connect Wallet button
      await window.ethereum.send('eth_requestAccounts')
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      // we call contract write data as a signer (metamask account)
      const _contract = await _intializeContract(signer)
      setContract(_contract)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <form className='m-4' onSubmit={connectWallet}>
        <div className='credit-card w-full shadow-lg mx-auto rounded-xl bg-white'>
          <footer className='p-4'>
            <button
              type='submit'
              className='btn btn-primary submit-button focus:ring focus:outline-none w-full'
            >
              Connect Wallet
            </button>
          </footer>
        </div>
      </form>
    </>
  )
}
