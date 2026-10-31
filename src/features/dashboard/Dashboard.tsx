import { useRef, useState } from 'react'
import {
  useAccounts,
  useCustomer,
  useRecentTransactions,
} from '../../api/queries'
import type { Segment } from '../../api/types'
import { Button } from '../../components/Button'
import { PlusIcon } from '../../components/icons'
import { SegmentSwitch } from '../preferences/SegmentSwitch'
import {
  getSystemTheme,
  type Theme,
  usePreference,
} from '../preferences/usePreference'
import { TransferDialog } from '../transfer/TransferDialog'
import { AccountCard } from './AccountCard'
import { BalanceHero } from './BalanceHero'
import { DailyLimitCard } from './DailyLimitCard'
import styles from './Dashboard.module.css'
import { DashboardError } from './DashboardError'
import { DashboardSkeleton } from './DashboardSkeleton'
import { Header } from './Header'
import { TransactionList } from './TransactionList'

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

  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const newTransferButtonRef = useRef<HTMLButtonElement>(null)

  function closeTransferDialog() {
    setIsTransferDialogOpen(false)
    newTransferButtonRef.current?.focus()
  }

  // Only a failed *first* load is an error. If a background refresh fails we
  // keep showing the data we already have (isError would also be true then).
  const failed = [customer, accounts, transactions].filter(
    (q) => q.isLoadingError,
  )

  return (
    <>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        segment={segment}
        onSegmentChange={setSegment}
      />
      <main className={styles.main}>
        {failed.length > 0 ? (
          <DashboardError
            onRetry={() => failed.forEach((q) => void q.refetch())}
            isRetrying={failed.some((q) => q.isFetching)}
          />
        ) : customer.data && accounts.data && transactions.data ? (
          <>
            <div className={styles.intro}>
              <h1 className={styles.greeting}>
                Good evening, {customer.data.firstName}
              </h1>
              <div className={styles.mobileOnly}>
                <SegmentSwitch segment={segment} onChange={setSegment} />
              </div>
            </div>
            <div className={styles.grid}>
              <div className={styles.hero}>
                <BalanceHero
                  accounts={accounts.data}
                  action={
                    <Button
                      ref={newTransferButtonRef}
                      className={styles.newTransfer}
                      onClick={() => setIsTransferDialogOpen(true)}
                    >
                      <PlusIcon />
                      New transfer
                    </Button>
                  }
                />
              </div>
              <div className={styles.limit}>
                <DailyLimitCard customer={customer.data} />
              </div>
              <section
                className={styles.accounts}
                aria-labelledby="accounts-title"
              >
                <h2 id="accounts-title" className={styles.sectionTitle}>
                  Accounts
                </h2>
                <ul aria-label="Accounts" className={styles.accountList}>
                  {accounts.data.map((account) => (
                    <li key={account.id}>
                      <AccountCard account={account} />
                    </li>
                  ))}
                </ul>
              </section>
              <div className={styles.transactions}>
                <TransactionList transactions={transactions.data} />
              </div>
            </div>
          </>
        ) : (
          <DashboardSkeleton />
        )}
      </main>
      {isTransferDialogOpen && <TransferDialog onClose={closeTransferDialog} />}
    </>
  )
}
