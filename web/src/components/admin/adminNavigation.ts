import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BadgeCheck,
  CalendarCheck2,
  TicketPercent,
  ShoppingBag,
  Landmark,
  Settings,
  Trophy,
  Languages,
  MessageSquareWarning,
  Shield,
  FileText,
  BarChart3,
} from 'lucide-react'

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Facilities', href: '/admin/facilities', icon: Building2 },
  { label: 'Coaches', href: '/admin/coaches', icon: GraduationCap },
  { label: 'Verification', href: '/admin/verification', icon: BadgeCheck },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck2 },
  { label: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
  { label: 'Store Management', href: '/admin/store-management', icon: ShoppingBag },
  { label: 'Finance', href: '/admin/finance', icon: Landmark },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Sports', href: '/admin/sports', icon: Trophy },
  { label: 'Localization', href: '/admin/localization', icon: Languages },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquareWarning },
  { label: 'Audit', href: '/admin/audit', icon: Shield },
  { label: 'CMS', href: '/admin/cms', icon: FileText },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
]
