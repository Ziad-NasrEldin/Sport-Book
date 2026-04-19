export type CourtDetail = {
  id: string
  name: string
  images: string[]
  basePrice: number
  rating: number
  reviewCount: number
  sport: {
    name: string
    displayName: string
  }
  branch: {
    name: string
    facility: {
      name: string
      address: string
    }
  }
  amenities: string[]
  pricingRules: Array<{
    id: string
    name: string
    type: string
    value: number
    fromHour: number
    toHour: number
  }>
}

export type SlotData = {
  hour: number
  available: boolean
  reason: string | null
  price: number
}

export type SlotsResponse = {
  slots: SlotData[]
}

export type CourtBookingRequest = {
  type: 'COURT'
  courtId: string
  date: string
  startHour: number
  endHour: number
  playerCount: number
  couponCode?: string
}

export type BookingResponse = {
  id: string
  type: string
  status: string
  date: string
  startHour: number
  endHour: number
  duration: number
  playerCount: number
  basePrice: number
  totalPrice: number
  paymentMethod: string | null
  paymentStatus: string
  court: {
    name: string
    branch: {
      name: string
      facility: {
        name: string
        address: string
      }
    }
  } | null
}

export type WalletResponse = {
  balance: number
  currency: string
}

export function formatHour(hour: number) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 === 0 ? 12 : hour % 12
  return `${normalized}:00 ${suffix}`
}