'use client'

import { useMemo, useState } from 'react'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CoachServicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'PAUSED' | 'DRAFT'>('all')

  const { data: servicesResponse, loading: servicesLoading, error: servicesError } = useApiCall('/coach/services')
  const { data: sessionTypesResponse, loading: sessionTypesLoading, error: sessionTypesError } = useApiCall('/coach/session-types')

  const coachServices = servicesResponse?.data || servicesResponse || []
  const sessionTypes = sessionTypesResponse?.data || sessionTypesResponse || []

  if (servicesError) {
    return <APIErrorFallback error={servicesError} onRetry={() => window.location.reload()} />
  }

  const sessionTypeMap = useMemo(() => {
    return new Map(sessionTypes.map((sessionType: any) => [sessionType.id, sessionType]))
  }, [sessionTypes])

  const filteredServices = useMemo(() => {
    return coachServices.filter((service: any) => {
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter
      const query = search.trim().toLowerCase()
      const sessionType = sessionTypeMap.get(service.sessionTypeId) as any

      const matchesSearch =
        query.length === 0 ||
        service.title?.toLowerCase()?.includes(query) ||
        service.sport?.toLowerCase()?.includes(query) ||
        (sessionType?.name?.toLowerCase()?.includes(query) ?? false)

      return matchesStatus && matchesSearch
    })
  }, [coachServices, search, sessionTypeMap, statusFilter])

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
          {sessionTypesLoading ? (
            <p className="text-sm text-primary/60">Loading session types...</p>
          ) : (
            sessionTypes.map((sessionType: any) => (
              <article key={sessionType.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{sessionType.name || 'Unknown'}</p>
                    <p className="text-xs text-primary/60 mt-1">{sessionType.description || 'No description'}</p>
                  </div>
                  <AdminStatusPill label={sessionType.status || 'Unknown'} tone={statusTone(sessionType.status || 'Unknown')} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-[var(--radius-default)] bg-surface-container-lowest px-2.5 py-2">
                    <p className="font-lexend uppercase tracking-[0.14em] text-primary/45">Participants</p>
                    <p className="text-primary font-bold mt-1">{sessionType.minParticipants || 1}-{sessionType.maxParticipants || 10}</p>
                  </div>
                  <div className="rounded-[var(--radius-default)] bg-surface-container-lowest px-2.5 py-2">
                    <p className="font-lexend uppercase tracking-[0.14em] text-primary/45">Base Rate</p>
                    <p className="text-primary font-bold mt-1">{formatEgp(sessionType.baseRate || 0)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(sessionType.durationOptions || []).map((duration: any) => (
                    <span
                      key={duration}
                      className="px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.12em] bg-surface-container-lowest text-primary/75"
                    >
                      {duration}m
                    </span>
                  ))}
                </div>

                <p className="text-xs text-primary/60">
                  Visibility: <span className="font-bold text-primary">{sessionType.visibility || 'Public'}</span> • Multiplier {sessionType.multiplier || 1}x
                </p>
              </article>
            ))
          )}
        </div>
      </AdminPanel>

      <AdminPanel eyebrow="Catalog" title="Published Services">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search services, sports, or session format"
          controls={
            ['all', 'ACTIVE', 'PAUSED', 'DRAFT'].map((status) => {
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
          {servicesLoading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={filteredServices}
              getRowKey={(service: any) => service.id}
              columns={[
                {
                  key: 'service',
                  header: 'Service',
                  render: (service: any) => (
                    <div>
                      <p className="font-bold text-primary">{service.title || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{service.sport || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'sessionType',
                  header: 'Session Type',
                  render: (service: any) => (
                    <span className="font-semibold text-primary">{(sessionTypeMap.get(service.sessionTypeId) as any)?.name || 'N/A'}</span>
                  ),
                },
                {
                  key: 'duration',
                  header: 'Duration',
                  render: (service: any) => <span className="font-semibold text-primary">{service.duration || 60} min</span>,
                },
                {
                  key: 'price',
                  header: 'Price',
                  render: (service: any) => <span className="font-bold text-primary">{formatEgp(service.price || 0)}</span>,
                },
                {
                  key: 'bookings',
                  header: 'Bookings (Month)',
                  render: (service: any) => <span className="font-semibold text-primary">{service.bookingsThisMonth || 0}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (service: any) => <AdminStatusPill label={service.status || 'Unknown'} tone={statusTone(service.status || 'Unknown')} />,
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
