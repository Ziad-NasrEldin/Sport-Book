export type TrendDirection = 'up' | 'down' | 'flat'

export type CoachMetric = {
  id: string
  label: string
  value: string
  delta: string
  trend: TrendDirection
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
  status: 'Live' | 'Draft'
  visibility: 'Public' | 'Hidden'
}

export type CoachService = {
  id: string
  title: string
  sport: string
  sessionTypeId: string
  duration: number
  price: number
  status: 'Active' | 'Paused' | 'Draft'
  bookingsThisMonth: number
}

export type CoachBooking = {
  id: string
  athlete: string
  sessionType: string
  dateTime: string
  duration: number
  location: string
  payout: number
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
}

export type AvailabilityWindow = {
  id: string
  day: string
  start: string
  end: string
  venue: string
  mode: 'Open' | 'Limited' | 'Blocked'
}

export type AvailabilityException = {
  id: string
  date: string
  reason: string
  impact: 'Full day blocked' | 'Late start' | 'Early end'
}

export type CoachProfile = {
  displayName: string
  headline: string
  bio: string
  city: string
  sports: string[]
  certifications: string[]
  languages: string[]
}

export const coachMetrics: CoachMetric[] = [
  { id: 'earnings', label: 'Monthly Earnings', value: 'EGP 48,600', delta: '+14.2% vs last month', trend: 'up' },
  { id: 'sessions', label: 'Sessions This Month', value: '86', delta: '+7 sessions this week', trend: 'up' },
  { id: 'rating', label: 'Average Rating', value: '4.9', delta: 'Stable excellence', trend: 'flat' },
  { id: 'utilization', label: 'Availability Utilization', value: '78%', delta: '-3% from last week', trend: 'down' },
]

export const coachRevenueTrend = [24, 31, 35, 29, 38, 44, 41, 46, 49, 45, 52, 56]

export const coachSessionMix = [
  { label: 'Performance', value: 42, color: '#002366' },
  { label: 'Technique', value: 35, color: '#fd8b00' },
  { label: 'Recovery', value: 23, color: '#c3f400' },
]

export const sessionTypes: CoachSessionType[] = [
  {
    id: 'st-performance-lab',
    name: 'Performance Lab',
    description: 'High-intensity session designed for match-play conditioning and tactical pressure scenarios.',
    minParticipants: 1,
    maxParticipants: 2,
    durationOptions: [60, 90],
    baseRate: 220,
    multiplier: 1.2,
    status: 'Live',
    visibility: 'Public',
  },
  {
    id: 'st-technique-clinic',
    name: 'Technique Clinic',
    description: 'Footwork, strike mechanics, and consistency drills with progressive checkpoints.',
    minParticipants: 1,
    maxParticipants: 4,
    durationOptions: [60, 120],
    baseRate: 180,
    multiplier: 1,
    status: 'Live',
    visibility: 'Public',
  },
  {
    id: 'st-recovery-focus',
    name: 'Recovery Focus',
    description: 'Low-intensity guided session for mobility, injury prevention, and post-match reset.',
    minParticipants: 1,
    maxParticipants: 3,
    durationOptions: [45, 60],
    baseRate: 140,
    multiplier: 0.9,
    status: 'Draft',
    visibility: 'Hidden',
  },
]

export const coachServices: CoachService[] = [
  {
    id: 'srv-1',
    title: 'Serve Power Blueprint',
    sport: 'Tennis',
    sessionTypeId: 'st-performance-lab',
    duration: 90,
    price: 320,
    status: 'Active',
    bookingsThisMonth: 18,
  },
  {
    id: 'srv-2',
    title: 'Backhand Precision Track',
    sport: 'Tennis',
    sessionTypeId: 'st-technique-clinic',
    duration: 60,
    price: 240,
    status: 'Active',
    bookingsThisMonth: 24,
  },
  {
    id: 'srv-3',
    title: 'Match Recovery Session',
    sport: 'Tennis',
    sessionTypeId: 'st-recovery-focus',
    duration: 45,
    price: 160,
    status: 'Draft',
    bookingsThisMonth: 4,
  },
  {
    id: 'srv-4',
    title: 'Doubles Rotation IQ',
    sport: 'Padel',
    sessionTypeId: 'st-technique-clinic',
    duration: 120,
    price: 380,
    status: 'Paused',
    bookingsThisMonth: 11,
  },
]

