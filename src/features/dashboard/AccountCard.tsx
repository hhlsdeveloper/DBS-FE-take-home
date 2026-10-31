import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import styles from './AccountCard.module.css'

export function AccountCard({ account }: { account: Account }) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.name}>{account.name}</h3>
        <span className={`${styles.number} amount`}>
          {account.maskedNumber}
        </span>
      </div>
      <p className={`${styles.balance} amount`}>
        {formatMoney(account.balance)}
      </p>
      {account.type === 'credit' && <p className={styles.due}>Amount due</p>}
    </article>
  )
}
