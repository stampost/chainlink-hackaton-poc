import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect } from 'react'
import { Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import { useGetIncomingMessages } from '../../hooks/useGetIncomingMessages'
import { useGetSentMessages } from '../../hooks/useGetSentMessages'

const { Text } = Typography

const Inbox: NextPageWithLayout = () => {
  const { loading, data, error } = useGetSentMessages()

  useEffect(() => {
    console.log('dashboard sent', loading, data, error)
  }, [loading, data, error])

  return <div>sent</div>
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Inbox
