import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ShieldCheck, Zap, Wallet, CreditCard } from 'lucide-react'

import { usePaymentStore } from '@/store/paymentStore'
import { useAuthStore } from '@/store/authStore'
import { useWalletBalance, useWalletPayBill, useInvalidateWallet } from '@/hooks/useWallet'
import { initiatePayment, verifyPayment } from '@/lib/api'
import { usePaystack } from '@/hooks/usePaystack'
import { Button, Badge } from '@/components/ui/primitives'
import { useInvalidateTransactions } from '@/hooks/useTransactions'
import { SecurityNote } from '../ui/SecurityNote'
import { billTypeLabels } from '@/types'
import { useMediaQuery } from 'react-responsive'

type PayMethod = 'paystack' | 'wallet'

function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

export function Step3Confirm() {
  const {
    selectedProvider,
    selectedBillType,
    meterInfo,
    amount,
    phone,
    email,
    setTransaction,
  } = usePaymentStore()
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const { isAuthenticated } = useAuthStore()
  const { data: walletData } = useWalletBalance()
  const walletBalance = Number(walletData?.wallet?.balance ?? 0)
  const hasSufficientBalance = walletBalance >= (amount ?? 0)

  // Default to wallet if signed in and has balance, else Paystack
  const [payMethod, setPayMethod] = useState<PayMethod>(
    isAuthenticated && hasSufficientBalance ? 'wallet' : 'paystack'
  )

  const invalidateTxs = useInvalidateTransactions()
  const invalidateWallet = useInvalidateWallet()

  // ── Paystack flow ─────────────────────────────────────────────────────────
  const [paystackConfig, setPaystackConfig] = useState<{
    publicKey: string;
    reference: string;
    amount: number;
    email: string
  } | null>(null)
  const [popupTriggered, setPopupTriggered] = useState(false)

  // Step 1: hit Django to create order, get Paystack ref
  const { mutate: initiate, isPending: initiating } = useMutation({
    mutationFn: () =>
      initiatePayment({
      billType: selectedBillType!,
      providerId: selectedProvider!.id,
      meterNumber: meterInfo!.meterNumber,
      meterType: meterInfo!.meterType,
      amount: amount!,
      phone,
      email,
    }),
    onSuccess: (data) => {
      setPaystackConfig({
        publicKey: data.paystackPublicKey,
        reference: data.reference,
        amount: data.amount / 100,  // kobo → naira for the hook
        email: data.email,
      })
    },
    onError: () => toast.error('Could not initiate payment. Please try again.'),
  })

  // Step 2: verify payment + trigger token vend
  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: (reference: string) => verifyPayment(reference),
    onSuccess: ({ transaction }) => {
      setTransaction(transaction)
      invalidateTxs()
      toast.success('Payment confirmed! Token on its way.')
    },
    onError: () => toast.error('Payment verification failed. Contact support.'),
  })

  // Paystack popup — only mounts when we have config
  const { openPopup } = usePaystack({
    publicKey: paystackConfig?.publicKey ?? '',
    email: paystackConfig?.email ?? '',
    amount: paystackConfig?.amount ?? 0,
    reference: paystackConfig?.reference ?? '',
    metadata: {
      meter_number: meterInfo?.meterNumber,
      provider: selectedProvider?.id,
      bill_type: selectedBillType,
      phone,
    },
    onSuccess: (reference) => verify(reference),
    onClose: () => toast('Payment cancelled.', { icon: '⚠️' }),
  })

  if (paystackConfig && !popupTriggered) {
    setPopupTriggered(true)
    setTimeout(() => openPopup(), 100) // slight delay for hook to settle
  }

  // ── Wallet flow ───────────────────────────────────────────────────────────
  const { mutate: walletPay, isPending: walletPaying } = useWalletPayBill()

  function handlePay() {
    if (payMethod === 'wallet') {
      walletPay(
        {
          billType: selectedBillType!,
          providerId: selectedProvider!.id,
          meterNumber: meterInfo!.meterNumber,
          meterType: meterInfo!.meterType,
          amount: amount!, phone, email,
        },
        {
          onSuccess: ({ transaction }) => {
            setTransaction(transaction)
            invalidateTxs()
            invalidateWallet()
            toast.success('Paid from wallet! Token on its way.')
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.detail || 'Wallet payment failed.'
            toast.error(msg)
          },
        }
      )
    } else {
      setPopupTriggered(false)
      initiate()
    }
  }

  const isLoading = initiating || verifying || walletPaying

  const rows: { label: string; value: string }[] = [
    {
      label: 'Bill type',
      value: selectedBillType ? billTypeLabels[selectedBillType] : '',
    },
    // { label: 'Bill type', value: selectedBillType?.replace('_', ' ') ?? '' },
    { label: 'Provider', value: `${selectedProvider?.shortName} — ${selectedProvider?.name}` },
    { label: 'Meter number', value: meterInfo?.meterNumber ?? '' },
    { label: 'Meter type', value: meterInfo?.meterType ?? '' },
    ...(meterInfo?.accountName ? [{ label: 'Account name', value: meterInfo.accountName }] : []),
    { label: 'Phone', value: phone },
    { label: 'Email', value: email || '—' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Full summary */}
      <div style={{
        // background: 'var(--surface)',
        background: 'rgb(240, 250, 248)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-semibold)', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text)' }}>
            Payment summary
          </span>
        </div>
        <div style={{ padding: '6px 0' }}>
          {rows.map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 18px',
            }}>
              <span style={{ fontFamily: 'var(--font-medium)', fontSize: '13px', color: 'var(--text)' }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-semibold)', fontSize: '14px', fontWeight: 600, color: 'var(--primary)', textAlign: 'right', textDecoration: 'none', maxWidth: '80%' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div style={{
          padding: '16px 18px',
          background: 'rgba(0,200,83,0.05)',
          borderTop: '1px solid rgba(0,200,83,0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '14px', fontFamily: 'var(--font-semibold)', fontWeight: 600, color: 'var(--text)' }}>Total payable</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '22px', color: 'var(--primary)',
          }}>
            {formatNaira(amount ?? 0)}
          </span>
        </div>
      </div>

      {/* ── Payment method picker — only shown when signed in ── */}
      {isAuthenticated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Pay with
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

            {/* Wallet option */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => hasSufficientBalance && setPayMethod('wallet')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '6px', padding: '14px',
                background: payMethod === 'wallet' ? 'rgba(0,200,83,0.07)' : 'rgb(245, 245, 245)',
                border: `1.5px solid ${payMethod === 'wallet' ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', cursor: hasSufficientBalance ? 'pointer' : 'not-allowed',
                opacity: hasSufficientBalance ? 1 : 0.5,
                transition: 'var(--transition)', outline: 'none',
                // boxShadow: payMethod === 'wallet' ? '0 0 0 1px var(--primary)' : 'none',
              }}
            >
              <Wallet size={18} style={{ color: payMethod === 'wallet' ? 'var(--primary)' : 'var(--text-muted)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: '13px', color: payMethod === 'wallet' ? 'var(--primary)' : 'var(--text)' }}>
                  NOQ Wallet
                </div>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '12px', color: hasSufficientBalance ? 'var(--text)' : 'var(--danger)', marginTop: '2px' }}>
                  {hasSufficientBalance
                    ? `Balance: ${formatNaira(walletBalance)}`
                    : `Insufficient (${formatNaira(walletBalance)})`}
                </div>
              </div>
            </motion.button>

            {/* Paystack option */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setPayMethod('paystack')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: '6px', padding: '14px',
                background: payMethod === 'paystack' ? 'rgba(0,200,83,0.07)' : 'rgb(245, 245, 245)',
                border: `1.5px solid ${payMethod === 'paystack' ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                transition: 'var(--transition)', outline: 'none',
                // boxShadow: payMethod === 'paystack' ? '0 0 0 1px var(--primary)' : 'none',
              }}
            >
              <CreditCard size={18} style={{ color: payMethod === 'paystack' ? 'var(--primary)' : 'var(--text-muted)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: '13px', color: payMethod === 'paystack' ? 'var(--primary)' : 'var(--text)' }}>
                  Card / Bank
                </div>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '12px', color: 'var(--text)', marginTop: '2px' }}>
                via Paystack
                </div>
              </div>
            </motion.button>
          </div>

          {/* Wallet insufficient hint */}
          <AnimatePresence>
            {!hasSufficientBalance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  fontSize: '12px', color: 'var(--orange)',
                  padding: '10px 14px',
                  background: 'rgba(255,213,79,0.06)',
                  border: '1px solid rgba(255,213,79,0.15)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                ⚠️ Not enough wallet balance for this payment. Top up or pay with card.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Trust badges */}
      {/* <div style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <Badge variant="success"><ShieldCheck size={11} style={{ marginRight: '4px' }} />256-bit SSL</Badge>
        <Badge variant="neutral">PCI DSS Compliant</Badge>
        <Badge variant="neutral"><Zap size={11} style={{ marginRight: '4px' }} />Instant token</Badge>
      </div> */}

      <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
        By proceeding you agree to our terms of service. Powered by VTPass &amp; Paystack.
      </p>

      {/* Pay button */}
      <Button
        variant="primary"
        size="lg"
        loading={isLoading}
        onClick={handlePay}
        style={{
          width: '100%',
          // background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-red) 100%)',
          background: 'var(--black)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          color: '#f5f5f0',
          fontFamily: 'var(--font-medium)',
          fontWeight: 500,
          fontSize: '14px',
          cursor: 'pointer',
          // boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
          letterSpacing: '0.02em',
          transition: 'var(--transition)',
        }}
      >
        {isLoading
          ? payMethod === 'wallet' ? 'Processing…' : initiating ? 'Preparing payment…' : 'Confirming…'
          : payMethod === 'wallet'
            ? `Pay ${formatNaira(amount ?? 0)} from Wallet`
            : `Pay ${formatNaira(amount ?? 0)} with Paystack`
        }
      </Button>

      <SecurityNote />

    </motion.div>
  )
}