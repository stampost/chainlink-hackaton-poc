import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect, useState } from 'react'
import { Button, Space, Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import useSWR from 'swr'
import { ContractName, useContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { Spin } from 'antd'

import { encrypt } from '@metamask/eth-sig-util'
import { ethers } from 'ethers'
const ascii85 = require('ascii85')

const { Text } = Typography

function encryptData(publicKey: Buffer, data: Buffer): number[] {
  // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
  // Each contains data encoded using base64, version is always the same string

  const key = publicKey.toString('base64')
  console.log({ key })
  const enc = encrypt({
    publicKey: key,
    data: ascii85.encode(data).toString(),
    version: 'x25519-xsalsa20-poly1305',
  })

  // We want to store the data in smart contract, therefore we concatenate them
  // into single Buffer
  const buf = Buffer.concat([
    Buffer.from(enc.ephemPublicKey, 'base64'),
    Buffer.from(enc.nonce, 'base64'),
    Buffer.from(enc.ciphertext, 'base64'),
  ])

  // In smart contract we are using `bytes[112]` variable (fixed size byte array)
  // you might need to use `bytes` type for dynamic sized array
  // We are also using ethers.js which requires type `number[]` when passing data
  // for argument of type `bytes` to the smart contract function
  // Next line just converts the buffer to `number[]` required by contract function
  // THIS LINE IS USED IN OUR ORIGINAL CODE:
  return buf.toJSON().data
}

async function decryptData(account: string, data: Buffer): Promise<Buffer> {
  // Reconstructing the original object outputed by encryption
  const structuredData = {
    version: 'x25519-xsalsa20-poly1305',
    ephemPublicKey: data.slice(0, 32).toString('base64'),
    nonce: data.slice(32, 56).toString('base64'),
    ciphertext: data.slice(56).toString('base64'),
  }
  // Convert data to hex string required by MetaMask
  const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`
  // Send request to MetaMask to decrypt the ciphertext
  // Once again application must have acces to the account
  const decrypt = await (window as any).ethereum.request({
    method: 'eth_decrypt',
    params: [ct, account],
  })
  // Decode the base85 to final bytes
  return ascii85.decode(decrypt)
}

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

    console.log('keyB64:', keyB64)
    console.log('publicKey:', publicKey)
    console.log('to string', publicKey.toString('base64'))

    return publicKey
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
      publicKey.toJSON().data,
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

  const parseMessages = (request: { [x: string]: number }) => {
    const req = {
      id: request['id'].toString(),
      timestamp: request['timestamp'].toString(),
      from: request['from'],
      to: request['to'],
      stamps: request['stamps'].toString(),
      opened: request['opened'].toString(),
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

  const showLockedForYou = () => {
    STAMP.totalWaiting(account).then((result: any[]) => {
      console.log('showLockedForYou response', result)
      setResult('waiting:' + result.toString())
    })
  }

  const showLockedByYou = () => {
    STAMP.totalLocked(account).then((result: any[]) => {
      console.log('showLockedByYou response', result)
      setResult('locked:' + result.toString())
    })
  }

  const acceptRequest = async () => {
    let reqId = prompt('Request Id')
    if (!reqId) return
    const publicKey = await generatePublicKey()

    Stampost.acceptPublicKeyRequest(+reqId, publicKey.toJSON().data)
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

  const sendLetter = async () => {
    let address = prompt('Address')
    if (!address) return

    // first we need recepient's public key

    const publicKeyResponse = await Stampost.publicKeys(address)
    console.log({ publicKey: publicKeyResponse })

    if (!publicKeyResponse.isSet) {
      alert('No public key found')
      return
    }

    const publicKey = Buffer.from(ethers.utils.arrayify(publicKeyResponse.key))

    console.log({ publicKey })

    // then we create and decode message to be sent

    let text = prompt('Text')
    if (!text) return

    const encodedMessage = encryptData(publicKey, Buffer.from(text, 'base64'))

    console.log({ encodedMessage })

    await Stampost.sendMail(1337, address, encodedMessage, BigInt('3000000000000000000'))
      .then(async (tx: { wait: () => any }) => {
        console.log({ tx })
        setPending(true)
        const r = await tx.wait()
        // here is receipt
        console.log({ r })
        setPending(false)
        setResult('mail sent')
        console.log('ready', r)
      })
      .catch((error: any) => {
        // metamask gets error.error object - try to send to the one address twice
        // or just common error.message - try to cancel transaction sign in metamask
        setResult(error.error ? error.error.message : error.message)
      })
  }

  const onGetIncomingMessages = () => {
    Stampost.incomingMail().then((result: any[]) => {
      console.log('onGetIncomingMessages response', result)
      setResult(JSON.stringify(result.map(parseMessages), null, '\r\n'))
    })
  }

  const onGetOutcomingMessages = () => {
    Stampost.outcomingMail().then((result: any[]) => {
      console.log('onGetOutcomingMessages response', result)
      setResult(JSON.stringify(result.map(parseMessages), null, '\r\n'))
    })
  }

  const readMail = async () => {
    let id = prompt('mail id')
    if (!id) return

    const letter = await Stampost.getMail(+id)
    console.log({ letter })

    const message = letter.message
    console.log({ message })

    const arraified = ethers.utils.arrayify(message)

    console.log('arraified message', arraified)

    const decrypted = await decryptData(letter.to, Buffer.from(arraified))

    console.log({ decrypted })
    const decryptedMessage = decrypted.toString('base64')

    setResult(decryptedMessage)
  }

  const markAsRead = () => {
    let id = prompt('mail id')
    if (!id) return
    setResult('')
    Stampost.markAsOpened(+id)
      .then(async (tx: { wait: () => any }) => {
        console.log({ tx })
        setPending(true)
        const r = await tx.wait()
        // here is receipt
        console.log({ r })
        setPending(false)
        setResult('you got stamps')
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

  const test = async () => {
    const pubkey = await generatePublicKey()
    console.log({ pubkey })

    const publicKeyResponse = await Stampost.publicKeys(
      '0xFf3Fe860B4Dd2137BfD5eb45B45c70d5ccb85931',
    )
    console.log({ publicKey: publicKeyResponse })

    const u8 = ethers.utils.arrayify(publicKeyResponse.key)

    console.log('arrayify', u8)
    console.log('arrayify string')
    const from = Buffer.from(u8)
    console.log({ from })

    //@ts-ignore
    const encrypted = await encryptData(from, Buffer.from('test'))
    console.log({ encrypted })
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
      <div>
        <Button onClick={sendLetter}>Send letter</Button>
      </div>
      <div>
        <Button onClick={onGetIncomingMessages}>Incoming messages</Button>
      </div>
      <div>
        <Button onClick={onGetOutcomingMessages}>Outcoming messages</Button>
      </div>
      <div>
        <Button onClick={readMail}>Read mail</Button>
      </div>
      <div>
        <Button onClick={markAsRead}>Get stamps for mail</Button>
      </div>
      <div>
        <Button onClick={showLockedForYou}>Show locked for you</Button>
      </div>
      <div>
        <Button onClick={showLockedByYou}>Show locked by you</Button>
      </div>
      {/* <div>
        <Button onClick={test}>test</Button>
      </div> */}

      {/* <Button onClick={onGetLocked}>Get STAMP locked</Button> */}
    </div>
  )
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Inbox
