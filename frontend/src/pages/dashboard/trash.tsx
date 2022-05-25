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

    let address = prompt('Address')
    if (!address) return

    // here we need to catch error in toast maybe - see catch below
    const publicKey = await generatePublicKey()

    console.log({ chainId })

    Stampost.requestPublicKey(
      chainId,
      // this is recepient address
      address,
      // this is 3 stamps * 10**18
      BigInt('3000000000000000000'),
      publicKey,
      'unencripted message',
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

  /* request solidity type

  enum PublicKeyRequestStatus { PENDING, ACCEPTED, DECLINED }

  struct PublicKeyRequest {
    uint256 id;
    uint256 timestamp;
    address from;
    address to;
    uint256 stamps;
    PublicKeyRequestStatus status; 0,1,2  from enum above
  }
  */

  const getStatus = (statusId: number) => {
    switch (statusId) {
      case 0:
        return 'Pending'
      case 1:
        return 'Accepted'
      case 2:
        return 'Declined'
    }
  }

  const parseRequest = (request: { [x: string]: number }) => {
    const req = {
      id: request['id'].toString(),
      timestamp: request['timestamp'].toString(),
      from: request['from'],
      to: request['to'],
      stamps: request['stamps'].toString(),
      status: getStatus(request['status']),
      message: request['message'],
    }
    return req
  }

  const onGetIncomingRequests = () => {
    Stampost.getRequestsForAddress(account).then((result: any[]) => {
      console.log('getRequestsForAddress response', result)
      setResult(JSON.stringify(result.map(parseRequest), null, '\r\n'))
    })
  }

  const onGetOutcomingRequests = () => {
    Stampost.getOutcomingRequests().then((result: any[]) => {
      console.log('getRequestsForAddress response', result)
      setResult(JSON.stringify(result.map(parseRequest), null, '\r\n'))
    })
  }

  const acceptRequest = async () => {
    let reqId = prompt('Request Id')
    if (!reqId) return
    const publicKey = await generatePublicKey()

    Stampost.acceptPublicKeyRequest(+reqId, publicKey)
      .then(async (tx: { wait: () => any }) => {
        console.log({ tx })
        setPending(true)
        const r = await tx.wait()
        // here is receipt
        console.log({ r })
        setPending(false)
        setResult('request sent')
        console.log('ready', r)
      })
      .catch((error: any) => {
        // metamask gets error.error object - try to send to the one address twice
        // or just common error.message - try to cancel transaction sign in metamask
        setResult(error.error ? error.error.message : error.message)
      })
  }

  const addToken = async () => {
    const tokenAddress = STAMP.address
    const tokenSymbol = 'STAMP'
    const tokenDecimals = 18
    const tokenImage = 'http://placekitten.com/200/300'

    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      })

      if (wasAdded) {
        console.log('Thanks for your interest!')
      } else {
        console.log('Your loss!')
      }
    } catch (error) {
      console.log(error)
    }
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
      <div>
        <Button onClick={addToken}>Add token to metamask</Button>
      </div>
      <div>
        <Button onClick={onGetBalance}>Get STAMP balance</Button>
      </div>
      <div>
        <Button onClick={onRequestAccess}>Request Access</Button>
      </div>
      <div>
        <Button onClick={onGetIncomingRequests}>Get Incoming Requests</Button>
      </div>
      <div>
        <Button onClick={onGetOutcomingRequests}>Get Outcoming Requests</Button>
      </div>
      <div>
        <Button onClick={acceptRequest}>Accept Request</Button>
      </div>

      {/* <Button onClick={onGetLocked}>Get STAMP locked</Button> */}
    </div>
  )
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Inbox
