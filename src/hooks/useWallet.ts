import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchWalletBalance,
  initiateWalletFunding,
  verifyWalletFunding,
  fetchWalletTransactions,
  payBillFromWallet,
} from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export const WALLET_KEY = ['wallet'] as const
export const WALLET_TX_KEY = ['wallet-transactions'] as const

// ── Balance ───────────────────────────────────────────────────────────────────

export function useWalletBalance() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: WALLET_KEY,
    queryFn: fetchWalletBalance,
    enabled: isAuthenticated,       // only fetch when signed in
    staleTime: 30_000,
    retry: 1,
  })
}

// ── Transactions ──────────────────────────────────────────────────────────────

export function useWalletTransactions() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: WALLET_TX_KEY,
    queryFn: fetchWalletTransactions,
    enabled: isAuthenticated,
    staleTime: 30_000,
  })
}

// ── Fund wallet ───────────────────────────────────────────────────────────────

export function useInitiateFunding() {
  return useMutation({
    mutationFn: (params: { amount: number; email: string }) =>
      initiateWalletFunding(params),
  })
}

export function useVerifyFunding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reference: string) => verifyWalletFunding(reference),
    onSuccess: () => {
      // Refresh balance after successful top-up
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_TX_KEY })
    },
  })
}

// ── Pay bill from wallet ──────────────────────────────────────────────────────

export function useWalletPayBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: payBillFromWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_TX_KEY })
    },
  })
}

// ── Invalidate helper ─────────────────────────────────────────────────────────

export function useInvalidateWallet() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    queryClient.invalidateQueries({ queryKey: WALLET_TX_KEY })
  }
}