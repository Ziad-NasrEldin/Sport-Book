'use client'

import { useMemo, useState } from 'react'
import { CalendarRange, Download } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import {
  branchesData,
  getBranchNameById,
  getCourtNameById,
  scheduleSlotsData,
} from '@/lib/operator/mockData'
import { statusTone } from '@/lib/admin/ui'

const branchOptions = ['All', ...branchesData.map((branch) => branch.id)] as const
const statusOptions = ['All', 'Open', 'Booked', 'Blocked'] as const
const weekOptions = ['This Week', 'Next Week', 'Following Week'] as const

export default function OperatorSchedulePage() {
  const [selectedBranch, setSelectedBranch] = useState<(typeof branchOptions)[number]>('All')
  const [selectedStatus, setSelectedStatus] = useState<(typeof statusOptions)[number]>('All')
  const [selectedWeek, setSelectedWeek] = useState<(typeof weekOptions)[number]>('This Week')

  const visibleSlots = useMemo(() => {
    return scheduleSlotsData.filter((slot) => {
      const matchesBranch = selectedBranch === 'All' || slot.branchId === selectedBranch
      const matchesStatus = selectedStatus === 'All' || slot.status === selectedStatus
      return matchesBranch && matchesStatus
    })
  }, [selectedBranch, selectedStatus])

  const daySummary = useMemo(() => {
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

    return orderedDays.map((day) => {
      const daySlots = visibleSlots.filter((slot) => slot.day === day)
      return {
        day,
        total: daySlots.length,
        booked: daySlots.filter((slot) => slot.status === 'Booked').length,
        blocked: daySlots.filter((slot) => slot.status === 'Blocked').length,
      }
    })
  }, [visibleSlots])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Schedule Management"
        subtitle="Control slot availability, track blocked windows, and monitor booking pressure by branch."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <Download className="w-4 h-4" />
              Export Schedule
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <CalendarRange className="w-4 h-4" />
              Publish Changes
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Planner" title="Weekly Slot Grid">
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedBranch}
            onChange={(event) => setSelectedBranch(event.target.value as (typeof branchOptions)[number])}
            className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
          >
            {branchOptions.map((branchId) => (
              <option key={branchId} value={branchId}>
                {branchId === 'All' ? 'All Branches' : getBranchNameById(branchId)}
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

          <select
            value={selectedWeek}
            onChange={(event) => setSelectedWeek(event.target.value as (typeof weekOptions)[number])}
            className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
          >
            {weekOptions.map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <AdminTable
            items={visibleSlots}
            getRowKey={(slot) => slot.id}
            columns={[
              {
                key: 'day',
                header: 'Day',
                render: (slot) => <p className="text-sm font-semibold text-primary">{slot.day}</p>,
              },
              {
                key: 'slot',
                header: 'Time Slot',
                render: (slot) => <p className="text-sm text-primary/75">{slot.slot}</p>,
              },
              {
                key: 'court',
                header: 'Court',
                render: (slot) => (
                  <div>
                    <p className="text-sm font-semibold text-primary">{getCourtNameById(slot.courtId)}</p>
                    <p className="text-xs text-primary/55 mt-1">{getBranchNameById(slot.branchId)}</p>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (slot) => <AdminStatusPill label={slot.status} tone={statusTone(slot.status)} />,
              },
              {
                key: 'reference',
                header: 'Reference',
                render: (slot) => <p className="text-sm text-primary/70">{slot.reference ?? 'None'}</p>,
              },
            ]}
          />
        </div>
      </AdminPanel>

      <AdminPanel eyebrow="Summary" title={`${selectedWeek} by Day`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {daySummary.map((summary) => (
            <article key={summary.day} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">{summary.day}</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{summary.total}</p>
              <p className="mt-1 text-xs text-primary/60">Booked {summary.booked} • Blocked {summary.blocked}</p>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  )
}
