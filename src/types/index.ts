// ─── Bill Types ───────────────────────────────────────────────────────────────

export type BillType = 'electricity' | 'airtime' | 'data' | 'cable' | 'sport' | 'lasg' | 'scratch_card' | 'transport' | 'wallet'

export interface BillOption {
  id: BillType
  label: string
  icon: string
  description: string
  phase: 1 | 2 | 3
  available: boolean
}

export const billTypeLabels: Record<BillType, string> = {
  electricity: 'Electricity',
  // water: 'Water',
  airtime: 'Airtime',
  data: 'Mobile Data',
  cable: 'Cable TV',
  sport: 'Sport Wallet',
  lasg: 'LASG Payment',
  scratch_card: 'Scratch Card',
  transport: 'Transport & Tolls',
  wallet: 'Noq Wallet',
}

// ─── Providers ────────────────────────────────────────────────────────────────

export interface Provider {
  id: string          // VTPass serviceID e.g. "ikeja-electric"
  name: string
  shortName: string
  region: string
  icon: string
  billType: BillType
}

// ─── Meter / Account ──────────────────────────────────────────────────────────

export type MeterType = 'prepaid' | 'postpaid'

export interface MeterInfo {
  meterNumber: string
  meterType: MeterType
  accountName?: string   // returned from meter lookup API
  address?: string
}

export const meterTypeLabels: Record<MeterType, string> = {
  prepaid: 'Prepaid',
  postpaid: 'Postpaid',
}

// ─── Payment Form ─────────────────────────────────────────────────────────────

export interface PaymentFormValues {
  billType: BillType
  providerId: string
  meterNumber: string
  meterType: MeterType
  phone: string
  email: string
  amount: number
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export type TransactionStatus = 'pending' | 'processing' | 'success' | 'failed'

export interface Transaction {
  id: string
  reference: string         // frontend alias — mapped from paystack_reference
  bill_type: BillType
  provider_name: string
  meter_number: string
  account_name: string
  amount: string            // Django returns DecimalField as string
  phone: string
  email: string
  token: string
  units: string
  status: TransactionStatus
  failure_reason: string
  receipt_sent: boolean
  created_at: string
  paid_at: string | null
  completed_at: string | null
  paystack_reference: string
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface MeterLookupResponse {
  accountName: string
  address: string
  meterNumber: string
}

export interface InitiatePaymentResponse {
  reference: string
  paystackPublicKey: string
  amount: number          // in kobo
  email: string
}

export interface VerifyPaymentResponse {
  transaction: Transaction
}

// ─── Store ────────────────────────────────────────────────────────────────────

export type Step = 1 | 2 | 3

export interface PaymentStore {
  step: Step
  selectedBillType: BillType | null
  selectedProvider: Provider | null
  meterInfo: MeterInfo | null
  amount: number | null
  phone: string
  email: string
  currentTransaction: Transaction | null

  setStep: (step: Step) => void
  setBillType: (bt: BillType) => void
  setProvider: (p: Provider) => void
  setMeterInfo: (m: MeterInfo) => void
  setAmountContact: (amount: number, phone: string, email: string) => void
  setTransaction: (t: Transaction) => void
  reset: () => void
}
