import { useFormContext } from 'react-hook-form'
import { usePayees } from '../../api/queries'
import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import styles from './ReviewStep.module.css'
import { NEW_RECIPIENT, type TransferFormValues } from './transferSchema'

// Transfers are free; shown so the total adds up on screen.
const FEE = 0

function useRecipient({ payeeId, newRecipient }: TransferFormValues) {
  const payees = usePayees()
  if (payeeId === NEW_RECIPIENT) {
    return {
      name: newRecipient.name.trim(),
      bank: newRecipient.bank,
      accountNumberMasked: `•••• ${newRecipient.accountNumber.slice(-4)}`,
    }
  }
  return payees.data?.find((payee) => payee.id === payeeId)
}

export function ReviewStep({ accounts }: { accounts: Account[] }) {
  // The form can't change while this step is shown, so a snapshot is enough.
  const values = useFormContext<TransferFormValues>().getValues()
  const recipient = useRecipient(values)
  const from = accounts.find((account) => account.id === values.fromAccountId)
  const amount = Number(values.amount)
  const note = values.note.trim()

  return (
    <>
      <dl className={styles.summary}>
        <div className={styles.row}>
          <dt>From</dt>
          <dd>
            {from?.name} · {from?.maskedNumber}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>To</dt>
          <dd>
            {recipient?.name} · {recipient?.bank} ·{' '}
            {recipient?.accountNumberMasked}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>Amount</dt>
          <dd className="amount">{formatMoney(amount)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Fee</dt>
          <dd className="amount">{formatMoney(FEE)}</dd>
        </div>
        {note && (
          <div className={styles.row}>
            <dt>Note</dt>
            <dd>{note}</dd>
          </div>
        )}
        <div className={`${styles.row} ${styles.total}`}>
          <dt>Total</dt>
          <dd className="amount">{formatMoney(amount + FEE)}</dd>
        </div>
      </dl>
      <p className={styles.info}>Usually arrives in minutes.</p>
    </>
  )
}
