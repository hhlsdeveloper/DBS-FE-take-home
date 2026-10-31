import styles from './InlineError.module.css'

/**
 * A field's error message. Point the field's `aria-describedby` at `id`.
 * Always rendered, so a line is reserved and nothing moves when it fills.
 */
export function InlineError({
  id,
  message,
  lines = 1,
}: {
  id: string
  message?: string
  /** Lines to reserve, for messages known to wrap on narrow screens. */
  lines?: 1 | 2
}) {
  return (
    <p
      id={id}
      className={
        lines === 2 ? `${styles.error} ${styles.twoLines}` : styles.error
      }
    >
      {message}
    </p>
  )
}
