import axios from 'axios'
import type {
  MeterLookupResponse,
  InitiatePaymentResponse,
  VerifyPaymentResponse,
  Transaction,
  MeterType,
  BillType,
} from '@/types'

const api = axios.create({
  // baseURL: '/api',
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Meter / Account Lookup ───────────────────────────────────────────────────

export async function lookupMeter(params: {
  providerId: string
  meterNumber: string
  meterType: MeterType
}): Promise<MeterLookupResponse> {
  const { data } = await api.post<MeterLookupResponse>('/bills/lookup/', {
    provider_id:  params.providerId,
    meter_number: params.meterNumber,
    meter_type:   params.meterType,
  })
  return data
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export async function initiatePayment(params: {
  billType: BillType
  providerId: string
  meterNumber: string
  meterType: MeterType
  amount: number      // in naira
  phone: string
  email: string
}): Promise<InitiatePaymentResponse> {
  const { data } = await api.post<InitiatePaymentResponse>('/payments/initiate/', {
    bill_type:    params.billType,
    provider_id:  params.providerId,
    meter_number: params.meterNumber,
    meter_type:   params.meterType,
    amount:       params.amount,
    phone:        params.phone,
    email:        params.email,
  })
  return data
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  const { data } = await api.post<VerifyPaymentResponse>('/payments/verify/', { reference })
  return data
}

// ─── Transaction History ─────────────────────────────────────────────────────

export async function fetchTransactions(params?: {
  page?: number
  billType?: BillType
  status?: string
}): Promise<{ results: Transaction[]; count: number; next: string | null }> {
  const { data } = await api.get('/transactions/', { params })
  return data
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const { data } = await api.get<Transaction>(`/transactions/${id}/`)
  return data
}

export async function downloadReceipt(id: string): Promise<Blob> {
  const { data } = await api.get(`/transactions/${id}/receipt/`, {
    responseType: 'blob',
  })
  return data
}

export default api