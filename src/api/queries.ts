import { useQuery } from '@tanstack/react-query'
import { apiFetch, type ApiError } from './client'
import type {
  AccountsResponse,
  CustomerResponse,
  TransactionsResponse,
} from './types'

export const RECENT_TRANSACTIONS_LIMIT = 8

// Invalidating a key also refreshes every key that starts with it, so
// ['transactions'] covers ['transactions', { limit: 8 }].
export const queryKeys = {
  customer: ['customer'],
  accounts: ['accounts'],
  transactions: ['transactions'],
} as const

export function useCustomer() {
  return useQuery<CustomerResponse, ApiError, CustomerResponse['customer']>({
    queryKey: queryKeys.customer,
    queryFn: ({ signal }) => apiFetch('/api/customer', { signal }),
    select: (data) => data.customer,
  })
}

export function useAccounts() {
  return useQuery<AccountsResponse, ApiError, AccountsResponse['accounts']>({
    queryKey: queryKeys.accounts,
    queryFn: ({ signal }) => apiFetch('/api/accounts', { signal }),
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
    queryFn: ({ signal }) =>
      apiFetch(`/api/transactions?limit=${RECENT_TRANSACTIONS_LIMIT}`, {
        signal,
      }),
    select: (data) => data.transactions,
  })
}
