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
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach JWT from persisted store ──────────────────────────────────
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('noq-auth')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`
      }
    }
  } catch { /* ignore */ }
  return config
})

// ── Response: auto-refresh on 401 ────────────────────────────────────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error)

    try {
      const raw = localStorage.getItem('noq-auth')
      if (!raw) return Promise.reject(error)
      const { state } = JSON.parse(raw)
      const refreshToken = state?.refreshToken
      if (!refreshToken) return Promise.reject(error)

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/token/refresh/`,
        { refresh: refreshToken }
      )
      const newAccess: string = data.access

      const parsed = JSON.parse(raw)
      parsed.state.accessToken = newAccess
      localStorage.setItem('noq-auth', JSON.stringify(parsed))

      const { useAuthStore } = await import('../store/authStore')
      useAuthStore.getState().setTokens(newAccess, refreshToken)

      processQueue(null, newAccess)
      original.headers.Authorization = `Bearer ${newAccess}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      const { useAuthStore } = await import('../store/authStore')
      useAuthStore.getState().logout()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface RegisterPayload { email: string; username: string; phone: string; password: string }
export interface LoginPayload    { email: string; password: string }
export interface TokenResponse   { access: string; refresh: string }
export interface UserProfile     { id: string; email: string; username: string; phone: string }

export async function register(payload: RegisterPayload): Promise<UserProfile> {
  const { data } = await api.post<UserProfile>('/auth/register/', payload)
  return data
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/auth/token/', payload)
  return data
}

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/auth/me/')
  return data
}

// ── Bills ─────────────────────────────────────────────────────────────────────
export async function lookupMeter(params: {
  providerId: string;
  meterNumber: string;
  meterType: MeterType
}): Promise<MeterLookupResponse> {
  const { data } = await api.post<MeterLookupResponse>('/bills/lookup/', {
    provider_id: params.providerId,
    meter_number: params.meterNumber,
    meter_type: params.meterType,
  })
  return data
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export async function initiatePayment(params: {
  billType: BillType;
  providerId: string;
  meterNumber: string
  meterType: MeterType;
  amount: number;
  phone: string;
  email: string
}): Promise<InitiatePaymentResponse> {
  const { data } = await api.post<InitiatePaymentResponse>('/payments/initiate/', {
    bill_type: params.billType,
    provider_id: params.providerId,
    meter_number: params.meterNumber,
    meter_type: params.meterType,
    amount: params.amount,
    phone: params.phone,
    email: params.email,
  })
  return data
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  const { data } = await api.post<VerifyPaymentResponse>('/payments/verify/', { reference })
  return data
}

// ─── Transaction History ─────────────────────────────────────────────────────

export async function fetchTransactions(params?: {
  page?: number;
  billType?: BillType;
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
    responseType: 'blob'
  })
  return data
}

export default api