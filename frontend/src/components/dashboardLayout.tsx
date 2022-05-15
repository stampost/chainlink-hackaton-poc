import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useEffect } from 'react'
import styles from '../styles/Dashboard.module.css'
import { Button, Layout } from 'antd'
import { Content, Header } from 'antd/lib/layout/layout'
import { PlusCircleFilled } from '@ant-design/icons'
import { Typography } from 'antd'
import { Navbar } from './navbar'

const { Text } = Typography

// @ts-ignore
export const DashboardLayout = ({ children }) => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()

  useEffect(() => {
    console.log('dashboardLayout', chainId, account, active)
  })

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerLeftBlock}>
          <img src={'/logo.svg'} />
          <Button icon={<PlusCircleFilled />} type='primary'>
            Compose
          </Button>
          <Navbar />
        </div>
        <div className={styles.headerRightBlock}>
          <div className={styles.alignVerticalCenter}>
            <Text type='secondary' className={styles.textBlock} style={{ width: 56 }}>
              Balance:
            </Text>
            <div className={styles.alignVerticalCenter}>
              <img src={'/tokens/stampost.png'} style={{ width: 16, height: 16 }} />
              <b>120 STMP</b>
              <Text type='secondary'>~1200 $</Text>
            </div>
          </div>
          <div className={styles.alignVerticalCenter}>
            <Text type='secondary' className={styles.textBlock} style={{ width: 56 }}>
              Address:
            </Text>
            <div className={styles.alignVerticalCenter}>
              <img src={'/tokens/ethereum.png'} style={{ width: 16, height: 16 }} />
              {account}
            </div>
          </div>
        </div>
      </Header>
      <Content className={styles.content}>{children}</Content>
    </Layout>
  )
}
