import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Alert, Button, Layout } from 'antd'
import { injectedConnectorInstance } from '../util/connector'
import { Content, Footer } from 'antd/lib/layout/layout'

const ConnectWallet = () => {
  const router = useRouter()
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()
  const onClick = () => {
    activate(injectedConnectorInstance)
  }

  useEffect(() => {
    console.log(chainId, account, active)
  })

  useEffect(() => {
    if (active) {
      router.push('/dashboard')
    }
  }, [active])

  return (
    <div>
      {active ? (
        <div>✅</div>
      ) : (
        <Button type='primary' onClick={onClick}>
          Connect Wallet
        </Button>
      )}
    </div>
  )
}

const Connect: NextPage = () => {
  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <img src={'/logo.svg'} style={{ marginBottom: '2rem' }} />
        <h3 style={{ fontSize: 24, fontWeight: 400, marginBottom: '2rem' }}>
          It's Time To Get Connected
        </h3>
        <ConnectWallet />
      </Content>
      <Footer>
        <Alert
          message='Процесс подключения'
          description='После нажатия на кнопку Connect Wallet откроется окно Metamask в котором произойдет подключение'
          type='info'
          showIcon
          style={{ width: 560 }}
        />
      </Footer>
    </Layout>
  )
}

export default Connect
