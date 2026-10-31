import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { handlers, resetMockDb } from '../mocks/handlers'

export const server = setupServer(...handlers)

// Every mock response takes ~500ms, so give findBy*/waitFor more room.
configure({ asyncUtilTimeout: 3000 })

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => resetMockDb())
afterEach(() => {
  // Vitest globals are off, so Testing Library can't unmount automatically.
  cleanup()
  server.resetHandlers()
  server.events.removeAllListeners()
})
afterAll(() => server.close())
