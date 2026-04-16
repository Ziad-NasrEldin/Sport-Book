import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarCheck2,
  CalendarClock,
  Grid2x2,
  LayoutDashboard,
  Settings2,
  UserCircle2,
  Users,
} from 'lucide-react'

export type OperatorNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const operatorNavItems: OperatorNavItem[] = [
  { label: 'Dashboard', href: '/operator/dashboard', icon: LayoutDashboard },
  { label: 'Branches', href: '/operator/branches', icon: Building2 },
  { label: 'Courts', href: '/operator/courts', icon: Grid2x2 },
  { label: 'Schedule', href: '/operator/schedule', icon: CalendarClock },
  { label: 'Approvals', href: '/operator/approvals', icon: BadgeCheck },
  { label: 'Bookings', href: '/operator/bookings', icon: CalendarCheck2 },
  { label: 'Reports', href: '/operator/reports', icon: BarChart3 },
  { label: 'Staff', href: '/operator/staff', icon: Users },
  { label: 'Profile', href: '/operator/profile', icon: UserCircle2 },
  { label: 'Settings', href: '/operator/settings', icon: Settings2 },
]
