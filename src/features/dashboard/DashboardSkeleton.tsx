import { Skeleton } from '../../components/Skeleton'
import layout from './Dashboard.module.css'
import styles from './DashboardSkeleton.module.css'

/**
 * Same grid as the loaded dashboard, with blocks sized (per breakpoint) like
 * the real content, so nothing jumps when the data arrives.
 */
export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className={layout.intro}>
        <Skeleton width="16rem" height="2rem" />
        <div className={layout.mobileOnly}>
          <Skeleton width="12rem" height="3.125rem" radius="var(--radius-full)" />
        </div>
      </div>
      <div className={layout.grid}>
        <div className={`${layout.hero} ${styles.hero}`}>
          <Skeleton height="100%" radius="var(--radius-xl)" />
        </div>
        <div className={`${layout.limit} ${styles.limit}`}>
          <Skeleton height="100%" radius="var(--radius-lg)" />
        </div>
        <div className={layout.accounts}>
          <Skeleton width="6rem" height="1.3rem" />
          <div className={styles.cards}>
            {[1, 2, 3].map((n) => (
              <div key={n} className={styles.card}>
                <Skeleton height="100%" radius="var(--radius-lg)" />
              </div>
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
