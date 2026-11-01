/**
 * Shared formatters so every screen (and test) renders money and dates the
 * same way.
 *
 * Note: `Intl` puts a non-breaking space (U+00A0) between `SGD` and the
 * number. In tests, assert against `formatMoney(...)` rather than typing the
 * string by hand.
 */
const money = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  currencyDisplay: 'code',
})

// Shown in place of a value that isn't usable, instead of "NaN" or a crash.
const MISSING = '—'

/** `4280.55` → `SGD 4,280.55`, `-420.3` → `-SGD 420.30` */
export function formatMoney(amount: number): string {
  return Number.isFinite(amount) ? money.format(amount) : MISSING
}

// Dates are shown in Singapore time so the output doesn't depend on where the
// app (or the test runner) happens to be.
const shortDate = new Intl.DateTimeFormat('en-SG', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Singapore',
})

/** `2026-10-18T08:15:00+08:00` → `18 Oct` */
export function formatShortDate(iso: string): string {
  const date = new Date(iso)
  // Intl throws on an invalid date, which would take down the whole dashboard.
  return Number.isNaN(date.getTime()) ? MISSING : shortDate.format(date)
}
