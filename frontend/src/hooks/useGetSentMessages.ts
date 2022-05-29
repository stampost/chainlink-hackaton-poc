import { FetchHookReturn } from './types/fetchHookReturn'
import { MessageInfo } from './types/messageInfo'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ContractName, useContract } from './core/useContract'
import { useCallback, useEffect, useState } from 'react'
import { parseRequest } from '../util/stampost'
import { useFetchApiCall } from './core/useFetchApiCall'

export const useGetSentMessages = (): FetchHookReturn<Array<MessageInfo>> => {
  const Stampost = useContract(ContractName.Stampost)
  const fetchFn = useCallback(() => {
    if (Stampost) {
      return Stampost.getOutcomingRequests().then((resultIncoming: any[]) => {
        console.log('useGetSentMessages getOutcomingRequests response', resultIncoming)
        const resultMapped = resultIncoming.map(parseRequest)
        console.log('useGetSentMessages resultMapped response', resultMapped)
        return resultMapped
      })
    }
  }, [Stampost])

  return useFetchApiCall({ fetchFn })
}
