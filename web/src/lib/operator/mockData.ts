export type TrendDirection = 'up' | 'down' | 'flat'

export type OperatorMetric = {
  id: string
  label: string
  value: string
  delta: string
  trend: TrendDirection
}

export type BranchStatus = 'Active' | 'Pending Setup' | 'Maintenance' | 'Paused'

export type BranchRecord = {
  id: string
  name: string
  city: string
  address: string
  manager: string
  managerEmail: string
  courts: number
  utilization: number
  monthlyRevenue: number
  status: BranchStatus
}

export type CourtStatus = 'Active' | 'Maintenance' | 'Paused'

export type CourtRecord = {
  id: string
  branchId: string
  name: string
  sport: 'Padel' | 'Tennis' | 'Football' | 'Basketball'
  surface: 'Acrylic' | 'Artificial Grass' | 'Hard Court'
  indoor: boolean
  lights: boolean
  status: CourtStatus
  pricePerHour: number
  nextMaintenance: string
}

export type ApprovalPriority = 'Low' | 'Medium' | 'High'
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

export type ApprovalRecord = {
  id: string
  type: 'Bulk Booking' | 'Discount Override' | 'Staff Access' | 'Refund Exception'
  subject: string
  requestedBy: string
  branchId: string
  submittedAt: string
  priority: ApprovalPriority
  status: ApprovalStatus
}

export type OperatorBookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'

export type OperatorBookingRecord = {
  id: string
  customer: string
  branchId: string
  courtId: string
  date: string
  slot: string
  amount: number
  paymentMethod: 'Visa' | 'Wallet' | 'Cash' | 'Apple Pay'
  status: OperatorBookingStatus
}

export type StaffStatus = 'Active' | 'Pending' | 'On Leave' | 'Suspended'

export type StaffRecord = {
  id: string
  name: string
  role: 'Branch Manager' | 'Front Desk' | 'Maintenance' | 'Coach Coordinator'
  branchId: string
  shift: 'Morning' | 'Evening' | 'Night'
  phone: string
  email: string
  status: StaffStatus
}

export type ScheduleSlotStatus = 'Open' | 'Booked' | 'Blocked'

export type ScheduleSlot = {
  id: string
  branchId: string
  courtId: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  slot: string
  status: ScheduleSlotStatus
  reference?: string
}

export type ReportJob = {
  id: string
  name: string
  branchId: string
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  owner: string
  format: 'CSV' | 'PDF' | 'XLSX'
  lastRun: string
  status: 'Healthy' | 'Needs Review'
}

export const operatorMetrics: OperatorMetric[] = [
  { id: 'utilization', label: 'Avg Utilization', value: '74%', delta: '+6.2% vs last week', trend: 'up' },
  { id: 'bookings', label: 'Bookings Today', value: '312', delta: '+18 from yesterday', trend: 'up' },
  { id: 'approvals', label: 'Pending Approvals', value: '9', delta: '-2 since morning', trend: 'down' },
  { id: 'revenue', label: 'Month Revenue', value: 'EGP 826K', delta: '+11.4% month to date', trend: 'up' },
]

