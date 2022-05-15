import 'antd/dist/antd.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import MetamaskProvider from '../util/MetamaskProvider'
import { NextPage } from 'next'
import { ReactElement, ReactNode } from 'react'

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  // library.pollingInterval = 12000
  return library
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? (page => page)

  const component = getLayout(<Component {...pageProps} />)

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <MetamaskProvider>{component}</MetamaskProvider>
    </Web3ReactProvider>
  )
}

export default MyApp
