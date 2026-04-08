import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { RefreshCw, Plus, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react'
import { useWalletBalance, useWalletTransactions, useInitiateFunding, useVerifyFunding } from '@/hooks/useWallet'
import { useAuthStore } from '@/store/authStore'
import { usePaystack } from '@/hooks/usePaystack'
import { Spinner, Button } from '@/components/ui/primitives'
// import { Input } from '@/components/primitives/Input'
import type { WalletTransaction } from '@/lib/api'

function fmt(n: string | number) {
  return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function safeDate(s: string) {
  try { return new Date(s).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

// ── Fund wallet sheet ─────────────────────────────────────────────────────────

interface FundSheetProps {
  onClose: () => void
}

function FundSheet({ onClose }: FundSheetProps) {
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
    metadata: { payment_type: 'wallet_topup' },
    onSuccess: (reference) => {
        // Poll verify every 2 seconds for up to 30 seconds
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
                if (attempts < MAX) setTimeout(poll, 2000)
                else toast.error('Could not confirm funding. Check your balance.')
            },
            })
        }

        // Start polling after 1.5s to give webhook time to fire
        setTimeout(poll, 1500)
    },
    onClose: () => toast('Funding cancelled.', { icon: '⚠️' }),
  })

  if (paystackConfig && !popupTriggered) {
    setPopupTriggered(true)
    setTimeout(() => openPopup(), 100)
  }

  const QUICK = [1000, 2000, 5000, 10000]

  function handleFund() {
    if (!isValid) return
    setPopupTriggered(false)
    initiate(
      { amount: numAmount, email: user?.email ?? '' },
      {
        onSuccess: (data) => {
          setPaystackConfig({
            publicKey: data.paystackPublicKey,
            reference: data.reference,
            amount: data.amount / 100,
            email: data.email,
          })
        },
        onError: () => toast.error('Could not initiate funding. Try again.'),
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: '16px', color: 'var(--text)', letterSpacing: '-0.5px' }}>
          Fund Wallet
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
            min={100}
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
      {/* <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}> */}
      
        {/* Quick amounts */}
        <div className="quick-amounts">
        {QUICK.map((q) => (
            <motion.button
            key={q}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setAmount(String(q))}
            className={`quick-amount-btn ${numAmount === q ? 'active' : ''}`}
            >
            ₦{q.toLocaleString()}
            </motion.button>
        ))}
        </div>
        {/* {QUICK.map(q => (
          <motion.button
            key={q}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setAmount(String(q))}
            style={{
              padding: '7px 14px',
              background: numAmount === q ? 'rgba(0,200,83,0.1)' : 'var(--surface2)',
              border: `1px solid ${numAmount === q ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              color: numAmount === q ? 'var(--green)' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600,
              fontFamily: 'var(--font-display)', cursor: 'pointer', outline: 'none',
              transition: 'var(--transition)',
            }}
          >
            ₦{q.toLocaleString()}
          </motion.button>
        ))} */}
      {/* </div> */}

      <Button
        variant="primary"
        size="lg"
        disabled={!isValid}
        loading={initiating || verifying}
        onClick={handleFund}
        style={{
            width: '100%',
            // background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-red) 100%)',
            background: 'var(--black)',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            padding: '16px',
            color: '#f5f5f0',
            fontFamily: 'var(--font-medium)',
            fontWeight: 500,
            fontSize: '14px',
            cursor: 'pointer',
            // boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
            transition: 'var(--transition)',
            letterSpacing: '0.02em',
            marginBottom: '12px',
        }}
      >
        {initiating ? 'Preparing…' : verifying ? 'Confirming…' : `Fund ${isValid ? fmt(numAmount) : 'Wallet'}`}
      </Button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-faint)' }}>
        Secured by Paystack · Funds available instantly
      </p>
    </motion.div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────

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
          {tx.source.replace(/_/g, ' ')}
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

export function WalletTab() {
  const [showFund, setShowFund] = useState(false)
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
        borderRadius: 'var(--radius-lg)',
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

        {/* Fund button */}
        <button
          type="button"
          onClick={() => setShowFund(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px', color: 'white',
            fontFamily: 'var(--font-title)', fontWeight: 700,
            fontSize: '14px', cursor: 'pointer',
            transition: 'var(--transition)',
          }}
        >
          <Plus size={16} />
          Add Money
        </button>
      </div>

      {/* ── Fund sheet ── */}
      <AnimatePresence>
        {showFund && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgb(245, 245, 245)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              overflow: 'hidden',
            }}
          >
            <FundSheet onClose={() => setShowFund(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recent transactions ── */}
      <div style={{
        background: 'rgb(240, 250, 248)',
        border: '1px solid rgba(0, 95, 86, 0.2)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 600, fontSize: '15px', color: 'var(--primary)' }}>
            Recent Activity
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
            {txData?.count ?? 0} total
          </span>
        </div>

        {recentTxs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-faint)', fontSize: '13px' }}>
            No transactions yet, fund your wallet to get started
          </div>
        ) : (
          recentTxs.map(tx => <TxRow key={tx.id} tx={tx} />)
        )}
      </div>

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
    </motion.div>
  )
}