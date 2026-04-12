import type { BillOption, BillType, Provider } from '@/types'

export const BILL_OPTIONS: BillOption[] = [
  {
    id: 'electricity',
    label: 'Electricity',
    icon: '⚡',
    description: 'Buy electricity units for any DISCO',
    phase: 1,
    available: true,
  },
  // {
  //   id: 'wallet',
  //   label: 'Noq Wallet',
  //   icon: '📡',
  //   description: 'Noq Wallet',
  //   phase: 3,
  //   available: true,
  // },
  {
    id: 'airtime_data',
    label: 'Airtime & Data',
    icon: '📱',
    description: 'MTN, Airtel, Glo, 9mobile',
    phase: 3,
    available: true,
  },
  // {
  //   id: 'data',
  //   label: 'Data Purchase',
  //   icon: '📡',
  //   description: 'Internet data bundles',
  //   phase: 3,
  //   available: false,
  // },
  {
    id: 'cable',
    label: 'Cable TV',
    icon: '📺',
    description: 'DSTV, GOtv, Startimes',
    phase: 2,
    available: false,
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: '🌐',
    description: 'Internet services',
    phase: 3,
    available: false,
  },
  {
    id: 'betting_gaming',
    label: 'Betting / Gaming',
    icon: '🎯',
    description: 'Betting / Gaming Wallet Funding',
    phase: 3,
    available: false,
  },
  {
    id: 'government_payments',
    label: 'Government Payments',
    icon: '🏛️',
    description: 'Government Payments',
    phase: 3,
    available: false,
  },
  {
    id: 'transport',
    label: 'Transport & Tolls',
    icon: '🚗',
    description: 'Transport & Tolls',
    phase: 3,
    available: false,
  },
  {
    id: 'education',
    label: 'Education',
    icon: '🎓',
    description: 'Education services',
    phase: 3,
    available: false,
  },
  {
    id: 'utilities',
    label: 'Utilities',
    icon: '🏠',
    description: 'Utilities (Water, Gas, etc)',
    phase: 3,
    available: false,
  },
]

// VTPass serviceIDs — https://vtpass.com/documentation/electricity/
export const ELECTRICITY_PROVIDERS: Provider[] = [
  { id: 'ikeja-electric',      name: 'Ikeja Electric',             shortName: 'IKEDC',  region: 'Lagos (Ikeja)',     icon: '🏙️', billType: 'electricity' },
  { id: 'eko-electric',        name: 'Eko Electricity',            shortName: 'EKEDC',  region: 'Lagos (Eko)',       icon: '🌊', billType: 'electricity' },
  { id: 'abuja-electric',      name: 'Abuja Electricity',          shortName: 'AEDC',   region: 'Abuja / North Central', icon: '🏛️', billType: 'electricity' },
  { id: 'portharcourt-electric', name: 'PH Electric',              shortName: 'PHEDC',  region: 'Port Harcourt',     icon: '⚓', billType: 'electricity' },
  { id: 'enugu-electric',      name: 'Enugu Electric',             shortName: 'EEDC',   region: 'Enugu / South East',icon: '🌳', billType: 'electricity' },
  { id: 'ibadan-electric',     name: 'Ibadan Electric',            shortName: 'IBEDC',  region: 'Ibadan / South West', icon: '🦅', billType: 'electricity' },
  { id: 'kano-electric',       name: 'Kano Electric',              shortName: 'KEDCO',  region: 'Kano / North West', icon: '🌾', billType: 'electricity' },
  { id: 'kaduna-electric',     name: 'Kaduna Electric',            shortName: 'KAEDCO', region: 'Kaduna / North West', icon: '⛰️', billType: 'electricity' },
  { id: 'benin-electric',      name: 'Benin Electric',             shortName: 'BEDC',   region: 'Benin / South South', icon: '🌺', billType: 'electricity' },
  { id: 'jos-electric',        name: 'Jos Electric',               shortName: 'JEDC',   region: 'Jos / North Central', icon: '🏔️', billType: 'electricity' },
  { id: 'aba-power',           name: 'Aba Power',                  shortName: 'APLE',   region: 'Aba / South East',  icon: '🔋', billType: 'electricity' },
]

export const PROVIDERS_BY_BILL_TYPE: Record<string, Provider[]> = {
  electricity: ELECTRICITY_PROVIDERS,
}

export const QUICK_AMOUNTS = [1000, 2000, 5000, 10000]

import type { Step, SubStep } from '@/types'

export const BILL_TYPE_FLOW: Record<BillType, {
  nextStep: Step
  stepKey: SubStep
  requiresProvider: boolean
}> = {
  airtime_data: {
    nextStep: 2,
    stepKey: 'airtime_data',
    requiresProvider: false,
  },
  electricity: {
    nextStep: 2,
    stepKey: 'electricity',
    requiresProvider: false,
  },
  utilities: {
    nextStep: 2,
    stepKey: 'utilities',
    requiresProvider: true,
  },
  cable: {
    nextStep: 2,
    stepKey: 'cable',
    requiresProvider: false,
  },
  internet: {
    nextStep: 2,
    stepKey: 'internet',
    requiresProvider: false,
  },
  betting_gaming: {
    nextStep: 2,
    stepKey: 'betting_gaming',
    requiresProvider: false,
  },
  government_payments: {
    nextStep: 2,
    stepKey: 'government_payments',
    requiresProvider: false,
  },
  transport: {
    nextStep: 2,
    stepKey: 'transport',
    requiresProvider: false,
  },
  education: {
    nextStep: 2,
    stepKey: 'education',
    requiresProvider: false,
  },
}