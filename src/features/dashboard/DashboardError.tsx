import { Button } from '../../components/Button'
import styles from './DashboardError.module.css'

interface DashboardErrorProps {
  onRetry: () => void
  isRetrying: boolean
}

export function DashboardError({ onRetry, isRetrying }: DashboardErrorProps) {
  return (
    <div role="alert" className={styles.error}>
      <p className={styles.message}>We couldn&apos;t load your dashboard.</p>
      <Button onClick={onRetry} disabled={isRetrying}>
        Retry
      </Button>
    </div>
  )
}
