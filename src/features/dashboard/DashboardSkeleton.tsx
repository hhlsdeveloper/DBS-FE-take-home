import { Skeleton } from '../../components/Skeleton'
import layout from './Dashboard.module.css'
import styles from './DashboardSkeleton.module.css'

/** Same grid as the loaded dashboard, with blocks of matching height. */
export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className={layout.intro}>
        <Skeleton width="16rem" height="2rem" />
      </div>
      <div className={layout.grid}>
        <div className={layout.hero}>
          <Skeleton height="11rem" radius="var(--radius-xl)" />
        </div>
        <div className={layout.limit}>
          <Skeleton height="8.5rem" radius="var(--radius-lg)" />
        </div>
        <div className={layout.accounts}>
          <Skeleton width="6rem" height="1rem" />
          <div className={styles.cards}>
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} height="6.5rem" radius="var(--radius-lg)" />
            ))}
          </div>
        </div>
        <div className={layout.transactions}>
          <Skeleton height="28rem" radius="var(--radius-lg)" />
        </div>
      </div>
    </div>
  )
}
