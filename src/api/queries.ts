import { queryOptions, useQuery } from '@tanstack/react-query'
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

// Shared by useQuery and useSuspenseQueries, which take options, not hooks.
export const customerQuery = queryOptions<
  CustomerResponse,
  ApiError,
  CustomerResponse['customer']
>({
  queryKey: queryKeys.customer,
  queryFn: ({ signal }) => apiFetch('/api/customer', { signal }),
  select: (data) => data.customer,
})

export const accountsQuery = queryOptions<
  AccountsResponse,
  ApiError,
  AccountsResponse['accounts']
>({
  queryKey: queryKeys.accounts,
  queryFn: ({ signal }) => apiFetch('/api/accounts', { signal }),
  select: (data) => data.accounts,
})

export const recentTransactionsQuery = queryOptions<
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

export function useCustomer() {
  return useQuery(customerQuery)
}

export function usePayees() {
  return useQuery<PayeesResponse, ApiError, PayeesResponse['payees']>({
    queryKey: queryKeys.payees,
    queryFn: ({ signal }) => apiFetch('/api/payees', { signal }),
    select: (data) => data.payees,
  })
}
