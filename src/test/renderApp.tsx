import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { server } from './setup'

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

/**
 * Counts requests that reach the mock API, e.g.
 * `const posts = countRequests('POST', '/api/transfers')` then `posts()`.
 */
export function countRequests(method: string, pathSuffix: string) {
  let count = 0
  server.events.on('request:start', ({ request }) => {
    if (
      request.method === method &&
      new URL(request.url).pathname.endsWith(pathSuffix)
    ) {
      count += 1
    }
  })
  return () => count
}
