import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from 'antd'
import { DeleteFilled, InboxOutlined, PlusCircleFilled, SendOutlined } from '@ant-design/icons'

const routes = [
  {
    url: '/dashboard/inbox',
    icon: <InboxOutlined />,
    text: 'Inbox',
  },
  {
    url: '/dashboard/sent',
    icon: <SendOutlined />,
    text: 'Sent',
  },
  {
    url: '/dashboard/trash',
    icon: <DeleteFilled />,
    text: 'Trash',
  },
]

export const Navbar = () => {
  const router = useRouter()

  // router.route
  //  <Link href={route.url}>{route.text}</Link>

  const navigate = (url: string) => router.push(url)

  return (
    <div>
      {routes.map(route => (
        <Button
          key={route.url}
          icon={route.icon}
          shape='round'
          type={router.route === route.url ? 'default' : 'text'}
          onClick={() => navigate(route.url)}
        >
          {route.text}
        </Button>
      ))}
    </div>
  )
}
