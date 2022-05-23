import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { ReactElement, useEffect, useState } from 'react'
import { Button, List, Skeleton, Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import { ContractName, useContract } from '../../hooks/useContract'
import { MessageInfo, parseRequest } from '../../util/stampost'
import { ListItem } from '../../components/listItem'

import mockJsonList from '../../test/responses/getRequestsForAddress.json'

const { Text } = Typography

const Inbox: NextPageWithLayout = () => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()
  const Stampost = useContract(ContractName.Stampost)
  const [listRequests, setListRequests] = useState<Array<MessageInfo>>()
  const isLoading = listRequests === undefined

  useEffect(() => {
    if (Stampost) {
      Stampost.getRequestsForAddress(account).then((resultIncoming: any[]) => {
        console.log('getRequestsForAddress response', resultIncoming)
        const resultMapped = resultIncoming.map(parseRequest)
        console.log('resultMapped response', resultMapped)
        //setListRequests(resultMapped)
        setListRequests(mockJsonList)
      })
    }
  }, [Stampost])

  return (
    <List
      itemLayout='horizontal'
      dataSource={listRequests}
      style={{ width: '100%', marginTop: 16 }}
      renderItem={item => (
        <List.Item>
          <Skeleton title={false} loading={isLoading} active>
            <ListItem data={item} />
          </Skeleton>
        </List.Item>
      )}
    />
  )
}

Inbox.getLayout = function getLayout(page: ReactElement) {
  return (
    <DashboardLayout contentStyle={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
      {page}
    </DashboardLayout>
  )
}

export default Inbox
