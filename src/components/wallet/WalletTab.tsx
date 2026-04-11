import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, ArrowUpRight, ArrowDownLeft, Wallet, Building2, CreditCard, Copy, CheckCheck, AlertCircle, } from 'lucide-react'
import { useWalletBalance, useWalletTransactions, useInitiateFunding, useVerifyFunding } from '@/hooks/useWallet'
import { useAuthStore } from '@/store/authStore'
import { usePaystack } from '@/hooks/usePaystack'
import { Spinner, Button } from '@/components/ui/primitives'
// import { Input } from '@/components/primitives/Input'
import { fetchDVA, createDVA } from '@/lib/api'
import type { WalletTransaction, DVAResponse } from '@/lib/api'

function fmt(n: string | number) {
  return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function safeDate(s: string) {
  try { return new Date(s).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

// ── DVA card ──────────────────────────────────────────────────────────────────

function DVACard() {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: dva, isLoading } = useQuery({
    queryKey: ['wallet-dva'],
    queryFn: fetchDVA,
    staleTime: 60_000,
    retry: 2,
  })

  const { mutate: retryCreate, isPending: creating } = useMutation({
    mutationFn: createDVA,
    onSuccess: () => {
      toast.success('Account creation started — refresh in a few seconds.')
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ['wallet-dva'] }), 5000)
    },
    onError: () => toast.error('Could not create account. Contact support.'),
  })

  function copyAccount() {
    if (!dva?.account_number) return
    navigator.clipboard.writeText(dva.account_number).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <Spinner size={20} />
      </div>
    )
  }

  // DVA pending / not created yet
  if (!dva?.has_dva) {
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(255,213,79,0.06)',
        border: '1px solid rgba(255,213,79,0.2)',
        borderRadius: 'var(--radius-md)',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {dva?.creation_pending
              ? 'Your dedicated bank account is being set up — check back in a moment.'
              : 'Could not create your account automatically.'}
          </span>
        </div>
        {!dva?.creation_pending && (
          <button
            type="button"
            onClick={() => retryCreate()}
            disabled={creating}
            style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '6px 12px',
              color: 'var(--text-muted)', fontSize: '12px',
              cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            {creating ? 'Creating…' : 'Retry account creation'}
          </button>
        )}
      </div>
    )
  }

  // DVA ready
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(0,95,86,0.05)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <Building2 size={13} style={{ color: 'var(--green)' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.8px', color: 'var(--green)', textTransform: 'uppercase' }}>
          Dedicated bank account
        </span>
      </div>

      {/* Account details */}
      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginBottom: '4px' }}>
          {dva.bank_name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800, fontSize: '22px', color: 'var(--text)',
            letterSpacing: '2px',
          }}>
            {dva.account_number}
          </span>
          <button
            type="button"
            onClick={copyAccount}
            style={{
              background: copied ? 'rgba(0,200,83,0.1)' : 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: '6px',
              padding: '4px 8px', cursor: 'pointer',
              color: copied ? 'var(--green)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: 600, transition: 'var(--transition)',
            }}
          >
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Account name: <strong>{dva.account_name}</strong>
        </div>
        <div style={{
          marginTop: '10px', padding: '8px 10px',
          background: 'rgba(0,200,83,0.04)', borderRadius: '6px',
          fontSize: '11px', color: 'var(--text-faint)', lineHeight: 1.6,
        }}>
          Transfer any amount to this account. Your wallet credits automatically — usually within seconds.
        </div>
      </div>
    </div>
  )
}

// ── Paystack fund sheet ───────────────────────────────────────────────────────

