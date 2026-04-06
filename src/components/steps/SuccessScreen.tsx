import { motion } from 'framer-motion'
import { Copy, Download, RotateCcw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePaymentStore } from '@/store/paymentStore'
import { useDownloadReceipt } from '@/hooks/useTransactions'
import { Button, Badge } from '@/components/ui/primitives'
import { format, parseISO, isValid } from 'date-fns'

// Safe date formatter — returns fallback string if date is null/invalid
function safeFormat(dateStr: string | null | undefined, fallback = '—'): string {
  if (!dateStr) return fallback
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'dd MMM yyyy, HH:mm') : fallback
  } catch {
    return fallback
  }
}

export function SuccessScreen() {
  const { currentTransaction, reset } = usePaymentStore()
  const { download } = useDownloadReceipt()

  if (!currentTransaction) return null

  const t = currentTransaction

  // The transaction is pending when Celery hasn't vended the token yet —
  // show a "processing" state instead of crashing.
  const isPending = t.status === 'pending' || t.status === 'processing'

  function copyToken() {
    if (!t.token) return
    navigator.clipboard.writeText(t.token.replace(/\s/g, ''))
    toast.success('Token copied!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', textAlign: 'center' }}
    >
      {/* Ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ position: 'relative', width: 88, height: 88 }}
      >
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,200,83,0.2)' }}
        />
        <div style={{
          width: '100%', height: '100%',
          borderRadius: '50%',
          background: isPending
            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
            : 'linear-gradient(135deg, var(--green), var(--naija))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isPending ? '0 0 32px rgba(245,158,11,0.4)' : '0 0 32px rgba(0,200,83,0.4)',
        }}>
          {isPending
            ? <span style={{ fontSize: '36px' }}>⏳</span>
            : <CheckCircle2 size={40} color="white" strokeWidth={2.5} />
          }
        </div>
      </motion.div>

      {/* Title */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '26px', color: 'var(--black)', marginBottom: '6px' }}>
          {isPending ? 'Payment Received!' : 'Payment Successful!'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          ₦{Number(t.amount).toLocaleString('en-NG')} paid to {t.provider_name}
        </p>
        {isPending && (
          <p style={{ color: 'var(--gold)', fontSize: '13px', marginTop: '8px', padding: '8px 14px', background: 'rgba(255,213,79,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,213,79,0.15)' }}>
            ⚡ Your token is being vended — usually takes under 30 seconds. Refresh shortly.
          </p>
        )}
      </div>

      {/* Token box — only shown when token is available */}
      {t.token && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1.5px solid rgba(0,200,83,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
          }}
        >
          <p style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Your electricity token
          </p>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px', fontWeight: 800,
            color: 'var(--green)',
            letterSpacing: '6px',
            marginBottom: '14px',
          }}>
            {t.token}
          </div>
          {t.units && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {t.units} kWh
            </p>
          )}
          <Button variant="secondary" size="sm" icon={<Copy size={13} />} onClick={copyToken} style={{ width: '100%' }}>
            Copy token
          </Button>
          <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '10px' }}>
            Also sent via SMS to {t.phone.slice(0, 4)}****{t.phone.slice(-3)}
          </p>
        </motion.div>
      )}

      {/* Transaction details */}
      <div style={{
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        {[
          { label: 'Reference',   value: t.paystack_reference },
          { label: 'Meter',       value: t.meter_number },
          ...(t.account_name ? [{ label: 'Account', value: t.account_name }] : []),
          { label: 'Date',        value: safeFormat(t.created_at) },
          {
            label: 'Status',
            value: isPending
              ? <Badge variant="warning">Processing</Badge>
              : <Badge variant="success">Successful</Badge>
          },
        ].map((row, i, arr) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.label}</span>
            <span style={{
              fontSize: '13px', fontWeight: 600, color: 'var(--text)',
              fontFamily: row.label === 'Reference' || row.label === 'Meter' ? 'monospace' : 'inherit',
              textAlign: 'right', maxWidth: '60%',
            }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        {t.status === 'success' && (
          <Button
            variant="secondary"
            size="md"
            icon={<Download size={14} />}
            onClick={() => download(t.id, t.paystack_reference)}
            style={{ flex: 1 }}
          >
            Receipt PDF
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          icon={<RotateCcw size={14} />}
          onClick={reset}
          style={{
            width: '100%',
            // background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-red) 100%)',
            background: 'var(--black)',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            padding: '16px',
            color: '#f5f5f0',
            fontFamily: 'var(--font-medium)',
            fontWeight: 600,
            fontSize: '16px',
            cursor: 'pointer',
            // boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
            transition: 'var(--transition)',
            letterSpacing: '0.02em',
            marginBottom: '12px',
          }}
        >
          New payment
        </Button>
      </div>
    </motion.div>
  )
}