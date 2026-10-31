import type { ReactNode } from 'react'
import type { Account } from '../../api/types'
import { getDepositAccounts, getTotalAvailable } from '../../lib/accounts'
import { formatMoney } from '../../lib/format'
import styles from './BalanceHero.module.css'

interface BalanceHeroProps {
  accounts: Account[]
  /** The New transfer button. */
  action: ReactNode
}

export function BalanceHero({ accounts, action }: BalanceHeroProps) {
  const count = getDepositAccounts(accounts).length

  return (
    <section className={styles.hero} aria-labelledby="total-available">
      <div>
        <h2 id="total-available" className={styles.label}>
          Total available
        </h2>
        <p className={`${styles.total} amount`}>
          {formatMoney(getTotalAvailable(accounts))}
        </p>
        <p className={styles.caption}>
          Across {count} deposit account{count === 1 ? '' : 's'}
        </p>
      </div>
      {action}
    </section>
  )
}