function PaystackFundSheet({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore()
  const [amount, setAmount] = useState('')
  const numAmount = parseFloat(amount) || 0
  const isValid = numAmount >= 100

  const { mutate: initiate, isPending: initiating } = useInitiateFunding()
  const { mutate: verify, isPending: verifying } = useVerifyFunding()

  const [paystackConfig, setPaystackConfig] = useState<{
    publicKey: string; reference: string; amount: number; email: string
  } | null>(null)
  const [popupTriggered, setPopupTriggered] = useState(false)

  const { openPopup } = usePaystack({
    publicKey: paystackConfig?.publicKey ?? '',
    email: paystackConfig?.email ?? '',
    amount: paystackConfig?.amount ?? 0,
    reference: paystackConfig?.reference ?? '',
    metadata:  { payment_type: 'wallet_topup' },
    onSuccess: (reference) => {
      // Poll for webhook to process
      let attempts = 0
      const MAX = 15
      
      const poll = () => {
        attempts++
        verify(reference, {
          onSuccess: (data) => {
            if (data.funding?.status === 'success') {
              toast.success('Wallet funded successfully!')
              onClose()
            } else if (attempts < MAX) {
              setTimeout(poll, 2000)
            } else {
              toast('Top-up received — balance will update shortly.', { icon: '✅' })
              onClose()
            }
          },
          onError: () => {
            if (attempts < MAX) setTimeout(poll, 2000) },
        })
      }
      setTimeout(poll, 1500)
    },
    onClose: () => toast('Funding cancelled.', { icon: '⚠️' }),
  })

  if (paystackConfig && !popupTriggered) {
    setPopupTriggered(true)
    setTimeout(() => openPopup(), 100)
  }

  const QUICK = [1000, 2000, 5000, 10000]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '16px', color: 'var(--white)' }}>
          Fund with Card / Instant
        </span>
        <button 
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}
          >
            ×
          </button>
      </div>

      {/* Amount input */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '20px',
          color: 'var(--primary)', pointerEvents: 'none',
        }}>₦</span>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0"
            className='amount-input '
            style={{
              width: '100%',
              background: '#FCFCFC',
              border: `2px solid ${isValid && amount ? 'var(--primary)' : !amount ? 'var(--border)' : 'var(--danger)'}`,
              borderRadius: 'var(--radius-xs)',
              padding: '13px 14px 13px 42px',
              color: 'var(--primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              outline: 'none',
              transition: 'var(--transition)',
              // boxShadow: isValid && amount ? '0 0 0 4px rgba(0,200,83,0.08)' : 'none',
            }}
        />
      </div>
      {amount && !isValid && (
        <span style={{ fontSize: '12px', color: 'var(--danger)' }}>Minimum top-up is ₦100</span>
      )}

      {/* Quick amounts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {QUICK.map(q => (
          <motion.button key={q} type="button" whileTap={{ scale: 0.95 }}
            onClick={() => setAmount(String(q))}
            style={{
              padding: '6px 12px',
              background: numAmount === q ? 'rgba(0,200,83,0.1)' : 'var(--surface2)',
              border: `1px solid ${numAmount === q ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              color: numAmount === q ? 'var(--green)' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-display)',
              cursor: 'pointer', outline: 'none',
            }}
          >
            ₦{q.toLocaleString()}
          </motion.button>
        ))}
      </div>

      <Button
        variant="primary" size="lg"
        disabled={!isValid} loading={initiating || verifying}
        onClick={() => {
          setPopupTriggered(false)
          initiate(
            { amount: numAmount, email: user?.email ?? '' },
            {
              onSuccess: (data) => setPaystackConfig({
                publicKey: data.paystackPublicKey,
                reference: data.reference,
                amount: data.amount / 100,
                email: data.email,
              }),
              onError: () => toast.error('Could not initiate funding. Try again.'),
            }
          )
        }}
        style={{ width: '100%' }}
      >
        {initiating ? 'Preparing…' : verifying ? 'Confirming…' : `Fund ${isValid ? fmt(numAmount) : 'Wallet'}`}
      </Button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-faint)' }}>
        Secured by Paystack
      </p>
    </motion.div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, string> = {
  paystack_topup:  'Card top-up',
  flutterwave_dva: 'Bank transfer',
  bill_payment:    'Bill payment',
  airtime_topup:   'Airtime/Data',
  refund:          'Refund',
  admin_credit:    'Admin credit',
  admin_debit:     'Admin debit',
}

function TxRow({ tx }: { tx: WalletTransaction }) {
  const isCredit = tx.type === 'credit'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: isCredit ? 'rgba(0,200,83,0.1)' : 'rgba(255,82,82,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isCredit
          ? <ArrowDownLeft size={16} style={{ color: 'var(--green)' }} />
          : <ArrowUpRight size={16} style={{ color: 'var(--danger)' }} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>
          {SOURCE_LABEL[tx.source] ?? tx.source.replace(/_/g, ' ')}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
          {safeDate(tx.created_at)}
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px',
        color: isCredit ? 'var(--green)' : 'var(--danger)', flexShrink: 0,
      }}>
        {isCredit ? '+' : '-'}{fmt(tx.amount)}
      </div>
    </div>
  )
}

// ── WalletTab ─────────────────────────────────────────────────────────────────

type FundMethod = 'bank' | 'card' | null

export function WalletTab() {
  const [fundMethod, setFundMethod] = useState<FundMethod>(null)
  const { data, isLoading, refetch, isFetching } = useWalletBalance()
  const { data: txData } = useWalletTransactions()

  const wallet = data?.wallet
  const balance = Number(wallet?.balance ?? 0)
  const recentTxs = data?.recent_transactions ?? []

  if (isLoading) {
    return ( 
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* ── Balance card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #005F56 0%, #003D36 100%)',
        borderRadius: 'var(--radius-md)',
        padding: '28px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative ring */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)',
          }} />
        <div style={{
          position: 'absolute', top: -10, right: -10,
          width: 100, height: 100, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Wallet size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            NOQ Wallet Balance
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: 'rgba(255,255,255,0.5)', display: 'flex' }}
            >
            <RefreshCw size={13} style={isFetching ? { animation: 'spin 0.7s linear infinite' } : {}} />
          </button>
        </div>

        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '36px', color: 'white', marginBottom: '20px', lineHeight: 1,
          }}>
          {fmt(balance)}
        </div>

        {/* Fund method buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setFundMethod(fundMethod === 'bank' ? null : 'bank')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: fundMethod === 'bank' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
              border: `1px solid ${fundMethod === 'bank' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)'}`,
              borderRadius: 'var(--radius-md)', padding: '9px 14px',
              color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '13px', cursor: 'pointer', transition: 'var(--transition)',
            }}>
            <Building2 size={14} />
            Bank Transfer
          </button>
          <button type="button" onClick={() => setFundMethod(fundMethod === 'card' ? null : 'card')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: fundMethod === 'card' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.12)',
              border: `1px solid ${fundMethod === 'card' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.18)'}`,
              borderRadius: 'var(--radius-md)', padding: '10px 20px',
              color: 'white', fontFamily: 'var(--font-title)', fontWeight: 700,
              fontSize: '14px', cursor: 'pointer', transition: 'var(--transition)',
            }}>
            <CreditCard size={16} />
            Card / Instant
          </button>
        </div>
      </div>

      {/* ── Bank transfer (DVA) panel ── */}
      <AnimatePresence>
        {fundMethod === 'bank' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'rgb(245, 245, 245)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 12px', 
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '15px', color: 'var(--white)' }}>
                  Your bank account
                </span>
                <button type="button" onClick={() => setFundMethod(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>×</button>
              </div>
              <DVACard />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Paystack / card panel ── */}
      <AnimatePresence>
        {fundMethod === 'card' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
              <PaystackFundSheet onClose={() => setFundMethod(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Low balance hint ── */}
      {balance < 500 && balance > 0 && (
        <div style={{
          padding: '12px 16px', fontSize: '13px',
          background: 'rgba(255,213,79,0.08)',
          border: '1px solid rgba(255,213,79,0.2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--gold)',
          }}>
          ⚠️ Low balance — top up to pay bills from your wallet
        </div>
      )}

      {/* ── Recent activity ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--white)' }}>Recent Activity</span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{txData?.count ?? 0} total</span>
        </div>
        {recentTxs.length === 0
          ? <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-faint)', fontSize: '13px' }}>No activity yet</div>
          : recentTxs.map(tx => <TxRow key={tx.id} tx={tx} />)
        }
      </div>
    </motion.div>
  )
}