import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, type FieldPath } from 'react-hook-form'
import type { ApiError } from '../../api/client'
import { useCreateTransfer } from '../../api/mutations'
import type { Account, Customer } from '../../api/types'
import { Button } from '../../components/Button'
import { CloseIcon } from '../../components/icons'
import { getDepositAccounts, getRemainingLimit } from '../../lib/accounts'
import { formatMoney } from '../../lib/format'
import { AmountStep } from './AmountStep'
import { RecipientStep } from './RecipientStep'
import { ReviewStep } from './ReviewStep'
import { Stepper, type TransferStep } from './Stepper'
import { SuccessPanel } from './SuccessPanel'
import styles from './TransferDialog.module.css'
import {
  createTransferSchema,
  toTransferRequest,
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

const SEND_ERROR =
  "Something went wrong. Your money hasn't left your account. Try again."

// If the API rejected a specific field (e.g. the balance changed since the
// form checked it), its message says more than the generic one.
function sendErrorMessage(error: ApiError): string {
  return Object.values(error.fields ?? {})[0] ?? SEND_ERROR
}

interface TransferDialogProps {
  accounts: Account[]
  customer: Customer
  onClose: () => void
}

export function TransferDialog({
  accounts,
  customer,
  onClose,
}: TransferDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stepTitleRef = useRef<HTMLHeadingElement>(null)
  const [step, setStep] = useState<TransferStep>('recipient')
  const transfer = useCreateTransfer()
  const sendingRef = useRef(false)

  const remainingLimit = getRemainingLimit(customer)
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(createTransferSchema({ accounts, remainingLimit })),
    mode: 'onTouched',
    defaultValues: {
      payeeId: '',
      newRecipient: { name: '', accountNumber: '', bank: '' },
      fromAccountId: getDepositAccounts(accounts)[0]?.id ?? '',
      amount: '',
      note: '',
    },
  })

  useEffect(() => {
    dialogRef.current?.showModal()
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

  function send() {
    if (sendingRef.current) return
    sendingRef.current = true
    transfer.mutate(toTransferRequest(form.getValues()), {
      onSettled: () => {
        sendingRef.current = false
      },
    })
  }

  function goBack(previous: TransferStep) {
    transfer.reset()
    setStep(previous)
  }

  const previous = PREVIOUS_STEP[step]
  const successfulTransferData = transfer.data?.transfer
  const isSending = transfer.isPending

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="transfer-title"
      className={styles.dialog}
      onClose={onClose}
      // The money is already on its way; stay open to show how it went.
      onCancel={(e) => isSending && e.preventDefault()}
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
                disabled={isSending}
                onClick={close}
              >
                <CloseIcon />
              </button>
            </div>
            {!successfulTransferData && <Stepper current={step} />}
          </header>

          <div className={styles.body}>
            <p aria-live="polite" className="sr-only">
              {successfulTransferData &&
                `Transfer sent. ${formatMoney(successfulTransferData.amount)} to ${successfulTransferData.recipient.name}.`}
            </p>
            {successfulTransferData ? (
              <SuccessPanel transfer={successfulTransferData} />
            ) : (
              <>
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
                  <AmountStep
                    accounts={accounts}
                    remainingLimit={remainingLimit}
                  />
                )}
                {step === 'review' && <ReviewStep accounts={accounts} />}
                {step === 'review' && transfer.error && (
                  <p role="alert" className={styles.alert}>
                    {sendErrorMessage(transfer.error)}
                  </p>
                )}
              </>
            )}
          </div>

          <footer className={styles.footer}>
            {successfulTransferData ? (
              <Button className={styles.done} onClick={close}>
                Back to dashboard
              </Button>
            ) : (
              <>
                {previous ? (
                  <Button
                    variant="secondary"
                    disabled={isSending}
                    onClick={() => goBack(previous)}
                  >
                    Back
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={close}>
                    Cancel
                  </Button>
                )}
                {step === 'review' ? (
                  <Button disabled={isSending} onClick={send}>
                    {isSending ? 'Sending…' : 'Confirm transfer'}
                  </Button>
                ) : (
                  <Button type="submit">Continue</Button>
                )}
              </>
            )}
          </footer>
        </form>
      </FormProvider>
    </dialog>
  )
}
