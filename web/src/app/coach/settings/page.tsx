'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import type { CoachSettingsData } from '@/lib/coach/types'

export default function CoachSettingsPage() {
  const { data: settingsData, error, refetch } = useApiCall<CoachSettingsData>('/coach/settings')
  const { data: securityInfo } = useApiCall<{
    twoFactorEnabled: boolean
    apiTokenCount: number
    activeDeviceSessions: number
    lastLoginAt: string
    lastLoginIp: string | null
  }>('/coach/security')
  const saveMutation = useApiMutation('/coach/settings', 'PUT')

  const [notifications, setNotifications] = useState<Record<string, boolean>>({})
  const [policies, setPolicies] = useState<Record<string, boolean>>({})
  const [payoutCycle, setPayoutCycle] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')

  useEffect(() => {
    if (!settingsData) return
    setNotifications(Object.fromEntries(settingsData.notifications.map((item) => [item.key, item.enabled])))
    setPolicies(Object.fromEntries(settingsData.policies.map((item) => [item.key, item.enabled])))
    setPayoutCycle(settingsData.payoutCycle)
  }, [settingsData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  const handleSave = async () => {
    await saveMutation.mutate({
      notifications,
      policies,
      payoutCycle,
    })
    await refetch()
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Settings"
        subtitle="Fine-tune your booking and communication controls so operations stay predictable at scale."
        actions={
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveMutation.loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminPanel eyebrow="Notifications" title="Communication Preferences">
          <div className="space-y-4">
            {(settingsData?.notifications ?? []).map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                description={item.description}
                enabled={notifications[item.key] ?? false}
                onToggle={() =>
                  setNotifications((current) => ({
                    ...current,
                    [item.key]: !(current[item.key] ?? false),
                  }))
                }
              />
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Policies" title="Booking Rules">
          <div className="space-y-4">
            {(settingsData?.policies ?? []).map((item) => (
              <ToggleRow
                key={item.key}
                label={item.label}
                description={item.description}
                enabled={policies[item.key] ?? false}
                onToggle={() =>
                  setPolicies((current) => ({
                    ...current,
                    [item.key]: !(current[item.key] ?? false),
                  }))
                }
              />
            ))}
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminPanel eyebrow="Payouts" title="Transfer Schedule">
          <div className="space-y-3">
            {[
              { label: 'Weekly', value: 'weekly' },
              { label: 'Bi-weekly', value: 'biweekly' },
              { label: 'Monthly', value: 'monthly' },
            ].map((option) => {
              const active = payoutCycle === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPayoutCycle(option.value as typeof payoutCycle)}
                  className={`w-full text-left px-5 py-4 rounded-[var(--radius-md)] transition-colors shadow-sm ${
                    active
                      ? 'bg-primary-container text-surface-container-lowest shadow-md'
                      : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
                  }`}
                >
                  <p className="font-black text-base">{option.label}</p>
                  <p className={`text-sm mt-1.5 font-semibold ${active ? 'text-surface-container-lowest/80' : 'text-primary/70'}`}>
                    {option.value === 'weekly'
                      ? 'Faster cash flow with smaller payout batches.'
                      : option.value === 'biweekly'
                        ? 'Balanced payout cadence for steady volume.'
                        : 'Single monthly reconciliation cycle.'}
                  </p>
                </button>
              )
            })}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Security" title="Access Controls">
          <div className="space-y-4">
            <article className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md">
              <p className="font-black text-primary text-base">Two-factor authentication</p>
              <p className="text-sm text-primary/70 mt-1.5 font-semibold">{securityInfo?.twoFactorEnabled ? 'Enabled on all sign-ins and payout actions.' : 'Not yet enabled. Consider enabling for enhanced security.'}</p>
            </article>
            <article className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md">
              <p className="font-black text-primary text-base">API token access</p>
              <p className="text-sm text-primary/70 mt-1.5 font-semibold">{securityInfo?.apiTokenCount ?? 0} active API token{((securityInfo?.apiTokenCount ?? 0) !== 1) ? 's' : ''}. Rotate tokens every 90 days for external integrations.</p>
            </article>
            <article className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md">
              <p className="font-black text-primary text-base">Device sessions</p>
              <p className="text-sm text-primary/70 mt-1.5 font-semibold">{securityInfo?.activeDeviceSessions ?? 0} active device{((securityInfo?.activeDeviceSessions ?? 0) !== 1) ? 's' : ''} currently trusted.</p>
            </article>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}

type ToggleRowProps = {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-surface-container-high rounded-[var(--radius-md)] px-5 py-4 shadow-sm">
      <div>
        <p className="font-black text-primary leading-tight text-base">{label}</p>
        <p className="text-sm text-primary/70 mt-1.5 font-semibold">{description}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`w-14 h-8 rounded-full p-1 transition-colors shadow-sm ${enabled ? 'bg-tertiary-fixed' : 'bg-primary/20'}`}
        aria-pressed={enabled}
      >
        <span
          className={`block w-6 h-6 rounded-full bg-surface-container-lowest shadow-md transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}
