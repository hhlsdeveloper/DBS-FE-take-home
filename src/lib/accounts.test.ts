import { describe, expect, it } from 'vitest'
import type { Account } from '../api/types'
import {
  getDepositAccounts,
  getRemainingLimit,
  getTotalAvailable,
} from './accounts'

const account = (id: string, type: Account['type'], balance: number): Account => ({
  id,
  name: id,
  type,
  maskedNumber: '•••• 0000',
  balance,
  currency: 'SGD',
})

const accounts = [
  account('acc_checking', 'checking', 4280.55),
  account('acc_savings', 'savings', 12840),
  account('acc_credit', 'credit', -420.3),
]

describe('account helpers', () => {
  it('totals deposit accounts only', () => {
    expect(getTotalAvailable(accounts)).toBe(17120.55)
  })

  it('totals an empty list as zero', () => {
    expect(getTotalAvailable([])).toBe(0)
  })

  it('leaves out the credit card from deposit accounts', () => {
    expect(getDepositAccounts(accounts).map((a) => a.id)).toEqual([
      'acc_checking',
      'acc_savings',
    ])
  })

  it('computes the remaining daily limit', () => {
    expect(
      getRemainingLimit({ dailyTransferLimit: 5000, transferredToday: 120 }),
    ).toBe(4880)
  })
})
