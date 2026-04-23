'use client'

import { useCallback, useMemo, useState } from 'react'
import { CalendarRange, Download } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import type { ScheduleSlot, BranchRecord, CourtRecord } from '@/lib/operator/mockData'
import { AppSelect } from '@/components/ui/AppSelect'

const statusOptions = ['All', 'OPEN', 'BOOKED', 'BLOCKED'] as const
const weekOptions = ['This Week', 'Next Week', 'Following Week'] as const

export default function OperatorSchedulePage() {
  const [selectedBranch, setSelectedBranch] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')
  const [selectedWeek, setSelectedWeek] = useState<(typeof weekOptions)[number]>('This Week')

  const { data: scheduleResponse, loading, error } = useApiCall('/operator/schedule')
  const { data: branchesResponse } = useApiCall('/operator/branches')
  const { data: courtsResponse } = useApiCall('/operator/courts')

  const handleBranchChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranch(event.target.value)
  }, [])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value as (typeof statusOptions)[number])
  }, [])

  const handleWeekChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWeek(event.target.value as (typeof weekOptions)[number])
  }, [])

  const scheduleSlotsData = Array.isArray(scheduleResponse) ? scheduleResponse : (Array.isArray(scheduleResponse?.data) ? scheduleResponse.data : [])
  const branchesData = Array.isArray(branchesResponse) ? branchesResponse : (Array.isArray(branchesResponse?.data) ? branchesResponse.data : [])
  const courtsData = Array.isArray(courtsResponse) ? courtsResponse : (Array.isArray(courtsResponse?.data) ? courtsResponse.data : [])

  const branchOptions = ['All', ...branchesData.map((branch: BranchRecord) => branch.id)]

  const getBranchNameById = (branchId: string) => {
    const found = branchesData.find((b: BranchRecord) => b.id === branchId)
    return found?.name || 'Unknown Branch'
  }

  const getCourtNameById = (courtId: string) => {
    const found = courtsData.find((c: CourtRecord) => c.id === courtId)
    return found?.name || 'Unknown Court'
  }

  const visibleSlots = useMemo(() => {
    return scheduleSlotsData.filter((slot: ScheduleSlot) => {
      const matchesBranch = selectedBranch === 'All' || slot.branchId === selectedBranch
      const matchesStatus = selectedStatus === 'All' || (slot.status as string).toUpperCase() === selectedStatus
      return matchesBranch && matchesStatus
    })
  }, [scheduleSlotsData, selectedBranch, selectedStatus])

  const daySummary = useMemo(() => {
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

    return orderedDays.map((day) => {
      const daySlots = visibleSlots.filter((slot: any) => slot.day === day)
      return {
        day,
        total: daySlots.length,
        booked: daySlots.filter((slot: any) => slot.status === 'BOOKED').length,
        blocked: daySlots.filter((slot: any) => slot.status === 'BLOCKED').length,
      }
    })
  }, [visibleSlots])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6 motion-safe:animate-[var(--animate-fade-in)]">
      <AdminPageHeader
        title="Schedule Management"
        subtitle="Control slot availability, track blocked windows, and monitor booking pressure by branch."
        className="motion-safe:animate-[var(--animate-soft-drop)]"
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-4 py-2 text-sm font-bold text-primary shadow-[0_8px_24px_-12px_rgba(0,17,58,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(0,17,58,0.85)] active:translate-y-0 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
            >
              <Download className="w-4 h-4" />
              Export Schedule
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container px-4 py-2 text-sm font-bold text-surface-container-lowest shadow-[0_20px_40px_-20px_rgba(0,35,102,1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_48px_-18px_rgba(0,35,102,1.1)] active:translate-y-0 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
            >
              <CalendarRange className="w-4 h-4" />
              Publish Changes
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Planner" title="Weekly Slot Grid" className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-100">
        <div className="flex flex-wrap gap-2">
          <AppSelect
            value={selectedBranch}
            onChange={handleBranchChange}
            className="rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2 text-xs font-lexend font-black uppercase tracking-[0.12em] text-primary outline-none shadow-[0_4px_12px_-8px_rgba(0,17,58,0.3)] transition-colors hover:shadow-[0_8px_16px_-10px_rgba(0,17,58,0.4)]"
          >
            {branchOptions.map((branchId: any) => (
              <option key={branchId} value={branchId}>
                {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
              </option>
            ))}
          </AppSelect>

          <AppSelect
            value={selectedStatus}
            onChange={handleStatusChange}
            className="rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2 text-xs font-lexend font-black uppercase tracking-[0.12em] text-primary outline-none shadow-[0_4px_12px_-8px_rgba(0,17,58,0.3)] transition-colors hover:shadow-[0_8px_16px_-10px_rgba(0,17,58,0.4)]"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </AppSelect>

          <AppSelect
            value={selectedWeek}
            onChange={handleWeekChange}
            className="rounded-full bg-gradient-to-br from-surface-container-low to-surface-container-high px-3 py-2 text-xs font-lexend font-black uppercase tracking-[0.12em] text-primary outline-none shadow-[0_4px_12px_-8px_rgba(0,17,58,0.3)] transition-colors hover:shadow-[0_8px_16px_-10px_rgba(0,17,58,0.4)]"
          >
            {weekOptions.map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </AppSelect>
        </div>

        <div className="mt-4 motion-safe:animate-[var(--animate-fade-in)] animation-delay-150">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={visibleSlots}
              getRowKey={(slot: any) => slot.id}
              columns={[
                {
                  key: 'day',
                  header: 'Day',
                  render: (slot: any) => <p className="text-sm font-bold text-primary">{slot.day || 'Unknown'}</p>,
                },
                {
                  key: 'slot',
                  header: 'Time Slot',
                  render: (slot: any) => <p className="text-sm text-primary/75">{slot.slot || 'Unknown'}</p>,
                },
                {
                  key: 'court',
                  header: 'Court',
                  render: (slot: any) => (
                    <div>
                      <p className="text-sm font-bold text-primary">{getCourtNameById(slot.courtId)}</p>
                      <p className="text-xs text-primary/55 mt-1">{getBranchNameById(slot.branchId)}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (slot: any) => <AdminStatusPill label={slot.status || 'Unknown'} tone={statusTone(slot.status || 'Unknown')} />,
                },
                {
                  key: 'reference',
                  header: 'Reference',
                  render: (slot: any) => <p className="text-sm text-primary/70">{slot.reference || 'None'}</p>,
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>

      <AdminPanel eyebrow="Summary" title={`${selectedWeek} by Day`} className="motion-safe:animate-[var(--animate-soft-rise)] animation-delay-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {daySummary.map((summary, index: number) => (
            <article key={summary.day} className="rounded-[var(--radius-default)] bg-gradient-to-br from-surface-container-low to-surface-container-high p-3.5 shadow-[0_8px_20px_-12px_rgba(0,17,58,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-14px_rgba(0,17,58,0.5)] motion-safe:animate-[var(--animate-card-stagger)]" style={{ animationDelay: `${200 + index * 50}ms` }}>
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/60">{summary.day}</p>
              <p className="mt-1 text-2xl font-black text-primary">{summary.total}</p>
              <p className="mt-1 text-xs text-primary/60">Booked {summary.booked} • Blocked {summary.blocked}</p>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  )
}


