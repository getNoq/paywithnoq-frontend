import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchTransactions, fetchTransaction, downloadReceipt } from '@/lib/api'
import { useCallback } from 'react'
import type { BillType } from '@/types'

export const TRANSACTIONS_KEY = ['transactions'] as const

export function useTransactions(params?: { page?: number; billType?: BillType }) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, params],
    queryFn: () => fetchTransactions(params),
    staleTime: 30_000,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, id],
    queryFn: () => fetchTransaction(id),
    enabled: !!id,
  })
}

export function useDownloadReceipt() {
  const download = useCallback(async (id: string, reference: string) => {
    const blob = await downloadReceipt(id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voltpay-receipt-${reference}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return { download }
}

export function useInvalidateTransactions() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
}
