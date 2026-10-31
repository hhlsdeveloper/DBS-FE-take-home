import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string
  height?: string
  radius?: string
}

/** A grey placeholder block. Decorative, so hidden from screen readers. */
export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = 'var(--radius-sm)',
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
    />
  )
}
