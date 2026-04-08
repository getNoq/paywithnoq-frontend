import { motion } from 'framer-motion'
import { Download, RefreshCw, Receipt, User } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { useTransactions, useDownloadReceipt } from '@/hooks/useTransactions'
import { useAuthStore } from '@/store/authStore'
import { Badge, Button, Spinner } from '@/components/ui/primitives'
import type { Transaction } from '@/types'

function safeFormat(dateStr: string | null | undefined, fallback = '—'): string {
  if (!dateStr) return fallback
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm') : fallback
  } catch {
    return fallback
  }
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  success:    'success',
  processing: 'warning',
  pending:    'warning',
  failed:     'danger',
}

const BILL_ICON: Record<string, string> = {
  electricity: '⚡',
  cable:       '📺',
  water:       '💧',
  airtime:     '📱',
  data:        '📡',
}

interface Props {
  onSignInRequest: () => void
}

export function TransactionHistory({ onSignInRequest }: Props) {
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading, refetch, isFetching } = useTransactions()
  const { download } = useDownloadReceipt()

  // ── Guest gate ───────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', color: 'var(--text-title)' }}>
          Transaction History
        </h2>

        {/* Sign-in prompt card */}
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: 'rgb(240, 250, 248)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--primary)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Receipt size={28} style={{ color: 'rgb(240, 250, 248)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--primary)', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-title)', marginBottom: '6px' }}>
              Your payment history
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
              Sign in to see all your past payments, tokens, and receipts.
            </p>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          // background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <button
            type="button"
            onClick={onSignInRequest}
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
              fontSize: '16px',
              cursor: 'pointer',
              // boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
              transition: 'var(--transition)',
              letterSpacing: '0.02em',
            }}
          >
            Sign in to view history
          </button>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text)',
              textAlign: 'center',
              flexWrap: 'wrap',
              lineHeight: '14px',
              fontFamily: 'var(--font-medium)',
            }}>
            Guest payments are not saved, create an account to keep your records.
          </p>
          </div>
      </motion.div>
    )
  }

  // ── Authenticated view ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', color: 'var(--text-title)' }}>
          Transaction History
        </h2>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={14} style={isFetching ? { animation: 'spin 0.7s linear infinite' } : {}} />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner size={28} />
        </div>
      )}

      {!isLoading && (!data?.results || data.results.length === 0) && (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'rgb(240, 250, 248)',
          border: '1px solid rgba(0, 95, 86, 0.2)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <Receipt size={36} style={{ color: 'var(--text-faint)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--primary)', fontSize: '15px', fontWeight: 600 }}>No transactions yet</p>
          <p style={{ color: 'var(--text-faint)', fontSize: '13px', marginTop: '4px' }}>Your payment history will appear here</p>
        </div>
      )}

      {data?.results.map((tx, i) => (
        <TransactionCard
          key={tx.id}
          tx={tx}
          index={i}
          onDownload={() => download(tx.id, tx.paystack_reference)}
        />
      ))}

      {data && data.count > 0 && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-faint)', paddingTop: '4px' }}>
          Showing {data.results.length} of {data.count} transactions
        </p>
      )}
    </div>
  )
}

function TransactionCard({ tx, index, onDownload }: { tx: Transaction; index: number; onDownload: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      style={{
        background: 'rgb(240, 250, 248)',
        border: '1px solid rgba(0, 95, 86, 0.2)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          background: 'var(--primary)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>
          {BILL_ICON[tx.bill_type] ?? '🧾'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--primary)', fontFamily: 'var(--font-title)' }}>
            {tx.provider_name}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--font-body)' }}>
            {tx.meter_number}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '16px',
            color: tx.status === 'success' ? 'var(--green)' : tx.status === 'failed' ? 'var(--danger)' : 'var(--text)',
          }}>
            ₦{Number(tx.amount).toLocaleString('en-NG')}
          </div>
          <div style={{ marginTop: '4px' }}>
            <Badge variant={STATUS_VARIANT[tx.status] ?? 'neutral'}>
              {tx.status}
              </Badge>
          </div>
        </div>
      </div>

      {tx.token && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(0,200,83,0.04)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Token</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '14px', color: 'var(--green)', letterSpacing: '3px',
            }}>
            {tx.token}
          </span>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
          {safeFormat(tx.created_at)}
        </span>
        {tx.status === 'success' && (
          <button
            onClick={onDownload}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-body)',
              padding: '4px 8px', borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'rgba(0,200,83,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
          >
            <Download size={12} />
            Receipt
          </button>
        )}
      </div>
    </motion.div>
  )
}
