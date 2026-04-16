'use client'

import { useMemo, useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

export default function CoachSettingsPage() {
  const { data: settingsResponse, loading, error, refetch } = useApiCall('/coach/settings')
  const saveMutation = useApiMutation('/coach/settings', 'PUT')

  const settingsData = settingsResponse?.data || settingsResponse || {}

  const [notifications, setNotifications] = useState<Record<string, boolean>>({})
  const [policies, setPolicies] = useState<Record<string, boolean>>({})
  const [payoutCycle, setPayoutCycle] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')

  useEffect(() => {
    if (settingsData.notifications) {
      const notificationDefaults = Object.fromEntries(settingsData.notifications.map((item: any) => [item.key, item.enabled]))
      setNotifications(notificationDefaults)
    }
    if (settingsData.policies) {
      const policyDefaults = Object.fromEntries(settingsData.policies.map((item: any) => [item.key, item.enabled]))
      setPolicies(policyDefaults)
    }
    if (settingsData.payoutCycle) {
      setPayoutCycle(settingsData.payoutCycle)
    }
  }, [settingsData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const handleSave = async () => {
    try {
      await saveMutation.mutate({
        notifications,
        policies,
        payoutCycle,
      })
      refetch()
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        subtitle="Fine-tune your booking and communication controls so operations stay predictable at scale."
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AdminPanel eyebrow="Notifications" title="Communication Preferences">
          <div className="space-y-3">
            {(settingsData.notifications || []).map((item: any) => (
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
          <div className="space-y-3">
            {(settingsData.policies || []).map((item: any) => (
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

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AdminPanel eyebrow="Payouts" title="Transfer Schedule">
          <div className="space-y-2.5">
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
                  className={`w-full text-left px-4 py-3 rounded-[var(--radius-default)] transition-colors ${
                    active
                      ? 'bg-primary-container text-surface-container-lowest'
                      : 'bg-surface-container-low text-primary'
                  }`}
                >
                  <p className="font-bold">{option.label}</p>
                  <p className={`text-xs mt-1 ${active ? 'text-surface-container-lowest/80' : 'text-primary/60'}`}>
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
          <div className="space-y-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low px-4 py-3">
              <p className="font-bold text-primary">Two-factor authentication</p>
              <p className="text-xs text-primary/60 mt-1">Enabled on all sign-ins and payout actions.</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low px-4 py-3">
              <p className="font-bold text-primary">API token access</p>
              <p className="text-xs text-primary/60 mt-1">Rotate tokens every 90 days for external integrations.</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low px-4 py-3">
              <p className="font-bold text-primary">Device sessions</p>
              <p className="text-xs text-primary/60 mt-1">3 active devices currently trusted.</p>
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
    <div className="flex items-center justify-between gap-4 bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5">
      <div>
        <p className="font-bold text-primary leading-tight">{label}</p>
        <p className="text-xs text-primary/60 mt-1">{description}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`w-12 h-7 rounded-full p-1 transition-colors ${enabled ? 'bg-tertiary-fixed' : 'bg-primary/20'}`}
        aria-pressed={enabled}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}
