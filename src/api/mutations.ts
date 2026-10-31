import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch, type ApiError } from './client'
import { queryKeys } from './queries'
import type { CreateTransferRequest, TransferResponse } from './types'

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation<TransferResponse, ApiError, CreateTransferRequest>({
    mutationFn: (body) =>
      apiFetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    // Refetch rather than patch the cache: the response has no transaction
    // row, and the server stays the only source of truth. Awaiting keeps the
    // mutation pending until the dashboard behind the dialog is up to date.
    // Defined here, not in mutate(), so it runs even if the dialog unmounts.
    onSuccess: () =>
      Promise.all(
        [queryKeys.customer, queryKeys.accounts, queryKeys.transactions].map(
          (queryKey) => queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  })
}
