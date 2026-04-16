'use client'

import { useCallback, useMemo, useState } from 'react'
import { Download, UserPlus2 } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { statusTone } from '@/lib/admin/ui'
import type { StaffRecord } from '@/lib/operator/mockData'

const roleOptions = ['All', 'Branch Manager', 'Front Desk', 'Maintenance', 'Coach Coordinator'] as const
const statusOptions = ['All', 'Active', 'Pending', 'On Leave', 'Suspended'] as const

export default function OperatorStaffPage() {
  const { data: staffResponse, loading, error } = useApiCall('/operator/staff')
  const { data: branchesResponse } = useApiCall('/operator/branches')

  const staffData = staffResponse?.data || staffResponse || []
  const branchesData = branchesResponse?.data || branchesResponse || []

  const branchOptions = ['All', ...branchesData.map((branch: any) => branch.id)] as const

  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<(typeof roleOptions)[number]>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')
  const [selectedBranch, setSelectedBranch] = useState<(typeof branchOptions)[number]>('All')

  const handleRoleChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value as (typeof roleOptions)[number])
  }, [])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as (typeof statusOptions)[number])
  }, [])

  const handleBranchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(event.target.value as (typeof branchOptions)[number])
  }, [])

  const visibleStaff = useMemo(() => {
    const query = search.trim().toLowerCase()

    return staffData.filter((member: StaffRecord) => {
      const matchesSearch =
        query.length === 0 ||
        member.name.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      const matchesRole = selectedRole === 'All' || member.role === selectedRole
      const matchesStatus = selectedStatus === 'All' || member.status === selectedStatus
      const matchesBranch = selectedBranch === 'All' || member.branchId === selectedBranch

      return matchesSearch && matchesRole && matchesStatus && matchesBranch
    })
  }, [search, selectedRole, selectedStatus, selectedBranch, staffData])

  const getBranchNameById = (branchId: string) => {
    const found = branchesData.find((b: any) => b.id === branchId)
    return found?.name || 'Unknown Branch'
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Staff Management"
        subtitle="Track branch staffing, monitor shift coverage, and coordinate facility teams from one operational board."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Staff
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <UserPlus2 className="w-4 h-4" />
              Invite Staff
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Directory" title="Team Roster">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, id, or email"
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

              <select
                value={selectedBranch}
                onChange={handleBranchChange}
                className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
              >
                {branchOptions.map((branchId) => (
                  <option key={branchId} value={branchId}>
                    {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
                  </option>
                ))}
              </select>
            </>
          }
        />

        <div className="mt-4">
          {loading ? (
            <SkeletonTable />
          ) : (
            <AdminTable
              items={visibleStaff}
              getRowKey={(member: any) => member.id}
              columns={[
                {
                  key: 'staff',
                  header: 'Staff Member',
                  render: (member: any) => (
                    <div>
                      <p className="font-bold text-primary">{member.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{member.id || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'role',
                  header: 'Role',
                  render: (member: any) => <p className="text-sm font-semibold text-primary">{member.role || 'Unknown'}</p>,
                },
                {
                  key: 'branch',
                  header: 'Branch',
                  render: (member: any) => <p className="text-sm text-primary/75">{getBranchNameById(member.branchId)}</p>,
                },
                {
                  key: 'shift',
                  header: 'Shift',
                  render: (member: any) => <p className="text-sm text-primary/70">{member.shift || 'Unknown'}</p>,
                },
                {
                  key: 'contact',
                  header: 'Contact',
                  render: (member: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{member.phone || 'Unknown'}</p>
                      <p className="text-xs text-primary/55 mt-1">{member.email || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (member: any) => <AdminStatusPill label={member.status || 'Unknown'} tone={statusTone(member.status || 'Unknown')} />,
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
