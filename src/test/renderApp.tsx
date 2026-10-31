import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { formatMoney } from '../lib/format'

/**
 * `formatMoney` for text queries. Testing Library turns the non-breaking
 * space after "SGD" in the page into a normal space before matching, but not
 * the string you search for, so do the same here.
 */
export function money(amount: number): string {
  return formatMoney(amount).replace(/\u00a0/g, ' ')
}

/** Renders the whole app with a fresh query cache and no retries. */
export function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const user = userEvent.setup()

  const result = render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )

  return { ...result, user }
}
