'use client'

import { FormEvent, useCallback, useMemo, useState } from 'react'
import { Download, UserPlus, X } from 'lucide-react'
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

type CoachStatus = 'APPROVED' | 'PENDING' | 'SUSPENDED'

type CoachFormState = {
  name: string
  email: string
  phone: string
  city: string
  bio: string
  sportId: string
  experienceYears: string
  sessionRate: string
  commissionRate: string
  status: CoachStatus
  certifications: string
  specialties: string
}

const INITIAL_FORM_STATE: CoachFormState = {
  name: '',
  email: '',
  phone: '',
  city: 'Cairo',
  bio: '',
  sportId: '',
  experienceYears: '3',
  sessionRate: '450',
  commissionRate: '20',
  status: 'APPROVED',
  certifications: '',
  specialties: '',
}

function extractStringValue(value: any): string {
  if (typeof value === 'object' && value !== null) {
    return value.displayName || value.name || value.id || ''
  }
  return value || ''
}

function parseCommaSeparatedList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function AdminCoachesPage() {
  const [search, setSearch] = useState('')
  const [sportFilter, setSportFilter] = useState<string>('All')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [formState, setFormState] = useState<CoachFormState>(INITIAL_FORM_STATE)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: coachesResponse, loading, error, refetch } = useApiCall('/admin-workspace/coaches')
  const { data: sportsResponse } = useApiCall('/admin-workspace/sports')
  const coachesData = coachesResponse?.data || coachesResponse || []
  const sportsData = sportsResponse?.data || sportsResponse || []

  const createCoachMutation = useApiMutation('/admin-workspace/coaches', 'POST', {
    onSuccess: async () => {
      showToast('Coach created successfully.', 'success')
      setIsInviteModalOpen(false)
      setFormState(INITIAL_FORM_STATE)
      setFormError(null)
      await refetch()
    },
    onError: (apiError) => {
      setFormError(apiError.message || 'Failed to create coach.')
    },
  })

  const sportOptions = useMemo<string[]>(
    () => ['All', ...Array.from(new Set<string>(coachesData.map((item: any) => extractStringValue(item.sport)).filter(Boolean)))],
    [coachesData],
  )

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return coachesData.filter((coach: any) => {
      const matchesSearch =
        query.length === 0 ||
        coach.name?.toLowerCase()?.includes(query) ||
        coach.id?.toLowerCase()?.includes(query) ||
        coach.user?.email?.toLowerCase()?.includes(query)
      const matchesSport = sportFilter === 'All' || extractStringValue(coach.sport) === sportFilter

      return matchesSearch && matchesSport
    })
  }, [search, sportFilter, coachesData])

  const exportCoaches = useCallback(() => {
    const headers = 'Name,Email,Sport,Status,Sessions This Month,Commission Rate,Rating'
    const rows = filteredCoaches.map((coach: any) =>
      [
        coach.name || '',
        coach.user?.email || '',
        extractStringValue(coach.sport) || '',
        coach.status || '',
        coach.sessionsThisMonth || 0,
        coach.commissionRate || 0,
        coach.rating || 0,
      ].join(','),
    )

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `coaches-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    showToast('Coaches export downloaded.', 'success')
  }, [filteredCoaches])

  const openInviteModal = useCallback(() => {
    setFormState((current) => ({
      ...INITIAL_FORM_STATE,
      sportId: sportsData[0]?.id || '',
    }))
    setFormError(null)
    setIsInviteModalOpen(true)
  }, [sportsData])

  const closeInviteModal = useCallback(() => {
    setIsInviteModalOpen(false)
    setFormError(null)
    createCoachMutation.reset()
  }, [createCoachMutation])

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

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFormError(null)

      if (!formState.name.trim() || !formState.email.trim() || !formState.sportId) {
        setFormError('Coach name, email, and sport are required.')
        return
      }

      await createCoachMutation.mutate({
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim() || undefined,
        city: formState.city.trim() || undefined,
        bio: formState.bio.trim() || undefined,
        sportId: formState.sportId,
        experienceYears: Number(formState.experienceYears),
        sessionRate: Number(formState.sessionRate),
        commissionRate: Number(formState.commissionRate),
        status: formState.status,
        certifications: parseCommaSeparatedList(formState.certifications),
        specialties: parseCommaSeparatedList(formState.specialties),
      })
    },
    [createCoachMutation, formState],
  )

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coach Management"
        subtitle="Review coach performance, control commission settings, and create verified coach listings from the admin workspace."
        actions={
          <>
            <button
              type="button"
              onClick={exportCoaches}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              Export Coaches
            </button>
            <button
              type="button"
              onClick={openInviteModal}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Invite Coach
            </button>
          </>
        }
      />

      <AdminPanel eyebrow="Quality and growth" title="Coach Directory">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by coach id, name, or email"
          controls={
            <select
              value={sportFilter}
              onChange={(event) => setSportFilter(event.target.value)}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {sportOptions.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
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
              items={filteredCoaches}
              getRowKey={(coach: any) => coach.id}
              columns={[
                {
                  key: 'coach',
                  header: 'Coach',
                  render: (coach: any) => (
                    <div>
                      <p className="font-bold text-primary">{coach.name || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{coach.user?.email || 'No email'}</p>
                    </div>
                  ),
                },
                {
                  key: 'sport',
                  header: 'Sport',
                  render: (coach: any) => <p className="text-sm text-primary/75">{extractStringValue(coach.sport) || 'Unknown'}</p>,
                },
                {
                  key: 'sessions',
                  header: 'Sessions (month)',
                  render: (coach: any) => <p className="text-sm font-semibold text-primary">{coach.sessionsThisMonth || 0}</p>,
                },
                {
                  key: 'commission',
                  header: 'Commission',
                  render: (coach: any) => <p className="text-sm text-primary/75">{coach.commissionRate || 0}%</p>,
                },
                {
                  key: 'rating',
                  header: 'Rating',
                  render: (coach: any) => <p className="text-sm font-semibold text-primary">{(coach.rating || 0).toFixed(1)}</p>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (coach: any) => <AdminStatusPill label={coach.status || 'Unknown'} tone={statusTone(coach.status || 'Unknown')} />,
                },
              ]}
            />
          )}
        </div>
      </AdminPanel>

      {isInviteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-[var(--radius-lg)] border border-primary/10 bg-surface-container-lowest shadow-ambient max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-primary/8 px-6 py-5">
              <div>
                <p className="text-[11px] font-lexend uppercase tracking-[0.16em] text-primary/55">Admin Action</p>
                <h3 className="mt-1 text-2xl font-black text-primary">Invite Coach</h3>
                <p className="mt-2 text-sm text-primary/65">
                  Create a coach profile, provision the user account, and make it available to the admin directory immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={closeInviteModal}
                aria-label="Close invite coach dialog"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container-high hover:scale-105 active:scale-95 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              <section className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Coach Name</span>
                  <input
                    name="name"
                    value={formState.name}
                    onChange={handleFieldChange}
                    placeholder="Mostafa Ali"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Email</span>
                  <input
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleFieldChange}
                    placeholder="coach@sportbook.local"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Phone</span>
                  <input
                    name="phone"
                    value={formState.phone}
                    onChange={handleFieldChange}
                    placeholder="+20 101 000 0000"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
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
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Bio</span>
                  <textarea
                    name="bio"
                    value={formState.bio}
                    onChange={handleFieldChange}
                    placeholder="Performance-focused coach with junior and adult group experience."
                    rows={3}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Sport</span>
                  <select
                    name="sportId"
                    value={formState.sportId}
                    onChange={handleFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                    required
                  >
                    <option value="">Select a sport</option>
                    {sportsData.map((sport: any) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.displayName || sport.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Status</span>
                  <select
                    name="status"
                    value={formState.status}
                    onChange={handleFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Experience (years)</span>
                  <input
                    name="experienceYears"
                    type="number"
                    min="0"
                    value={formState.experienceYears}
                    onChange={handleFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Session Rate (EGP)</span>
                  <input
                    name="sessionRate"
                    type="number"
                    min="0"
                    value={formState.sessionRate}
                    onChange={handleFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Commission Rate (%)</span>
                  <input
                    name="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.commissionRate}
                    onChange={handleFieldChange}
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Certifications</span>
                  <input
                    name="certifications"
                    value={formState.certifications}
                    onChange={handleFieldChange}
                    placeholder="PTR Level 1, ITF Level 2"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Specialties</span>
                  <input
                    name="specialties"
                    value={formState.specialties}
                    onChange={handleFieldChange}
                    placeholder="Junior development, Match strategy"
                    className="w-full rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-primary outline-none focus:border-primary-container"
                  />
                </label>
              </section>

              <p className="text-xs text-primary/55">
                Newly created coach accounts use the seeded default password: <span className="font-bold">password123</span>
              </p>

              {formError ? (
                <div className="rounded-[var(--radius-default)] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-primary/8 pt-4">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  className="inline-flex items-center rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCoachMutation.loading}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" />
                  {createCoachMutation.loading ? 'Creating…' : 'Create Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
