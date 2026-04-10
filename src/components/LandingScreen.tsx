import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, History, Wallet, ChevronRight, Zap } from 'lucide-react'
// import { NigerianSceneBackground } from '@/components/NigerianSceneBackground'
import { AdBackground } from './AdBackground'
import { useMediaQuery } from 'react-responsive'

interface Props {
  onSignIn: () => void
  onSignUp: () => void
  onGuest: () => void
}

const tips = [
  '⚡ Create an account for faster wallet checkout',
  '📊 Track your payment history',
  '💾 Saved details for one-tap recharges',
]

const BENEFITS = [
  {
    icon: <History size={16} />,
    title: 'Full payment history',
    body:  'See every bill you\'ve ever paid, download receipts anytime.',
  },
  {
    icon: <Wallet size={16} />,
    title: 'NOQ Wallet',
    body:  'Fund once, pay instantly — no card entry every time.',
  },
  {
    icon: <ShieldCheck size={16} />,
    title: 'Saved meters',
    body:  'Your meters are remembered — one tap to recharge.',
  },
]

export function LandingScreen({ onSignIn, onSignUp, onGuest }: Props) {
  const [tipDismissed, setTipDismissed] = useState(false)
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <div style={{
      minHeight: '100vh',
    //   background: 'var(--white-warm)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'center',
    }}>
      {/* Background scene — Nigerian landmarks, anchored bottom */}
      {/* <NigerianSceneBackground /> */}
      <AdBackground />

      <header className="app-header">
          <div style={{ display: 'flex', width: '100%', maxWidth: '1280px', justifyContent: 'space-between', alignItems: 'center', margin: '0 auto' }}>

            {/* Logo */}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', lineHeight: '28px', color: 'var(--black)' }}>
              NOQ
            </span>
            
              <button
                type="button"
                // onClick={() => openAuth('signin')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#111', border: '1px solid var(--border)',
                  borderRadius: '100px', padding: '12px 16px',
                  fontSize: '15px', color: '#fff', fontWeight: 500,
                  cursor: 'pointer', letterSpacing: '1px',
                }}
              >
                About Us
              </button>
          </div>
        </header>

      {/* Content layer */}
      <div style={{
        position: 'fixed',
        zIndex: 2,
        width: '90%',
        maxWidth: 512,
        // padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        // minHeight: '70vh',
        maxHeight: '60vh',
        backgroundColor: 'rgba(255, 255, 255)',
        borderRadius: 16,
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 11px 15px -7px, rgba(0, 0, 0, 0.14) 0px 24px 38px 3px, rgba(0, 0, 0, 0.12) 0px 9px 46px 8px;',
        alignItems: 'center',
        margin: 'auto',
        overflow: 'hidden',
      }}>

        {/* ── Top logo ── */}
        {/* <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ paddingTop: 52, marginBottom: 'auto' }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 32,
            color: '#111111',
            letterSpacing: '-1px',
          }}>
            NOQ
          </span>
        </motion.div> */}

        <div style={{
            width: '100%',
            overflowY: 'auto',
            padding: isMobile ? '32px 24px 20px' : '48px 48px 40px',
        }}>

        {/* ── Hero text ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 8vw, 44px)',
            fontWeight: 900,
            color: '#111111',
            lineHeight: 1.08,
            letterSpacing: '-1px',
            marginBottom: 14,
            textAlign: 'center',
          }}>
            Pay your bills.<br />
            No queue. Ever.
          </h1>
          {/* <p style={{
            fontSize: 16,
            color: '#4B5563',
            lineHeight: 1.65,
            maxWidth: 340,
          }}>
            Electricity, cable, water, airtime — paid in seconds.
            No bank visit, no waiting.
          </p> */}

          <div
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
                }}
                >
                {tips.map((tip, index) => (
                    <span key={index}>
                    {tip}
                    {index < tips.length - 1 }
                    </span>
                ))}
                </div>
        </motion.div>



        {/* ── Tip card — benefits of having an account ── */}
        {/* <AnimatePresence>
          {!tipDismissed && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(0,95,86,0.15)',
                borderRadius: 8,
                padding: '16px 18px',
                marginBottom: 20,
              }}
            > */}
              {/* Card header */}
              {/* <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: 'rgba(0,95,86,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={13} style={{ color: '#005F56' }} />
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: '#005F56', letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-display)',
                  }}>
                    Why create an account?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTipDismissed(true)}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9CA3AF',
                    fontSize: 18, lineHeight: 1, padding: '0 2px',
                  }}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div> */}

              {/* Benefit rows */}
              {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {BENEFITS.map(b => (
                  <div
                    key={b.title}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(0,95,86,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#005F56',
                    }}>
                      {b.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 1 }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                        {b.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}

        {/* ── CTA buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            // paddingBottom: 48,
          }}
        >
          {/* Primary — Sign in */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onSignIn}
            style={{
              width: '100%',
              padding: '16px',
              background: '#111111',
              border: 'none',
              borderRadius: 12,
              color: '#FFFFFF',
              fontFamily: 'var(--font-title)',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              letterSpacing: '-0.2px',
            }}
          >
            Sign in to your account
            <ChevronRight size={17} />
          </motion.button>

          {/* Secondary — Continue as guest */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onGuest}
            style={{
                background: 'rgb(240, 250, 248)',
                border: '1.5px solid rgba(0, 95, 86, 0.2)',
                borderRadius: 'var(--radius-xs)',
                padding: '15px',
                color: 'var(--primary)',
                fontFamily: 'var(--font-title)',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition)',
                width: '100%',
            }}
          >
            Continue as guest
          </motion.button>

          {/* Link — Sign up */}
          <div style={{ textAlign: 'center', paddingTop: 6 }}>
            <span style={{ fontSize: 14, color: '#9CA3AF' }}>
              Don't have an account?{' '}
            </span>
            <button
              type="button"
              onClick={onSignUp}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--green)',
                fontWeight: 500,
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                padding: 0,
                // textDecoration: 'underline',
                // textUnderlineOffset: 3,
              }}
            >
              Create one
            </button>
          </div>
        </motion.div>
        
        </div>

      </div>
    </div>
  )
}