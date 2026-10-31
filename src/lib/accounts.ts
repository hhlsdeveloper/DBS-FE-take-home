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

export function getTotalAvailable(accounts: Account[]): number {
  return roundCents(
    getDepositAccounts(accounts).reduce((sum, a) => sum + a.balance, 0),
  )
}

export function getRemainingLimit(
  customer: Pick<Customer, 'dailyTransferLimit' | 'transferredToday'>,
): number {
  return roundCents(customer.dailyTransferLimit - customer.transferredToday)
}
