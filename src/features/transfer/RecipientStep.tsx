import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { usePayees } from '../../api/queries'
import type { Payee } from '../../api/types'
import { Button } from '../../components/Button'
import { InlineError } from '../../components/InlineError'
import { SelectField, TextField } from '../../components/fields'
import { PlusIcon } from '../../components/icons'
import { Skeleton } from '../../components/Skeleton'
import styles from './RecipientStep.module.css'
import { BANKS, NEW_RECIPIENT, type TransferFormValues } from './transferSchema'

function filterPayees(payees: Payee[], query: string): Payee[] {
  const q = query.trim().toLowerCase()
  if (!q) return payees
  return payees.filter(
    (p) => p.name.toLowerCase().includes(q) || p.bank.toLowerCase().includes(q),
  )
}

function PayeeList({ query }: { query: string }) {
  const payees = usePayees()
  const { register } = useFormContext<TransferFormValues>()

  if (payees.isPending) {
    return (
      <div role="status" aria-label="Loading payees" className={styles.list}>
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} height="3.5rem" radius="var(--radius-md)" />
        ))}
      </div>
    )
  }

  if (payees.isError) {
    return (
      <div role="alert" className={styles.message}>
        <p>We couldn&apos;t load your payees.</p>
        <Button
          variant="secondary"
          onClick={() => void payees.refetch()}
          disabled={payees.isFetching}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (payees.data.length === 0) {
    return <p className={styles.message}>You have no saved payees yet.</p>
  }

  const visible = filterPayees(payees.data, query)
  if (visible.length === 0) {
    return <p className={styles.message}>No payees match your search.</p>
  }

  return (
    <div className={styles.list}>
      {visible.map((payee) => (
        <label key={payee.id} className={styles.option}>
          <input
            type="radio"
            value={payee.id}
            className={styles.radio}
            {...register('payeeId')}
          />
          <span className={styles.avatar} aria-hidden="true">
            {payee.initials}
          </span>
          <span className={styles.details}>
            <span className={styles.name}>{payee.name}</span>
            <span className={styles.meta}>
              {payee.bank} · {payee.accountNumberMasked}
            </span>
          </span>
        </label>
      ))}
    </div>
  )
}

export function RecipientStep({ labelledBy }: { labelledBy: string }) {
  const [query, setQuery] = useState('')
  const {
    register,
    formState: { errors },
  } = useFormContext<TransferFormValues>()
  const payeeId = useWatch<TransferFormValues, 'payeeId'>({ name: 'payeeId' })

  return (
    <>
      {/* Not a form field, so no error line under it. */}
      <label htmlFor="payee-search" className="sr-only">
        Search payees
      </label>
      <input
        id="payee-search"
        type="search"
        placeholder="Search payees"
        className={styles.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Native radios: Tab reaches the group, arrow keys move within it. */}
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-invalid={errors.payeeId ? true : undefined}
        aria-describedby={errors.payeeId ? 'payeeId-error' : undefined}
        className={styles.list}
      >
        <PayeeList query={query} />
        <label className={styles.option}>
          <input
            type="radio"
            value={NEW_RECIPIENT}
            className={styles.radio}
            {...register('payeeId')}
          />
          <span className={styles.avatar} aria-hidden="true">
            <PlusIcon />
          </span>
          <span className={styles.name}>Send to someone new</span>
        </label>
      </div>
      <InlineError id="payeeId-error" message={errors.payeeId?.message} />

      {payeeId === NEW_RECIPIENT && (
        <div className={styles.newRecipient}>
          <TextField
            id="recipient-name"
            label="Recipient name"
            autoComplete="off"
            error={errors.newRecipient?.name?.message}
            {...register('newRecipient.name')}
          />
          <TextField
            id="recipient-account"
            label="Account number"
            inputMode="numeric"
            autoComplete="off"
            error={errors.newRecipient?.accountNumber?.message}
            {...register('newRecipient.accountNumber')}
          />
          <SelectField
            id="recipient-bank"
            label="Bank"
            error={errors.newRecipient?.bank?.message}
            {...register('newRecipient.bank')}
          >
            <option value="" disabled hidden>
              Choose a bank
            </option>
            {BANKS.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </SelectField>
        </div>
      )}
    </>
  )
}
