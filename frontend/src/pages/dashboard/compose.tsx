import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect } from 'react'
import { Button, Modal, Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import { useRouter } from 'next/router'

const { Text } = Typography

const Compose: NextPageWithLayout = () => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()
  const router = useRouter()

  useEffect(() => {
    console.log('dashboard compose', chainId, account, active)
  })

  const onBack = () => {
    router.back()
  }

  return (
    <Modal visible={true} onCancel={onBack} width={'70%'}>
      compose content
    </Modal>
  )
}

Compose.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Compose
