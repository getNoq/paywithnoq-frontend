import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api, { fetchMe } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/primitives'
import { Input } from '@/components/ui/primitives'
import { EmailVerification } from './EmailVerification'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
  onSwitchToRegister: () => void
  onContinueAsGuest: () => void
}

export function SignIn({ onSuccess, onSwitchToRegister, onContinueAsGuest }: Props) {
  const { setTokens, setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  // If backend returns requires_verification, show verification screen
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      api.post('/auth/token/', { email: values.email, password: values.password }),
    onSuccess: async (response) => {
      const { access, refresh } = response.data
      setTokens(access, refresh)
      const me = await fetchMe()
      setUser(me)
      toast.success('Welcome back!')
      onSuccess()
    },
    onError: (err: any) => {
      const data = err?.response?.data

      // Backend sends 403 when email is not verified
      if (err?.response?.status === 403 && data?.requires_verification) {
        setPendingEmail(data.email)
        return
      }

      toast.error(data?.detail || 'Incorrect email or password.')
    },
  })

  // ── Verification screen ───────────────────────────────────────────────────
  if (pendingEmail) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="verify">
          <EmailVerification
            email={pendingEmail}
            onSuccess={onSuccess}
            onBack={() => setPendingEmail(null)}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  // ── Sign in form ──────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: 600, letterSpacing: '-1px', color: 'var(--black)', marginBottom: '2px' }}>
          Welcome back
        </h1>
        <p style={{ fontFamily: 'var(--font-medium)', fontSize: '12px', color: 'var(--text)' }}>
          Sign in to access your history and wallet
        </p>
      </div>

      <form onSubmit={handleSubmit(v => mutate(v))} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <Input
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          startIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          startIcon={<Lock size={15} />}
          error={errors.password?.message}
          verifyButton={
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                padding: '4px 6px',
              }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          {...register('password')}
        />

        <Button type="submit" variant="primary" size="lg" loading={isPending}
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
              }}>
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Guest option */}
      <button
        type="button"
        onClick={onContinueAsGuest}
        style={{
          background: 'rgb(240, 250, 248)',
          border: '1.5px solid rgba(0, 95, 86, 0.2)',
          borderRadius: 'var(--radius-xs)',
          padding: '13px',
          color: 'var(--primary)',
          fontFamily: 'var(--font-medium)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'var(--transition)',
          width: '100%',
        }}
      >
        Continue as guest - pay without account
      </button>

      {/* Switch to register */}
      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px' }}>
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--green)', fontWeight: 600, fontFamily: 'var(--font-body)',
            fontSize: '13px', padding: 0,
          }}
        >
          Create one
        </button>
      </p>
    </motion.div>
  )
}
