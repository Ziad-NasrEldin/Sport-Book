'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Radar, Save, ShieldCheck, TimerReset, WalletCards } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

import { AppSelect } from '@/components/ui/AppSelect'
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

  const approvalModeLabel = approvalMode === 'auto' ? 'Auto approve' : 'Manual review'
  const policyHighlights = [
    {
      label: 'Commission floor',
      value: `${commissionRate || '0'}%`,
      icon: WalletCards,
      tone: 'from-[#00113a]/20 via-[#002366]/10 to-[#fd8b00]/15',
    },
    {
      label: 'Approval protocol',
      value: approvalModeLabel,
      icon: ShieldCheck,
      tone: 'from-[#fd8b00]/25 via-[#fd8b00]/10 to-[#00113a]/10',
    },
    {
      label: 'Refund deadline',
      value: `${refundWindow || '0'}h`,
      icon: TimerReset,
      tone: 'from-[#c3f400]/35 via-[#c3f400]/12 to-[#00113a]/12',
    },
  ] as const

  return (
    <div className="relative isolate space-y-7">
      <div className="pointer-events-none absolute inset-x-0 -top-8 -z-10 h-56 bg-[radial-gradient(75%_75%_at_10%_20%,rgba(0,35,102,0.22),transparent),radial-gradient(65%_65%_at_92%_15%,rgba(253,139,0,0.22),transparent)] blur-2xl" />

      <AdminPageHeader
        title="Platform Settings"
        subtitle="Control marketplace defaults, governance safeguards, and booking policy behavior used by all operator modules."
        className="px-5 py-5 md:px-7 md:py-6"
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-container px-5 py-2.5 text-xs font-lexend font-bold uppercase tracking-[0.14em] text-surface-container-lowest transition-all hover:scale-[1.03] hover:shadow-[0_14px_25px_-16px_rgba(0,17,58,0.85)] active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      {saved ? (
        <div className="animate-[var(--animate-soft-rise)] rounded-[var(--radius-default)] border border-primary/15 bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-primary shadow-[0_16px_32px_-28px_rgba(0,17,58,0.85)]">
          Settings updated successfully.
        </div>
      ) : saveError ? (
        <div className="animate-[var(--animate-soft-rise)] rounded-[var(--radius-default)] border border-red-300/60 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 shadow-[0_16px_32px_-28px_rgba(127,29,29,0.6)]">
          {saveError}
        </div>
      ) : loading ? (
        <div className="animate-[var(--animate-soft-rise)] rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 py-3 text-sm font-semibold text-primary/70">
          Loading settings from backend...
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {policyHighlights.map((item, index) => (
          <article
            key={item.label}
            className={`animate-[var(--animate-card-stagger)] rounded-[var(--radius-default)] border border-primary/10 bg-gradient-to-br ${item.tone} p-4 shadow-[0_20px_35px_-26px_rgba(0,17,58,0.7)]`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <item.icon className="h-5 w-5 text-primary/75" />
            <p className="mt-3 text-[11px] font-lexend uppercase tracking-[0.16em] text-primary/60">{item.label}</p>
            <p className="mt-1 text-xl font-black text-primary md:text-2xl">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <AdminPanel
          eyebrow="Revenue controls"
          title="Monetization Defaults"
          className="overflow-hidden border border-primary/15 bg-[linear-gradient(152deg,rgba(255,255,255,0.96)_0%,rgba(236,234,243,0.86)_60%,rgba(195,244,0,0.2)_100%)] shadow-[0_26px_50px_-38px_rgba(0,17,58,0.7)]"
        >
          <div className="space-y-3.5">
            <label className="block rounded-[var(--radius-default)] border border-primary/10 bg-white/85 p-4 shadow-[0_14px_26px_-22px_rgba(0,17,58,0.65)]">
              <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/60">Base commission rate (%)</span>
              <input
                value={commissionRate}
                onChange={(event) => setCommissionRate(event.target.value)}
                type="number"
                min={0}
                max={100}
                className="mt-2.5 w-full rounded-[var(--radius-default)] border border-primary/20 bg-surface-container-lowest px-3.5 py-2.5 text-3xl font-black tracking-tight text-primary outline-none transition-all focus:border-primary-container focus:shadow-[0_0_0_2px_rgba(0,35,102,0.12)]"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] border border-primary/10 bg-white/85 p-4 shadow-[0_14px_26px_-22px_rgba(0,17,58,0.65)]">
              <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/60">Default booking approval mode</span>
              <AppSelect
                value={approvalMode}
                onChange={(event) => setApprovalMode(event.target.value)}
                className="mt-2.5 w-full rounded-[var(--radius-default)] border border-primary/20 bg-surface-container-lowest px-3.5 py-3 text-lg font-extrabold text-primary outline-none transition-all focus:border-primary-container focus:shadow-[0_0_0_2px_rgba(0,35,102,0.12)]"
              >
                <option value="manual">Manual approval</option>
                <option value="auto">Auto approve</option>
              </AppSelect>
            </label>

            <label className="block rounded-[var(--radius-default)] border border-primary/10 bg-white/85 p-4 shadow-[0_14px_26px_-22px_rgba(0,17,58,0.65)]">
              <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/60">Cancellation window (hours)</span>
              <input
                value={refundWindow}
                onChange={(event) => setRefundWindow(event.target.value)}
                type="number"
                min={1}
                max={72}
                className="mt-2.5 w-full rounded-[var(--radius-default)] border border-primary/20 bg-surface-container-lowest px-3.5 py-2.5 text-3xl font-black tracking-tight text-primary outline-none transition-all focus:border-primary-container focus:shadow-[0_0_0_2px_rgba(0,35,102,0.12)]"
              />
            </label>

            <p className="rounded-[var(--radius-default)] bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.11em] text-surface-container-lowest/90">
              Changes apply across operator dashboards and booking workflows after save.
            </p>
          </div>
        </AdminPanel>

        <AdminPanel
          eyebrow="Security"
          title="Risk and Compliance"
          className="overflow-hidden border border-[#fd8b00]/30 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(253,139,0,0.1)_65%,rgba(0,17,58,0.08)_100%)] shadow-[0_26px_50px_-38px_rgba(253,139,0,0.8)]"
        >
          <div className="space-y-3.5">
            <label
              className={`flex items-center justify-between rounded-[var(--radius-default)] border p-4 transition-all ${strictKyc ? 'border-primary/25 bg-primary/8' : 'border-primary/10 bg-white/80'}`}
            >
              <div>
                <p className="text-sm font-black uppercase tracking-[0.08em] text-primary">Strict KYC Requirements</p>
                <p className="mt-1 text-xs text-primary/65">Require full legal documentation before account approval.</p>
              </div>
              <input
                type="checkbox"
                checked={strictKyc}
                onChange={(event) => setStrictKyc(event.target.checked)}
                className="h-6 w-6 rounded-md border border-primary/40 accent-secondary-container"
              />
            </label>

            <label
              className={`flex items-center justify-between rounded-[var(--radius-default)] border p-4 transition-all ${fraudMonitoring ? 'border-primary/25 bg-primary/8' : 'border-primary/10 bg-white/80'}`}
            >
              <div>
                <p className="text-sm font-black uppercase tracking-[0.08em] text-primary">Fraud Monitoring</p>
                <p className="mt-1 text-xs text-primary/65">Escalate payment anomalies with real-time automated alerts.</p>
              </div>
              <input
                type="checkbox"
                checked={fraudMonitoring}
                onChange={(event) => setFraudMonitoring(event.target.checked)}
                className="h-6 w-6 rounded-md border border-primary/40 accent-secondary-container"
              />
            </label>

            <article className="rounded-[var(--radius-default)] border border-primary/10 bg-[linear-gradient(135deg,rgba(0,17,58,0.92),rgba(0,35,102,0.92))] p-4 text-surface-container-lowest shadow-[0_20px_38px_-24px_rgba(0,17,58,0.95)]">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-tertiary-fixed" />
                <p className="text-[11px] font-lexend uppercase tracking-[0.14em] text-surface-container-lowest/70">API key rotation</p>
              </div>
              <p className="mt-2 text-lg font-black text-surface-container-lowest">Last rotated 17 days ago</p>
              <p className="mt-1 text-xs text-surface-container-lowest/70">Next rotation recommended in 13 days.</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3.5 py-1.5 text-[10px] font-lexend font-black uppercase tracking-[0.12em] text-primary transition-transform hover:scale-[1.04] active:scale-[0.98]"
              >
                <Radar className="h-3.5 w-3.5" />
                Rotate Keys
              </button>
            </article>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}

