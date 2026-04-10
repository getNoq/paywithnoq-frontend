import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Mail, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/primitives'
import api from '@/lib/api'

interface Props {
  email: string
  onSuccess: () => void
  onBack: () => void
}

export function EmailVerification({ email, onSuccess, onBack }: Props) {
  const { setTokens, setUser } = useAuthStore()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // ── Verify mutation ───────────────────────────────────────────────────────
  const { mutate: verify, isPending: verifying } = useMutation({
    mutationFn: (fullCode: string) =>
      api.post('/auth/verify-email/', { email, code: fullCode }),
    onSuccess: (response) => {
      const data = response.data
      setTokens(data.access, data.refresh)
      setUser({
        id:       data.id ?? '',
        email:    data.email,
        username: data.username,
        phone:    data.phone ?? '',
      })
      toast.success('Email verified! Welcome to NOQ.')
      onSuccess()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Invalid code. Please try again.'
      toast.error(msg)
      // Clear code on error so user can re-enter
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    },
  })

  // ── Resend mutation ───────────────────────────────────────────────────────
  const { mutate: resend, isPending: resending } = useMutation({
    mutationFn: () => api.post('/auth/resend-code/', { email }),
    onSuccess: () => {
      toast.success('New code sent to your email.')
      setCooldown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Could not resend. Please try again.'
      toast.error(msg)
    },
  })

  // ── Input handlers ────────────────────────────────────────────────────────
  function handleChange(index: number, value: string) {
    // Only accept digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = digit
    setCode(next)

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 filled
    if (digit && index === 5) {
      const full = next.join('')
      if (full.length === 6) verify(full)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const full = code.join('')
      if (full.length === 6) verify(full)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...code]
    pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d })
    setCode(next)
    // Focus last filled or last
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
    if (pasted.length === 6) verify(pasted)
  }

  const isFilled = code.every(d => d !== '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0', alignItems: 'center' }}
    >
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: '16px', marginBottom: '12px',
        background: 'rgba(0,200,83,0.1)', border: '1.5px solid rgba(0,200,83,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Mail size={24} style={{ color: 'var(--green)' }} />
      </div>

      <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '24px', fontWeight: 600, color: 'var(--black)', marginBottom: '8px' }}>
        Check your email
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6, maxWidth: 320, textAlign: 'center' }}>
        We sent a 6-digit code to{' '}
        <span style={{ color: 'var(--green)', fontWeight: 600 }}>{email}</span>.
        Enter it below to verify your account.
      </p>

      {/* 6-digit code inputs */}
      <div
        onPaste={handlePaste}
        style={{ display: 'flex', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}
      >
        {code.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 56, height: 56,
              textAlign: 'center',
              fontSize: '24px',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              background: '#fff',
              border: `2px solid ${digit ? 'var(--green)' : '#D0D5DD'}`,
              borderRadius: 'var(--radius-xs)',
              color: 'var(--text)',
              outline: 'none',
              transition: 'var(--transition)',
              caretColor: 'var(--green)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 1px var(--primary)' }}
            onBlur={e => { e.target.style.borderColor = digit ? 'var(--primary)' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
        ))}
      </div>

      {/* Verify button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        loading={verifying}
        disabled={!isFilled}
        onClick={() => verify(code.join(''))}
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
          marginBottom: '16px',
        }}>
        Verify email
      </Button>

      {/* Resend */}
      <div style={{ textAlign: 'center' }}>
        {cooldown > 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
            Resend code in {cooldown}s
          </p>
        ) : (
          <button
            type="button"
            onClick={() => resend()}
            disabled={resending}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--green)', fontSize: '13px',
              fontFamily: 'var(--font-body)',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            <RefreshCw size={13} style={resending ? { animation: 'spin 0.7s linear infinite' } : {}} />
            {resending ? 'Sending…' : "Didn't get a code? Resend"}
          </button>
        )}
      </div>

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: '20px', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-faint)',
          fontSize: '13px', fontFamily: 'var(--font-body)',
        }}
      >
        ← Use a different email
      </button>
    </motion.div>
  )
}