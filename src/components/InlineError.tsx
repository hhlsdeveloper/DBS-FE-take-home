import styles from './InlineError.module.css'

/** A field's error message. Point the field's `aria-describedby` at `id`. */
export function InlineError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className={styles.error}>
      {message}
    </p>
  )
}
