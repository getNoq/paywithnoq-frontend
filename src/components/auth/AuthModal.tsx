import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { SignIn } from './SignIn'
import { SignUp } from './SignUp'

type AuthView = 'signin' | 'signup'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultView?: AuthView
}

export function AuthModal({ isOpen, onClose, onSuccess, defaultView = 'signin' }: Props) {
  const [view, setView] = useState<AuthView>(defaultView)

  function handleSuccess() {
    onSuccess()
    onClose()
  }

  function handleGuest() {
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 200,
            }}
          />

          {/* Sheet — slides up from bottom */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              zIndex: 201,
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 24px 48px',
              maxWidth: '520px',
              margin: '0 auto',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderBottom: 'none',
            }}
          >
            {/* Handle bar */}
            <div style={{
              width: 40, height: 4,
              background: 'var(--border)',
              borderRadius: 2,
              margin: '0 auto 24px',
            }} />

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 20, right: 20,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
              }}
            >
              <X size={15} />
            </button>

            {/* Content */}
            <AnimatePresence mode="wait">
              {view === 'signin' ? (
                <motion.div key="signin">
                  <SignIn
                    onSuccess={handleSuccess}
                    onSwitchToRegister={() => setView('signup')}
                    onContinueAsGuest={handleGuest}
                  />
                </motion.div>
              ) : (
                <motion.div key="signup">
                  <SignUp
                    onSuccess={handleSuccess}
                    onSwitchToSignIn={() => setView('signin')}
                    onContinueAsGuest={handleGuest}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
