'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

export default function AdminSettingsPage() {
  const [commissionRate, setCommissionRate] = useState('18')
  const [approvalMode, setApprovalMode] = useState('manual')
  const [refundWindow, setRefundWindow] = useState('12')
  const [strictKyc, setStrictKyc] = useState(true)
  const [fraudMonitoring, setFraudMonitoring] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const { data: settingsResponse, loading, error, refetch } = useApiCall('/admin-workspace/settings')

  useEffect(() => {
    const settings = settingsResponse?.data || settingsResponse
    if (!settings) return

    if (settings.commissionRate !== undefined) {
      setCommissionRate(String(settings.commissionRate))
    }
    if (settings.approvalMode) {
      setApprovalMode(settings.approvalMode)
    }
    if (settings.refundWindow !== undefined) {
      setRefundWindow(String(settings.refundWindow))
    }
    if (settings.strictKyc !== undefined) {
      setStrictKyc(Boolean(settings.strictKyc))
    }
    if (settings.fraudMonitoring !== undefined) {
      setFraudMonitoring(Boolean(settings.fraudMonitoring))
    }
  }, [settingsResponse])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError('')

    try {
      await api.put('/admin-workspace/settings', {
        commissionRate: Number(commissionRate),
        approvalMode,
        refundWindow: Number(refundWindow),
        strictKyc,
        fraudMonitoring,
      })
      setSaved(true)
      await refetch()
      setTimeout(() => setSaved(false), 1800)
    } catch {
      setSaveError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Settings"
        subtitle="Control marketplace defaults, governance safeguards, and booking policy behavior used by all operator modules."
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      {saved ? (
        <div className="rounded-[var(--radius-default)] bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-primary">
          Settings updated successfully.
        </div>
      ) : saveError ? (
        <div className="rounded-[var(--radius-default)] bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700">
          {saveError}
        </div>
      ) : loading ? (
        <div className="rounded-[var(--radius-default)] bg-surface-container-low px-4 py-3 text-sm font-semibold text-primary/70">
          Loading settings from backend...
        </div>
      ) : null}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AdminPanel eyebrow="Revenue controls" title="Monetization Defaults">
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Base commission rate (%)</span>
              <input
                value={commissionRate}
                onChange={(event) => setCommissionRate(event.target.value)}
                type="number"
                min={0}
                max={100}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Default booking approval mode</span>
              <select
                value={approvalMode}
                onChange={(event) => setApprovalMode(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              >
                <option value="manual">Manual approval</option>
                <option value="auto">Auto approve</option>
              </select>
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Cancellation window (hours)</span>
              <input
                value={refundWindow}
                onChange={(event) => setRefundWindow(event.target.value)}
                type="number"
                min={1}
                max={72}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Security" title="Risk and Compliance">
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <div>
                <p className="text-sm font-bold text-primary">Strict KYC Requirements</p>
                <p className="text-xs text-primary/60 mt-1">Require all entities to submit full legal documentation.</p>
              </div>
              <input
                type="checkbox"
                checked={strictKyc}
                onChange={(event) => setStrictKyc(event.target.checked)}
                className="h-5 w-5 accent-primary-container"
              />
            </label>

            <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <div>
                <p className="text-sm font-bold text-primary">Fraud Monitoring</p>
                <p className="text-xs text-primary/60 mt-1">Trigger automatic alerts when payment anomalies are detected.</p>
              </div>
              <input
                type="checkbox"
                checked={fraudMonitoring}
                onChange={(event) => setFraudMonitoring(event.target.checked)}
                className="h-5 w-5 accent-primary-container"
              />
            </label>

            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">API key rotation</p>
              <p className="mt-1 text-sm font-semibold text-primary">Last rotated 17 days ago</p>
              <button
                type="button"
                className="mt-3 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-primary"
              >
                Rotate Keys
              </button>
            </article>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
