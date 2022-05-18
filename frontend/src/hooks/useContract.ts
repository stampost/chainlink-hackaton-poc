import { Web3Provider } from '@ethersproject/providers'
import React, { useState, useEffect, useContext } from 'react'
import { useWeb3React } from '@web3-react/core'

import { Contract } from '@ethersproject/contracts'
import stamp_deploy from '../../../contracts/deployments/goerli/STAMP.json'
import stampost_deploy from '../../../contracts/deployments/goerli/Stampost.json'
import stamp_abi from '../../artifact/contracts/STAMP.sol/STAMP.json'
import stampost_abi from '../../artifact/contracts/Stampost.sol/Stampost.json'

export enum ContractName {
  STAMP,
  Stampost,
}

const getContract = (contractName: ContractName, library: Web3Provider): Contract | undefined => {
  switch (contractName) {
    case ContractName.STAMP:
      // Are we sure that library exists here? How to remove ! sign?
      return new Contract(stamp_deploy.address, stamp_abi.abi, library!.getSigner())
    case ContractName.Stampost:
      return new Contract(stampost_deploy.address, stampost_abi.abi, library!.getSigner())
    default:
      throw new Error('No contract')
  }
}

export const useContract = (contractName: ContractName) => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()

  const [contract, setContract] = useState<Contract | undefined>()

  useEffect(() => {
    let contract = getContract(contractName, library!)
    setContract(contract)
  }, [contractName, library])

  return contract
}
