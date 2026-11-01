import type { Account, Customer } from '../api/types'

// Money from the API has at most 2 decimals; adding floats can leave
// 17120.550000000003, so round sums back to cents.
const roundCents = (n: number) => Math.round(n * 100) / 100

/** Checking and savings hold money you can spend; the credit card doesn't. */
function isDepositAccount(account: Account): boolean {
  return account.type !== 'credit'
}

export function getDepositAccounts(accounts: Account[]): Account[] {
  return accounts.filter(isDepositAccount)
}

// A missing or non-number balance is skipped so one bad account can't turn
// the whole total into NaN.
export function getTotalAvailable(accounts: Account[]): number {
  return roundCents(
    getDepositAccounts(accounts)
      .filter((a) => Number.isFinite(a.balance))
      .reduce((sum, a) => sum + a.balance, 0),
  )
}

// Never below zero: going over the limit means nothing is left, not a
// negative amount.
export function getRemainingLimit(
  customer: Pick<Customer, 'dailyTransferLimit' | 'transferredToday'>,
): number {
  const remaining = roundCents(
    customer.dailyTransferLimit - customer.transferredToday,
  )
  return Number.isFinite(remaining) ? Math.max(0, remaining) : 0
}
