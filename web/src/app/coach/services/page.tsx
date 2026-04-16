'use client'

import { useMemo, useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import {
  coachServices,
  formatEgp,
  sessionTypes,
} from '@/lib/coach/mockData'
import { statusTone } from '@/lib/admin/ui'

export default function CoachServicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Paused' | 'Draft'>('all')

  const sessionTypeMap = useMemo(() => {
    return new Map(sessionTypes.map((sessionType) => [sessionType.id, sessionType]))
  }, [])

  const filteredServices = useMemo(() => {
    return coachServices.filter((service) => {
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter
      const query = search.trim().toLowerCase()
      const sessionType = sessionTypeMap.get(service.sessionTypeId)

      const matchesSearch =
        query.length === 0 ||
        service.title.toLowerCase().includes(query) ||
        service.sport.toLowerCase().includes(query) ||
        (sessionType?.name.toLowerCase().includes(query) ?? false)

      return matchesStatus && matchesSearch
    })
  }, [search, sessionTypeMap, statusFilter])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        subtitle="Design your service catalog and session formats. Session types here will power player booking experiences in the next integration step."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </button>
        }
      />

      <AdminPanel
        eyebrow="Coach-managed"
        title="Session Type Formats"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-bold text-primary"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Edit Rules
          </button>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {sessionTypes.map((sessionType) => (
            <article key={sessionType.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-primary">{sessionType.name}</p>
                  <p className="text-xs text-primary/60 mt-1">{sessionType.description}</p>
                </div>
                <AdminStatusPill label={sessionType.status} tone={statusTone(sessionType.status)} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-[var(--radius-default)] bg-surface-container-lowest px-2.5 py-2">
                  <p className="font-lexend uppercase tracking-[0.14em] text-primary/45">Participants</p>
                  <p className="text-primary font-bold mt-1">{sessionType.minParticipants}-{sessionType.maxParticipants}</p>
                </div>
                <div className="rounded-[var(--radius-default)] bg-surface-container-lowest px-2.5 py-2">
                  <p className="font-lexend uppercase tracking-[0.14em] text-primary/45">Base Rate</p>
                  <p className="text-primary font-bold mt-1">{formatEgp(sessionType.baseRate)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sessionType.durationOptions.map((duration) => (
                  <span
                    key={duration}
                    className="px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.12em] bg-surface-container-lowest text-primary/75"
                  >
                    {duration}m
                  </span>
                ))}
              </div>

              <p className="text-xs text-primary/60">
                Visibility: <span className="font-bold text-primary">{sessionType.visibility}</span> • Multiplier {sessionType.multiplier}x
              </p>
            </article>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel eyebrow="Catalog" title="Published Services">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search services, sports, or session format"
          controls={
            ['all', 'Active', 'Paused', 'Draft'].map((status) => {
              const isActive = statusFilter === status

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  className={`px-3 py-2 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.14em] ${
                    isActive
                      ? 'bg-primary-container text-surface-container-lowest'
                      : 'bg-surface-container-low text-primary/70'
                  }`}
                >
                  {status}
                </button>
              )
            })
          }
        />

        <div className="mt-4">
          <AdminTable
            items={filteredServices}
            getRowKey={(service) => service.id}
            columns={[
              {
                key: 'service',
                header: 'Service',
                render: (service) => (
                  <div>
                    <p className="font-bold text-primary">{service.title}</p>
                    <p className="text-xs text-primary/60 mt-1">{service.sport}</p>
                  </div>
                ),
              },
              {
                key: 'sessionType',
                header: 'Session Type',
                render: (service) => (
                  <span className="font-semibold text-primary">{sessionTypeMap.get(service.sessionTypeId)?.name ?? 'N/A'}</span>
                ),
              },
              {
                key: 'duration',
                header: 'Duration',
                render: (service) => <span className="font-semibold text-primary">{service.duration} min</span>,
              },
              {
                key: 'price',
                header: 'Price',
                render: (service) => <span className="font-bold text-primary">{formatEgp(service.price)}</span>,
              },
              {
                key: 'bookings',
                header: 'Bookings (Month)',
                render: (service) => <span className="font-semibold text-primary">{service.bookingsThisMonth}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (service) => <AdminStatusPill label={service.status} tone={statusTone(service.status)} />,
              },
            ]}
          />
        </div>
      </AdminPanel>
    </div>
  )
}
