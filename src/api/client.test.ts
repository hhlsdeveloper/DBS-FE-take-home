import { afterEach, describe, expect, it } from 'vitest'
import { server } from '../test/setup'
import { apiFetch, ApiError } from './client'

describe('apiFetch demo params', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('passes ?scenario from the page URL to GET requests', async () => {
    window.history.replaceState(null, '', '/?scenario=error')

    await expect(apiFetch('/api/accounts')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })
  })

  it('does not pass ?scenario to POST requests', async () => {
    window.history.replaceState(null, '', '/?scenario=error')
    const urls: string[] = []
    server.events.on('request:start', ({ request }) => {
      urls.push(request.url)
    })

    await apiFetch('/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch((error: unknown) => {
      // The empty body is rejected with a validation error; that's fine here.
      expect(error).toBeInstanceOf(ApiError)
    })

    expect(urls).toHaveLength(1)
    expect(new URL(urls[0]).searchParams.has('scenario')).toBe(false)
  })
})
