import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect, useState } from 'react'
import { Button, Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import useSWR from 'swr'
import { ContractName, useContract } from '../../hooks/useContract'

const { Text } = Typography

const Inbox: NextPageWithLayout = () => {
  // Is it ok to have ! signs here?
  const STAMP = useContract(ContractName.STAMP)!
  const Stampost = useContract(ContractName.Stampost)!
  const [result, setResult] = useState()

  // useEffect(() => {
  //   const symbol = STAMP.symbol().then((result: any) => console.log({ result }))
  // })

  const onClick = () => {
    STAMP.symbol().then((result: any) => console.log({ result }))
  }

  return (
    <div>
      <Button onClick={onClick}>DO</Button>
      <div>{result}</div>
    </div>
  )
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Inbox
