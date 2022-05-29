import { FetchHookReturn } from './types/fetchHookReturn'
import { MessageInfo } from './types/messageInfo'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ContractName, useContract } from './core/useContract'
import { useCallback } from 'react'
import { parseRequest } from '../util/stampost'
import { useFetchApiCall } from './core/useFetchApiCall'

export const useGetIncomingMessages = (): FetchHookReturn<Array<MessageInfo>> => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()
  const Stampost = useContract(ContractName.Stampost)
  const fetchFn = useCallback(() => {
    if (Stampost) {
      return Stampost.getRequestsForAddress(account).then((resultIncoming: any[]) => {
        console.log('useGetIncomingMessages getRequestsForAddress response', resultIncoming)
        const resultMapped = resultIncoming.map(parseRequest)
        console.log('useGetIncomingMessages resultMapped response', resultMapped)
        return resultMapped
      })
    }
  }, [Stampost])

  return useFetchApiCall({ fetchFn })
}
