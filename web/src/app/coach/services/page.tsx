'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import type { CoachService, CoachSessionType } from '@/lib/coach/types'
import { api } from '@/lib/api/client'

import { AppSelect } from '@/components/ui/AppSelect'
function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

type SessionTypeFormState = {
  name: string
  description: string
  minParticipants: number
  maxParticipants: number
  durationOptions: string
  baseRate: number
  multiplier: number
  visibility: string
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT'
}

type ServiceFormState = {
  title: string
  description: string
  duration: number
  price: number
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT'
  sessionTypeId: string
}

const EMPTY_SESSION_TYPE: SessionTypeFormState = {
  name: '',
  description: '',
  minParticipants: 1,
  maxParticipants: 1,
  durationOptions: '60, 90',
  baseRate: 150,
  multiplier: 1,
  visibility: 'Public',
  status: 'ACTIVE',
}

const EMPTY_SERVICE: ServiceFormState = {
  title: '',
  description: '',
  duration: 60,
  price: 150,
  status: 'ACTIVE',
  sessionTypeId: '',
}

export default function CoachServicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'PAUSED' | 'DRAFT'>('all')
  const [isSessionTypeFormOpen, setIsSessionTypeFormOpen] = useState(false)
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false)
  const [editingSessionTypeId, setEditingSessionTypeId] = useState<string | null>(null)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [sessionTypeForm, setSessionTypeForm] = useState<SessionTypeFormState>(EMPTY_SESSION_TYPE)
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(EMPTY_SERVICE)

  const { data: coachServices, loading: servicesLoading, error: servicesError, refetch: refetchServices } =
    useApiCall<CoachService[]>('/coach/services')
  const { data: sessionTypes, loading: sessionTypesLoading, error: sessionTypesError, refetch: refetchSessionTypes } =
    useApiCall<CoachSessionType[]>('/coach/session-types')

  const createSessionType = useApiMutation('/coach/session-types', 'POST')
  const createService = useApiMutation('/coach/services', 'POST')

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('create') === 'session-type') {
      setIsSessionTypeFormOpen(true)
    }
  }, [])

  const safeServices = coachServices ?? []
  const safeSessionTypes = sessionTypes ?? []

  const sessionTypeMap = useMemo(() => new Map(safeSessionTypes.map((sessionType) => [sessionType.id, sessionType])), [safeSessionTypes])

  const filteredServices = useMemo(() => {
    return safeServices.filter((service) => {
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter
      const query = search.trim().toLowerCase()
      const sessionType = service.sessionTypeId ? sessionTypeMap.get(service.sessionTypeId) : undefined

      const matchesSearch =
        query.length === 0 ||
        service.title.toLowerCase().includes(query) ||
        (typeof service.sport === 'string' ? service.sport : ((service.sport as any)?.displayName || (service.sport as any)?.name || '')).toLowerCase().includes(query) ||
        sessionType?.name.toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [safeServices, search, sessionTypeMap, statusFilter])

  if (servicesError) {
    return <APIErrorFallback error={servicesError} onRetry={refetchServices} />
  }

  if (sessionTypesError) {
    return <APIErrorFallback error={sessionTypesError} onRetry={refetchSessionTypes} />
  }

  const resetSessionTypeForm = () => {
    setEditingSessionTypeId(null)
    setSessionTypeForm(EMPTY_SESSION_TYPE)
    setIsSessionTypeFormOpen(false)
  }

  const resetServiceForm = () => {
    setEditingServiceId(null)
    setServiceForm(EMPTY_SERVICE)
    setIsServiceFormOpen(false)
  }

  const handleSubmitSessionType = async () => {
    const payload = {
      ...sessionTypeForm,
      durationOptions: sessionTypeForm.durationOptions
        .split(',')
        .map((value) => Number(value.trim()))
        .filter(Number.isFinite),
    }

    if (editingSessionTypeId) {
      await api.patch(`/coach/session-types/${editingSessionTypeId}`, payload)
    } else {
      await createSessionType.mutate(payload)
    }

    await refetchSessionTypes()
    resetSessionTypeForm()
  }

  const handleSubmitService = async () => {
    const payload = {
      ...serviceForm,
      sessionTypeId: serviceForm.sessionTypeId || null,
    }

    if (editingServiceId) {
      await api.patch(`/coach/services/${editingServiceId}`, payload)
    } else {
      await createService.mutate(payload)
    }

    await refetchServices()
    resetServiceForm()
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Services"
        subtitle="Design your service catalog and session formats. Session types here power player booking experiences."
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsSessionTypeFormOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isSessionTypeFormOpen ? 'Close Session Type Form' : 'Add Session Type'}
            </button>
            <button
              type="button"
              onClick={() => setIsServiceFormOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Plus className="w-4 h-4" />
              {isServiceFormOpen ? 'Close Service Form' : 'Add New Service'}
            </button>
          </>
        }
      />

      {(isSessionTypeFormOpen || isServiceFormOpen) && (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {isSessionTypeFormOpen && (
            <AdminPanel eyebrow="Compose" title={editingSessionTypeId ? 'Edit Session Type' : 'Create Session Type'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput label="Name" value={sessionTypeForm.name} onChange={(value) => setSessionTypeForm((current) => ({ ...current, name: value }))} />
                <LabeledInput label="Visibility" value={sessionTypeForm.visibility} onChange={(value) => setSessionTypeForm((current) => ({ ...current, visibility: value }))} />
                <LabeledInput label="Description" value={sessionTypeForm.description} onChange={(value) => setSessionTypeForm((current) => ({ ...current, description: value }))} className="md:col-span-2" />
                <LabeledInput label="Min Participants" type="number" value={String(sessionTypeForm.minParticipants)} onChange={(value) => setSessionTypeForm((current) => ({ ...current, minParticipants: Number(value) }))} />
                <LabeledInput label="Max Participants" type="number" value={String(sessionTypeForm.maxParticipants)} onChange={(value) => setSessionTypeForm((current) => ({ ...current, maxParticipants: Number(value) }))} />
                <LabeledInput label="Duration Options" value={sessionTypeForm.durationOptions} onChange={(value) => setSessionTypeForm((current) => ({ ...current, durationOptions: value }))} />
                <LabeledInput label="Base Rate" type="number" value={String(sessionTypeForm.baseRate)} onChange={(value) => setSessionTypeForm((current) => ({ ...current, baseRate: Number(value) }))} />
                <LabeledInput label="Multiplier" type="number" value={String(sessionTypeForm.multiplier)} onChange={(value) => setSessionTypeForm((current) => ({ ...current, multiplier: Number(value) }))} />
                <label className="space-y-1">
                  <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Status</span>
                  <AppSelect
                    value={sessionTypeForm.status}
                    onChange={(event) => setSessionTypeForm((current) => ({ ...current, status: event.target.value as SessionTypeFormState['status'] }))}
                    className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="DRAFT">DRAFT</option>
                  </AppSelect>
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => void handleSubmitSessionType()} className="rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-surface-container-lowest shadow-md hover:shadow-lg transition-shadow">
                  {editingSessionTypeId ? 'Save Session Type' : 'Create Session Type'}
                </button>
                <button type="button" onClick={resetSessionTypeForm} className="rounded-full bg-surface-container-low px-5 py-2.5 text-sm font-bold text-primary hover:bg-surface-container-high transition-colors">
                  Cancel
                </button>
              </div>
            </AdminPanel>
          )}

          {isServiceFormOpen && (
            <AdminPanel eyebrow="Catalog" title={editingServiceId ? 'Edit Service' : 'Create Service'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledInput label="Title" value={serviceForm.title} onChange={(value) => setServiceForm((current) => ({ ...current, title: value }))} />
                <label className="space-y-1">
                  <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Session Type</span>
                  <AppSelect
                    value={serviceForm.sessionTypeId}
                    onChange={(event) => setServiceForm((current) => ({ ...current, sessionTypeId: event.target.value }))}
                    className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
                  >
                    <option value="">None</option>
                    {safeSessionTypes.map((sessionType) => (
                      <option key={sessionType.id} value={sessionType.id}>{sessionType.name}</option>
                    ))}
                  </AppSelect>
                </label>
                <LabeledInput label="Description" value={serviceForm.description} onChange={(value) => setServiceForm((current) => ({ ...current, description: value }))} className="md:col-span-2" />
                <LabeledInput label="Duration" type="number" value={String(serviceForm.duration)} onChange={(value) => setServiceForm((current) => ({ ...current, duration: Number(value) }))} />
                <LabeledInput label="Price" type="number" value={String(serviceForm.price)} onChange={(value) => setServiceForm((current) => ({ ...current, price: Number(value) }))} />
                <label className="space-y-1">
                  <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Status</span>
                  <AppSelect
                    value={serviceForm.status}
                    onChange={(event) => setServiceForm((current) => ({ ...current, status: event.target.value as ServiceFormState['status'] }))}
                    className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="DRAFT">DRAFT</option>
                  </AppSelect>
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => void handleSubmitService()} className="rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-surface-container-lowest shadow-md hover:shadow-lg transition-shadow">
                  {editingServiceId ? 'Save Service' : 'Create Service'}
                </button>
                <button type="button" onClick={resetServiceForm} className="rounded-full bg-surface-container-low px-5 py-2.5 text-sm font-bold text-primary hover:bg-surface-container-high transition-colors">
                  Cancel
                </button>
              </div>
            </AdminPanel>
          )}
        </section>
      )}

      <AdminPanel eyebrow="Coach-managed" title="Session Type Formats">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {sessionTypesLoading ? (
            <p className="text-sm text-primary/60">Loading session types...</p>
          ) : (
            safeSessionTypes.map((sessionType) => (
              <article key={sessionType.id} className="rounded-[var(--radius-md)] bg-surface-container-low p-5 space-y-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-primary">{sessionType.name}</p>
                    <p className="text-sm text-primary/70 mt-1.5 font-semibold">{sessionType.description}</p>
                  </div>
                  <AdminStatusPill label={sessionType.status} tone={statusTone(sessionType.status)} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-[var(--radius-md)] bg-surface-container-lowest px-4 py-3 shadow-sm">
                    <p className="font-lexend uppercase tracking-[0.2em] text-primary/40 font-bold text-[10px]">Participants</p>
                    <p className="text-primary font-black mt-1.5 text-base">{sessionType.minParticipants}-{sessionType.maxParticipants}</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-surface-container-lowest px-4 py-3 shadow-sm">
                    <p className="font-lexend uppercase tracking-[0.2em] text-primary/40 font-bold text-[10px]">Base Rate</p>
                    <p className="text-primary font-black mt-1.5 text-base">{formatEgp(sessionType.baseRate)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sessionType.durationOptions.map((duration) => (
                    <span key={duration} className="px-3 py-1.5 rounded-full text-[10px] font-lexend font-black uppercase tracking-[0.2em] bg-surface-container-lowest text-primary/75 shadow-sm">
                      {duration}m
                    </span>
                  ))}
                </div>

                <p className="text-sm text-primary/70 font-semibold">
                  Visibility: <span className="font-black text-primary">{sessionType.visibility}</span> • Multiplier {sessionType.multiplier}x
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSessionTypeId(sessionType.id)
                      setSessionTypeForm({
                        name: sessionType.name,
                        description: sessionType.description,
                        minParticipants: sessionType.minParticipants,
                        maxParticipants: sessionType.maxParticipants,
                        durationOptions: sessionType.durationOptions.join(', '),
                        baseRate: sessionType.baseRate,
                        multiplier: sessionType.multiplier,
                        visibility: sessionType.visibility,
                        status: sessionType.status,
                      })
                      setIsSessionTypeFormOpen(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-black text-primary hover:bg-surface-container-high transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.delete(`/coach/session-types/${sessionType.id}`)
                      await refetchSessionTypes()
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-black text-secondary hover:bg-surface-container-high transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
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

        <div className="mt-6">
          {servicesLoading ? (
            <SkeletonTable rows={10} />
          ) : (
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
                      <p className="text-xs text-primary/60 mt-1">{typeof service.sport === 'string' ? service.sport : ((service.sport as any)?.displayName || (service.sport as any)?.name || '')}</p>
                    </div>
                  ),
                },
                {
                  key: 'sessionType',
                  header: 'Session Type',
                  render: (service) => (
                    <span className="font-semibold text-primary">{service.sessionTypeId ? sessionTypeMap.get(service.sessionTypeId)?.name ?? 'N/A' : 'N/A'}</span>
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
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (service) => (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(service.id)
                          setServiceForm({
                            title: service.title,
                            description: service.description,
                            duration: service.duration,
                            price: service.price,
                            status: service.status,
                            sessionTypeId: service.sessionTypeId ?? '',
                          })
                          setIsServiceFormOpen(true)
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-bold text-primary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await api.delete(`/coach/services/${service.id}`)
                          await refetchServices()
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-bold text-secondary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
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

type LabeledInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
  className?: string
}

function LabeledInput({ label, value, onChange, type = 'text', className }: LabeledInputProps) {
  return (
    <label className={`space-y-1 ${className ?? ''}`}>
      <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
      />
    </label>
  )
}

