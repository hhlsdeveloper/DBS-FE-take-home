import type { Theme } from '../../api/types'
import { MoonIcon, SunIcon } from '../../components/icons'
import styles from './ThemeToggle.module.css'

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
