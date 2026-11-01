import { Button } from '../../components/Button'
import styles from './DashboardError.module.css'

interface DashboardErrorProps {
  onRetry: () => void
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <div role="alert" className={styles.error}>
      <p className={styles.message}>We couldn&apos;t load your dashboard.</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}
