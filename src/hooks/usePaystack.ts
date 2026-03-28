import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackOptions) => { openIframe: () => void }
    }
  }
}

interface PaystackOptions {
  key: string
  email: string
  amount: number        // in kobo
  ref: string
  currency?: string
  channels?: string[]
  metadata?: Record<string, unknown>
  onClose?: () => void
  callback?: (response: { reference: string }) => void
}

interface UsePaystackOptions {
  publicKey: string
  email: string
  amount: number        // in naira — hook converts to kobo
  reference: string
  metadata?: Record<string, unknown>
  onSuccess: (reference: string) => void
  onClose?: () => void
}

export function usePaystack({
  publicKey,
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onClose,
}: UsePaystackOptions) {
  const scriptLoaded = useRef(false)

  // Inject Paystack inline script once
  useEffect(() => {
    if (scriptLoaded.current || document.getElementById('paystack-script')) {
      scriptLoaded.current = true
      return
    }
    const script = document.createElement('script')
    script.id = 'paystack-script'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => { scriptLoaded.current = true }
    document.body.appendChild(script)
  }, [])

  const openPopup = useCallback(() => {
    if (!window.PaystackPop) {
      console.error('Paystack script not yet loaded')
      return
    }
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount: Math.round(amount * 100),   // naira → kobo
      ref: reference,
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      metadata,
      callback: (response) => onSuccess(response.reference),
      onClose: onClose,
    })
    handler.openIframe()
  }, [publicKey, email, amount, reference, metadata, onSuccess, onClose])

  return { openPopup }
}
