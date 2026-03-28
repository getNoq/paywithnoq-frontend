import { create } from 'zustand'
import type { PaymentStore, BillType, Provider, MeterInfo, Transaction } from '@/types'

export const usePaymentStore = create<PaymentStore>((set) => ({
  step: 1,
  selectedBillType: null,
  selectedProvider: null,
  meterInfo: null,
  amount: null,
  phone: '',
  email: '',
  currentTransaction: null,

  setStep: (step) => set({ step }),

  setBillType: (billType: BillType) =>
    set({ selectedBillType: billType, selectedProvider: null, meterInfo: null, step: 1 }),

  setProvider: (provider: Provider) =>
    set({ selectedProvider: provider, meterInfo: null }),

  setMeterInfo: (meterInfo: MeterInfo) =>
    set({ meterInfo }),

  setAmountContact: (amount, phone, email) =>
    set({ amount, phone, email, step: 3 }),

  setTransaction: (transaction: Transaction) =>
    set({ currentTransaction: transaction }),

  reset: () =>
    set({
      step: 1,
      selectedBillType: null,
      selectedProvider: null,
      meterInfo: null,
      amount: null,
      phone: '',
      email: '',
      currentTransaction: null,
    }),
}))