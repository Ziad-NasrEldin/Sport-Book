'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'

export default function OperatorSettingsPage() {
  const [defaultSlotDuration, setDefaultSlotDuration] = useState('60')
  const [bufferTime, setBufferTime] = useState('10')
  const [lateCancellationFee, setLateCancellationFee] = useState('80')
  const [autoConfirmBookings, setAutoConfirmBookings] = useState(false)
  const [allowCashPayments, setAllowCashPayments] = useState(true)
  const [strictMaintenanceBlocks, setStrictMaintenanceBlocks] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operator Settings"
        subtitle="Define branch-wide operating defaults for booking flow, payment behavior, and maintenance policies."
        actions={
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        }
      />

      {saved ? (
        <div className="rounded-[var(--radius-default)] bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-primary">
          Operator settings saved.
        </div>
      ) : null}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AdminPanel eyebrow="Booking policy" title="Operational Defaults">
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Default slot duration (minutes)</span>
              <input
                type="number"
                min={30}
                max={180}
                value={defaultSlotDuration}
                onChange={(event) => setDefaultSlotDuration(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Buffer between sessions (minutes)</span>
              <input
                type="number"
                min={0}
                max={45}
                value={bufferTime}
                onChange={(event) => setBufferTime(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Late cancellation fee (EGP)</span>
              <input
                type="number"
                min={0}
                max={500}
                value={lateCancellationFee}
                onChange={(event) => setLateCancellationFee(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Automation" title="Rules and Guardrails">
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <div>
                <p className="text-sm font-bold text-primary">Auto-confirm bookings</p>
                <p className="text-xs text-primary/60 mt-1">Automatically confirm eligible bookings.</p>
              </div>
              <input
                type="checkbox"
                checked={autoConfirmBookings}
                onChange={(event) => setAutoConfirmBookings(event.target.checked)}
                className="h-5 w-5 accent-primary-container"
              />
            </label>

            <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <div>
                <p className="text-sm font-bold text-primary">Allow cash payments</p>
                <p className="text-xs text-primary/60 mt-1">Enable front-desk cash settlements.</p>
              </div>
              <input
                type="checkbox"
                checked={allowCashPayments}
                onChange={(event) => setAllowCashPayments(event.target.checked)}
                className="h-5 w-5 accent-primary-container"
              />
            </label>

            <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <div>
                <p className="text-sm font-bold text-primary">Strict maintenance blocks</p>
                <p className="text-xs text-primary/60 mt-1">Prevent manual booking overrides on blocked courts.</p>
              </div>
              <input
                type="checkbox"
                checked={strictMaintenanceBlocks}
                onChange={(event) => setStrictMaintenanceBlocks(event.target.checked)}
                className="h-5 w-5 accent-primary-container"
              />
            </label>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
