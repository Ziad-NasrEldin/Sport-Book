'use client'

import { FormEvent, useCallback, useMemo, useState } from 'react'
import { Building2, Download, Plus, X } from 'lucide-react'
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

export default function AdminFacilitiesPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formState, setFormState] = useState<FacilityFormState>(INITIAL_FORM_STATE)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: facilitiesResponse, loading, error, refetch } = useApiCall('/admin-workspace/facilities')
  const { data: sportsResponse } = useApiCall('/admin-workspace/sports')
  const facilitiesData = facilitiesResponse?.data || facilitiesResponse || []
  const sportsData = sportsResponse?.data || sportsResponse || []

  const createFacilityMutation = useApiMutation('/admin-workspace/facilities', 'POST', {
    onSuccess: async () => {
      showToast('Facility created successfully.', 'success')
      setIsCreateModalOpen(false)
      setFormState(INITIAL_FORM_STATE)
      setFormError(null)
      await refetch()
    },
    onError: (apiError) => {
      setFormError(apiError.message || 'Failed to create facility.')
    },
  })

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
    setIsCreateModalOpen(true)
  }, [])

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
    setFormError(null)
    createFacilityMutation.reset()
  }, [createFacilityMutation])

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

      await createFacilityMutation.mutate({
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
      })
    },
    [createFacilityMutation, formState],
  )

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Facility Management"
        subtitle="Control partner facilities, monitor branch utilization, and add new operators without leaving the admin workspace."
        actions={
          <>
            <button
              type="button"
              onClick={exportFacilities}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              Export Facilities
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Building2 className="w-4 h-4" />
              Add Facility
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Operations" title="Facility Directory">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by facility name, id, or operator"
          controls={
            <select
              value={cityFilter}
              onChange={handleCityFilterChange}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {cityOptions.map((city: string) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4">
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
              ]}
            />
          )}
        </div>
      </AdminPanel>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-[var(--radius-lg)] bg-surface-container-lowest shadow-ambient border border-primary/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-primary/8 px-6 py-5">
              <div>
                <p className="text-[11px] font-lexend uppercase tracking-[0.16em] text-primary/55">Admin Action</p>
                <h3 className="mt-1 text-2xl font-black text-primary">Add Facility</h3>
                <p className="mt-2 text-sm text-primary/65">
                  Create a facility, provision its operator account, and optionally link sports in one step.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                aria-label="Close add facility dialog"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <section className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility Name</span>
                  <input
                    name="name"
                    value={formState.name}
                    onChange={handleFieldChange}
                    placeholder="Smash Hub Nasr City"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
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
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
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
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
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
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility Phone</span>
                  <input
                    name="phone"
                    value={formState.phone}
                    onChange={handleFieldChange}
                    placeholder="+20 100 123 4567"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
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
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Status</span>
                  <select
                    name="status"
                    value={formState.status}
                    onChange={handleFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Main Branch Name</span>
                  <input
                    name="branchName"
                    value={formState.branchName}
                    onChange={handleFieldChange}
                    placeholder="Main Branch"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Main Branch Address</span>
                  <input
                    name="branchAddress"
                    value={formState.branchAddress}
                    onChange={handleFieldChange}
                    placeholder="Leave blank to reuse the facility address"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
              </section>

              <section className="space-y-4 rounded-[var(--radius-md)] bg-surface-container-low p-4">
                <div>
                  <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Operator Account</p>
                  <p className="mt-1 text-sm text-primary/65">
                    Leave these fields blank and the system will auto-generate the operator identity for you.
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
                      className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-lowest px-4 py-3 text-primary outline-none focus:border-primary-container"
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
                      className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-lowest px-4 py-3 text-primary outline-none focus:border-primary-container"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Operator Phone</span>
                    <input
                      name="operatorPhone"
                      value={formState.operatorPhone}
                      onChange={handleFieldChange}
                      placeholder="+20 100 000 0000"
                      className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-lowest px-4 py-3 text-primary outline-none focus:border-primary-container"
                    />
                  </label>
                </div>
                <p className="text-xs text-primary/55">Auto-created operators use the default seeded password: <span className="font-bold">password123</span></p>
              </section>

              <section className="space-y-3">
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
                        className={`inline-flex items-center rounded-full px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] transition-colors ${
                          isSelected
                            ? 'bg-primary-container text-surface-container-lowest'
                            : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
                        }`}
                      >
                        {sport.displayName || sport.name}
                      </button>
                    )
                  })}
                </div>
              </section>

              {formError ? (
                <div className="rounded-[var(--radius-default)] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-primary/8 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="inline-flex items-center rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createFacilityMutation.loading}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {createFacilityMutation.loading ? 'Creating…' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
