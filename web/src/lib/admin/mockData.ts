export type TrendDirection = 'up' | 'down' | 'flat'
export type GenericStatus = 'Active' | 'Pending' | 'Suspended' | 'Archived'

export type DashboardMetric = {
  id: string
  label: string
  value: string
  delta: string
  trend: TrendDirection
}

export type UserRecord = {
  id: string
  name: string
  email: string
  role: 'Player' | 'Coach' | 'Facility' | 'Admin'
  status: GenericStatus
  country: string
  joinedAt: string
}

export type FacilityRecord = {
  id: string
  name: string
  branches: number
  city: string
  status: GenericStatus
  monthlyRevenue: number
  utilization: number
}

export type CoachRecord = {
  id: string
  name: string
  sport: string
  status: GenericStatus
  commissionRate: number
  rating: number
  sessionsThisMonth: number
}

export type VerificationRecord = {
  id: string
  entity: string
  type: 'Facility License' | 'Coach ID' | 'Bank Account' | 'Business Registration'
  submittedAt: string
  riskLevel: 'Low' | 'Medium' | 'High'
  region: string
}

export type BookingRecord = {
  id: string
  customer: string
  facility: string
  date: string
  amount: number
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
}

export type CouponRecord = {
  id: string
  code: string
  discount: string
  usage: string
  expiresAt: string
  status: 'Active' | 'Expired' | 'Draft'
}

export type TransactionRecord = {
  id: string
  source: string
  type: 'Booking' | 'Payout' | 'Refund' | 'Chargeback'
  amount: number
  method: 'Visa' | 'Wallet' | 'Apple Pay' | 'Bank Transfer'
  status: 'Settled' | 'In Review' | 'Failed'
  createdAt: string
}

export type ReviewRecord = {
  id: string
  author: string
  target: string
  rating: number
  status: 'Pending' | 'Approved' | 'Rejected'
  reason: string
  createdAt: string
}

export type AuditRecord = {
  id: string
  actor: string
  action: string
  object: string
  ip: string
  createdAt: string
  severity: 'Info' | 'Warning' | 'Critical'
}

export type SportRecord = {
  id: string
  name: string
  categories: number
  activeListings: number
  status: 'Enabled' | 'Disabled'
}

export type LocalizationRecord = {
  id: string
  locale: string
  language: string
  currency: string
  timezone: string
  rtl: boolean
}

export type CmsPageRecord = {
  id: string
  page: string
  language: string
  status: 'Published' | 'Draft'
  updatedAt: string
  version: string
}

export type ReportRecord = {
  id: string
  name: string
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  format: 'CSV' | 'PDF' | 'JSON'
  owner: string
  lastRun: string
  status: 'Healthy' | 'Needs Review'
}

export type StoreProductRecord = {
  id: string
  title: string
  category: string
  facility: string
  price: number
  quantity: number
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  updatedAt: string
}

export type StoreOrderRecord = {
  id: string
  productId: string
  productTitle: string
  customer: string
  quantity: number
  total: number
  fulfillment: 'Pickup' | 'Delivery'
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled'
  placedAt: string
}

export const dashboardMetrics: DashboardMetric[] = [
  { id: 'users', label: 'Total Users', value: '84,220', delta: '+9.6% vs last month', trend: 'up' },
  { id: 'revenue', label: 'Monthly Revenue', value: 'EGP 1.28M', delta: '+12.1% momentum', trend: 'up' },
  { id: 'bookings', label: 'Bookings This Week', value: '6,142', delta: '-2.4% from last week', trend: 'down' },
  { id: 'approvals', label: 'Pending Approvals', value: '37', delta: 'stable queue size', trend: 'flat' },
]

export const verificationQueue: VerificationRecord[] = [
  { id: 'V-1001', entity: 'Smash Arena Maadi', type: 'Facility License', submittedAt: '2026-04-15 13:30', riskLevel: 'Low', region: 'Cairo' },
  { id: 'V-1002', entity: 'Omar Salem', type: 'Coach ID', submittedAt: '2026-04-15 11:02', riskLevel: 'Medium', region: 'Alexandria' },
  { id: 'V-1003', entity: 'Blue Court Hub', type: 'Business Registration', submittedAt: '2026-04-14 21:14', riskLevel: 'High', region: 'Giza' },
  { id: 'V-1004', entity: 'Lina Nabil', type: 'Bank Account', submittedAt: '2026-04-14 18:24', riskLevel: 'Low', region: 'Mansoura' },
]

