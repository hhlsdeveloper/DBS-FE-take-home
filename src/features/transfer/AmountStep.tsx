import { useFormContext, useWatch } from 'react-hook-form'
import type { Account } from '../../api/types'
import { SelectField, TextField } from '../../components/fields'
import { getDepositAccounts } from '../../lib/accounts'
import { formatMoney } from '../../lib/format'
import styles from './AmountStep.module.css'
import { NOTE_MAX_LENGTH, type TransferFormValues } from './transferSchema'

const QUICK_AMOUNTS = [50, 100, 250, 500]

interface AmountStepProps {
  accounts: Account[]
  remainingLimit: number
}

export function AmountStep({ accounts, remainingLimit }: AmountStepProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<TransferFormValues>()
  const [fromAccountId, note] = useWatch<
    TransferFormValues,
    ['fromAccountId', 'note']
  >({ name: ['fromAccountId', 'note'] })

  const depositAccounts = getDepositAccounts(accounts)
  const from = depositAccounts.find((account) => account.id === fromAccountId)

  return (
    <div className={styles.fields}>
      <SelectField
        id="from-account"
        label="From account"
        error={errors.fromAccountId?.message}
        {...register('fromAccountId')}
      >
        {depositAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} · {account.maskedNumber}
          </option>
        ))}
      </SelectField>

      <div>
        <TextField
          id="amount"
          label="Amount"
          unit="SGD"
          // The balance and limit messages wrap on phones.
          errorLines={2}
          inputMode="decimal"
          autoComplete="off"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <div
          role="group"
          aria-label="Quick amounts in SGD"
          className={styles.quick}
        >
          {QUICK_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              className={styles.chip}
              onClick={() =>
                setValue('amount', String(amount), {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
            >
              {amount}
            </button>
          ))}
        </div>
        <dl className={styles.limits}>
          <div>
            <dt>Available</dt>
            <dd className="amount">{from ? formatMoney(from.balance) : '—'}</dd>
          </div>
          <div>
            <dt>Remaining daily limit</dt>
            <dd className="amount">{formatMoney(remainingLimit)}</dd>
          </div>
        </dl>
      </div>

      <TextField
        id="note"
        label="Note (optional)"
        autoComplete="off"
        aside={
          <span
            className={
              note.length > NOTE_MAX_LENGTH ? styles.countOver : styles.count
            }
          >
            {note.length}/{NOTE_MAX_LENGTH}
          </span>
        }
        error={errors.note?.message}
        {...register('note')}
      />
    </div>
  )
}
