import type { ComponentProps } from 'react'
import { InlineError } from './InlineError'
import styles from './fields.module.css'

interface FieldProps {
  id: string
  label: string
  error?: string
  hideLabel?: boolean
}

// Shared by both fields: the error is linked to the control (T8).
function errorProps(id: string, error?: string) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

function Label({ id, label, hideLabel }: FieldProps) {
  return (
    <label
      htmlFor={id}
      className={hideLabel ? 'visually-hidden' : styles.label}
    >
      {label}
    </label>
  )
}

export function TextField({
  id,
  label,
  error,
  hideLabel,
  ...props
}: FieldProps & ComponentProps<'input'>) {
  return (
    <div className={styles.field}>
      <Label id={id} label={label} hideLabel={hideLabel} />
      <input
        id={id}
        className={styles.control}
        {...errorProps(id, error)}
        {...props}
      />
      <InlineError id={`${id}-error`} message={error} />
    </div>
  )
}

export function SelectField({
  id,
  label,
  error,
  hideLabel,
  ...props
}: FieldProps & ComponentProps<'select'>) {
  return (
    <div className={styles.field}>
      <Label id={id} label={label} hideLabel={hideLabel} />
      <div className={styles.selectWrap}>
        <select
          id={id}
          className={`${styles.control} ${styles.select}`}
          {...errorProps(id, error)}
          {...props}
        />
      </div>
      <InlineError id={`${id}-error`} message={error} />
    </div>
  )
}
