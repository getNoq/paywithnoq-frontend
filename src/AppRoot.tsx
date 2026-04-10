/**
 * AppRoot — controls landing vs app, and which auth view opens first.
 *
 * Session logic:
 *   - Signed-in user (JWT in localStorage) → straight to app, no landing
 *   - Tab already entered (sessionStorage flag) → straight to app
 *   - Fresh visit → landing screen
 *   - Closing browser tab clears sessionStorage → next visit sees landing again
 */
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { LandingScreen } from '@/components/LandingScreen'
import { AppLayout } from '@/components/layout/AppLayout'

type Screen = 'landing' | 'app'
type AuthIntent = 'signin' | 'signup' | null

const SESSION_KEY = 'noq-entered'

export function AppRoot() {
  const { isAuthenticated } = useAuthStore()

  function getInitial(): Screen {
    if (isAuthenticated) return 'app'
    if (sessionStorage.getItem(SESSION_KEY)) return 'app'
    return 'landing'
  }

  const [screen, setScreen] = useState<Screen>(getInitial)
  const [authIntent, setAuthIntent] = useState<AuthIntent>(null)

  // If user signs in from within the app while on landing, go to app
  useEffect(() => {
    if (isAuthenticated) setScreen('app')
  }, [isAuthenticated])

  function enter(intent: AuthIntent = null) {
    sessionStorage.setItem(SESSION_KEY, '1')
    setAuthIntent(intent)
    setScreen('app')
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <LandingScreen
            onSignIn={() => enter('signin')}
            onSignUp={() => enter('signup')}
            onGuest={() => enter(null)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28 }}
        >
          <AppLayout initialAuthIntent={authIntent} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}