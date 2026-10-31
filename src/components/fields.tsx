import type { ComponentProps, ReactNode } from 'react'
import { InlineError } from './InlineError'
import styles from './fields.module.css'

interface FieldProps {
  id: string
  label: string
  error?: string
}

// Shared by both fields: the error is linked to the control (T8).
function errorProps(id: string, error?: string) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  }
}

function Label({ id, label }: FieldProps) {
  return (
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
  )
}

type TextFieldProps = FieldProps &
  ComponentProps<'input'> & {
    /** Shown inside the box before the value, e.g. `SGD`. */
    unit?: string
    /** Shown at the end of the label row, e.g. a character counter. */
    aside?: ReactNode
    /** Lines reserved for the error, so a long one doesn't move the form. */
    errorLines?: 1 | 2
  }

export function TextField({
  id,
  label,
  error,
  unit,
  aside,
  errorLines,
  ...props
}: TextFieldProps) {
  const input = (
    <input
      id={id}
      className={unit ? `${styles.control} ${styles.withUnit}` : styles.control}
      {...errorProps(id, error)}
      {...props}
    />
  )

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <Label id={id} label={label} />
        {aside}
      </div>
      {unit ? (
        <div className={styles.unitWrap}>
          <span className={styles.unit} aria-hidden="true">
            {unit}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      <InlineError id={`${id}-error`} message={error} lines={errorLines} />
    </div>
  )
}

export function SelectField({
  id,
  label,
  error,
  ...props
}: FieldProps & ComponentProps<'select'>) {
  return (
    <div className={styles.field}>
      <Label id={id} label={label} />
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
