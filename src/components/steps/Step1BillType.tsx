import { motion, AnimatePresence } from 'framer-motion'
import { usePaymentStore } from '@/store/paymentStore'
import { BILL_OPTIONS, PROVIDERS_BY_BILL_TYPE } from '@/lib/data'
import type { BillType } from '@/types'
import { SecurityNote } from '../ui/SecurityNote'
import { useMediaQuery } from 'react-responsive';

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
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <p style={{ fontSize: isMobile ? '32px' : '40px', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--black)', marginBottom: '4px', letterSpacing: '-0.5px', lineHeight: isMobile ? '40px' : '48px', marginTop: '-16px', maxWidth: isMobile ? '100%' : '90%' }}>
        Get it done instantly with Noq
      </p>

      {/* Bill type grid */}
      <motion.div variants={fadeUp}>
        <p style={{ fontSize: '14px', fontFamily: 'var(--font-medium)', fontWeight: 600, color: 'var(--text)', marginBottom: '4px', letterSpacing: '0.5px' }}>
          What would you like to pay?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
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
                  background: isSelected ? 'var(--primary)' : opt.available ? '#F0FAF8' : '#F5F5F5 ',
                  border: `1px solid ${isSelected ? 'var(--primary)' : opt.available ? 'rgba(0, 95, 86, 0.2)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-xs)',
                  cursor: opt.available ? 'pointer' : 'not-allowed',
                  opacity: opt.available ? 1 : 1,
                  transition: 'var(--transition)',
                  boxShadow: isSelected ? '0 0 0 1px var(--primary), 0 4px 20px rgba(0,200,83,0.1)' : opt.available ? '0 0 0 1px rgba(0, 95, 86, 0.2)' : 'none',
                  outline: 'none',
                  position: 'relative',
                  justifyContent: 'center',
                }}
              >
                {!opt.available && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '6px',
                    fontSize: '9px', fontWeight: 600, letterSpacing: '0.5px',
                    background: 'var(--surface2)', color: 'var(--text-faint)',
                    padding: '2px 5px', borderRadius: '4px',
                    opacity: 0.4,
                  }}>
                    SOON
                  </span>
                )}
                
        {/* Green check */}
        {opt.available && isSelected && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '6px',
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--white)',
          color: 'var(--primary)', fontSize: '10px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
                  }}>
                    ✓
                  </span>
                )}
                <span style={{ fontSize: '24px', opacity: opt.available ? 1 : 0.4 }}>{opt.icon}</span>
                <span style={{
                  fontFamily: isSelected ? 'var(--font-semibold)' : 'var(--font-medium)',
                  fontSize: isMobile ? '12px' : '12px',
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? 'var(--white)' : opt.available ? '#005F56' : '#9CA3AF ',
                  letterSpacing: '0.5px',
                  lineHeight: isMobile ? '14px' : '14px'
                }}>
                  {opt.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Provider grid — same layout as bill type grid, revealed after selection */}
      {/* <AnimatePresence>
        {selectedBillType && providers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Select your distribution company
            </p> */}
            {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
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
            </div>  */}
            {/* Provider dropdown */}
{/* <div style={{ position: 'relative', width: '100%' }}> */}

  {/* Selected state display — acts as the trigger */}
  {/* <div
    style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '0 14px',
      height: '58px',
      background: 'var(--surface2)',
      border: `1.5px solid ${selectedProvider ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'var(--transition)',
      boxShadow: selectedProvider ? '0 0 0 3px rgba(0,200,83,0.1)' : 'none',
      position: 'relative',
    }}
  >
    {selectedProvider ? ( */}
      <>
        {/* Optional icon */}
        {/* <span style={{ fontSize: '18px', flexShrink: 0 }}>{selectedProvider.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px', fontWeight: 700,
            color: 'var(--green)',
            lineHeight: 1.2,
          }}>
            {selectedProvider.shortName}
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {selectedProvider.region}
          </div>
        </div> */}
        {/* Green check */}
        {/* <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--green)',
          color: 'white', fontSize: '10px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>✓</span> */}
      </>
    {/* // ) : (
    //   <span style={{ fontSize: '14px', color: 'var(--text-faint)', fontFamily: 'var(--font-body)' }}>
    //     Select your distribution company
    //   </span>
    // )} */}

    {/* Chevron */}
    {/* <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{
        position: 'absolute', right: '14px',
        color: selectedProvider ? 'var(--green)' : 'var(--text-faint)',
        pointerEvents: 'none', flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg> */}

    {/* Native select — invisible, covers the entire div */}
    {/* <select
      value={selectedProvider?.id ?? ''}
      onChange={e => {
        const found = providers.find(p => p.id === e.target.value)
        if (found) setProvider(found)
      }}
      style={{
        position: 'absolute', inset: 0,
        opacity: 0,
        width: '100%', height: '100%',
        cursor: 'pointer',
        // font-size >= 16px prevents iOS zoom on focus
        fontSize: '16px',
      }}
    >
      <option value="" disabled>Select distribution company</option>
      {providers.map(p => (
        <option key={p.id} value={p.id}>
          {p.shortName} - {p.region}
        </option>
      ))}
    </select>
  </div>
</div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Continue button — only appears once provider is selected */}
      <AnimatePresence>
        {/* {selectedProvider && ( */}
        {selectedBillType && providers.length > 0 && (
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
              }}
            >
              Continue with {selectedBillType}
            </button>
          </motion.div>
        )}
      </AnimatePresence>


        
        {/* {selectedProvider && ( */}
        {selectedBillType && providers.length > 0 && (
      <SecurityNote />
        )}
    </motion.div>
  )
}