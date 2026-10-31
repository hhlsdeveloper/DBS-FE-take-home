import styles from './Stepper.module.css'

export type TransferStep = 'recipient' | 'amount' | 'review'

const STEPS: { id: TransferStep; label: string }[] = [
  { id: 'recipient', label: 'Recipient' },
  { id: 'amount', label: 'Amount' },
  { id: 'review', label: 'Review' },
]

export function Stepper({ current }: { current: TransferStep }) {
  return (
    <ol aria-label="Transfer steps" className={styles.stepper}>
      {STEPS.map((step, index) => (
        <li
          key={step.id}
          aria-current={step.id === current ? 'step' : undefined}
          className={styles.step}
        >
          <span className={styles.number}>{index + 1}</span>
          {step.label}
        </li>
      ))}
    </ol>
  )
}
