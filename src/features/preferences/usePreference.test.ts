import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Theme } from '../../api/types'
import { usePreference } from './usePreference'

describe('usePreference', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.segment
  })

  it('uses the fallback when nothing is stored', () => {
    const { result } = renderHook(() => usePreference<Theme>('theme', 'light'))

    expect(result.current[0]).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('prefers a stored value over the fallback', () => {
    localStorage.setItem('meridian.segment', 'premium')

    const { result } = renderHook(() => usePreference('segment', 'retail'))

    expect(result.current[0]).toBe('premium')
    expect(document.documentElement.dataset.segment).toBe('premium')
  })

  it('setting a value updates <html> and localStorage', () => {
    const { result } = renderHook(() => usePreference<Theme>('theme', 'light'))

    act(() => result.current[1]('dark'))

    expect(result.current[0]).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('meridian.theme')).toBe('dark')
  })
})