export const usersData: UserRecord[] = [
  { id: 'U-4901', name: 'Youssef Adel', email: 'y.adel@sportbook.app', role: 'Player', status: 'Active', country: 'Egypt', joinedAt: '2026-02-11' },
  { id: 'U-4902', name: 'Maya Fathi', email: 'maya.fathi@sportbook.app', role: 'Coach', status: 'Pending', country: 'Egypt', joinedAt: '2026-03-02' },
  { id: 'U-4903', name: 'CourtZone Downtown', email: 'ops@courtzone.co', role: 'Facility', status: 'Active', country: 'Egypt', joinedAt: '2025-11-28' },
  { id: 'U-4904', name: 'Rania Mostafa', email: 'rania@sportbook.app', role: 'Admin', status: 'Active', country: 'Egypt', joinedAt: '2025-08-18' },
  { id: 'U-4905', name: 'Ibrahim Helmy', email: 'i.helmy@sportbook.app', role: 'Player', status: 'Suspended', country: 'KSA', joinedAt: '2025-12-19' },
  { id: 'U-4906', name: 'Nour Samir', email: 'nour.samir@sportbook.app', role: 'Coach', status: 'Active', country: 'UAE', joinedAt: '2026-01-07' },
]

export const facilitiesData: FacilityRecord[] = [
  { id: 'F-1201', name: 'Padel One New Cairo', branches: 3, city: 'Cairo', status: 'Active', monthlyRevenue: 248000, utilization: 81 },
  { id: 'F-1202', name: 'CourtZone Alexandria', branches: 2, city: 'Alexandria', status: 'Pending', monthlyRevenue: 127000, utilization: 62 },
  { id: 'F-1203', name: 'Prime Sports Hub', branches: 1, city: 'Giza', status: 'Active', monthlyRevenue: 94000, utilization: 57 },
  { id: 'F-1204', name: 'Rally Arena East', branches: 4, city: 'Cairo', status: 'Suspended', monthlyRevenue: 61000, utilization: 42 },
]

export const coachesData: CoachRecord[] = [
  { id: 'C-2101', name: 'Hassan Tarek', sport: 'Tennis', status: 'Active', commissionRate: 18, rating: 4.9, sessionsThisMonth: 84 },
  { id: 'C-2102', name: 'Mariam Samy', sport: 'Padel', status: 'Pending', commissionRate: 20, rating: 4.6, sessionsThisMonth: 49 },
  { id: 'C-2103', name: 'Sherif Khaled', sport: 'Squash', status: 'Active', commissionRate: 17, rating: 4.8, sessionsThisMonth: 62 },
  { id: 'C-2104', name: 'Aya Adel', sport: 'Tennis', status: 'Archived', commissionRate: 16, rating: 4.2, sessionsThisMonth: 11 },
]

export const bookingsData: BookingRecord[] = [
  { id: 'B-7001', customer: 'Mahmoud Elgendy', facility: 'Padel One New Cairo', date: '2026-04-16 19:00', amount: 640, status: 'Confirmed' },
  { id: 'B-7002', customer: 'Nadine Wael', facility: 'Prime Sports Hub', date: '2026-04-16 20:00', amount: 520, status: 'Pending' },
  { id: 'B-7003', customer: 'Omar Medhat', facility: 'CourtZone Alexandria', date: '2026-04-15 18:00', amount: 480, status: 'Completed' },
  { id: 'B-7004', customer: 'Laila Hossam', facility: 'Rally Arena East', date: '2026-04-14 17:00', amount: 450, status: 'Cancelled' },
  { id: 'B-7005', customer: 'Ziad Emad', facility: 'Padel One New Cairo', date: '2026-04-16 21:00', amount: 720, status: 'Pending' },
]

export const couponsData: CouponRecord[] = [
  { id: 'CP-90', code: 'RAMADAN25', discount: '25%', usage: '1,240 / 2,000', expiresAt: '2026-05-01', status: 'Active' },
  { id: 'CP-91', code: 'WELCOME100', discount: 'EGP 100', usage: '8,022 / 10,000', expiresAt: '2026-06-15', status: 'Active' },
  { id: 'CP-92', code: 'SPRING15', discount: '15%', usage: '0 / 3,000', expiresAt: '2026-07-01', status: 'Draft' },
  { id: 'CP-93', code: 'EARLYBIRD', discount: '12%', usage: '2,990 / 3,000', expiresAt: '2026-03-30', status: 'Expired' },
]

export const transactionsData: TransactionRecord[] = [
  { id: 'TX-4101', source: 'Booking B-7001', type: 'Booking', amount: 640, method: 'Visa', status: 'Settled', createdAt: '2026-04-16 19:01' },
  { id: 'TX-4102', source: 'Coach payout batch', type: 'Payout', amount: 84200, method: 'Bank Transfer', status: 'In Review', createdAt: '2026-04-16 12:30' },
  { id: 'TX-4103', source: 'Refund B-6998', type: 'Refund', amount: 450, method: 'Wallet', status: 'Settled', createdAt: '2026-04-15 09:42' },
  { id: 'TX-4104', source: 'Chargeback C-12', type: 'Chargeback', amount: 740, method: 'Apple Pay', status: 'Failed', createdAt: '2026-04-14 18:11' },
]

