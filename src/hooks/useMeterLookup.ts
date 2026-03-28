import { useMutation } from '@tanstack/react-query'
import { lookupMeter } from '@/lib/api'
import type { MeterType } from '@/types'

export function useMeterLookup() {
  return useMutation({
    mutationFn: (params: {
      providerId: string
      meterNumber: string
      meterType: MeterType
    }) => lookupMeter(params),
  })
}
