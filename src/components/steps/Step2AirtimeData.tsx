import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Wifi } from 'lucide-react'
import { usePaymentStore } from '@/store/paymentStore'
import { Input } from '../ui/primitives'

// ── Network detection from phone prefix ──────────────────────────────────────
const NETWORK_PREFIXES: Record<string, { id: string; name: string; color: string; icon: string }> = {
  '0803': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0806': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0813': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0816': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0703': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0706': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0810': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0814': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0903': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0906': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0913': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },
  '0916': { id: 'mtn', name: 'MTN', color: '#FFC300', icon: '🟡' },

  '0802': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0808': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0812': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0701': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0708': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0902': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0907': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0901': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0904': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },
  '0912': { id: 'airtel', name: 'Airtel', color: '#E22222', icon: '🔴' },

  '0805': { id: 'glo', name: 'Glo', color: '#00A651', icon: '🟢' },
  '0807': { id: 'glo', name: 'Glo', color: '#00A651', icon: '🟢' },
  '0811': { id: 'glo', name: 'Glo', color: '#00A651', icon: '🟢' },
  '0815': { id: 'glo', name: 'Glo', color: '#00A651', icon: '🟢' },
  '0705': { id: 'glo', name: 'Glo', color: '#00A651', icon: '🟢' },
  '0905': { id: 'glo', name: 'Glo', color: '#00A651', icon: '🟢' },

  '0809': { id: '9mobile', name: '9mobile', color: '#006633', icon: '💚' },
  '0817': { id: '9mobile', name: '9mobile', color: '#006633', icon: '💚' },
  '0818': { id: '9mobile', name: '9mobile', color: '#006633', icon: '💚' },
  '0908': { id: '9mobile', name: '9mobile', color: '#006633', icon: '💚' },
  '0909': { id: '9mobile', name: '9mobile', color: '#006633', icon: '💚' },
}

const NETWORKS = [
  {
    id: 'mtn',
    name: 'MTN',
    icon: 'images/networks/mtn.svg',
    color: '#FFC300',
  },
  {
    id: 'airtel',
    name: 'Airtel',
    icon: 'images/networks/airtel.png',
    color: '#E22222',
  },
  {
    id: 'glo',
    name: 'Glo',
    icon: 'images/networks/glo.webp',
    color: '#00A651',
  },
  {
    id: '9mobile',
    name: '9mobile',
    icon: 'images/networks/9mobile.png',
    color: '#006633',
  },
]

// ── Data plans per network ────────────────────────────────────────────────────
const DATA_PLANS: Record<string, Array<{ code: string; name: string; amount: number; validity: string }>> = {
  mtn: [
    { code: 'mtn-100mb-1day',  name: '100MB',  amount: 100,  validity: '1 day' },
    { code: 'mtn-1gb-1day',    name: '1GB',    amount: 300,  validity: '1 day' },
    { code: 'mtn-2gb-2days',   name: '2GB',    amount: 500,  validity: '2 days' },
    { code: 'mtn-3gb-7days',   name: '3GB',    amount: 1000, validity: '7 days' },
    { code: 'mtn-5gb-30days',  name: '5GB',    amount: 1500, validity: '30 days' },
    { code: 'mtn-10gb-30days', name: '10GB',   amount: 2500, validity: '30 days' },
    { code: 'mtn-20gb-30days', name: '20GB',   amount: 3500, validity: '30 days' },
    { code: 'mtn-50gb-30days', name: '50GB',   amount: 8000, validity: '30 days' },
  ],
  airtel: [
    { code: 'airtel-100mb-1day',  name: '100MB', amount: 100,  validity: '1 day' },
    { code: 'airtel-1gb-1day',    name: '1GB',   amount: 300,  validity: '1 day' },
    { code: 'airtel-2gb-30days',  name: '2GB',   amount: 1000, validity: '30 days' },
    { code: 'airtel-5gb-30days',  name: '5GB',   amount: 1500, validity: '30 days' },
    { code: 'airtel-10gb-30days', name: '10GB',  amount: 2500, validity: '30 days' },
    { code: 'airtel-20gb-30days', name: '20GB',  amount: 3500, validity: '30 days' },
  ],
  glo: [
    { code: 'glo-200mb-3days',  name: '200MB', amount: 200,  validity: '3 days' },
    { code: 'glo-1gb-7days',    name: '1GB',   amount: 500,  validity: '7 days' },
    { code: 'glo-3gb-30days',   name: '3GB',   amount: 1000, validity: '30 days' },
    { code: 'glo-5gb-30days',   name: '5GB',   amount: 1500, validity: '30 days' },
    { code: 'glo-10gb-30days',  name: '10GB',  amount: 2500, validity: '30 days' },
    { code: 'glo-15gb-30days',  name: '15GB',  amount: 3000, validity: '30 days' },
  ],
  '9mobile': [
    { code: '9mobile-150mb-7days',  name: '150MB', amount: 200,  validity: '7 days' },
    { code: '9mobile-1gb-30days',   name: '1GB',   amount: 500,  validity: '30 days' },
    { code: '9mobile-2gb-30days',   name: '2GB',   amount: 1000, validity: '30 days' },
    { code: '9mobile-5gb-30days',   name: '5GB',   amount: 2000, validity: '30 days' },
    { code: '9mobile-10gb-30days',  name: '10GB',  amount: 3000, validity: '30 days' },
  ],
}