export const reviewsData: ReviewRecord[] = [
  { id: 'R-9001', author: 'Mona Talaat', target: 'Padel One New Cairo', rating: 5, status: 'Pending', reason: 'Contains external contact details', createdAt: '2026-04-16 10:12' },
  { id: 'R-9002', author: 'Ibrahim Magdy', target: 'Coach Hassan Tarek', rating: 2, status: 'Rejected', reason: 'Abusive language', createdAt: '2026-04-15 17:09' },
  { id: 'R-9003', author: 'Layla Nasser', target: 'Prime Sports Hub', rating: 4, status: 'Approved', reason: 'Clean', createdAt: '2026-04-15 08:36' },
  { id: 'R-9004', author: 'Karim Samir', target: 'Coach Mariam Samy', rating: 3, status: 'Pending', reason: 'Potential duplicate review', createdAt: '2026-04-14 21:50' },
]

export const auditData: AuditRecord[] = [
  { id: 'A-5101', actor: 'Rania Mostafa', action: 'Updated commission baseline', object: 'Platform Settings', ip: '10.4.18.11', createdAt: '2026-04-16 11:10', severity: 'Info' },
  { id: 'A-5102', actor: 'System', action: 'Flagged suspicious payout attempt', object: 'Finance', ip: '10.4.18.33', createdAt: '2026-04-16 09:44', severity: 'Critical' },
  { id: 'A-5103', actor: 'Maha Abdelrahman', action: 'Approved facility verification V-1001', object: 'Verification Queue', ip: '10.4.21.15', createdAt: '2026-04-15 20:15', severity: 'Info' },
  { id: 'A-5104', actor: 'Automated Guard', action: 'Temporarily suspended account U-4905', object: 'User Management', ip: '10.4.17.54', createdAt: '2026-04-15 07:20', severity: 'Warning' },
]

export const sportsData: SportRecord[] = [
  { id: 'S-1', name: 'Padel', categories: 5, activeListings: 124, status: 'Enabled' },
  { id: 'S-2', name: 'Tennis', categories: 4, activeListings: 96, status: 'Enabled' },
  { id: 'S-3', name: 'Squash', categories: 3, activeListings: 42, status: 'Enabled' },
  { id: 'S-4', name: 'Badminton', categories: 2, activeListings: 0, status: 'Disabled' },
]

export const localizationData: LocalizationRecord[] = [
  { id: 'L-1', locale: 'en-EG', language: 'English', currency: 'EGP', timezone: 'Africa/Cairo', rtl: false },
  { id: 'L-2', locale: 'ar-EG', language: 'Arabic', currency: 'EGP', timezone: 'Africa/Cairo', rtl: true },
  { id: 'L-3', locale: 'en-SA', language: 'English', currency: 'SAR', timezone: 'Asia/Riyadh', rtl: false },
  { id: 'L-4', locale: 'ar-SA', language: 'Arabic', currency: 'SAR', timezone: 'Asia/Riyadh', rtl: true },
]

export const cmsData: CmsPageRecord[] = [
  { id: 'CMS-1', page: 'Terms of Service', language: 'English', status: 'Published', updatedAt: '2026-04-14 09:30', version: 'v3.4' },
  { id: 'CMS-2', page: 'Privacy Policy', language: 'Arabic', status: 'Draft', updatedAt: '2026-04-15 15:10', version: 'v2.9' },
  { id: 'CMS-3', page: 'FAQ', language: 'English', status: 'Published', updatedAt: '2026-04-16 08:50', version: 'v5.1' },
]

export const reportsData: ReportRecord[] = [
  { id: 'RP-1', name: 'Revenue by Sport', frequency: 'Weekly', format: 'CSV', owner: 'Finance Team', lastRun: '2026-04-15 22:00', status: 'Healthy' },
  { id: 'RP-2', name: 'User Growth Funnel', frequency: 'Daily', format: 'PDF', owner: 'Growth Team', lastRun: '2026-04-16 06:00', status: 'Healthy' },
  { id: 'RP-3', name: 'Fraud Signals', frequency: 'Daily', format: 'JSON', owner: 'Risk Team', lastRun: '2026-04-16 05:30', status: 'Needs Review' },
]

