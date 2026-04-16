import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { LogoutButton } from '@/components/auth/LogoutButton'

type DashboardRole = 'admin' | 'coach' | 'facility' | 'operator'

type DashboardPageProps = {
  params: Promise<{ role: string }>
}

type DashboardConfig = {
  title: string
  subtitle: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
}

const dashboardByRole: Record<DashboardRole, DashboardConfig> = {
  admin: {
    title: 'Admin Dashboard',
    subtitle: 'Manage users, operations, and platform sections quickly.',
    primaryHref: '/profile',
    primaryLabel: 'Open Profile Center',
    secondaryHref: '/teams',
    secondaryLabel: 'Open Teams Moderation',
  },
  coach: {
    title: 'Coach Dashboard',
    subtitle: 'Manage coaching visibility, sessions, and bookings.',
    primaryHref: '/coach/dashboard',
    primaryLabel: 'Open Coach Suite',
    secondaryHref: '/coach/bookings',
    secondaryLabel: 'Open Coach Bookings',
  },
  facility: {
    title: 'Facility Dashboard',
    subtitle: 'Manage listed products, orders, and facility storefront.',
    primaryHref: '/store',
    primaryLabel: 'Open Facility Store',
    secondaryHref: '/profile/store-purchases',
    secondaryLabel: 'Open Purchase History',
  },
  operator: {
    title: 'Operator Dashboard',
    subtitle: 'Manage branches, courts, bookings, and approvals from one operator workspace.',
    primaryHref: '/operator/dashboard',
    primaryLabel: 'Open Operator Suite',
    secondaryHref: '/operator/bookings',
    secondaryLabel: 'Open Operator Bookings',
  },
}

function isDashboardRole(value: string): value is DashboardRole {
  return value === 'admin' || value === 'coach' || value === 'facility' || value === 'operator'
}

export default async function DashboardRolePage({ params }: DashboardPageProps) {
  const { role } = await params

  if (!isDashboardRole(role)) {
    notFound()
  }

  if (role === 'admin') {
    redirect('/admin/dashboard')
  }

  const dashboard = dashboardByRole[role]

  return (
    <main className="w-full min-h-screen bg-surface-container-low px-5 py-8 md:px-10 lg:px-14 md:py-10">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
        <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/55">Signed in role</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-primary">{dashboard.title}</h1>
        <p className="mt-2 text-sm md:text-base text-primary/60">{dashboard.subtitle}</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={dashboard.primaryHref}
            className="inline-flex items-center justify-center h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 transition-all"
          >
            {dashboard.primaryLabel}
          </Link>
          <Link
            href={dashboard.secondaryHref}
            className="inline-flex items-center justify-center h-12 rounded-[var(--radius-full)] bg-surface-container-low text-primary font-bold hover:bg-surface-container-high transition-colors"
          >
            {dashboard.secondaryLabel}
          </Link>
        </div>

        <LogoutButton
          className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[var(--radius-full)] bg-surface-container-low text-primary font-bold hover:bg-surface-container-high transition-colors"
        />

        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-bold text-secondary-container hover:text-secondary transition-colors"
        >
          Go to Player Home
        </Link>
      </div>
    </main>
  )
}
