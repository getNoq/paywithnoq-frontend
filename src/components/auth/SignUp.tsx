import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { Button, Input } from '@/components/ui/primitives'
import { EmailVerification } from './EmailVerification'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  username: z.string().min(3, 'At least 3 characters').max(30).regex(/^\w+$/, 'Letters, numbers and underscores only'),
  phone:    z.string().regex(/^(070|080|081|090|091)\d{8}$/, 'Enter a valid Nigerian phone number'),
  password: z.string().min(8, 'At least 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
  onSwitchToSignIn: () => void
  onContinueAsGuest: () => void
}

export function SignUp({ onSuccess, onSwitchToSignIn, onContinueAsGuest }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  // After register succeeds, switch to verification screen
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      api.post('/auth/register/', {
        email:    values.email,
        username: values.username,
        phone:    values.phone,
        password: values.password,
      }),
    onSuccess: (_, variables) => {
      // Show verification screen — do NOT sign in yet
      setPendingEmail(variables.email)
    },
    onError: (err: any) => {
      const data = err?.response?.data
      const first =
        data?.email?.[0] ||
        data?.username?.[0] ||
        data?.phone?.[0] ||
        data?.detail ||
        'Registration failed. Please try again.'
      toast.error(first)
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

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: 600, letterSpacing: '-1px', color: 'var(--black)', marginBottom: '2px' }}>
          Create account
        </h1>
        <p style={{ fontFamily: 'var(--font-medium)', fontSize: '12px', color: 'var(--text)' }}>
          Save history, use your wallet, pay faster
        </p>
      </div>

      <form
        onSubmit={handleSubmit(v => mutate(v))}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
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
          label="Username"
          autoComplete="username"
          startIcon={<User size={15} />}
          hint="Letters, numbers and underscores"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          maxLength={11}
          autoComplete="tel"
          startIcon={<Phone size={15} />}
          hint="Your token will be sent to this number"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          startIcon={<Lock size={15} />}
          hint="At least 8 characters"
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

        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          startIcon={<Lock size={15} />}
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isPending}
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
                // textTransform: 'uppercase',
                // boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
                transition: 'var(--transition)',
                letterSpacing: '0.02em',
              }}
        >
          Create account
        </Button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Guest */}
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

      {/* Switch */}
      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--green)', fontWeight: 600,
            fontFamily: 'var(--font-body)', fontSize: '13px', padding: 0,
          }}
        >
          Sign in
        </button>
      </p>
    </motion.div>
  )
}
