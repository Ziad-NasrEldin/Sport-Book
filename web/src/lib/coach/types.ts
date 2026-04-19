export type TrendDirection = 'up' | 'down' | 'flat' | 'steady'

export type CoachMetric = {
  id: string
  label: string
  value: string
  delta: string
  trend: TrendDirection
}

export type CoachDashboardBooking = {
  id: string
  athlete: string
  sessionType: string
  duration: number
  location: string
  payout: number
  status: string
  dateTime: string
  user: {
    name: string
    email?: string
  }
  service: {
    id: string
    name: string
  } | null
}

export type ChartPoint = {
  id: string
  label: string
  value: number
}

export type CoachDashboardData = {
  metrics: CoachMetric[]
  revenueTrend: ChartPoint[]
  sessionMix: ChartPoint[]
  bookings: CoachDashboardBooking[]
}

export type CoachProfileData = {
  id: string
  displayName: string
  headline: string
  bio: string
  city: string
  avatar: string
  isPublicProfileVisible: boolean
  sports: string[]
  certifications: string[]
  specialties: string[]
  languages: string[]
}

export type CoachSettingsOption = {
  key: string
  label: string
  description: string
  enabled: boolean
}

export type CoachSettingsData = {
  payoutCycle: 'weekly' | 'biweekly' | 'monthly'
  notifications: CoachSettingsOption[]
  policies: CoachSettingsOption[]
}

export type CoachSessionType = {
  id: string
  name: string
  description: string
  minParticipants: number
  maxParticipants: number
  durationOptions: number[]
  baseRate: number
  multiplier: number
  visibility: string
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT'
}

export type CoachService = {
  id: string
  title: string
  description: string
  sport: string
  duration: number
  price: number
  bookingsThisMonth: number
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT'
  sessionTypeId: string | null
}

export type CoachAvailabilityWindow = {
  id: string
  day: string
  start: string
  end: string
  venue: string
  mode: 'ACTIVE' | 'PAUSED' | string
}

export type CoachAvailabilityException = {
  id: string
  date: string
  reason: string
  impact: string
  isAvailable: boolean
}

export type CoachAvailabilityData = {
  windows: CoachAvailabilityWindow[]
  exceptions: CoachAvailabilityException[]
}

export type CoachReportSnapshot = {
  id: string
  month: string
  sessions: number
  gross: number
  avgRating: number
}

export type CoachReportsData = {
  bookings: CoachDashboardBooking[]
  revenueTrend: ChartPoint[]
  sessionMix: ChartPoint[]
  monthSnapshots: CoachReportSnapshot[]
}

export type PublicCoachSummary = {
  id: string
  slug: string
  name: string
  sport: string
  bio: string
  image: string
  sessionRate: string
  experienceYears: number
}

export type PublicCoachDetail = {
  id: string
  slug: string
  bio: string | null
  headline: string | null
  city: string | null
  experienceYears: number
  sessionRate: number
  currency: string
  user: {
    name: string
    avatar: string | null
  }
  sport: {
    displayName: string
  }
  services: Array<{
    id: string
    name: string
    description: string | null
    duration: number
    price: number
    currency: string
    sessionTypeId?: string | null
  }>
}

export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
