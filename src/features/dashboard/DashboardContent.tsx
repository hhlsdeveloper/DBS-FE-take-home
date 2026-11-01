import { useSuspenseQueries } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import {
  accountsQuery,
  customerQuery,
  recentTransactionsQuery,
} from '../../api/queries'
import type { Segment } from '../../api/types'
import { Button } from '../../components/Button'
import { PlusIcon } from '../../components/icons'
import { SegmentSwitch } from '../preferences/SegmentSwitch'
import { TransferDialog } from '../transfer/TransferDialog'
import { AccountCard } from './AccountCard'
import { BalanceHero } from './BalanceHero'
import { DailyLimitCard } from './DailyLimitCard'
import styles from './Dashboard.module.css'
import { TransactionList } from './TransactionList'

interface DashboardContentProps {
  segment: Segment
  onSegmentChange: (segment: Segment) => void
}

export function DashboardContent({
  segment,
  onSegmentChange,
}: DashboardContentProps) {
  const [customer, accounts, transactions] = useSuspenseQueries({
    queries: [customerQuery, accountsQuery, recentTransactionsQuery],
  })

  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const newTransferButtonRef = useRef<HTMLButtonElement>(null)

  function closeTransferDialog() {
    setIsTransferDialogOpen(false)
    newTransferButtonRef.current?.focus()
  }

  return (
    <>
      <div className={styles.intro}>
        <h1 className={styles.greeting}>
          Good evening, {customer.data.firstName}
        </h1>
        <div className={styles.mobileOnly}>
          <SegmentSwitch segment={segment} onChange={onSegmentChange} />
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
        <section className={styles.accounts} aria-labelledby="accounts-title">
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
      {isTransferDialogOpen && (
        <TransferDialog
          accounts={accounts.data}
          customer={customer.data}
          onClose={closeTransferDialog}
        />
      )}
    </>
  )
}
