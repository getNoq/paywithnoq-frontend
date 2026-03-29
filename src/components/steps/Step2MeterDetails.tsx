import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

import { usePaymentStore } from '@/store/paymentStore'
import { useMeterLookup } from '@/hooks/useMeterLookup'
import { Input, Button, ToggleGroup } from '@/components/ui/primitives'
import { QUICK_AMOUNTS } from '@/lib/data'
import type { MeterType } from '@/types'
import { SecurityNote } from '../ui/SecurityNote'

const schema = z.object({
  meterNumber: z
    .string()
    .min(11, 'Meter number must be at least 11 digits')
    .max(13, 'Too long')
    .regex(/^\d+$/, 'Digits only'),
  phone: z
    .string()
    .regex(/^(070|080|081|090|091)\d{8}$/, 'Enter a valid Nigerian phone number'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

const METER_TYPES: { value: MeterType; label: string }[] = [
  { value: 'prepaid', label: '⚡ Prepaid' },
  { value: 'postpaid', label: '📋 Postpaid' },
]

const sectionCard: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: '0',
}

function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

export function Step2MeterDetails() {
  const { selectedProvider, setMeterInfo, setAmountContact } = usePaymentStore()

  const [meterType, setMeterType] = useState<MeterType>('prepaid')
  const [lookedUp, setLookedUp] = useState<{ accountName: string; address: string } | null>(null)
  const [amount, setAmount] = useState<string>('')

  const numAmount = parseFloat(amount) || 0
  const amountValid = numAmount >= 500

  const { mutate: lookup, isPending: looking } = useMeterLookup()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const meterNumber = watch('meterNumber')

  function handleLookup() {
    if (!meterNumber || meterNumber.length < 11) return
    lookup(
      { providerId: selectedProvider!.id, meterNumber, meterType },
      {
        onSuccess: (data) => {
          setLookedUp({ accountName: data.accountName, address: data.address })
          toast.success('Meter verified!')
        },
        onError: () => {
          setLookedUp(null)
          toast.error('Meter not found. Check the number and try again.')
        },
      }
    )
  }

  function onSubmit(values: FormValues) {
    if (!amountValid) {
      toast.error('Please enter an amount of at least ₦500')
      return
    }
    setMeterInfo({
      meterNumber: values.meterNumber,
      meterType,
      accountName: lookedUp?.accountName,
      address: lookedUp?.address,
    })
    setAmountContact(numAmount, values.phone, values.email ?? '')
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >

      {/* Provider banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px',
        background: 'rgba(0,200,83,0.06)',
        border: '1px solid rgba(0,200,83,0.15)',
        borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ fontSize: '20px' }}>{selectedProvider?.icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--green)' }}>
            {selectedProvider?.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedProvider?.region}</div>
        </div>
      </div>

      {/* ── Meter Details card ── */}
      <div style={sectionCard}>
        {/* <p style={sectionTitle}>Meter Details</p> */}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Meter type
          </span>
          <ToggleGroup options={METER_TYPES} value={meterType} onChange={setMeterType} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input
            label="Meter Number"
            placeholder="Enter 11-digit meter number"
            inputMode="numeric"
            maxLength={13}
            startIcon={<Zap size={15} />}
            error={errors.meterNumber?.message}
            {...register('meterNumber', { onChange: () => setLookedUp(null) })}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={looking}
            icon={<Search size={14} />}
            onClick={handleLookup}
            disabled={!meterNumber || meterNumber.length < 11}
          >
            Verify meter
          </Button>

          <AnimatePresence>
            {lookedUp && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px 14px',
                  background: 'rgba(0,200,83,0.06)',
                  border: '1px solid rgba(0,200,83,0.2)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <CheckCircle2 size={16} style={{ color: 'var(--green)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{lookedUp.accountName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{lookedUp.address}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {meterNumber?.length >= 11 && !lookedUp && !looking && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', color: 'var(--gold)',
              padding: '10px 14px',
              background: 'rgba(255,213,79,0.06)',
              border: '1px solid rgba(255,213,79,0.15)',
              borderRadius: 'var(--radius-md)',
            }}>
              <AlertCircle size={14} />
              Meter not verified — double-check before proceeding.
            </div>
          )}
        </div>

        <Input
          label="Phone Number"
          placeholder="08012345678"
          inputMode="tel"
          maxLength={11}
          prefix="📱"
          hint="Token will be sent via SMS to this number"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Email — optional */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Email Address
            </span>
            <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-faint)', background: 'var(--surface3)', padding: '2px 6px', borderRadius: '4px' }}>
              optional
            </span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '13px', fontSize: '15px', pointerEvents: 'none' }}>✉️</span>
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: `1.5px solid ${errors.email ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px 12px 40px',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                outline: 'none',
              }}
              {...register('email')}
            />
          </div>
          {errors.email && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{errors.email.message}</span>}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Receipt will be sent here</span>
        </div>
      </div>

      {/* ── Enter Amount card ── */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Enter Amount</p>

        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '20px', color: 'var(--green)', pointerEvents: 'none',
          }}>₦</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min={500}
            step={100}
            className='amount-input '
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: `2px solid ${amountValid && amount ? 'var(--green)' : !amount ? 'var(--border)' : 'var(--danger)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '13px 14px 13px 42px',
              color: 'var(--text)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              outline: 'none',
              transition: 'var(--transition)',
              boxShadow: amountValid && amount ? '0 0 0 4px rgba(0,200,83,0.08)' : 'none',
            }}
          />
        </div>

        {amount && !amountValid && (
          <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '-8px' }}>
            Minimum amount is ₦500
          </span>
        )}

        {/* Quick amounts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {QUICK_AMOUNTS.map(qa => (
            <motion.button
              key={qa}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmount(String(qa))}
              style={{
                padding: '8px 14px',
                background: numAmount === qa ? 'rgba(0,200,83,0.1)' : 'var(--surface2)',
                border: `1px solid ${numAmount === qa ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                color: numAmount === qa ? 'var(--green)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 600,
                fontFamily: 'var(--font-display)',
                cursor: 'pointer', outline: 'none',
                transition: 'var(--transition)',
              }}
            >
              {formatNaira(qa).replace('.00', '')}
            </motion.button>
          ))}
        </div>

        {/* Live total summary */}
        <AnimatePresence>
          {amountValid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '12px 14px',
                background: 'rgba(0,200,83,0.05)',
                border: '1px solid rgba(0,200,83,0.15)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total payable</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '18px', color: 'var(--green)',
              }}>
                {formatNaira(numAmount)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue */}
      
      {amountValid && (
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!amountValid}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, var(--green) 0%, var(--naija) 100%)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,200,83,0.25)',
          transition: 'var(--transition)',
        }}
      >
        Review & Pay {amountValid ? formatNaira(numAmount) : ''}
      </Button>
      )}
      
      {amountValid && (
        <SecurityNote />
      )}

    </motion.form>
  )
}