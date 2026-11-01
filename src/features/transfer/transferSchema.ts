import { z } from 'zod'
import type { Account, CreateTransferRequest } from '../../api/types'
import { getDepositAccounts } from '../../lib/accounts'
import { formatMoney } from '../../lib/format'

/** The `payeeId` value for "Send to someone new". */
export const NEW_RECIPIENT = 'new'

// The API has no list of banks; these are the ones the saved payees use.
export const BANKS = ['DBS', 'OCBC', 'UOB', 'POSB']

export const NOTE_MAX_LENGTH = 50

const NAME_MESSAGE = 'Enter a name between 2 and 50 characters.'

const newRecipientSchema = z.object({
  name: z.string().trim().min(2, NAME_MESSAGE).max(50, NAME_MESSAGE),
  accountNumber: z
    .string()
    .regex(/^\d{8}$/, 'Enter a valid 8-digit account number.'),
  bank: z.string().min(1, 'Choose a bank.'),
})

interface TransferContext {
  accounts: Account[]
  remainingLimit: number
}

/**
 * Every transfer rule, in one place. The balance and daily-limit rules need
 * live numbers, so the schema is built from the current server data.
 */
export function createTransferSchema({
  accounts,
  remainingLimit,
}: TransferContext) {
  return z
    .object({
      payeeId: z.string().min(1, 'Choose who to send to.'),
      newRecipient: z.object({
        name: z.string(),
        accountNumber: z.string(),
        bank: z.string(),
      }),
      fromAccountId: z.string().min(1, 'Choose an account.'),
      // Only the first failing rule is shown, so the order matters.
      amount: z
        .string()
        .trim()
        .min(1, 'Enter an amount.')
        .regex(/^\d+(\.\d{1,2})?$/, 'Use numbers only, up to 2 decimal places.')
        .refine(
          (value) => Number(value) >= 1,
          `Enter at least ${formatMoney(1)}.`,
        ),
      note: z
        .string()
        .max(
          NOTE_MAX_LENGTH,
          `Keep the note to ${NOTE_MAX_LENGTH} characters or fewer.`,
        ),
    })
    .superRefine((values, ctx) => {
      // The new-recipient fields only count when "Send to someone new" is
      // picked.
      if (values.payeeId === NEW_RECIPIENT) {
        const result = newRecipientSchema.safeParse(values.newRecipient)
        for (const issue of result.error?.issues ?? []) {
          ctx.addIssue({
            code: 'custom',
            message: issue.message,
            path: ['newRecipient', ...issue.path],
          })
        }
      }

      const amount = Number(values.amount)
      const from = getDepositAccounts(accounts).find(
        (account) => account.id === values.fromAccountId,
      )
      if (!from || Number.isNaN(amount)) return

      if (amount > from.balance) {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: `Amount can't be more than your available balance (${formatMoney(from.balance)}).`,
        })
      } else if (amount > remainingLimit) {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: `This transfer exceeds your remaining daily limit (${formatMoney(remainingLimit)}).`,
        })
      }
    })
}

export type TransferFormValues = z.input<
  ReturnType<typeof createTransferSchema>
>

/** Turns valid form values into the body for `POST /api/transfers`. */
export function toTransferRequest(
  values: TransferFormValues,
): CreateTransferRequest {
  const note = values.note.trim()
  return {
    fromAccountId: values.fromAccountId,
    amount: Number(values.amount),
    ...(note && { note }),
    ...(values.payeeId === NEW_RECIPIENT
      ? {
          recipient: {
            name: values.newRecipient.name.trim(),
            accountNumber: values.newRecipient.accountNumber,
            bank: values.newRecipient.bank,
          },
        }
      : { payeeId: values.payeeId }),
  }
}
