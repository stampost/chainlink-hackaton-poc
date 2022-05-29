import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import styles from '../styles/Dashboard.module.css'
import { Button, Layout } from 'antd'
import { Content, Header } from 'antd/lib/layout/layout'
import { PlusCircleFilled } from '@ant-design/icons'
import { Typography } from 'antd'
import { Navbar } from './navbar'
import { useRouter } from 'next/router'
import { ContractName, useContract } from '../hooks/core/useContract'

const { Text } = Typography

// @ts-ignore
export const DashboardLayout = ({ children, contentStyle = {} }) => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()
  const router = useRouter()
  const [stampBalance, setStampBalance] = useState(0)

  const STAMP = useContract(ContractName.STAMP)

  useEffect(() => {
    console.log('dashboardLayout', chainId, account, active)

    if (STAMP) {
      // result is BigNumber - should be divided to 10**18 , leave
      STAMP.balanceOf(account).then((result: any) =>
        // should be :10e18 but correct amount when divided to 10*17 - why?
        setStampBalance(Math.round(+result.toString() / 10e17)),
      )
    }
  }, [STAMP])

  const onComposeClick = () => {
    router.push('/dashboard/compose')
  }

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerLeftBlock}>
          <img src={'/logo.svg'} />
          <Button icon={<PlusCircleFilled />} type='primary' onClick={onComposeClick}>
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
              <b>{stampBalance} STMP</b>
              {/*<Text type='secondary'>~1200 $</Text>*/}
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
      <Content className={styles.content} style={contentStyle}>
        {children}
      </Content>
    </Layout>
  )
}
