import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect, useState } from 'react'
import { Button, Space, Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import useSWR from 'swr'
import { ContractName, useContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { Spin } from 'antd'

const { Text } = Typography

const Inbox: NextPageWithLayout = () => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()

  // Is it ok to have ! signs here?
  const STAMP = useContract(ContractName.STAMP)!
  const Stampost = useContract(ContractName.Stampost)!
  const [result, setResult] = useState<any>()
  const [pending, setPending] = useState<boolean>(false)

  // useEffect(() => {
  //   const symbol = STAMP.symbol().then((result: any) => console.log({ result }))
  // })

  const generatePublicKey = async () => {
    const keyB64 = (await (window as any).ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [account],
    })) as string

    const publicKey = Buffer.from(keyB64, 'base64')

    console.log('publicKey:', publicKey)

    return keyB64
  }

  const onRequestAccess = async () => {
    setResult('')

    // here we need to catch error in toast maybe - see catch below
    const publicKey = await generatePublicKey()

    console.log({ chainId })

    Stampost.requestPublicKey(
      chainId,
      // this is recepient address
      '0x9a4407Bf1Dc791383923cc0EA2706607c8E43eb1',
      // this is 3 stamps * 10**18
      BigInt('3000000000000000000'),
      publicKey,
    )
      .then(async (tx: { wait: () => any }) => {
        console.log({ tx })
        setPending(true)
        const r = await tx.wait()
        // here is receipt
        console.log({ r })
        setPending(false)
        setResult('request sent')
        console.log('ready', r)

        // here we can refresh stamps balance and locked amount of sender
      })
      .catch((error: any) => {
        // metamask gets error.error object - try to send to the one address twice
        // or just common error.message - try to cancel transaction sign in metamask
        setResult(error.error ? error.error.message : error.message)
      })
  }

  const onGetBalance = () => {
    // result is BigNumber - should be divided to 10**18 , leave
    STAMP.balanceOf(account).then((result: any) =>
      // should be :10e18 but correct amount when divided to 10*17 - why?
      setResult(Math.round(+result.toString() / 10e17)),
    )
  }

  //incorrect implementation in contract, fix soon
  // const onGetLocked = () => {
  //   // result is BigNumber - should be divided to 10**18 , leave
  //   STAMP.locked(account).then((result: any) => {
  //     console.log({ result })
  //     // should be :10e18 but correct amount when divided to 10*17 - why?
  //     setResult(result.toString())
  //   })
  // }

  return (
    <div>
      <div>{result}</div>
      <div>
        {pending && (
          <Space align='center'>
            <Spin />
            tx sent, wait..
          </Space>
        )}
      </div>
      <Button onClick={onRequestAccess}>Request Access</Button>
      <Button onClick={onGetBalance}>Get STAMP balance</Button>
      {/* <Button onClick={onGetLocked}>Get STAMP locked</Button> */}
    </div>
  )
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Inbox
