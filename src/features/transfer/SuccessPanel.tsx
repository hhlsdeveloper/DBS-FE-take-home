import { useEffect, useRef } from 'react'
import type { Transfer } from '../../api/types'
import { CheckIcon } from '../../components/icons'
import { formatMoney } from '../../lib/format'
import styles from './SuccessPanel.module.css'

export function SuccessPanel({ transfer }: { transfer: Transfer }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { recipient } = transfer

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className={styles.success}>
      <span className={styles.badge} aria-hidden="true">
        <CheckIcon />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className={styles.title}>
        Transfer sent
      </h3>
      <p className={`${styles.amount} amount`}>
        {formatMoney(transfer.amount)}
      </p>
      <p className={styles.recipient}>
        to {recipient.name} · {recipient.bank} · {recipient.accountNumberMasked}
      </p>
      <dl className={styles.reference}>
        <dt>Reference</dt>
        <dd>{transfer.reference}</dd>
      </dl>
      <p className={styles.note}>The money should arrive within minutes.</p>
    </div>
  )
}
