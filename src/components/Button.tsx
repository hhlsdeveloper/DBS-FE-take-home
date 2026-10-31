import type { ComponentProps } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classes} {...props} />
}
