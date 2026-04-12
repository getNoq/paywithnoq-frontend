import { usePaymentStore } from '@/store/paymentStore'
import { Step2AirtimeData } from './Step2AirtimeData'
import { Step2MeterDetails } from './Step2MeterDetails'

export function Step2() {
  const { subStep } = usePaymentStore()

  if (subStep === 'airtime_data') {
    return <Step2AirtimeData />
  }

  if (subStep === 'electricity' || subStep === 'meterDetails') {
    return <Step2MeterDetails />
  }

  return null
}