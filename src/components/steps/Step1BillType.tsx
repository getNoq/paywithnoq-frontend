import { motion, AnimatePresence } from 'framer-motion'
import { usePaymentStore } from '@/store/paymentStore'
import { BILL_OPTIONS, PROVIDERS_BY_BILL_TYPE } from '@/lib/data'
import type { BillType } from '@/types'
import { SecurityNote } from '../ui/SecurityNote'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.05 } },
}

export function Step1BillType() {
  const { selectedBillType, selectedProvider, setBillType, setProvider } = usePaymentStore()
  const providers = selectedBillType ? (PROVIDERS_BY_BILL_TYPE[selectedBillType] ?? []) : []

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Bill type grid */}
      <motion.div variants={fadeUp}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          What would you like to pay?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {BILL_OPTIONS.map(opt => {
            const isSelected = selectedBillType === opt.id
            return (
              <motion.button
                key={opt.id}
                type="button"
                whileTap={{ scale: opt.available ? 0.97 : 1 }}
                onClick={() => opt.available && setBillType(opt.id as BillType)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '16px 10px',
                  background: isSelected ? 'rgba(0,200,83,0.07)' : 'var(--surface)',
                  border: `1.5px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: opt.available ? 'pointer' : 'not-allowed',
                  opacity: opt.available ? 1 : 0.4,
                  transition: 'var(--transition)',
                  boxShadow: isSelected ? '0 0 0 1px var(--green), 0 4px 20px rgba(0,200,83,0.1)' : 'none',
                  outline: 'none',
                  position: 'relative',
                }}
              >
                {!opt.available && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '6px',
                    fontSize: '9px', fontWeight: 600, letterSpacing: '0.5px',
                    background: 'var(--surface3)', color: 'var(--text-faint)',
                    padding: '2px 5px', borderRadius: '4px',
                  }}>
                    SOON
                  </span>
                )}
                <span style={{ fontSize: '24px' }}>{opt.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px', fontWeight: 700,
                  color: isSelected ? 'var(--green)' : 'var(--text)',
                }}>
                  {opt.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Provider grid — same layout as bill type grid, revealed after selection */}
      <AnimatePresence>
        {selectedBillType && providers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Select your distribution company
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {providers.map((p, i) => {
                const isSelected = selectedProvider?.id === p.id
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setProvider(p)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      padding: '16px 10px',
                      background: isSelected ? 'rgba(0,200,83,0.07)' : 'var(--surface)',
                      border: `1.5px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      boxShadow: isSelected ? '0 0 0 1px var(--green), 0 4px 20px rgba(0,200,83,0.1)' : 'none',
                      outline: 'none',
                      position: 'relative',
                    }}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <span style={{
                        position: 'absolute', top: '6px', right: '6px',
                        fontSize: '10px', fontWeight: 700,
                        background: 'var(--green)',
                        color: 'white',
                        width: '16px', height: '16px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1,
                      }}>
                        ✓
                      </span>
                    )}
                    <span style={{ fontSize: '24px' }}>{p.icon}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '12px', fontWeight: 700,
                      color: isSelected ? 'var(--green)' : 'var(--text)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}>
                      {p.shortName}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: isSelected ? 'var(--green)' : 'var(--text-faint)',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      opacity: 0.8,
                    }}>
                      {p.region.split('/')[0].trim()}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button — only appears once provider is selected */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => usePaymentStore.getState().setStep(2)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--green) 0%, var(--naija) 100%)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                color: 'white',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
                transition: 'var(--transition)',
              }}
            >
              Continue with {selectedProvider.shortName} →
            </button>
          </motion.div>
        )}
      </AnimatePresence>


        
        {selectedProvider && (
      <SecurityNote />
        )}
    </motion.div>
  )
}