'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Save, Wrench } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['Active', 'Maintenance', 'Paused'] as const
const surfaceOptions = ['Acrylic', 'Artificial Grass', 'Hard Court'] as const

export default function OperatorCourtDetailsPage() {
  const params = useParams<{ id: string }>()
  const courtId = Array.isArray(params.id) ? params.id[0] : params.id

  const { data: courtResponse, loading, error } = useApiCall(`/operator/courts/${courtId}`)
  const { data: branchesResponse } = useApiCall('/operator/branches')
  const saveMutation = useApiMutation(`/operator/courts/${courtId}`, 'PUT')

  const court = courtResponse?.data || courtResponse
  const branchesData = branchesResponse?.data || branchesResponse || []

  const [displayName, setDisplayName] = useState(court?.name ?? '')
  const [status, setStatus] = useState<(typeof statusOptions)[number]>(court?.status ?? 'Active')
  const [surface, setSurface] = useState<(typeof surfaceOptions)[number]>(court?.surface ?? 'Acrylic')
  const [pricePerHour, setPricePerHour] = useState(String(court?.pricePerHour ?? 0))
  const [indoor, setIndoor] = useState(court?.indoor ?? false)
  const [lights, setLights] = useState(court?.lights ?? true)
  const [nextMaintenance, setNextMaintenance] = useState(court?.nextMaintenance ?? '2026-05-01')
  const [cancellationWindow, setCancellationWindow] = useState('4')
  const [saved, setSaved] = useState(false)

  const handleDisplayNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value)
  }, [])

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value as (typeof statusOptions)[number])
  }, [])

  const handleSurfaceChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSurface(event.target.value as (typeof surfaceOptions)[number])
  }, [])

  const handlePricePerHourChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPricePerHour(event.target.value)
  }, [])

  const handleIndoorChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIndoor(event.target.checked)
  }, [])

  const handleLightsChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLights(event.target.checked)
  }, [])

  const handleNextMaintenanceChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNextMaintenance(event.target.value)
  }, [])

  const handleCancellationWindowChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCancellationWindow(event.target.value)
  }, [])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  if (loading) {
    return <SkeletonStat />
  }

  if (!court) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-extrabold text-primary">Court not found</h2>
        <p className="text-primary/70">The selected court id does not exist.</p>
        <Link
          href="/operator/courts"
          className="inline-flex items-center rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
        >
          Back to Courts
        </Link>
      </div>
    )
  }

  const branch = branchesData.find((entry: any) => entry.id === court.branchId)

  const getBranchNameById = (branchId: string) => {
    const found = branchesData.find((b: any) => b.id === branchId)
    return found?.name || 'Unknown Branch'
  }

  const formatEgp = (value: number) => {
    return `${value.toLocaleString()} EGP`
  }

  const handleSave = async () => {
    try {
      await saveMutation.mutate({
        name: displayName,
        status,
        surface,
        pricePerHour: Number(pricePerHour),
        indoor,
        lights,
        nextMaintenance,
        cancellationWindow: Number(cancellationWindow),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch (err) {
      console.error('Failed to save court:', err)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit ${court.name}`}
        subtitle={`Branch: ${getBranchNameById(court.branchId)} • Configure availability, pricing, and maintenance rules.`}
        actions={
          <>
            <Link
              href="/operator/courts"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courts
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </>
        }
      />

      {saved ? (
        <div className="rounded-[var(--radius-default)] bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-primary">
          Court configuration saved successfully.
        </div>
      ) : null}

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Court profile" title="Basics">
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Court name</span>
              <input
                value={displayName}
                onChange={handleDisplayNameChange}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Status</span>
              <select
                value={status}
                onChange={handleStatusChange}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Surface type</span>
              <select
                value={surface}
                onChange={handleSurfaceChange}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                {surfaceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <div>
                  <p className="text-sm font-bold text-primary">Indoor court</p>
                  <p className="text-xs text-primary/60 mt-1">Weather-protected court mode</p>
                </div>
                <input
                  type="checkbox"
                  checked={indoor}
                  onChange={handleIndoorChange}
                  className="h-5 w-5 accent-primary-container"
                />
              </label>

              <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <div>
                  <p className="text-sm font-bold text-primary">Night lighting</p>
                  <p className="text-xs text-primary/60 mt-1">Enable bookings after sunset</p>
                </div>
                <input
                  type="checkbox"
                  checked={lights}
                  onChange={handleLightsChange}
                  className="h-5 w-5 accent-primary-container"
                />
              </label>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Commercial settings" title="Pricing and Policy">
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Price per hour (EGP)</span>
              <input
                value={pricePerHour}
                onChange={handlePricePerHourChange}
                type="number"
                min={0}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
              <p className="mt-1 text-xs text-primary/55">Preview: {formatEgp(Number(pricePerHour || 0))}</p>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Cancellation window (hours)</span>
              <input
                value={cancellationWindow}
                onChange={handleCancellationWindowChange}
                type="number"
                min={1}
                max={24}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Next maintenance date</span>
              <input
                value={nextMaintenance}
                onChange={handleNextMaintenanceChange}
                type="date"
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Current health status</p>
              <div className="mt-2">
                <AdminStatusPill label={status} tone={statusTone(status)} />
              </div>
              <p className="mt-2 text-xs text-primary/60 inline-flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Last maintenance registered for {branch?.name ?? 'Unknown branch'}
              </p>
            </article>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
