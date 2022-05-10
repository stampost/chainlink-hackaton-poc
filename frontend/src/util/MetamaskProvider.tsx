import React, { useEffect, useState } from 'react'
import { injectedConnectorInstance } from './connector'
import { useWeb3React } from '@web3-react/core'

// @ts-ignore
export const MetamaskProvider = ({ children }) => {
  const { active: networkActive, error: networkError, activate: activateNetwork } = useWeb3React()
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    injectedConnectorInstance
      .isAuthorized()
      .then(isAuthorized => {
        if (isAuthorized && !networkActive && !networkError) {
          return activateNetwork(injectedConnectorInstance)
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoaded(true)
      })
  }, [activateNetwork, networkActive, networkError])
  if (loaded) {
    return children
  }
  return null
}

export default MetamaskProvider
