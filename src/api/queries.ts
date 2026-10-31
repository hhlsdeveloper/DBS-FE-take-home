import { useQuery } from '@tanstack/react-query'
import { apiFetch, type ApiError } from './client'
import type {
  AccountsResponse,
  CustomerResponse,
  PayeesResponse,
  TransactionsResponse,
} from './types'

export const RECENT_TRANSACTIONS_LIMIT = 8

// Invalidating a key also refreshes every key that starts with it, so
// ['transactions'] covers ['transactions', { limit: 8 }].
export const queryKeys = {
  customer: ['customer'],
  accounts: ['accounts'],
  transactions: ['transactions'],
  payees: ['payees'],
} as const

export function useCustomer() {
  return useQuery<CustomerResponse, ApiError, CustomerResponse['customer']>({
    queryKey: queryKeys.customer,
    queryFn: () => apiFetch('/api/customer'),
    select: (data) => data.customer,
  })
}

export function useAccounts() {
  return useQuery<AccountsResponse, ApiError, AccountsResponse['accounts']>({
    queryKey: queryKeys.accounts,
    queryFn: () => apiFetch('/api/accounts'),
    select: (data) => data.accounts,
  })
}

export function useRecentTransactions() {
  return useQuery<
    TransactionsResponse,
    ApiError,
    TransactionsResponse['transactions']
  >({
    queryKey: [...queryKeys.transactions, { limit: RECENT_TRANSACTIONS_LIMIT }],
    queryFn: () =>
      apiFetch(`/api/transactions?limit=${RECENT_TRANSACTIONS_LIMIT}`),
    select: (data) => data.transactions,
  })
}

export function usePayees() {
  return useQuery<PayeesResponse, ApiError, PayeesResponse['payees']>({
    queryKey: queryKeys.payees,
    queryFn: () => apiFetch('/api/payees'),
    select: (data) => data.payees,
  })
}
