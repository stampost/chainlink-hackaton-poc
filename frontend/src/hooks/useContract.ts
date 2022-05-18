import { Web3Provider } from '@ethersproject/providers'
import React, { useState, useEffect, useContext } from 'react'
import { useWeb3React } from '@web3-react/core'

import { Contract } from '@ethersproject/contracts'
import STAMP from '../../../contracts/deployments/goerli/STAMP.json'
import Stampost from '../../../contracts/deployments/goerli/Stampost.json'

export enum ContractName {
  STAMP,
  Stampost,
}

const getContract = (contractName: ContractName, library: Web3Provider): Contract | undefined => {
  switch (contractName) {
    case ContractName.STAMP:
      // Are we sure that library exists here? How to remove ! sign?
      return new Contract(STAMP.address, STAMP.abi, library!.getSigner())
    case ContractName.Stampost:
      return new Contract(Stampost.address, Stampost.abi, library!.getSigner())
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