export const coachBookings: CoachBooking[] = [
  {
    id: 'CB-9012',
    athlete: 'Mariam Fathy',
    sessionType: 'Performance Lab',
    dateTime: '2026-04-17 18:00',
    duration: 90,
    location: 'Regent Club Court 2',
    payout: 285,
    status: 'Confirmed',
  },
  {
    id: 'CB-9016',
    athlete: 'Karim Nabil',
    sessionType: 'Technique Clinic',
    dateTime: '2026-04-17 20:00',
    duration: 60,
    location: 'Regent Club Court 4',
    payout: 210,
    status: 'Pending',
  },
  {
    id: 'CB-9018',
    athlete: 'Hana Yasser',
    sessionType: 'Technique Clinic',
    dateTime: '2026-04-16 16:00',
    duration: 120,
    location: 'Prime Sports Hub',
    payout: 340,
    status: 'Completed',
  },
  {
    id: 'CB-9020',
    athlete: 'Omar Tarek',
    sessionType: 'Recovery Focus',
    dateTime: '2026-04-16 19:30',
    duration: 45,
    location: 'Regent Club Court 1',
    payout: 132,
    status: 'Cancelled',
  },
]

export const availabilityWindows: AvailabilityWindow[] = [
  { id: 'aw-1', day: 'Monday', start: '06:00', end: '11:00', venue: 'Regent Club', mode: 'Open' },
  { id: 'aw-2', day: 'Monday', start: '16:00', end: '21:00', venue: 'Regent Club', mode: 'Limited' },
  { id: 'aw-3', day: 'Tuesday', start: '07:00', end: '13:00', venue: 'Prime Sports Hub', mode: 'Open' },
  { id: 'aw-4', day: 'Wednesday', start: '17:00', end: '22:00', venue: 'Regent Club', mode: 'Open' },
  { id: 'aw-5', day: 'Thursday', start: '15:00', end: '19:00', venue: 'Prime Sports Hub', mode: 'Limited' },
  { id: 'aw-6', day: 'Friday', start: '09:00', end: '12:00', venue: 'Regent Club', mode: 'Blocked' },
]

export const availabilityExceptions: AvailabilityException[] = [
  { id: 'ae-1', date: '2026-04-21', reason: 'Tournament travel day', impact: 'Full day blocked' },
  { id: 'ae-2', date: '2026-04-23', reason: 'Medical appointment', impact: 'Late start' },
  { id: 'ae-3', date: '2026-04-27', reason: 'Academy event', impact: 'Early end' },
]

export const coachProfile: CoachProfile = {
  displayName: 'Omar Hassan',
  headline: 'High-performance tennis coach for competitive juniors and adults',
  bio: 'I help athletes convert raw intensity into repeatable match execution through tactical sessions and measurable progression plans.',
  city: 'Cairo',
  sports: ['Tennis', 'Padel'],
  certifications: ['ITF Level 2', 'Strength & Conditioning Fundamentals'],
  languages: ['Arabic', 'English'],
}

export const settingsGroups = {
  notifications: [
    {
      key: 'new-booking',
      label: 'New booking alerts',
      description: 'Get instant alerts when athletes request a new session.',
      enabled: true,
    },
    {
      key: 'session-reminders',
      label: 'Session reminders',
      description: 'Receive reminders 60 minutes before each booked session.',
      enabled: true,
    },
    {
      key: 'promotion-insights',
      label: 'Promotion insights',
      description: 'Weekly marketing suggestions for boosting profile conversion.',
      enabled: false,
    },
  ],
  policies: [
    {
      key: 'auto-approve',
      label: 'Auto-approve recurring athletes',
      description: 'Automatically confirm requests from previously completed athletes.',
      enabled: true,
    },
    {
      key: 'strict-cancellation',
      label: 'Strict cancellation window',
      description: 'Reject cancellations inside 10 hours of session start.',
      enabled: false,
    },
    {
      key: 'public-session-types',
      label: 'Show all live session types publicly',
      description: 'Expose live session formats to booking pages by default.',
      enabled: true,
    },
  ],
}

export function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}
