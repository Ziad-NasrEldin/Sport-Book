'use client'

import { FormEvent, useCallback, useMemo, useState } from 'react'
import { Activity, Building2, Download, Landmark, Pencil, Plus, Save, TrendingUp, X } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { showToast } from '@/lib/toast'
import { AppSelect } from '@/components/ui/AppSelect'

type FacilityStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED'

type FacilityFormState = {
  name: string
  city: string
  address: string
  description: string
  phone: string
  email: string
  status: FacilityStatus
  operatorName: string
  operatorEmail: string
  operatorPhone: string
  branchName: string
  branchAddress: string
  sportIds: string[]
}

const INITIAL_FORM_STATE: FacilityFormState = {
  name: '',
  city: 'Cairo',
  address: '',
  description: '',
  phone: '',
  email: '',
  status: 'ACTIVE',
  operatorName: '',
  operatorEmail: '',
  operatorPhone: '',
  branchName: '',
  branchAddress: '',
  sportIds: [],
}

function formatEgp(value: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

export default function AdminFacilitiesPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingFacilityId, setEditingFacilityId] = useState<string | null>(null)
  const [formState, setFormState] = useState<FacilityFormState>(INITIAL_FORM_STATE)
  const [formError, setFormError] = useState<string | null>(null)
  const isEditMode = Boolean(editingFacilityId)
  const isFormModalOpen = isCreateModalOpen || isEditMode

  const { data: facilitiesResponse, loading, error, refetch } = useApiCall('/admin-workspace/facilities')
  const { data: sportsResponse } = useApiCall('/admin-workspace/sports')
  const facilitiesData = facilitiesResponse?.data || facilitiesResponse || []
  const sportsData = sportsResponse?.data || sportsResponse || []

  const createFacilityMutation = useApiMutation('/admin-workspace/facilities', 'POST', {
    onSuccess: async () => {
      showToast('Facility created successfully.', 'success')
      setIsCreateModalOpen(false)
      setEditingFacilityId(null)
      setFormState(INITIAL_FORM_STATE)
      setFormError(null)
      await refetch()
    },
    onError: (apiError) => {
      setFormError(apiError.message || 'Failed to create facility.')
    },
  })

  const updateFacilityMutation = useApiMutation(
    editingFacilityId ? `/admin-workspace/facilities/${editingFacilityId}` : '/admin-workspace/facilities',
    'PATCH',
    {
      onSuccess: async () => {
        showToast('Facility updated successfully.', 'success')
        setIsCreateModalOpen(false)
        setEditingFacilityId(null)
        setFormState(INITIAL_FORM_STATE)
        setFormError(null)
        await refetch()
      },
      onError: (apiError) => {
        setFormError(apiError.message || 'Failed to update facility.')
      },
    },
  )

  const handleCityFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setCityFilter(event.target.value)
  }, [])

  const handleFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setFormState((current) => ({
        ...current,
        [name]: value,
      }))
    },
    [],
  )

  const handleSportToggle = useCallback((sportId: string) => {
    setFormState((current) => ({
      ...current,
      sportIds: current.sportIds.includes(sportId)
        ? current.sportIds.filter((id) => id !== sportId)
        : [...current.sportIds, sportId],
    }))
  }, [])

  const openCreateModal = useCallback(() => {
    setFormState(INITIAL_FORM_STATE)
    setFormError(null)
    setEditingFacilityId(null)
    setIsCreateModalOpen(true)
  }, [])

  const openEditModal = useCallback((facility: any) => {
    setIsCreateModalOpen(false)
    setEditingFacilityId(facility.id)
    setFormError(null)
    setFormState({
      name: facility.name || '',
      city: facility.city || 'Cairo',
      address: facility.address || '',
      description: facility.description || '',
      phone: facility.phone || '',
      email: facility.email || '',
      status: (facility.status as FacilityStatus) || 'ACTIVE',
      operatorName: facility.operator?.name || '',
      operatorEmail: facility.operator?.email || '',
      operatorPhone: facility.operator?.phone || '',
      branchName: facility.branches?.[0]?.name || '',
      branchAddress: facility.branches?.[0]?.address || '',
      sportIds: Array.isArray(facility.sports) ? facility.sports.map((item: any) => item.sportId).filter(Boolean) : [],
    })
  }, [])

  const closeFormModal = useCallback(() => {
    setIsCreateModalOpen(false)
    setEditingFacilityId(null)
    setFormState(INITIAL_FORM_STATE)
    setFormError(null)
    createFacilityMutation.reset()
    updateFacilityMutation.reset()
  }, [createFacilityMutation, updateFacilityMutation])

  const cityOptions = useMemo<string[]>(
    () => ['All', ...Array.from(new Set<string>(facilitiesData.map((item: any) => item.city).filter(Boolean)))],
    [facilitiesData],
  )

  const filteredFacilities = useMemo(() => {
    const query = search.trim().toLowerCase()

    return facilitiesData.filter((facility: any) => {
      const matchesSearch =
        query.length === 0 ||
        facility.name?.toLowerCase()?.includes(query) ||
        facility.id?.toLowerCase()?.includes(query) ||
        facility.operator?.name?.toLowerCase()?.includes(query)
      const matchesCity = cityFilter === 'All' || facility.city === cityFilter

      return matchesSearch && matchesCity
    })
  }, [cityFilter, search, facilitiesData])

  const facilityInsights = useMemo(() => {
    const totalFacilities = facilitiesData.length
    const activeCount = facilitiesData.filter((facility: any) => facility.status === 'ACTIVE').length
    const pendingCount = facilitiesData.filter((facility: any) => facility.status === 'PENDING').length
    const suspendedCount = facilitiesData.filter((facility: any) => facility.status === 'SUSPENDED').length
    const totalRevenue = facilitiesData.reduce((total: number, facility: any) => total + Number(facility.monthlyRevenue || 0), 0)
    const utilizationTotal = facilitiesData.reduce((total: number, facility: any) => total + Number(facility.utilization || 0), 0)
    const averageUtilization = totalFacilities > 0 ? utilizationTotal / totalFacilities : 0

    const cityTotals = facilitiesData.reduce<Record<string, number>>((accumulator, facility: any) => {
      const city = String(facility.city || '').trim()
      if (!city) {
        return accumulator
      }
      accumulator[city] = (accumulator[city] || 0) + 1
      return accumulator
    }, {})

    const [topCityName = 'No city data', topCityCount = 0] = Object.entries(cityTotals).sort((a, b) => b[1] - a[1])[0] || []

    return {
      totalFacilities,
      activeCount,
      pendingCount,
      suspendedCount,
      totalRevenue,
      averageUtilization,
      topCityName,
      topCityCount,
    }
  }, [facilitiesData])

  const utilizationLeaders = useMemo(
    () =>
      [...filteredFacilities]
        .sort((a: any, b: any) => Number(b.utilization || 0) - Number(a.utilization || 0))
        .slice(0, 3),
    [filteredFacilities],
  )

  const exportFacilities = useCallback(() => {
    const headers = 'Name,City,Status,Branches,Monthly Revenue,Utilization'
    const rows = filteredFacilities.map((facility: any) =>
      [
        facility.name,
        facility.city,
        facility.status,
        facility._count?.branches || 0,
        facility.monthlyRevenue || 0,
        `${facility.utilization || 0}%`,
      ].join(','),
    )

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `facilities-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    showToast('Facilities export downloaded.', 'success')
  }, [filteredFacilities])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFormError(null)

      const trimmedName = formState.name.trim()
      const trimmedCity = formState.city.trim()
      if (!trimmedName || !trimmedCity) {
        setFormError('Facility name and city are required.')
        return
      }

      const payload = {
        ...formState,
        name: trimmedName,
        city: trimmedCity,
        address: formState.address.trim() || undefined,
        description: formState.description.trim() || undefined,
        phone: formState.phone.trim() || undefined,
        email: formState.email.trim() || undefined,
        operatorName: formState.operatorName.trim() || undefined,
        operatorEmail: formState.operatorEmail.trim() || undefined,
        operatorPhone: formState.operatorPhone.trim() || undefined,
        branchName: formState.branchName.trim() || undefined,
        branchAddress: formState.branchAddress.trim() || undefined,
      }

      if (isEditMode && editingFacilityId) {
        await updateFacilityMutation.mutate(payload)
        return
      }

      await createFacilityMutation.mutate(payload)
    },
    [createFacilityMutation, editingFacilityId, formState, isEditMode, updateFacilityMutation],
  )

  const isSubmitting = createFacilityMutation.loading || updateFacilityMutation.loading

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6 motion-safe:animate-[var(--animate-fade-in)]">
      <AdminPageHeader
        title="Facility Management"
        subtitle="Control partner facilities, monitor branch utilization, and add new operators without leaving the admin workspace."
        className="motion-safe:animate-[var(--animate-soft-drop)]"
        actions={
          <>
            <button
              type="button"
              onClick={exportFacilities}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-surface-container-high motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Export Facilities
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest transition-all duration-200 hover:opacity-90 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            >
              <Building2 className="w-4 h-4" />
              Add Facility
            </button>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)]">
        <AdminPanel
          noPadding
          className="relative overflow-hidden border border-primary/12 bg-gradient-to-br from-primary-container/65 via-surface-container-lowest to-surface-container-high p-5 motion-safe:animate-[var(--animate-spring-in)] md:p-6"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/20 blur-3xl motion-safe:animate-[var(--animate-float-blob)]" />
          <div className="pointer-events-none absolute -left-14 bottom-0 h-40 w-40 rounded-full bg-surface-container-high blur-2xl motion-safe:animate-[var(--animate-float-blob)] animation-delay-300" />

          <div className="relative space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/60">Performance Pulse</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-primary md:text-3xl">Facility Command Center</h3>
                <p className="mt-2 max-w-2xl text-sm text-primary/70">
                  Live snapshot across partner growth, utilization pressure, and revenue momentum.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface-container-lowest/85 px-3 py-1.5 text-[11px] font-lexend font-bold uppercase tracking-[0.12em] text-primary/70">
                <Activity className="h-3.5 w-3.5" />
                {filteredFacilities.length} tracked
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="card-lift rounded-[var(--radius-default)] border border-primary/12 bg-surface-container-lowest/90 px-4 py-4 shadow-sm backdrop-blur-sm motion-safe:animate-[var(--animate-card-stagger)]">
                <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Total Facilities</p>
                <p className="mt-2 text-3xl font-black text-primary motion-safe:animate-[var(--animate-number-pop)]">{facilityInsights.totalFacilities}</p>
                <p className="mt-1 text-xs text-primary/60">{facilityInsights.activeCount} active operators</p>
              </article>
              <article className="card-lift rounded-[var(--radius-default)] border border-primary/12 bg-surface-container-lowest/90 px-4 py-4 shadow-sm backdrop-blur-sm motion-safe:animate-[var(--animate-card-stagger)] animation-delay-100">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Avg Utilization
                </p>
                <p className="mt-2 text-3xl font-black text-primary motion-safe:animate-[var(--animate-number-pop)] animation-delay-150">{clampPercentage(facilityInsights.averageUtilization)}%</p>
                <p className="mt-1 text-xs text-primary/60">
                  {facilityInsights.pendingCount} pending, {facilityInsights.suspendedCount} suspended
                </p>
              </article>
              <article className="card-lift rounded-[var(--radius-default)] border border-primary/12 bg-surface-container-lowest/90 px-4 py-4 shadow-sm backdrop-blur-sm motion-safe:animate-[var(--animate-card-stagger)] animation-delay-200">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">
                  <Landmark className="h-3.5 w-3.5" />
                  Monthly Revenue
                </p>
                <p className="mt-2 text-2xl font-black text-primary motion-safe:animate-[var(--animate-number-pop)] animation-delay-200">{formatEgp(facilityInsights.totalRevenue)}</p>
                <p className="mt-1 text-xs text-primary/60">Combined active portfolio performance</p>
              </article>
              <article className="card-lift rounded-[var(--radius-default)] border border-primary/12 bg-surface-container-lowest/90 px-4 py-4 shadow-sm backdrop-blur-sm motion-safe:animate-[var(--animate-card-stagger)] animation-delay-300">
                <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Top City Density</p>
                <p className="mt-2 text-xl font-black text-primary">{facilityInsights.topCityName}</p>
                <p className="mt-1 text-xs text-primary/60">{facilityInsights.topCityCount} facilities concentrated</p>
              </article>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel
          eyebrow="Leaderboard"
          title="Utilization Leaders"
          className="border border-primary/10 bg-surface-container-lowest motion-safe:animate-[var(--animate-soft-rise)] animation-delay-200"
        >
          <div className="space-y-3">
            {utilizationLeaders.length > 0 ? (
              utilizationLeaders.map((facility: any, index: number) => {
                const utilization = clampPercentage(Number(facility.utilization || 0))
                return (
                  <article
                    key={facility.id || `${facility.name}-${index}`}
                    className="card-lift rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3.5 py-3 motion-safe:animate-[var(--animate-stagger-pop)]"
                    style={{ animationDelay: `${120 + index * 75}ms` }}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-primary">{facility.name || 'Unknown facility'}</p>
                        <p className="mt-1 text-[11px] font-lexend uppercase tracking-[0.1em] text-primary/55">{facility.city || 'Unknown city'}</p>
                      </div>
                      <span className="text-sm font-black text-primary">{utilization}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full w-full origin-left rounded-full bg-primary-container transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ transform: `scaleX(${utilization / 100})` }}
                      />
                    </div>
                  </article>
                )
              })
            ) : (
              <p className="rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-3.5 py-4 text-sm text-primary/65 motion-safe:animate-[var(--animate-empty-bob)]">
                Add facilities to reveal utilization leaders.
              </p>
            )}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel
        eyebrow="Operations"
        title="Facility Directory"
        className="border border-primary/10 bg-surface-container-lowest motion-safe:animate-[var(--animate-soft-rise)] animation-delay-300"
      >
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by facility name, id, or operator"
          controls={
            <AppSelect
              value={cityFilter}
              onChange={handleCityFilterChange}
              className="rounded-full border border-primary/12 bg-surface-container-low px-4 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary shadow-sm outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.15)] motion-safe:focus:-translate-y-0.5"
            >
              {cityOptions.map((city: string) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </AppSelect>
          }
        />

        <div className="mt-4 rounded-[var(--radius-default)] border border-primary/8 bg-surface-container-low/45 p-2 motion-safe:animate-[var(--animate-fade-in)] animation-delay-400 md:p-3">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={filteredFacilities}
              getRowKey={(facility: any) => facility.id}
              columns={[
                {
                  key: 'facility',
                  header: 'Facility',
                  render: (facility: any) => (
                    <div>
                      <p className="font-bold text-primary">{facility.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{facility.city || 'Unknown city'}</p>
                    </div>
                  ),
                },
                {
                  key: 'operator',
                  header: 'Operator',
                  render: (facility: any) => (
                    <div>
                      <p className="text-sm font-semibold text-primary">{facility.operator?.name || 'Unassigned'}</p>
                      <p className="text-xs text-primary/55 mt-1">{facility.operator?.email || facility.email || 'No email'}</p>
                    </div>
                  ),
                },
                {
                  key: 'branches',
                  header: 'Branches',
                  render: (facility: any) => <p className="text-sm font-semibold text-primary">{facility._count?.branches || 0}</p>,
                },
                {
                  key: 'utilization',
                  header: 'Utilization',
                  render: (facility: any) => <p className="text-sm text-primary/75">{facility.utilization || 0}%</p>,
                },
                {
                  key: 'revenue',
                  header: 'Monthly Revenue',
                  render: (facility: any) => <p className="text-sm font-semibold text-primary">{formatEgp(facility.monthlyRevenue || 0)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (facility: any) => <AdminStatusPill label={facility.status || 'Unknown'} tone={statusTone(facility.status || 'Unknown')} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (facility: any) => (
                    <button
                      type="button"
                      onClick={() => openEditModal(facility)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-surface-container-low px-3 py-1.5 text-xs font-lexend font-bold uppercase tracking-[0.1em] text-primary transition-all duration-200 hover:bg-surface-container-high motion-safe:hover:-translate-y-0.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ),
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] motion-safe:animate-[var(--animate-modal-backdrop-in)]">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden overflow-y-auto rounded-[calc(var(--radius-lg)+6px)] border border-primary/14 bg-surface-container-lowest shadow-[0_28px_70px_rgba(0,0,0,0.32)] motion-safe:animate-[var(--animate-modal-dialog-in)]">
            <div className="relative flex items-start justify-between gap-4 border-b border-primary/10 bg-gradient-to-r from-primary-container/35 via-surface-container-lowest to-surface-container-low px-6 py-5">
              <div className="pointer-events-none absolute -bottom-8 right-8 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
              <div>
                <p className="text-[11px] font-lexend uppercase tracking-[0.16em] text-primary/55">{isEditMode ? 'Admin Update' : 'Admin Action'}</p>
                <h3 className="mt-1 text-2xl font-black text-primary">{isEditMode ? 'Edit Facility' : 'Add Facility'}</h3>
                <p className="mt-2 text-sm text-primary/65">
                  {isEditMode
                    ? 'Update facility profile, operator identity, branch details, and linked sports from one workspace.'
                    : 'Create a facility, provision its operator account, and optionally link sports in one step.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                aria-label={isEditMode ? 'Close edit facility dialog' : 'Close add facility dialog'}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/10 bg-surface-container-low text-primary shadow-sm transition-all duration-200 hover:bg-surface-container-high motion-safe:hover:scale-105 motion-safe:active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <section className="grid gap-4 rounded-[var(--radius-md)] border border-primary/10 bg-surface-container-low/45 p-4 motion-safe:animate-[var(--animate-field-group-in)] md:grid-cols-2 md:p-5">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility Name</span>
                  <input
                    name="name"
                    value={formState.name}
                    onChange={handleFieldChange}
                    placeholder="Smash Hub Nasr City"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                    required
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">City</span>
                  <input
                    name="city"
                    value={formState.city}
                    onChange={handleFieldChange}
                    placeholder="Cairo"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                    required
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Address</span>
                  <input
                    name="address"
                    value={formState.address}
                    onChange={handleFieldChange}
                    placeholder="Makram Ebeid Street, Nasr City"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Description</span>
                  <textarea
                    name="description"
                    value={formState.description}
                    onChange={handleFieldChange}
                    placeholder="Indoor multi-sport complex focused on premium community leagues."
                    rows={3}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility Phone</span>
                  <input
                    name="phone"
                    value={formState.phone}
                    onChange={handleFieldChange}
                    placeholder="+20 100 123 4567"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility Email</span>
                  <input
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleFieldChange}
                    placeholder="operations@smashhub.eg"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Status</span>
                  <AppSelect
                    name="status"
                    value={formState.status}
                    onChange={handleFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </AppSelect>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Main Branch Name</span>
                  <input
                    name="branchName"
                    value={formState.branchName}
                    onChange={handleFieldChange}
                    placeholder="Main Branch"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Main Branch Address</span>
                  <input
                    name="branchAddress"
                    value={formState.branchAddress}
                    onChange={handleFieldChange}
                    placeholder="Leave blank to reuse the facility address"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                  />
                </label>
              </section>

              <section className="space-y-4 rounded-[var(--radius-md)] border border-primary/10 bg-gradient-to-br from-surface-container-low to-surface-container-high p-4 motion-safe:animate-[var(--animate-field-group-in)] animation-delay-100">
                <div>
                  <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Operator Account</p>
                  <p className="mt-1 text-sm text-primary/65">
                    {isEditMode
                      ? 'Update operator identity, email, and phone details tied to this facility account.'
                      : 'Leave these fields blank and the system will auto-generate the operator identity for you.'}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Operator Name</span>
                    <input
                      name="operatorName"
                      value={formState.operatorName}
                      onChange={handleFieldChange}
                      placeholder="Facility Manager"
                      className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-lowest px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Operator Email</span>
                    <input
                      name="operatorEmail"
                      type="email"
                      value={formState.operatorEmail}
                      onChange={handleFieldChange}
                      placeholder="manager@smashhub.eg"
                      className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-lowest px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Operator Phone</span>
                    <input
                      name="operatorPhone"
                      value={formState.operatorPhone}
                      onChange={handleFieldChange}
                      placeholder="+20 100 000 0000"
                      className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-lowest px-4 py-3 text-primary outline-none transition-[border-color,box-shadow,transform] duration-200 focus:border-primary-container focus:shadow-[0_0_0_3px_rgba(0,35,102,0.12)] motion-safe:focus:-translate-y-0.5"
                    />
                  </label>
                </div>
                {isEditMode ? (
                  <p className="text-xs text-primary/55">Operator status syncs with facility status automatically.</p>
                ) : (
                  <p className="text-xs text-primary/55">Auto-created operators use the default seeded password: <span className="font-bold">password123</span></p>
                )}
              </section>

              <section className="space-y-3 rounded-[var(--radius-md)] border border-primary/10 bg-surface-container-low/35 p-4 motion-safe:animate-[var(--animate-field-group-in)] animation-delay-200">
                <div>
                  <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Linked Sports</p>
                  <p className="mt-1 text-sm text-primary/65">Optional. Assign any sports this facility should surface under immediately.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sportsData.map((sport: any) => {
                    const isSelected = formState.sportIds.includes(sport.id)
                    return (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => handleSportToggle(sport.id)}
                        className={`inline-flex items-center rounded-full border px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] transition-all ${
                          isSelected
                            ? 'border-primary-container bg-primary-container text-surface-container-lowest shadow-sm motion-safe:animate-[var(--animate-chip-select)]'
                            : 'border-primary/10 bg-surface-container-low text-primary motion-safe:hover:-translate-y-0.5 hover:bg-surface-container-high'
                        }`}
                      >
                        {sport.displayName || sport.name}
                      </button>
                    )
                  })}
                </div>
              </section>

              {formError ? (
                <div className="rounded-[var(--radius-default)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 motion-safe:animate-[var(--animate-shake)]">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-primary/8 pt-4">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="inline-flex items-center rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-surface-container-high motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest shadow-sm transition-all duration-200 hover:opacity-90 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEditMode ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save Changes' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}


