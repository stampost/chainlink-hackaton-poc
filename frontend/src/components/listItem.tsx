import { MessageInfo } from '../util/stampost'
import styles from '../styles/listItem.module.css'

const getIndicator = (data: MessageInfo) => {
  switch (data.statusId) {
    case 0: // Pending
      return <img src={'/ellipse.png'} style={{ width: 8, height: 8 }} />
    default:
      return <></>
  }
}

const getContent = (data: MessageInfo) => {
  switch (data.statusId) {
    case 0: // Pending
      return (
        <>
          If you accept you will receive{' '}
          <img src={'/tokens/stampost.png'} style={{ width: 16, height: 16 }} />
          <b>{data.stamps} STMP</b>
        </>
      )
    case 1: // Accepted
      return (
        <>
          You received <img src={'/tokens/stampost.png'} style={{ width: 16, height: 16 }} />
          <b>{data.stamps} STMP</b>
        </>
      )
    default:
      return `Status ${data.statusId} not supported`
  }
}

export const ListItem = ({ data }: { data: MessageInfo }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.leftBlock}>
        <div className={styles.indicatorBlock}>{getIndicator(data)}</div>
        <div className={styles.dateBlock}>{data.timestamp}</div>
        <div className={styles.addressBlock}>
          <img src={'/tokens/ethereum64.png'} style={{ width: 32, height: 32 }} />
          {data.from}
        </div>
      </div>
      <div className={styles.rightBlock}>{getContent(data)}</div>
    </div>
  )
}
