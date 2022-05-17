import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect } from 'react'
import { Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import useSWR from 'swr'
import { Contract } from '@ethersproject/contracts'
import STAMP from '../../../../contracts/deployments/goerli/STAMP.json'
import Stampost from '../../../../contracts/deployments/goerli/Stampost.json'

const { Text } = Typography

const Inbox: NextPageWithLayout = () => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()

  useEffect(() => {
    const stamp = new Contract(STAMP.address, STAMP.abi, library!.getSigner())
    const stampost = new Contract(Stampost.address, Stampost.abi, library!.getSigner())

    const symbol = stamp.symbol().then((result: any) => console.log({ result }))
    console.log('dashboard trash', chainId, account, active)
  })

  return <div>trash</div>
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Inbox
