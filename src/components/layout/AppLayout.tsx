import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Receipt, User, LogOut, Wallet } from 'lucide-react'
import { usePaymentStore } from '@/store/paymentStore'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { useAuthStore } from '@/store/authStore'
import { Step1BillType } from '@/components/steps/Step1BillType'
import { Step2MeterDetails } from '@/components/steps/Step2MeterDetails'
import { Step3Confirm } from '@/components/steps/Step3Confirm'
import { SuccessScreen } from '@/components/steps/SuccessScreen'
import { TransactionHistory } from '@/components/TransactionHistory'
import { AdBackground } from '@/components/AdBackground'
import { billTypeLabels } from '@/types'
import { SignIn } from '@/components/auth/SignIn'
import { SignUp } from '@/components/auth/SignUp'
import { BillsSceneBackground } from '../BillsSceneBackground'
import toast from 'react-hot-toast'

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'pay' | 'history' | 'auth'
type AuthView = 'signin' | 'signup'

// ── Pay steps ─────────────────────────────────────────────────────────────────
function PayStep({ onOpenWallet }: { onOpenWallet: () => void }) {
  const { step, currentTransaction } = usePaymentStore()
  if (currentTransaction) return <SuccessScreen />
  return (
    <AnimatePresence mode="wait">
      {step === 1 && <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Step1BillType onOpenWallet={onOpenWallet} /></motion.div>}
      {step === 2 && <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Step2MeterDetails /></motion.div>}
      {step === 3 && <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Step3Confirm /></motion.div>}
    </AnimatePresence>
  )
}

// ── Step heading ──────────────────────────────────────────────────────────────
function StepHeading() {
  const { step, selectedBillType, currentTransaction } = usePaymentStore()
  if (currentTransaction) return null
  const headings: Record<number, { title: string; sub: string }> = {
    // 1: { title: 'Pay your bills instantly with noq', sub: selectedBillType ? '' : '' },
    1: { title: '', sub: selectedBillType ? '' : '' },
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

// ── Auth tab — inline sign in / sign up, no modal ─────────────────────────────
interface AuthTabProps {
  defaultView?: AuthView
  onSuccess: () => void
  onContinueAsGuest: () => void
}

function AuthTab({ defaultView = 'signin', onSuccess, onContinueAsGuest }: AuthTabProps) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const [view, setView] = useState<AuthView>(defaultView)

  // ── Signed-in profile view ────────────────────────────────────────────────
  if (isAuthenticated && user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        {/* Avatar card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--green), var(--naija))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '20px', color: 'white',
          }}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--white)' }}>
              {user.username}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        </div>

        {/* Menu items */}
        {[
          {
            icon: <Wallet size={16} />,
            label: 'My Wallet',
            sub: 'Balance & top-up — coming soon',
            onClick: () => toast('Wallet feature coming soon!'),
          },
          {
            icon: <Receipt size={16} />,
            label: 'Transaction History',
            sub: 'View all your payments',
            onClick: () => toast('Switch to the History tab'),
          },
        ].map(item => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 16px', width: '100%', textAlign: 'left',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ color: 'var(--green)', flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {item.sub}
              </div>
            </div>
          </button>
        ))}

        {/* Sign out */}
        <button
          type="button"
          onClick={() => { logout(); toast.success('Signed out') }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '13px', width: '100%', marginTop: '4px',
            background: 'transparent', border: '1px solid rgba(255,82,82,0.2)',
            borderRadius: 'var(--radius-md)', color: 'var(--danger)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontWeight: 500, fontSize: '14px', transition: 'var(--transition)',
          }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </motion.div>
    )
  }

  // ── Not signed in — show SignIn / SignUp inline ────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {view === 'signin' ? (
        <motion.div key="signin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <SignIn
            onSuccess={onSuccess}
            onSwitchToRegister={() => setView('signup')}
            onContinueAsGuest={onContinueAsGuest}
          />
        </motion.div>
      ) : (
        <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <SignUp
            onSuccess={onSuccess}
            onSwitchToSignIn={() => setView('signin')}
            onContinueAsGuest={onContinueAsGuest}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── App layout ────────────────────────────────────────────────────────────────
export function AppLayout() {
  const contentRef = useRef<HTMLDivElement>(null)

  const [tab, setTab] = useState<Tab>('pay')
  const [authDefaultView, setAuthDefaultView] = useState<AuthView>('signin')
  const { step, currentTransaction, setStep } = usePaymentStore()
  const { isAuthenticated, user } = useAuthStore()

  // Scroll to top on step or tab change
  useEffect(() => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [step, tab])

  function handleBack() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3)
  }

  // Opens auth tab — call this from header button, wallet card, history prompt
  function openAuth(view: AuthView = 'signin') {
    setAuthDefaultView(view)
    setTab('auth')
  }

  // After successful sign-in go back to pay tab
  function handleAuthSuccess() {
    setTab('pay')
    toast.success('Welcome!')
  }

  // Guest — close auth tab, go back to pay
  function handleContinueAsGuest() {
    setTab('pay')
  }

  const NAV = [
    { id: 'pay'     as Tab, icon: Zap,     label: 'Pay' },
    { id: 'history' as Tab, icon: Receipt, label: 'History' },
    // 'auth' tab is NOT in the nav — it's opened programmatically
  ]

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
          <div style={{ display: 'flex', width: '100%', maxWidth: '1280px', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto' }}>

            {/* Logo */}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', lineHeight: '28px', color: 'var(--white)' }}>
              NOQ
            </span>

            {/* Auth button */}
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => openAuth('signin')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: '100px', padding: '8px 16px',
                  fontSize: '15px', color: '#111', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setTab('auth')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(23,32,25,0.7)', backdropFilter: 'blur(8px)',
                  border: '1px solid var(--border)', borderRadius: '20px',
                  padding: '4px 10px 4px 6px', fontSize: '13px', color: 'var(--green)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--green), var(--naija))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 800, color: 'white',
                }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                {user?.username}
              </button>
            )}
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

        {/* ── Main ── */}
        <main className="app-main">
          {/* <div style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}> */}
          {/* <div className="app-main-content"> */}
          <div ref={contentRef} className="app-main-content">

            {/* ── Pay tab ── */}
            {tab === 'pay' && (
              <>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center'}}>
                  {step > 1 && !currentTransaction && (
                    <button
                      type="button"
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
                        gap: '4px',
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Back
                    </button>
                  )}
                  <StepHeading />
                </div>
              {/* <StepIndicator current={step as 1 | 2 | 3} /> */}
              {/* <StepHeading /> */}
                <PayStep onOpenWallet={() => openAuth('signin')} />
              </>
            )}

            {/* ── History tab ── */}
            {tab === 'history' && (
              <TransactionHistory
                onSignInRequest={() => openAuth('signin')}
              />
            )}

            {/* ── Auth tab — full inline, no modal ── */}
            {tab === 'auth' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Back to pay if coming from auth */}
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setTab('pay')}
                    style={{
                      background: 'transparent', border: '1.5px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', padding: '6px 10px',
                      color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center',
                      gap: '4px', marginBottom: '24px',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                  </button>
                )}
                <AuthTab
                  key={authDefaultView}
                  defaultView={authDefaultView}
                  onSuccess={handleAuthSuccess}
                  onContinueAsGuest={handleContinueAsGuest}
                />
              </motion.div>
            )}

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
                  type="button"
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