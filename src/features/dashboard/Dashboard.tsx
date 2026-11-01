import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useCustomer } from '../../api/queries'
import type { Segment, Theme } from '../../api/types'
import { getSystemTheme, usePreference } from '../preferences/usePreference'
import styles from './Dashboard.module.css'
import { DashboardContent } from './DashboardContent'
import { DashboardError } from './DashboardError'
import { DashboardSkeleton } from './DashboardSkeleton'
import { Header } from './Header'

/**
 * The parts that render while loading (header, preferences) plus the
 * loading and error boundaries around the data-driven content.
 */
export function Dashboard() {
  // Not suspending: the header needs a segment default before the customer
  // loads. It shares the cache entry with DashboardContent, so one request.
  const customer = useCustomer()

  const [theme, setTheme] = usePreference<Theme>('theme', getSystemTheme())
  // The customer's API segment is the default until the user picks one.
  const [segment, setSegment] = usePreference<Segment>(
    'segment',
    customer.data?.segment ?? 'retail',
  )

  return (
    <>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        segment={segment}
        onSegmentChange={setSegment}
      />
      <main className={styles.main}>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={({ resetErrorBoundary }) => (
                <DashboardError onRetry={resetErrorBoundary} />
              )}
            >
              <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent
                  segment={segment}
                  onSegmentChange={setSegment}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </main>
    </>
  )
}
