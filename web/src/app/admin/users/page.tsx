'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { Download, UserCog, UserMinus } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

const roleOptions = ['All', 'PLAYER', 'COACH', 'FACILITY', 'OPERATOR', 'ADMIN'] as const
const statusOptions = ['All', 'ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'] as const

type UserRole = 'PLAYER' | 'COACH' | 'FACILITY' | 'OPERATOR' | 'ADMIN'
type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  country?: string
  createdAt: string
}

function buildWhatsAppHref(userName: string, userId: string) {
  const message = `Hi ${userName}, this is the SportBook admin team regarding your account (${userId}).`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<(typeof roleOptions)[number]>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')

  const { data: usersResponse, loading, error } = useApiCall('/admin-workspace/users')

  const usersData = useMemo<User[]>(() => {
    const payload = usersResponse && 'data' in usersResponse ? usersResponse.data : usersResponse
    return Array.isArray(payload) ? (payload as User[]) : []
  }, [usersResponse])

  const handleRoleChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value as (typeof roleOptions)[number])
  }, [])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as (typeof statusOptions)[number])
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return usersData.filter((user: User) => {
      const matchSearch =
        query.length === 0 ||
        user.name?.toLowerCase()?.includes(query) ||
        user.email?.toLowerCase()?.includes(query) ||
        user.id?.toLowerCase()?.includes(query)
      const matchRole = selectedRole === 'All' || user.role === selectedRole
      const matchStatus = selectedStatus === 'All' || user.status === selectedStatus

      return matchSearch && matchRole && matchStatus
    })
  }, [search, selectedRole, selectedStatus, usersData])

  const userStats = useMemo(() => {
    return usersData.reduce(
      (acc: { total: number; active: number; suspended: number; pending: number }, user: User) => {
        acc.total += 1
        if (user.status === 'ACTIVE') acc.active += 1
        if (user.status === 'SUSPENDED') acc.suspended += 1
        if (user.status === 'PENDING_VERIFICATION') acc.pending += 1
        return acc
      },
      { total: 0, active: 0, suspended: 0, pending: 0 }
    )
  }, [usersData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        subtitle="Moderate platform accounts, review account health, and apply role-based actions without leaving the dashboard."
        className="px-4 py-5 md:px-6"
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                const headers = 'ID,Name,Email,Role,Status,Created At'
                const rows = filteredUsers.map((u: User) =>
                  [u.id, u.name, u.email, u.role, u.status, u.createdAt].join(',')
                )
                const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface-container-highest px-4 py-2 text-sm font-semibold text-primary shadow-[0_10px_26px_-20px_rgba(0,17,58,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-lowest hover:shadow-[0_18px_30px_-20px_rgba(0,17,58,0.65)] active:translate-y-0"
            >
              <Download className="w-4 h-4" />
              Export Users
            </button>
            <Link
              href="/admin/verification"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest shadow-[0_16px_30px_-18px_rgba(0,17,58,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            >
              <UserCog className="w-4 h-4" />
              Create Admin
            </Link>
          </>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.35rem] border border-primary/10 bg-surface-container-lowest p-4 shadow-[0_20px_45px_-34px_rgba(0,17,58,0.75)] animate-[var(--animate-soft-rise)]">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/60">Total Accounts</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{userStats.total}</p>
        </article>
        <article className="rounded-[1.35rem] border border-primary/10 bg-gradient-to-br from-primary to-primary-container p-4 shadow-[0_22px_46px_-28px_rgba(0,17,58,0.95)] animate-[var(--animate-soft-rise)] animation-delay-100">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-surface-container-lowest/75">Active</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-container-lowest">{userStats.active}</p>
        </article>
        <article className="rounded-[1.35rem] border border-[#fd8b00]/35 bg-gradient-to-br from-[#fff3e5] to-[#ffe2bf] p-4 shadow-[0_22px_46px_-28px_rgba(253,139,0,0.7)] animate-[var(--animate-soft-rise)] animation-delay-200">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-[#8a4300]">Pending Verification</p>
          <p className="mt-2 text-3xl font-extrabold text-[#603100]">{userStats.pending}</p>
        </article>
        <article className="rounded-[1.35rem] border border-[#c91919]/20 bg-gradient-to-br from-[#fff3f3] to-[#ffe4e4] p-4 shadow-[0_22px_46px_-28px_rgba(201,25,25,0.6)] animate-[var(--animate-soft-rise)] animation-delay-300">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-[#9b1c1c]">Suspended</p>
          <p className="mt-2 text-3xl font-extrabold text-[#7a1616]">{userStats.suspended}</p>
        </article>
      </section>

      <AdminPanel
        eyebrow="Filters"
        title="User Directory"
        className="border border-primary/10 bg-surface-container-lowest/95 shadow-[0_26px_54px_-36px_rgba(0,17,58,0.85)]"
      >
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by id, email, or user name"
          controls={
            <>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="rounded-full border border-primary/10 bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none transition-colors hover:bg-surface-container-medium"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="rounded-full border border-primary/10 bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none transition-colors hover:bg-surface-container-medium"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-secondary-container to-[#ff9f22] px-3.5 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-on-secondary-container shadow-[0_14px_28px_-18px_rgba(253,139,0,0.9)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserMinus className="w-3.5 h-3.5" />
                Suspend Selection
              </button>
            </>
          }
        />

        <div className="mt-4 rounded-[1.25rem] border border-primary/8 bg-surface-container-lowest p-2">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <p className="text-[10px] font-lexend uppercase tracking-[0.14em] text-primary/55">Live Directory Snapshot</p>
            <p className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary">
              {filteredUsers.length} Visible
            </p>
          </div>
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={filteredUsers}
              getRowKey={(user) => user.id}
              columns={[
                {
                  key: 'identity',
                  header: 'User',
                  render: (user) => (
                    <div>
                      <p className="font-bold text-primary">{user.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{user.email || 'No email'}</p>
                    </div>
                  ),
                },
                {
                  key: 'meta',
                  header: 'Role & Region',
                  render: (user) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{user.role || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{user.country || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (user) => <AdminStatusPill label={user.status || 'Unknown'} tone={statusTone(user.status || 'Unknown')} />,
                },
                {
                  key: 'joined',
                  header: 'Joined',
                  render: (user) => <p className="text-sm text-primary/70">{user.createdAt || 'Unknown'}</p>,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (user) => (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/users/${encodeURIComponent(user.id)}`}
                        className="inline-flex items-center rounded-full border border-primary/15 bg-surface-container-high px-2.5 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-surface-container-medium"
                      >
                        View Account Details
                      </Link>

                      <Link
                        href={`/admin/users/${encodeURIComponent(user.id)}/edit`}
                        className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary-container px-2.5 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-surface-container-lowest transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Edit Account
                      </Link>

                      <a
                        href={buildWhatsAppHref(user.name || 'User', user.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-[#25D366]/40 bg-[#25D366]/20 px-2.5 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-[#128C7E] transition-colors hover:bg-[#25D366]/30"
                      >
                        Quick Chat on WhatsApp
                      </a>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
