import styles from './InlineError.module.css'

/**
 * A field's error message. Point the field's `aria-describedby` at `id`.
 * Always rendered, so a line is reserved and nothing moves when it fills.
 */
export function InlineError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} className={styles.error}>
      {message}
    </p>
  )
}
