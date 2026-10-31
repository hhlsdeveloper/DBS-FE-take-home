import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
type PreferenceName = 'theme' | 'segment'

// Same keys as the pre-paint script in index.html.
const STORAGE_KEYS: Record<PreferenceName, string> = {
  theme: 'meridian.theme',
  segment: 'meridian.segment',
}

function readStored(name: PreferenceName): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS[name])
  } catch {
    return null
  }
}

export function getSystemTheme(): Theme {
  if (typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * A preference that lives on <html data-theme / data-segment> and in
 * localStorage. Only the user's explicit choice is stored; until they make
 * one, the fallback applies (it may change, e.g. once the customer loads).
 */
export function usePreference<T extends string>(
  name: PreferenceName,
  fallback: T,
): [T, (value: T) => void] {
  const [stored, setStored] = useState(() => readStored(name) as T | null)
  const value = stored ?? fallback

  useEffect(() => {
    document.documentElement.dataset[name] = value
  }, [name, value])

  function setValue(next: T) {
    setStored(next)
    try {
      localStorage.setItem(STORAGE_KEYS[name], next)
    } catch {
      // Storage can be unavailable (e.g. private mode); the choice still
      // applies for this visit.
    }
  }

  return [value, setValue]
}
