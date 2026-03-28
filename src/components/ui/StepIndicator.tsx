import { motion } from 'framer-motion'
import type { Step } from '@/types'

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: 'Bill Type' },
  { n: 2, label: 'Details' },
  { n: 3, label: 'Confirm' },
]

export function StepIndicator({ current }: { current: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', marginBottom: '32px' }}>
      {STEPS.map((step, i) => {
        const done = current > step.n
        const active = current === step.n
        return (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <motion.div
                animate={{
                  background: done
                    ? 'linear-gradient(135deg, var(--green), var(--naija))'
                    : active
                    ? 'rgba(0,200,83,0.15)'
                    : 'var(--surface2)',
                  borderColor: done || active ? 'var(--green)' : 'var(--border)',
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  border: '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: done ? 'white' : active ? 'var(--green)' : 'var(--text-faint)',
                  flexShrink: 0,
                }}
              >
                {done ? '✓' : step.n}
              </motion.div>
              <span style={{
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: active ? 'var(--green)' : done ? 'var(--text-muted)' : 'var(--text-faint)',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: '22px', position: 'relative', background: 'var(--border)' }}>
                <motion.div
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, var(--green), var(--naija))',
                    borderRadius: '2px',
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}