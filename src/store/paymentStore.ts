import { create } from 'zustand'
import type {
  PaymentStore,
  BillType,
  Provider,
  MeterInfo,
  Transaction,
  Step,
} from '@/types'

const initialState = {
  step: 1 as Step,
  subStep: null, // ✅ NEW
  history: [{ step: 1 as Step, subStep: null }], // ✅ track both

  selectedBillType: null,
  selectedProvider: null,
  meterInfo: null,

  amount: null,
  phone: '',
  email: '',

  currentTransaction: null,
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setSubStep: (subStep) => set({ subStep }),

  // ✅ forward navigation WITH subStep awareness
  advanceTo: (step, subStep = null) =>
    set((s) => ({
      step,
      subStep,
      history: [...s.history, { step, subStep }],
    })),

  // ✅ back navigation restores BOTH step + subStep
  goBack: () =>
    set((s) => {
      if (s.history.length <= 1) return s

      const newHistory = s.history.slice(0, -1)
      const prev = newHistory[newHistory.length - 1]

      return {
        history: newHistory,
        step: prev.step,
        subStep: prev.subStep,
      }
    }),

  // ✅ reset dependent state when bill type changes
  setBillType: (billType: BillType) =>
    set({
      selectedBillType: billType,
      selectedProvider: null,
      meterInfo: null,
      amount: null,
      phone: '',
      email: '',
      step: 1,
      subStep: null, // ✅ IMPORTANT
      history: [{ step: 1, subStep: null }],
    }),

  setProvider: (provider: Provider) =>
    set({
      selectedProvider: provider,
      meterInfo: null,
    }),

  setMeterInfo: (meterInfo: MeterInfo) =>
    set({ meterInfo }),

  // ✅ move to step 3 (no subStep needed here)
  setAmountContact: (amount, phone, email) =>
    set((s) => ({
      amount,
      phone,
      email,
      step: 3,
      subStep: null,
      history: [...s.history, { step: 3, subStep: null }],
    })),

  setTransaction: (transaction: Transaction) =>
    set({ currentTransaction: transaction }),

  // ✅ full reset
  reset: () => set(initialState),
}))