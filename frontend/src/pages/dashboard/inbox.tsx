import { ReactElement } from 'react'
import { Button, List, Skeleton, Typography } from 'antd'
import { DashboardLayout } from '../../components/dashboardLayout'
import { NextPageWithLayout } from '../_app'
import { ListItem } from '../../components/listItem'

import mockJsonList from '../../test/responses/getRequestsForAddress.json'
import { useGetIncomingMessages } from '../../hooks/useGetIncomingMessages'

const Inbox: NextPageWithLayout = () => {
  const { loading, data, error } = useGetIncomingMessages()

  return (
    <List
      itemLayout='horizontal'
      dataSource={data}
      style={{ width: '100%', marginTop: 16 }}
      renderItem={item => (
        <List.Item>
          <Skeleton title={false} loading={loading} active>
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
