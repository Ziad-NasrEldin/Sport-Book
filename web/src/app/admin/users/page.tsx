'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Download, UserCog, UserMinus } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { usersData } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const roleOptions = ['All', 'Player', 'Coach', 'Facility', 'Admin'] as const
const statusOptions = ['All', 'Active', 'Pending', 'Suspended', 'Archived'] as const

function buildWhatsAppHref(userName: string, userId: string) {
  const message = `Hi ${userName}, this is the SportBook admin team regarding your account (${userId}).`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<(typeof roleOptions)[number]>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return usersData.filter((user) => {
      const matchSearch =
        query.length === 0 ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      const matchRole = selectedRole === 'All' || user.role === selectedRole
      const matchStatus = selectedStatus === 'All' || user.status === selectedStatus

      return matchSearch && matchRole && matchStatus
    })
  }, [search, selectedRole, selectedStatus])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        subtitle="Moderate platform accounts, review account health, and apply role-based actions without leaving the dashboard."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Users
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <UserCog className="w-4 h-4" />
              Create Admin
            </button>
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
                onChange={(event) => setSelectedRole(event.target.value as (typeof roleOptions)[number])}
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
                onChange={(event) => setSelectedStatus(event.target.value as (typeof statusOptions)[number])}
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
          <AdminTable
            items={filteredUsers}
            getRowKey={(user) => user.id}
            columns={[
              {
                key: 'identity',
                header: 'User',
                render: (user) => (
                  <div>
                    <p className="font-bold text-primary">{user.name}</p>
                    <p className="text-xs text-primary/60 mt-1">{user.email}</p>
                  </div>
                ),
              },
              {
                key: 'meta',
                header: 'Role & Region',
                render: (user) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{user.role}</p>
                    <p className="text-xs text-primary/55 mt-1">{user.country}</p>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (user) => <AdminStatusPill label={user.status} tone={statusTone(user.status)} />,
              },
              {
                key: 'joined',
                header: 'Joined',
                render: (user) => <p className="text-sm text-primary/70">{user.joinedAt}</p>,
              },
              {
                key: 'id',
                header: 'ID',
                render: (user) => <p className="font-lexend text-xs uppercase tracking-[0.12em] text-primary/55">{user.id}</p>,
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (user) => (
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
                      href={buildWhatsAppHref(user.name, user.id)}
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
        </div>
      </AdminPanel>
    </div>
  )
}