function detectNetwork(phone: string) {
  if (phone.length >= 4) {
    const prefix = phone.slice(0, 4)
    return NETWORK_PREFIXES[prefix] || null
  }
  return null
}

// ── Airtime amount quick picks ────────────────────────────────────────────────
const AIRTIME_AMOUNTS = [100, 500, 1000, 2000]

// ── Main component ────────────────────────────────────────────────────────────
export function Step2AirtimeData() {
  const {
    selectedBillType,
    phone: storedPhone,
    advanceTo,
    setAmountContact,
  } = usePaymentStore()

const [tab, setTab] = useState<'airtime' | 'data'>('airtime')

 const isAirtime = tab === 'airtime'
 const isData    = tab === 'data'

  const [phone, setPhone] = useState(storedPhone || '')
  const [selectedNetwork, setSelectedNetwork] = useState<typeof NETWORKS[0] | null>(null)
  const [autoNetwork, setAutoNetwork] = useState<typeof NETWORKS[0] | null>(null)
  const [airtimeAmount, setAirtimeAmount] = useState<number | ''>('')
  const [selectedPlan, setSelectedPlan] = useState<typeof DATA_PLANS.mtn[0] | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-detect network from phone prefix
  useEffect(() => {
    const detected = detectNetwork(phone)
    if (detected) {
      const network = NETWORKS.find(n => n.id === detected.id) ?? null
      setAutoNetwork(network)
      if (!selectedNetwork) setSelectedNetwork(network)
    } else {
      setAutoNetwork(null)
    }
  }, [phone])

  const activeNetwork = selectedNetwork
  const plans = activeNetwork ? (DATA_PLANS[activeNetwork.id] ?? []) : []

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!/^(070|080|081|090|091)\d{8}$/.test(phone)) {
      errs.phone = 'Enter a valid 11-digit Nigerian number'
    }
    if (!activeNetwork) errs.network = 'Select a network'
    if (isAirtime && (!airtimeAmount || Number(airtimeAmount) < 50)) {
      errs.amount = 'Minimum airtime is ₦50'
    }
    if (isData && !selectedPlan) errs.plan = 'Select a data plan'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleContinue() {
  if (!validate()) return

  try {
    let payload: any = {}

    if (tab === 'airtime') {
      payload = {
        phone,
        network: activeNetwork!.id,
        amount: Number(airtimeAmount),
        email: recipientEmail,
      }

      const res = await fetch('/api/v1/payments/airtime/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setAmountContact(payload.amount, phone, recipientEmail)

    } else {
      payload = {
        phone,
        network: activeNetwork!.id,
        plan: selectedPlan!.code,
        amount: selectedPlan!.amount,
        email: recipientEmail,
      }

      const res = await fetch('/api/v1/payments/data/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setAmountContact(payload.amount, phone, recipientEmail)
    }

  } catch (err: any) {
    console.error(err)
    alert(err.message || 'Payment failed')
  }
}

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
        <div  style={{
      display: 'grid',
      gridTemplateColumns: `repeat(2, 1fr)`,
      gap: '6px',
      background: '#F0FAF8',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '2px',
    }}>
  {['airtime', 'data'].map(t => {
    const active = tab === t
    return (
      <button
        key={t}
        type="button"
        onClick={() => {
          setTab(t as 'airtime' | 'data')
          setSelectedPlan(null) // reset when switching
        }}
          style={{
            padding: '12px',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            background: active ? 'var(--primary)' : 'transparent',
            // background: value === opt.value ? 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)' : 'transparent',
            color: active ? 'var(--white)' : 'var(--primary)',
            fontFamily: 'var(--font-semibold)',
            fontWeight: 500,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'var(--transition)',
            outline: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            // boxShadow: value === opt.value ? '0 0 0 1px var(--border-hover)' : 'none',
          }}
      >
        {t === 'airtime' ? 'Airtime' : 'Data'}
      </button>
    )
  })}
</div>

      {/* ── Phone number ── */}

      <Input
  label="Phone number"
  value={phone}
  maxLength={11}
  inputMode="numeric"
  error={errors.phone}
  onChange={(e: any) =>
    setPhone(e.target.value.replace(/\D/g, ''))
  }
  startIcon="📱"
  endAdornment={
    autoNetwork ? (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span>{autoNetwork.icon}</span>
        {autoNetwork.name}
      </div>
    ) : null
  }
/>

{/* <div style={{ position: 'relative' }}>
  <Input
    label="Phone number"
    type="tel"
    inputMode="numeric"
    maxLength={11}
    value={phone}
    error={errors.phone}
    onChange={(e: any) =>
      setPhone(e.target.value.replace(/\D/g, '')
    )}
    startIcon={<Phone size={16} />}
  />

  {autoNetwork && (
    <div
      style={{
        position: 'absolute',
        right: 12,
        top: '60%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text)',
        pointerEvents: 'none',
      }}
    >
      <span>{autoNetwork.icon}</span>
      {autoNetwork.name}
    </div>
  )}
</div> */}

      {/* ── Network picker ── */}
      <div>
        <label style={{ fontFamily: 'var(--font-medium)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'capitalize', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
          Select Network {autoNetwork ? <span style={{ color: 'var(--green)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— auto-detected</span> : ''}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {NETWORKS.map(n => {
            const active = selectedNetwork?.id === n.id
            return (
              <motion.button
                key={n.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => { setSelectedNetwork(n); setSelectedPlan(null) }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  padding: '12px 6px',
                  background: active ? 'var(--primary)' : 'rgb(240, 250, 248)',
                  border: `1px solid ${active ? 'var(--primary)' : 'rgba(0, 95, 86, 0.2)'}`,
                  borderRadius: '4px', cursor: 'pointer', outline: 'none',
                  transition: 'var(--transition)',
                  boxShadow: active ? '0 0 0 1px var(--primary)' : 'none',
                }}
              >
                {/* <span style={{ fontSize: '22px' }}>{n.icon}</span> */}
                <img
  src={n.icon}
  alt={n.name}
  style={{
    width: 28,
    height: 28,
    objectFit: 'contain',
  }}
/>
                <span style={{ fontFamily: 'var(--font-title)', fontSize: '12px', fontWeight: active ? 600 : 400, color: active ? 'var(--white)' : 'var(--primary)' }}>
                  {n.name}
                </span>
              </motion.button>
            )
          })}
        </div>
        {errors.network && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '6px' }}>{errors.network}</p>}
      </div>

      {/* ── Airtime amount ── */}
      {/* {isAirtime && (
        <div>
          <label style={{ fontFamily: 'var(--font-medium)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'capitalize', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
            Enter Amount
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {AIRTIME_AMOUNTS.map(a => (
              <motion.button
                key={a}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setAirtimeAmount(a)}
                style={{
                  padding: '8px 16px',
                  background: airtimeAmount === a ? 'rgba(0,200,83,0.09)' : 'var(--surface)',
                  border: `1.5px solid ${airtimeAmount === a ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', outline: 'none',
                  color: airtimeAmount === a ? 'var(--green)' : 'var(--text)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
                  transition: 'var(--transition)',
                }}
              >
                ₦{a.toLocaleString()}
              </motion.button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--green)', pointerEvents: 'none' }}>₦</span>
            <input
              type="number"
              value={airtimeAmount}
              onChange={e => setAirtimeAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter amount"
              min={50}
              style={{
                width: '100%', background: 'var(--surface)',
                border: `1.5px solid ${errors.amount ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)', padding: '14px 14px 14px 40px',
                color: 'var(--text)', fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '20px', outline: 'none',
              }}
            />
          </div>
          {errors.amount && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '6px' }}>{errors.amount}</p>}
        </div>
      )} */}

      {/* ── Enter Amount card ── */}
      
      {isAirtime && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
              <p style={{ fontFamily: 'var(--font-medium)', fontSize: '12px', fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize', letterSpacing: '0.5px' }}>Enter Amount</p>
      
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-display)', fontWeight: 800,
                  fontSize: '20px', color: 'var(--primary)', pointerEvents: 'none',
                }}>₦</span>
                <input
                  type="number"
                  value={airtimeAmount}
                  onChange={e => setAirtimeAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  min={50}
                  className='amount-input '
                  style={{
                    width: '100%',
                    background: '#FCFCFC',
                    border: `1.5px solid ${errors.amount ? 'var(--danger)' : 'var(--border)'}`,
                    // border: `2px solid ${airtimeAmount && errors.amount ? 'var(--primary)' : !airtimeAmount ? 'var(--border)' : 'var(--danger)'}`,
                    borderRadius: 'var(--radius-xs)',
                    padding: '13px 14px 13px 42px',
                    color: 'var(--primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    outline: 'none',
                    transition: 'var(--transition)',
                    // boxShadow: amountValid && amount ? '0 0 0 4px rgba(0,200,83,0.08)' : 'none',
                  }}
                />
              </div>
              {errors.amount && <p style={{ fontSize: '10px', color: 'var(--danger)', marginTop: '0px' }}>{errors.amount}</p>}
              </div>
      
              {/* Quick amounts */}
              <div className="quick-amounts">
                {AIRTIME_AMOUNTS.map((a) => (
                  <motion.button
                    key={a}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAirtimeAmount(a)}
                    className={`quick-amount-btn ${airtimeAmount === a ? 'active' : ''}`}
                  >
                    ₦{a.toLocaleString()}
                  </motion.button>
                ))}
              </div>
            </div>
      )}

      {/* ── Data plans ── */}
      {isData && activeNetwork && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label style={{ fontFamily: 'var(--font-medium)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'capitalize', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
              {/* {activeNetwork.icon} {activeNetwork.name} Data Plans */}
                {activeNetwork.name} Data Plans
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {plans.map(plan => {
                const active = selectedPlan?.code === plan.code
                return (
                  <motion.button
                    key={plan.code}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 16px',
                      background: active ? 'var(--primary)' : 'rgb(240, 250, 248)',
                      border: `1px solid ${active ? 'var(--primary)' : 'rgba(0, 95, 86, 0.2)'}`,
                      borderRadius: '4px', cursor: 'pointer', outline: 'none',
                      transition: 'var(--transition)',
                      boxShadow: active ? '0 0 0 1px var(--primary)' : 'none', gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* <Wifi size={16} style={{ color: active ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0 }} /> */}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontFamily: 'var(--font-title)', fontWeight: active ? 600 : 400, fontSize: '15px', color: active ? 'var(--white)' : 'var(--primary)', textAlign: 'center' }}>
                          {plan.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: active ? 'rgb(240, 250, 248)' : 'rgb(156, 163, 175)', fontWeight: 400, marginTop: '1px' }}>
                          Valid for {plan.validity}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-title)', fontWeight: active ? 600 : 400, fontSize: '16px', color: active ? 'var(--white)' : 'var(--primary)', flexShrink: 0 }}>
                      ₦{plan.amount.toLocaleString()}
                    </span>
                  </motion.button>
                )
              })}
            </div>
            {errors.plan && <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '6px' }}>{errors.plan}</p>}
          </motion.div>
        </AnimatePresence>
      )}

      {isData && selectedPlan && (
  <div>
    <label  style={{ fontFamily: 'var(--font-medium)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'capitalize', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
      Amount
    </label>
    <input
      type="text"
      value={`₦${selectedPlan.amount.toLocaleString()}`}
      disabled
      style={{
        width: '100%',
        background: '#f5f5f5',
        border: '1.5px solid var(--border)',
        borderRadius: '4px',
        padding: '14px 16px',
        fontWeight: 600,
        fontSize: '20px !important',
        color: 'var(--text-muted)',
        height: '56px',
      }}
    />
  </div>
)}

      {/* ── Email (optional receipt) ── */}
      {/* <Input
  label="Email"
  optional
  type="email"
  inputMode="email"
  value={recipientEmail}
  onChange={(e: any) => setRecipientEmail(e.target.value)}
  startIcon="✉️"
  hint="Receipt will be sent here"
  error={errors.email}
/> */}

      {/* ── Continue ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
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
          letterSpacing: '0.02em',
          transition: 'var(--transition)',
          marginBottom: '12px',
        }}
      >
        {isAirtime
          ? `Buy ₦${airtimeAmount ? Number(airtimeAmount).toLocaleString() : '-'} Airtime`
          : selectedPlan
            ? `Buy ${selectedPlan.name} for ₦${selectedPlan.amount.toLocaleString()}`
            : 'Select a plan to continue'
        }
      </motion.button>
    </motion.div>
  )
}
