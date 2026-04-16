import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  CalendarClock,
  BriefcaseBusiness,
  CalendarCheck2,
  BarChart3,
  UserCircle2,
  Settings,
} from 'lucide-react'

export type CoachNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const coachNavItems: CoachNavItem[] = [
  { label: 'Dashboard', href: '/coach/dashboard', icon: LayoutDashboard },
  { label: 'Availability', href: '/coach/availability', icon: CalendarClock },
  { label: 'Services', href: '/coach/services', icon: BriefcaseBusiness },
  { label: 'Bookings', href: '/coach/bookings', icon: CalendarCheck2 },
  { label: 'Reports', href: '/coach/reports', icon: BarChart3 },
  { label: 'Profile', href: '/coach/profile', icon: UserCircle2 },
  { label: 'Settings', href: '/coach/settings', icon: Settings },
]
