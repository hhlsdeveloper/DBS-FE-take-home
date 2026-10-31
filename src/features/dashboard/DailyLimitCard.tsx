import type { Customer } from '../../api/types'
import { getRemainingLimit } from '../../lib/accounts'
import { formatMoney } from '../../lib/format'
import styles from './DailyLimitCard.module.css'

export function DailyLimitCard({ customer }: { customer: Customer }) {
  return (
    <section className={styles.card} aria-labelledby="daily-limit">
      <h2 id="daily-limit" className={styles.title}>
        Daily limit
      </h2>
      <p className={`${styles.remaining} amount`}>
        {formatMoney(getRemainingLimit(customer))} remaining today
      </p>
      <p className={styles.note}>Resets daily. Applies to all transfers.</p>
    </section>
  )
}
