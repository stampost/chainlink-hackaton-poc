import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

const Home: NextPage = () => {
  const router = useRouter()
  const { active } = useWeb3React<Web3Provider>()

  useEffect(() => {
    if (active) {
      // console.log('pushing dashboard')
      router.push('/dashboard')
    } else {
      // console.log('pushing connect')
      router.push('/connect')
    }
  }, [active])

  return null
}

export default Home