export const branchesData: BranchRecord[] = [
  {
    id: 'br-nasr-city',
    name: 'Nasr City Arena',
    city: 'Cairo',
    address: '18 Abbas El Akkad St, Nasr City',
    manager: 'Mona Fawzy',
    managerEmail: 'mona.fawzy@sportbook.app',
    courts: 7,
    utilization: 82,
    monthlyRevenue: 248000,
    status: 'Active',
  },
  {
    id: 'br-zayed-central',
    name: 'Zayed Central Courts',
    city: 'Giza',
    address: '14 Al Bostan Rd, Sheikh Zayed',
    manager: 'Karim Helal',
    managerEmail: 'karim.helal@sportbook.app',
    courts: 5,
    utilization: 69,
    monthlyRevenue: 173000,
    status: 'Active',
  },
  {
    id: 'br-alex-seaview',
    name: 'Alex Seaview Club',
    city: 'Alexandria',
    address: '6 Corniche Rd, Sidi Gaber',
    manager: 'Reem Saber',
    managerEmail: 'reem.saber@sportbook.app',
    courts: 4,
    utilization: 61,
    monthlyRevenue: 119000,
    status: 'Pending Setup',
  },
  {
    id: 'br-mansoura-east',
    name: 'Mansoura East Hub',
    city: 'Mansoura',
    address: '32 El Geish St, Mansoura',
    manager: 'Ahmed Khalifa',
    managerEmail: 'ahmed.khalifa@sportbook.app',
    courts: 3,
    utilization: 46,
    monthlyRevenue: 76000,
    status: 'Maintenance',
  },
  {
    id: 'br-new-cairo-lakes',
    name: 'New Cairo Lakes',
    city: 'Cairo',
    address: '12 South 90 St, New Cairo',
    manager: 'Nada Ashraf',
    managerEmail: 'nada.ashraf@sportbook.app',
    courts: 6,
    utilization: 78,
    monthlyRevenue: 210000,
    status: 'Active',
  },
]

export const courtsData: CourtRecord[] = [
  {
    id: 'ct-padel-a1',
    branchId: 'br-nasr-city',
    name: 'Padel Court A1',
    sport: 'Padel',
    surface: 'Acrylic',
    indoor: false,
    lights: true,
    status: 'Active',
    pricePerHour: 580,
    nextMaintenance: '2026-05-12',
  },
  {
    id: 'ct-padel-a2',
    branchId: 'br-nasr-city',
    name: 'Padel Court A2',
    sport: 'Padel',
    surface: 'Acrylic',
    indoor: true,
    lights: true,
    status: 'Active',
    pricePerHour: 620,
    nextMaintenance: '2026-05-20',
  },
  {
    id: 'ct-tennis-b1',
    branchId: 'br-zayed-central',
    name: 'Tennis Court B1',
    sport: 'Tennis',
    surface: 'Hard Court',
    indoor: false,
    lights: true,
    status: 'Active',
    pricePerHour: 500,
    nextMaintenance: '2026-05-09',
  },
  {
    id: 'ct-football-c1',
    branchId: 'br-zayed-central',
    name: 'Football Field C1',
    sport: 'Football',
    surface: 'Artificial Grass',
    indoor: false,
    lights: true,
    status: 'Maintenance',
    pricePerHour: 780,
    nextMaintenance: '2026-04-28',
  },
  {
    id: 'ct-padel-d1',
    branchId: 'br-new-cairo-lakes',
    name: 'Padel Court D1',
    sport: 'Padel',
    surface: 'Acrylic',
    indoor: false,
    lights: true,
    status: 'Active',
    pricePerHour: 640,
    nextMaintenance: '2026-05-26',
  },
  {
    id: 'ct-basket-d2',
    branchId: 'br-new-cairo-lakes',
    name: 'Basketball Court D2',
    sport: 'Basketball',
    surface: 'Hard Court',
    indoor: true,
    lights: true,
    status: 'Active',
    pricePerHour: 450,
    nextMaintenance: '2026-05-15',
  },
  {
    id: 'ct-tennis-e1',
    branchId: 'br-alex-seaview',
    name: 'Tennis Court E1',
    sport: 'Tennis',
    surface: 'Hard Court',
    indoor: false,
    lights: true,
    status: 'Paused',
    pricePerHour: 430,
    nextMaintenance: '2026-05-30',
  },
  {
    id: 'ct-padel-f1',
    branchId: 'br-mansoura-east',
    name: 'Padel Court F1',
    sport: 'Padel',
    surface: 'Acrylic',
    indoor: false,
    lights: false,
    status: 'Maintenance',
    pricePerHour: 390,
    nextMaintenance: '2026-04-25',
  },
]

