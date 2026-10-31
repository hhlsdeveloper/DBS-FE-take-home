import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, type FieldPath } from 'react-hook-form'
import type { Account, Customer } from '../../api/types'
import { Button } from '../../components/Button'
import { CloseIcon } from '../../components/icons'
import { getRemainingLimit } from '../../lib/accounts'
import { AmountStep } from './AmountStep'
import { RecipientStep } from './RecipientStep'
import { ReviewStep } from './ReviewStep'
import { Stepper, type TransferStep } from './Stepper'
import styles from './TransferDialog.module.css'
import {
  createTransferSchema,
  emptyTransfer,
  type TransferFormValues,
} from './transferSchema'

const STEP_TITLES: Record<TransferStep, string> = {
  recipient: 'Who are you sending to?',
  amount: 'How much?',
  review: 'Check the details',
}

// The fields each step checks before Continue moves on.
const STEP_FIELDS: Partial<
  Record<TransferStep, FieldPath<TransferFormValues>[]>
> = {
  recipient: ['payeeId', 'newRecipient'],
  amount: ['fromAccountId', 'amount', 'note'],
}

const NEXT_STEP: Partial<Record<TransferStep, TransferStep>> = {
  recipient: 'amount',
  amount: 'review',
}

const PREVIOUS_STEP: Partial<Record<TransferStep, TransferStep>> = {
  amount: 'recipient',
  review: 'amount',
}

interface TransferDialogProps {
  accounts: Account[]
  customer: Customer
  /** Called once the dialog has closed (✕, Cancel or Esc). */
  onClose: () => void
}

/**
 * Mounted only while open, so closing throws away what was entered and the
 * next transfer starts empty.
 */
export function TransferDialog({
  accounts,
  customer,
  onClose,
}: TransferDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stepTitleRef = useRef<HTMLHeadingElement>(null)
  const [step, setStep] = useState<TransferStep>('recipient')

  const remainingLimit = getRemainingLimit(customer)
  const form = useForm<TransferFormValues>({
    // Rebuilt each render, so a refreshed balance or limit applies at once.
    resolver: zodResolver(createTransferSchema({ accounts, remainingLimit })),
    // Check a field when the user leaves it, then as they fix it.
    mode: 'onTouched',
    defaultValues: emptyTransfer(accounts),
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  // Each step starts with focus on its title, so screen readers announce it.
  useEffect(() => {
    stepTitleRef.current?.focus()
  }, [step])

  // Closing the native dialog first lifts the modal's inert background, so
  // the parent can move focus back to the button that opened it.
  const close = () => dialogRef.current?.close()

  async function handleContinue() {
    const next = NEXT_STEP[step]
    if (!next) return
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true })
    if (valid) setStep(next)
  }

  const previous = PREVIOUS_STEP[step]

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="transfer-title"
      className={styles.dialog}
      onClose={onClose}
    >
      <FormProvider {...form}>
        <form
          noValidate
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            void handleContinue()
          }}
        >
          <header className={styles.header}>
            <div className={styles.titleRow}>
              <h2 id="transfer-title" className={styles.title}>
                New transfer
              </h2>
              <button
                type="button"
                aria-label="Close"
                className={styles.close}
                onClick={close}
              >
                <CloseIcon />
              </button>
            </div>
            <Stepper current={step} />
          </header>

          <div className={styles.body}>
            <h3
              id="transfer-step-title"
              ref={stepTitleRef}
              tabIndex={-1}
              className={styles.stepTitle}
            >
              {STEP_TITLES[step]}
            </h3>
            {step === 'recipient' && (
              <RecipientStep labelledBy="transfer-step-title" />
            )}
            {step === 'amount' && (
              <AmountStep accounts={accounts} remainingLimit={remainingLimit} />
            )}
            {step === 'review' && <ReviewStep accounts={accounts} />}
          </div>

          <footer className={styles.footer}>
            {previous ? (
              <Button variant="secondary" onClick={() => setStep(previous)}>
                Back
              </Button>
            ) : (
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
            )}
            {step === 'review' ? (
              // Sending is added with POST /api/transfers.
              <Button>Confirm transfer</Button>
            ) : (
              <Button type="submit">Continue</Button>
            )}
          </footer>
        </form>
      </FormProvider>
    </dialog>
  )
}
