import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { CloseIcon } from '../../components/icons'
import { RecipientStep } from './RecipientStep'
import { Stepper, type TransferStep } from './Stepper'
import styles from './TransferDialog.module.css'
import {
  emptyTransfer,
  transferSchema,
  type TransferFormValues,
} from './transferSchema'

const STEP_TITLES: Record<TransferStep, string> = {
  recipient: 'Who are you sending to?',
  amount: 'How much?',
  review: 'Check the details',
}

interface TransferDialogProps {
  /** Called once the dialog has closed (✕, Cancel or Esc). */
  onClose: () => void
}

/**
 * Mounted only while open, so closing throws away what was entered and the
 * next transfer starts empty.
 */
export function TransferDialog({ onClose }: TransferDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stepTitleRef = useRef<HTMLHeadingElement>(null)
  const [step, setStep] = useState<TransferStep>('recipient')

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    // Check a field when the user leaves it, then as they fix it.
    mode: 'onTouched',
    defaultValues: emptyTransfer,
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
    const valid = await form.trigger(['payeeId', 'newRecipient'], {
      shouldFocus: true,
    })
    if (valid) setStep('amount')
  }

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
          </div>

          <footer className={styles.footer}>
            {step === 'recipient' ? (
              <>
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Continue</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setStep('recipient')}>
                Back
              </Button>
            )}
          </footer>
        </form>
      </FormProvider>
    </dialog>
  )
}
