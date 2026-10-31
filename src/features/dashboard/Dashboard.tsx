import type { Segment } from '../../api/types'
import {
  useAccounts,
  useCustomer,
  useRecentTransactions,
} from '../../api/queries'
import { SegmentSwitch } from '../preferences/SegmentSwitch'
import {
  getSystemTheme,
  type Theme,
  usePreference,
} from '../preferences/usePreference'
import styles from './Dashboard.module.css'
import { DashboardError } from './DashboardError'
import { DashboardSkeleton } from './DashboardSkeleton'
import { Header } from './Header'

export function Dashboard() {
  // Siblings, so all three requests start at the same time (D1).
  const customer = useCustomer()
  const accounts = useAccounts()
  const transactions = useRecentTransactions()

  const [theme, setTheme] = usePreference<Theme>('theme', getSystemTheme())
  // The customer's API segment is the default until the user picks one.
  const [segment, setSegment] = usePreference<Segment>(
    'segment',
    customer.data?.segment ?? 'retail',
  )

  const failed = [customer, accounts, transactions].filter((q) => q.isError)

  let content
  if (failed.length > 0) {
    content = (
      <DashboardError
        onRetry={() => failed.forEach((q) => void q.refetch())}
        isRetrying={failed.some((q) => q.isFetching)}
      />
    )
  } else if (customer.data && accounts.data && transactions.data) {
    content = (
      <>
        <div className={styles.intro}>
          <h1 className={styles.greeting}>
            Good evening, {customer.data.firstName}
          </h1>
          <div className={styles.mobileOnly}>
            <SegmentSwitch segment={segment} onChange={setSegment} />
          </div>
        </div>
        <div className={styles.grid} />
      </>
    )
  } else {
    content = <DashboardSkeleton />
  }

  return (
    <>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        segment={segment}
        onSegmentChange={setSegment}
      />
      <main className={styles.main}>{content}</main>
    </>
  )
}
