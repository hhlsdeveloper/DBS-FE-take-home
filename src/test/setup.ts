import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { handlers, resetMockDb } from '../mocks/handlers'

export const server = setupServer(...handlers)

// Every mock response takes ~500ms, so give findBy*/waitFor more room.
configure({ asyncUtilTimeout: 3000 })

// jsdom has no showModal()/close() on <dialog>. Minimal stand-ins so the
// transfer dialog can open and close in tests.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => resetMockDb())
afterEach(() => {
  // Vitest globals are off, so Testing Library can't unmount automatically.
  cleanup()
  server.resetHandlers()
  server.events.removeAllListeners()
})
afterAll(() => server.close())
