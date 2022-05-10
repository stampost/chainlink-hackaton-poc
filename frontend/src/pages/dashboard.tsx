import { NextPage } from 'next'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useEffect } from 'react'

const Dashboard: NextPage = () => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()

  useEffect(() => {
    console.log('dashboard', chainId, account, active)
  })

  return <div>Dashboard</div>
}

export default Dashboard
