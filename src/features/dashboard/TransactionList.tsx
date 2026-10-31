import { useRef, useState } from 'react'
import type { Transaction } from '../../api/types'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { CloseIcon, SearchIcon } from '../../components/icons'
import { formatMoney, formatShortDate } from '../../lib/format'
import styles from './TransactionList.module.css'

/**
 * Filters the loaded rows in the browser: instant, no request per keystroke.
 * Trade-off: it only searches the 8 rows on screen, not older history.
 */
function filterTransactions(
  transactions: Transaction[],
  query: string,
): Transaction[] {
  const q = query.trim().toLowerCase()
  if (!q) return transactions
  return transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q),
  )
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function TransactionRow({ transaction: t }: { transaction: Transaction }) {
  const isIn = t.direction === 'in'
  return (
    <li className={styles.row}>
      <div className={styles.details}>
        <p className={styles.description}>{t.description}</p>
        <p className={styles.meta}>
          {capitalise(t.category)} · {formatShortDate(t.date)}
        </p>
      </div>
      <div className={styles.side}>
        <span className={`${styles.amount} ${isIn ? styles.in : ''} amount`}>
          {isIn ? `+${formatMoney(t.amount)}` : formatMoney(-t.amount)}
        </span>
        {t.status === 'pending' && <span className={styles.chip}>Pending</span>}
      </div>
    </li>
  )
}

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const results = filterTransactions(transactions, query)
  const isSearching = query.trim() !== ''

  function clearSearch() {
    setQuery('')
    inputRef.current?.focus()
  }

  let body
  if (results.length > 0) {
    body = (
      <ul aria-label="Recent transactions" className={styles.list}>
        {results.map((t) => (
          <TransactionRow key={t.id} transaction={t} />
        ))}
      </ul>
    )
  } else if (isSearching) {
    body = (
      <EmptyState
        message="No transactions match your search."
        action={
          <Button variant="secondary" onClick={clearSearch}>
            Clear search
          </Button>
        }
      />
    )
  } else {
    body = <EmptyState message="No transactions yet." />
  }

  return (
    <section className={styles.card} aria-labelledby="transactions-title">
      <div className={styles.header}>
        <h2 id="transactions-title" className={styles.title}>
          Recent transactions
        </h2>
        <div className={styles.search}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <label htmlFor="transaction-search" className="visually-hidden">
            Search transactions
          </label>
          <input
            ref={inputRef}
            id="transaction-search"
            type="search"
            placeholder="Search transactions"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className={styles.clear}
              aria-label="Clear search"
              onClick={clearSearch}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
      <p className={styles.count} aria-live="polite">
        {isSearching &&
          `${results.length} result${results.length === 1 ? '' : 's'}`}
      </p>
      {body}
    </section>
  )
}