export const approvalsData: ApprovalRecord[] = [
  {
    id: 'ap-3201',
    type: 'Bulk Booking',
    subject: 'Corporate event booking for 6 courts',
    requestedBy: 'Rana Soliman',
    branchId: 'br-nasr-city',
    submittedAt: '2026-04-16 10:22',
    priority: 'High',
    status: 'Pending',
  },
  {
    id: 'ap-3202',
    type: 'Discount Override',
    subject: '25% override for academy package',
    requestedBy: 'Mona Fawzy',
    branchId: 'br-nasr-city',
    submittedAt: '2026-04-16 09:05',
    priority: 'Medium',
    status: 'Pending',
  },
  {
    id: 'ap-3203',
    type: 'Refund Exception',
    subject: 'Late cancellation weather exception',
    requestedBy: 'Karim Helal',
    branchId: 'br-zayed-central',
    submittedAt: '2026-04-15 20:14',
    priority: 'Low',
    status: 'Approved',
  },
  {
    id: 'ap-3204',
    type: 'Staff Access',
    subject: 'Temporary manager access for Ramadan shift',
    requestedBy: 'Reem Saber',
    branchId: 'br-alex-seaview',
    submittedAt: '2026-04-15 18:33',
    priority: 'Medium',
    status: 'Rejected',
  },
]

export const operatorBookingsData: OperatorBookingRecord[] = [
  {
    id: 'ob-8001',
    customer: 'Youssef Adel',
    branchId: 'br-nasr-city',
    courtId: 'ct-padel-a1',
    date: '2026-04-16',
    slot: '19:00 - 20:00',
    amount: 580,
    paymentMethod: 'Visa',
    status: 'Confirmed',
  },
  {
    id: 'ob-8002',
    customer: 'Maya Fathi',
    branchId: 'br-zayed-central',
    courtId: 'ct-tennis-b1',
    date: '2026-04-16',
    slot: '18:00 - 19:00',
    amount: 500,
    paymentMethod: 'Wallet',
    status: 'Pending',
  },
  {
    id: 'ob-8003',
    customer: 'Omar Shaban',
    branchId: 'br-new-cairo-lakes',
    courtId: 'ct-padel-d1',
    date: '2026-04-15',
    slot: '21:00 - 22:00',
    amount: 640,
    paymentMethod: 'Apple Pay',
    status: 'Completed',
  },
  {
    id: 'ob-8004',
    customer: 'Nadine Wael',
    branchId: 'br-alex-seaview',
    courtId: 'ct-tennis-e1',
    date: '2026-04-15',
    slot: '17:00 - 18:00',
    amount: 430,
    paymentMethod: 'Cash',
    status: 'Cancelled',
  },
  {
    id: 'ob-8005',
    customer: 'Karim Mostafa',
    branchId: 'br-nasr-city',
    courtId: 'ct-padel-a2',
    date: '2026-04-16',
    slot: '20:00 - 21:00',
    amount: 620,
    paymentMethod: 'Visa',
    status: 'Pending',
  },
  {
    id: 'ob-8006',
    customer: 'Salma Adel',
    branchId: 'br-zayed-central',
    courtId: 'ct-football-c1',
    date: '2026-04-16',
    slot: '22:00 - 23:00',
    amount: 780,
    paymentMethod: 'Wallet',
    status: 'Pending',
  },
]

export const staffData: StaffRecord[] = [
  {
    id: 'st-1101',
    name: 'Mona Fawzy',
    role: 'Branch Manager',
    branchId: 'br-nasr-city',
    shift: 'Morning',
    phone: '+20 111 230 7781',
    email: 'mona.fawzy@sportbook.app',
    status: 'Active',
  },
  {
    id: 'st-1102',
    name: 'Mahmoud Rashed',
    role: 'Front Desk',
    branchId: 'br-nasr-city',
    shift: 'Evening',
    phone: '+20 100 883 4410',
    email: 'mahmoud.rashed@sportbook.app',
    status: 'Active',
  },
  {
    id: 'st-1103',
    name: 'Dina Magdy',
    role: 'Coach Coordinator',
    branchId: 'br-zayed-central',
    shift: 'Morning',
    phone: '+20 122 540 9182',
    email: 'dina.magdy@sportbook.app',
    status: 'Active',
  },
  {
    id: 'st-1104',
    name: 'Sherif Hatem',
    role: 'Maintenance',
    branchId: 'br-mansoura-east',
    shift: 'Night',
    phone: '+20 109 780 1236',
    email: 'sherif.hatem@sportbook.app',
    status: 'On Leave',
  },
  {
    id: 'st-1105',
    name: 'Reem Saber',
    role: 'Branch Manager',
    branchId: 'br-alex-seaview',
    shift: 'Morning',
    phone: '+20 101 734 1027',
    email: 'reem.saber@sportbook.app',
    status: 'Pending',
  },
  {
    id: 'st-1106',
    name: 'Adam Nader',
    role: 'Front Desk',
    branchId: 'br-new-cairo-lakes',
    shift: 'Evening',
    phone: '+20 112 448 0902',
    email: 'adam.nader@sportbook.app',
    status: 'Suspended',
  },
]

