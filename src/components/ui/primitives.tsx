import React from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx('btn', `btn--${variant}`, `btn--${size}`, className)}
      style={buttonStyle(variant, size)}
      {...props}
    >
      {loading ? <Loader2 size={16} className="spin" /> : icon}
      {children}
    </button>
  )
}

function buttonStyle(variant: string, size: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--transition)',
    whiteSpace: 'nowrap',
    outline: 'none',
    fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px',
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '16px 28px' : '11px 20px',
  }
  if (variant === 'primary') return {
    ...base,
    background: 'linear-gradient(135deg, var(--green) 0%, var(--naija) 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
  }
  if (variant === 'secondary') return {
    ...base,
    background: 'var(--surface2)',
    color: 'var(--text)',
    border: '1.5px solid var(--border)',
  }
  if (variant === 'ghost') return {
    ...base,
    background: 'transparent',
    color: 'var(--text-muted)',
  }
  if (variant === 'danger') return {
    ...base,
    background: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid rgba(255,82,82,0.2)',
  }
  return base
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {prefix && (
            <span style={{
              position: 'absolute', left: '13px',
              color: error ? 'var(--danger)' : 'var(--green)',
              fontSize: '14px', pointerEvents: 'none',
              display: 'flex', alignItems: 'center',
            }}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: `12px 14px 12px ${prefix ? '40px' : '14px'}`,
              paddingRight: suffix ? '40px' : '14px',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              outline: 'none',
              transition: 'var(--transition)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--green)'
              e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(255,82,82,0.1)' : 'rgba(0,200,83,0.1)'}`
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            {...props}
          />
          {suffix && (
            <span style={{
              position: 'absolute', right: '13px',
              color: 'var(--text-muted)', fontSize: '13px',
              pointerEvents: 'none', display: 'flex', alignItems: 'center',
            }}>
              {suffix}
            </span>
          )}
        </div>
        {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
        {hint && !error && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  color: 'var(--text-muted)',
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  selected?: boolean
  hoverable?: boolean
}

export function Card({ children, style, onClick, selected, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? 'rgba(0,200,83,0.06)' : 'var(--surface)',
        border: `1.5px solid ${selected ? 'var(--green)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'var(--transition)',
        boxShadow: selected ? '0 0 0 1px var(--green), 0 4px 24px rgba(0,200,83,0.12)' : 'none',
        ...(hoverable && !selected ? { ':hover': { borderColor: 'var(--border-hover)' } } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    success: { bg: 'rgba(0,200,83,0.1)', color: 'var(--green)', border: 'rgba(0,200,83,0.2)' },
    warning: { bg: 'var(--gold-bg)', color: 'var(--gold)', border: 'rgba(255,213,79,0.2)' },
    danger:  { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'rgba(255,82,82,0.2)' },
    info:    { bg: 'rgba(64,196,255,0.08)', color: '#40c4ff', border: 'rgba(64,196,255,0.2)' },
    neutral: { bg: 'var(--surface2)', color: 'var(--text-muted)', border: 'var(--border)' },
  }
  const c = colors[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '11px', fontWeight: 600,
      padding: '3px 10px', borderRadius: '20px',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.3px',
    }}>
      {children}
    </span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (!label) return (
    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
      <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
      <span style={{ fontSize: '11px', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{label}</span>
      <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

interface ToggleGroupProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

export function ToggleGroup<T extends string>({ options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${options.length}, 1fr)`,
      gap: '6px',
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '4px',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: '9px 12px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            background: value === opt.value ? 'var(--surface3)' : 'transparent',
            color: value === opt.value ? 'var(--green)' : 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'var(--transition)',
            outline: 'none',
            boxShadow: value === opt.value ? '0 0 0 1px var(--border-hover)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <Loader2
      size={size}
      style={{ animation: 'spin 0.7s linear infinite', color: 'var(--green)' }}
    />
  )
}

// Inject keyframe once
if (typeof document !== 'undefined') {
  if (!document.getElementById('spin-kf')) {
    const s = document.createElement('style')
    s.id = 'spin-kf'
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
    document.head.appendChild(s)
  }
}
