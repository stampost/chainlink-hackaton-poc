import { isEmpty } from 'lodash'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ContractName, useContract } from './core/useContract'
import { useCallback, useState } from 'react'
import { UpdateHookReturn } from './types/updateHookReturn'

/**
 * Return value:
 * data=true when request is accepted
 */
export const useAcceptPublicRequest = (): UpdateHookReturn<string, boolean> => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()
  const Stampost = useContract(ContractName.Stampost)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState(false)

  const generatePublicKey = useCallback(async () => {
    const keyB64 = (await (window as any).ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [account],
    })) as string

    const publicKey = Buffer.from(keyB64, 'base64')
    console.log('publicKey:', publicKey)
    return keyB64
  }, [account])

  const acceptRequest = useCallback(
    async (requestId: string) => {
      try {
        if (!isEmpty(requestId)) {
          throw new Error('requestId is required')
        }
        if (!Stampost) {
          throw new Error('Stampost is required')
        }
        setLoading(true)
        const publicKey = await generatePublicKey()
        const tx: { wait: () => any } = await Stampost.acceptPublicKeyRequest(+requestId, publicKey)
        console.log({ tx })
        const r = await tx.wait()
        // here is receipt
        console.log({ r })
        console.log('ready', r)
        setData(true)
      } catch (e: any) {
        setError(e)
        // metamask gets error.error object - try to send to the one address twice
        // or just common error.message - try to cancel transaction sign in metamask
        // error.error ? error.error.message : error.message
      } finally {
        setLoading(false)
      }
    },
    [Stampost, generatePublicKey],
  )

  return [acceptRequest, { loading, error, data }]
}
