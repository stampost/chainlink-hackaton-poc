import { MessageInfo } from '../hooks/types/messageInfo'

const getStatusById = (statusId: number) => {
  switch (statusId) {
    case 0:
      return 'Pending'
    case 1:
      return 'Accepted'
    case 2:
      return 'Declined'
  }
}

export const parseRequest = (request: { [x: string]: number }): MessageInfo => {
  const req = {
    id: request['id'].toString(),
    timestamp: request['timestamp'].toString(),
    from: request['from'],
    to: request['to'],
    stamps: request['stamps'].toString(),
    statusId: request['status'],
    status: getStatusById(request['status']),
  }
  return req
}
