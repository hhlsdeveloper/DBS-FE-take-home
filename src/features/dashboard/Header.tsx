import type { Segment, Theme } from '../../api/types'
import { SegmentSwitch } from '../preferences/SegmentSwitch'
import { ThemeToggle } from '../preferences/ThemeToggle'
import styles from './Header.module.css'

// Only Overview exists; the rest are shown but out of scope (brief §2).
const DISABLED_NAV = ['Cards', 'Payments', 'Insights']

interface HeaderProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  segment: Segment
  onSegmentChange: (segment: Segment) => void
}

export function Header({
  theme,
  onThemeChange,
  segment,
  onSegmentChange,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            M
          </span>
          <span className={styles.name}>Meridian</span>
        </div>

        <nav aria-label="Main" className={styles.nav}>
          {/* Not a link: we're already here, and reloading would reset the
              in-memory mock data. */}
          <span aria-current="page" className={styles.navItem}>
            Overview
          </span>
          {DISABLED_NAV.map((item) => (
            <span key={item} aria-disabled="true" className={styles.navItem}>
              {item}
            </span>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.desktopOnly}>
            <SegmentSwitch segment={segment} onChange={onSegmentChange} />
          </div>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <span className={styles.avatar} role="img" aria-label="Ava Chen">
            AC
          </span>
        </div>
      </div>
    </header>
  )
}
