import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect } from 'react'
import { Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'

const { Text } = Typography

const Inbox: NextPageWithLayout = () => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()

  useEffect(() => {
    console.log('dashboard inbox', chainId, account, active)
  })

  return <div>content</div>
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Inbox
