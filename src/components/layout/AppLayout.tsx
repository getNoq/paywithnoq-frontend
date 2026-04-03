import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Receipt } from 'lucide-react'
import { usePaymentStore } from '@/store/paymentStore'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Step1BillType } from '@/components/steps/Step1BillType'
import { Step2MeterDetails } from '@/components/steps/Step2MeterDetails'
import { Step3Confirm } from '@/components/steps/Step3Confirm'
import { SuccessScreen } from '@/components/steps/SuccessScreen'
import { TransactionHistory } from '@/components/TransactionHistory'
import { AdBackground } from '@/components/AdBackground'
import { billTypeLabels } from '@/types'
import { BillsSceneBackground } from '../Billsscenebackground'

type Tab = 'pay' | 'history'

const NAV = [
  { id: 'pay' as Tab,     icon: Zap,     label: 'Pay' },
  { id: 'history' as Tab, icon: Receipt, label: 'History' },
]

function PayStep() {
  const { step, currentTransaction } = usePaymentStore()
  if (currentTransaction) return <SuccessScreen />
  return (
    <AnimatePresence mode="wait">
      {step === 1 && <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Step1BillType /></motion.div>}
      {step === 2 && <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Step2MeterDetails /></motion.div>}
      {step === 3 && <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Step3Confirm /></motion.div>}
    </AnimatePresence>
  )
}

function StepHeading() {
  const { step, selectedBillType, currentTransaction } = usePaymentStore()
  if (currentTransaction) return null
  const headings: Record<number, { title: string; sub: string }> = {
    1: { title: 'Pay your bills instantly with noq', sub: selectedBillType ? '' : '' },
    // 1: { title: 'New Payment', sub: selectedBillType ? '' : '' },
    // 2: { title: 'Payment Details', sub: selectedBillType ? `Pay your ${billTypeLabels[selectedBillType]} bill instantly` : '' },
    2: { title: 'Payment Details', sub: selectedBillType ? '' : '' },
    // 3: { title: 'Confirm Payment', sub: 'Review before you pay' },
    3: { title: 'Confirm Payment', sub: '' },
  }
  const h = headings[step]
  return (
    <div style={{ marginBottom: '16px' }}>
      <h1 className='app-title'>{h.title}</h1>
      {h.sub && <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{h.sub}</p>}
    </div>
  )
}

export function AppLayout() {
  const contentRef = useRef<HTMLDivElement>(null)

  const [tab, setTab] = useState<Tab>('pay')
  const { step, currentTransaction, setStep } = usePaymentStore()

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [step, tab]) // include tab too if switching views

  function handleBack() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3)
  }

  return (
    <>
      <BillsSceneBackground />
      {/* Ad background — sits behind everything */}
      {/* <AdBackground /> */}

      {/* <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 80px',
        position: 'relative',
        zIndex: 1,
      }}> */}
      {/* <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // centers main vertically
        padding: '80px 0 80px', // top = header height, bottom = nav
        position: 'relative',
        zIndex: 1,
      }}> */}
      <div className="app-container">

        {/* Header */}
        {/* <header style={{
          width: '100%', maxWidth: '100%',
          padding: '20px 20px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '4px',
        }}> */}
        {/* <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
          background: 'rgba(9,13,12,0.85)',
          backdropFilter: 'blur(10px)',
        }}> */}
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              {/* <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, var(--green), var(--naija))',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 0 16px rgba(0,200,83,0.25)',
              }}>⚡</div> */}
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', lineHeight: '32px', color: 'var(--white)' }}>
                {/* PayWith */}
                <span style={{ color: 'var(--white)' }}>NOQ</span>
              </span>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(23, 32, 25, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            borderRadius: '20px', padding: '4px 12px',
            fontSize: '12px', color: 'var(--text-muted)',
          }}>
            🇳🇬 Nigeria
          </div>
        </header>

        {/* Main content */}
        {/* <main style={{ width: '100%', maxWidth: 520, padding: '24px', flex: 1, borderRadius: '16px', backgroundColor: 'rgba(23, 32, 25, 0.7)' }}> */}
        {/* <main style={{
          width: '90%', // mobile default
          maxWidth: 520,
          height: '70vh',
          borderRadius: '16px',
          backgroundColor: 'rgba(23, 32, 25, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // IMPORTANT
        }}> */}
        <main className="app-main">
          {/* <div style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}> */}
          {/* <div className="app-main-content"> */}
          <div ref={contentRef} className="app-main-content">
          {tab === 'pay' && (
            <>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'flex-start',
                }}>
              {step > 1 && !currentTransaction && (
                <button
                  onClick={handleBack}
                  style={{
                    // background: 'rgba(23, 32, 25, 0.7)',
                    background: 'transparent',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '6px 10px',
                    color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'var(--transition)',
                    outline: 'none',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      stroke-width="2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg> 
                Back
                </button>
              )}
              <StepHeading />
              </div>
              {/* <StepIndicator current={step as 1 | 2 | 3} /> */}
              {/* <StepHeading /> */}
              <PayStep />
            </>
          )}
          {tab === 'history' && <TransactionHistory />}
          </div>
        </main>

        {/* Bottom nav */}
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          padding: '0 20px 24px',
          // background: 'linear-gradient(to top, rgba(9,13,12,0.97) 60%, transparent)',
          // background: 'var(--white-warm)',
          zIndex: 50,
        }}>
          <div style={{
            display: 'flex',
            background: 'var(--white)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '6px',
            gap: '4px',
            // boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {NAV.map(({ id, icon: Icon, label }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: active ? 'var(--surface)' : 'transparent',
                    color: active ? 'var(--white)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-semibold)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    outline: 'none',
                    boxShadow: active ? '0 0 0 1px var(--white)' : 'none',
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              )
            })}
          </div>
        </nav>

      </div>
    </>
  )
}