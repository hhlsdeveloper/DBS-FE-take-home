import { z } from 'zod'

/** The `payeeId` value for "Send to someone new". */
export const NEW_RECIPIENT = 'new'

// The API has no list of banks; these are the ones the saved payees use.
export const BANKS = ['DBS', 'OCBC', 'UOB', 'POSB']

const NAME_MESSAGE = 'Enter a name between 2 and 50 characters.'

const newRecipientSchema = z.object({
  name: z.string().trim().min(2, NAME_MESSAGE).max(50, NAME_MESSAGE),
  accountNumber: z
    .string()
    .regex(/^\d{8}$/, 'Enter a valid 8-digit account number.'),
  bank: z.string().min(1, 'Choose a bank.'),
})

export const transferSchema = z
  .object({
    payeeId: z.string().min(1, 'Choose who to send to.'),
    newRecipient: z.object({
      name: z.string(),
      accountNumber: z.string(),
      bank: z.string(),
    }),
  })
  .superRefine(({ payeeId, newRecipient }, ctx) => {
    // The new-recipient fields only count when "Send to someone new" is picked.
    if (payeeId !== NEW_RECIPIENT) return
    const result = newRecipientSchema.safeParse(newRecipient)
    for (const issue of result.error?.issues ?? []) {
      ctx.addIssue({
        code: 'custom',
        message: issue.message,
        path: ['newRecipient', ...issue.path],
      })
    }
  })

export type TransferFormValues = z.input<typeof transferSchema>

export const emptyTransfer: TransferFormValues = {
  payeeId: '',
  newRecipient: { name: '', accountNumber: '', bank: '' },
}
