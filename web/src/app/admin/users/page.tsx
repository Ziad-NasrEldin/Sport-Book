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

  const usersData = usersResponse?.data || usersResponse || []

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

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        subtitle="Moderate platform accounts, review account health, and apply role-based actions without leaving the dashboard."
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
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              Export Users
            </button>
            <Link
              href="/admin/verification"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserCog className="w-4 h-4" />
              Create Admin
            </Link>
          </>
        }
      />

      <AdminPanel eyebrow="Filters" title="User Directory">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by id, email, or user name"
          controls={
            <>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
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
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3.5 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-on-secondary-container"
              >
                <UserMinus className="w-3.5 h-3.5" />
                Suspend Selection
              </button>
            </>
          }
        />

        <div className="mt-4">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={filteredUsers}
              getRowKey={(user: any) => user.id}
              columns={[
                {
                  key: 'identity',
                  header: 'User',
                  render: (user: any) => (
                    <div>
                      <p className="font-bold text-primary">{user.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{user.email || 'No email'}</p>
                    </div>
                  ),
                },
                {
                  key: 'meta',
                  header: 'Role & Region',
                  render: (user: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{user.role || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{user.country || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (user: any) => <AdminStatusPill label={user.status || 'Unknown'} tone={statusTone(user.status || 'Unknown')} />,
                },
                {
                  key: 'joined',
                  header: 'Joined',
                  render: (user: any) => <p className="text-sm text-primary/70">{user.createdAt || 'Unknown'}</p>,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (user: any) => (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/users/${encodeURIComponent(user.id)}`}
                        className="inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
                      >
                        View Account Details
                      </Link>

                      <Link
                        href={`/admin/users/${encodeURIComponent(user.id)}/edit`}
                        className="inline-flex items-center rounded-full bg-primary-container px-2.5 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-surface-container-lowest"
                      >
                        Edit Account
                      </Link>

                      <a
                        href={buildWhatsAppHref(user.name || 'User', user.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full bg-[#25D366]/20 px-2.5 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-[#128C7E]"
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