export const scheduleSlotsData: ScheduleSlot[] = [
  {
    id: 'sc-5001',
    branchId: 'br-nasr-city',
    courtId: 'ct-padel-a1',
    day: 'Mon',
    slot: '18:00 - 19:00',
    status: 'Booked',
    reference: 'ob-8001',
  },
  {
    id: 'sc-5002',
    branchId: 'br-nasr-city',
    courtId: 'ct-padel-a1',
    day: 'Mon',
    slot: '19:00 - 20:00',
    status: 'Open',
  },
  {
    id: 'sc-5003',
    branchId: 'br-zayed-central',
    courtId: 'ct-tennis-b1',
    day: 'Tue',
    slot: '17:00 - 18:00',
    status: 'Booked',
    reference: 'ob-8002',
  },
  {
    id: 'sc-5004',
    branchId: 'br-zayed-central',
    courtId: 'ct-football-c1',
    day: 'Tue',
    slot: '22:00 - 23:00',
    status: 'Blocked',
    reference: 'Maintenance',
  },
  {
    id: 'sc-5005',
    branchId: 'br-new-cairo-lakes',
    courtId: 'ct-padel-d1',
    day: 'Wed',
    slot: '20:00 - 21:00',
    status: 'Booked',
    reference: 'ob-8003',
  },
  {
    id: 'sc-5006',
    branchId: 'br-new-cairo-lakes',
    courtId: 'ct-basket-d2',
    day: 'Thu',
    slot: '18:00 - 19:00',
    status: 'Open',
  },
  {
    id: 'sc-5007',
    branchId: 'br-alex-seaview',
    courtId: 'ct-tennis-e1',
    day: 'Fri',
    slot: '17:00 - 18:00',
    status: 'Blocked',
    reference: 'Setup pending',
  },
  {
    id: 'sc-5008',
    branchId: 'br-mansoura-east',
    courtId: 'ct-padel-f1',
    day: 'Sat',
    slot: '19:00 - 20:00',
    status: 'Blocked',
    reference: 'Maintenance',
  },
]

export const reportJobs: ReportJob[] = [
  {
    id: 'rp-7001',
    name: 'Daily Revenue by Branch',
    branchId: 'br-nasr-city',
    frequency: 'Daily',
    owner: 'Operations Team',
    format: 'CSV',
    lastRun: '2026-04-16 06:10',
    status: 'Healthy',
  },
  {
    id: 'rp-7002',
    name: 'Cancellation Reasons Digest',
    branchId: 'br-zayed-central',
    frequency: 'Weekly',
    owner: 'Support Team',
    format: 'PDF',
    lastRun: '2026-04-15 22:00',
    status: 'Healthy',
  },
  {
    id: 'rp-7003',
    name: 'Maintenance Cost Tracker',
    branchId: 'br-mansoura-east',
    frequency: 'Monthly',
    owner: 'Facility Ops',
    format: 'XLSX',
    lastRun: '2026-04-01 08:40',
    status: 'Needs Review',
  },
]

export function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function getBranchNameById(branchId: string) {
  return branchesData.find((branch) => branch.id === branchId)?.name ?? branchId
}

export function getCourtNameById(courtId: string) {
  return courtsData.find((court) => court.id === courtId)?.name ?? courtId
}
