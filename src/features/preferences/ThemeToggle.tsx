import { MoonIcon, SunIcon } from '../../components/icons'
import styles from './ThemeToggle.module.css'
import type { Theme } from './usePreference'

interface ThemeToggleProps {
  theme: Theme
  onChange: (theme: Theme) => void
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Dark mode"
      aria-pressed={isDark}
      onClick={() => onChange(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