export const storeProductsAdminData: StoreProductRecord[] = [
  {
    id: 'PRD-001',
    title: 'Pro Spin 98 Tennis Racket',
    category: 'Tennis Rackets',
    facility: 'The Regent Park Store',
    price: 4200,
    quantity: 34,
    status: 'In Stock',
    updatedAt: '2026-04-16 08:10',
  },
  {
    id: 'PRD-002',
    title: 'Control X Padel Racket',
    category: 'Padel Rackets',
    facility: 'Elite Padel Club Shop',
    price: 3100,
    quantity: 27,
    status: 'In Stock',
    updatedAt: '2026-04-16 08:22',
  },
  {
    id: 'PRD-003',
    title: 'Tournament Tennis Balls (3-Pack)',
    category: 'Balls',
    facility: 'Downtown Tennis Club',
    price: 260,
    quantity: 6,
    status: 'Low Stock',
    updatedAt: '2026-04-16 07:56',
  },
  {
    id: 'PRD-004',
    title: 'Dry Feel Overgrip Set',
    category: 'Grips',
    facility: 'Center Court Supply',
    price: 140,
    quantity: 48,
    status: 'In Stock',
    updatedAt: '2026-04-16 06:41',
  },
  {
    id: 'PRD-005',
    title: 'Tour Duffle Racket Bag',
    category: 'Bags',
    facility: 'Queen Club Pro Shop',
    price: 960,
    quantity: 4,
    status: 'Low Stock',
    updatedAt: '2026-04-16 07:18',
  },
  {
    id: 'PRD-006',
    title: 'Padel Match Balls (Tube)',
    category: 'Balls',
    facility: 'The Padel Hub Store',
    price: 220,
    quantity: 0,
    status: 'Out of Stock',
    updatedAt: '2026-04-16 05:53',
  },
  {
    id: 'PRD-007',
    title: 'Club Starter Kit Bundle',
    category: 'Bundles',
    facility: 'Prime Sports Hub',
    price: 1800,
    quantity: 9,
    status: 'Low Stock',
    updatedAt: '2026-04-16 04:38',
  },
]

export const storeOrdersAdminData: StoreOrderRecord[] = [
  {
    id: 'SO-8801',
    productId: 'PRD-001',
    productTitle: 'Pro Spin 98 Tennis Racket',
    customer: 'Mona Talaat',
    quantity: 1,
    total: 4200,
    fulfillment: 'Delivery',
    status: 'Delivered',
    placedAt: '2026-04-16 09:22',
  },
  {
    id: 'SO-8802',
    productId: 'PRD-003',
    productTitle: 'Tournament Tennis Balls (3-Pack)',
    customer: 'Karim Samir',
    quantity: 3,
    total: 780,
    fulfillment: 'Pickup',
    status: 'Processing',
    placedAt: '2026-04-16 10:11',
  },
  {
    id: 'SO-8803',
    productId: 'PRD-005',
    productTitle: 'Tour Duffle Racket Bag',
    customer: 'Aly Nasser',
    quantity: 2,
    total: 1920,
    fulfillment: 'Delivery',
    status: 'Pending',
    placedAt: '2026-04-16 10:38',
  },
  {
    id: 'SO-8804',
    productId: 'PRD-002',
    productTitle: 'Control X Padel Racket',
    customer: 'Rana Youssef',
    quantity: 1,
    total: 3100,
    fulfillment: 'Pickup',
    status: 'Delivered',
    placedAt: '2026-04-15 18:05',
  },
  {
    id: 'SO-8805',
    productId: 'PRD-004',
    productTitle: 'Dry Feel Overgrip Set',
    customer: 'Ibrahim Magdy',
    quantity: 4,
    total: 560,
    fulfillment: 'Delivery',
    status: 'Cancelled',
    placedAt: '2026-04-15 16:14',
  },
  {
    id: 'SO-8806',
    productId: 'PRD-007',
    productTitle: 'Club Starter Kit Bundle',
    customer: 'Dalia Fawzy',
    quantity: 1,
    total: 1800,
    fulfillment: 'Delivery',
    status: 'Processing',
    placedAt: '2026-04-15 15:49',
  },
  {
    id: 'SO-8807',
    productId: 'PRD-003',
    productTitle: 'Tournament Tennis Balls (3-Pack)',
    customer: 'Youssef Adel',
    quantity: 2,
    total: 520,
    fulfillment: 'Pickup',
    status: 'Delivered',
    placedAt: '2026-04-14 21:05',
  },
  {
    id: 'SO-8808',
    productId: 'PRD-002',
    productTitle: 'Control X Padel Racket',
    customer: 'Nadine Wael',
    quantity: 1,
    total: 3100,
    fulfillment: 'Delivery',
    status: 'Pending',
    placedAt: '2026-04-14 19:27',
  },
]

export function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}
