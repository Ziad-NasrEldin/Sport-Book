'use client'

import { useEffect, useMemo, useState } from 'react'
import { Globe2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

import { AppSelect } from '@/components/ui/AppSelect'
export default function AdminLocalizationPage() {
  const [defaultLocale, setDefaultLocale] = useState('')
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState('')

  const { data: localizationResponse, loading, error, refetch } = useApiCall('/admin-workspace/localization')
  const localizationPayload = useMemo(
    () => localizationResponse?.data || localizationResponse || { locales: [], defaultLocale: '' },
    [localizationResponse],
  )
  const localizationData = localizationPayload.locales || []

  useEffect(() => {
    if (localizationPayload.defaultLocale) {
      setDefaultLocale(localizationPayload.defaultLocale)
    } else if (!defaultLocale && localizationData.length > 0) {
      setDefaultLocale(localizationData[0].locale)
    }
  }, [defaultLocale, localizationData, localizationPayload.defaultLocale])

  const handlePublish = async () => {
    if (!defaultLocale) return

    setSaving(true)
    setBanner('')

    try {
      await api.put('/admin-workspace/localization', {
        defaultLocale,
      })
      setBanner(`Published locale pack for ${defaultLocale}.`)
      await refetch()
    } catch {
      setBanner('Failed to publish locale pack. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Localization"
        subtitle="Manage locale packs, regional currency settings, and RTL experience controls for international users."
        actions={
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || !defaultLocale}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Globe2 className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Publish Locale Pack'}
          </button>
        }
      />

      {banner ? (
        <div className="rounded-[var(--radius-default)] bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-primary">
          {banner}
        </div>
      ) : null}

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Regional presets" title="Locale Registry">
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={localizationData}
              getRowKey={(row: any) => row.id}
              columns={[
                {
                  key: 'locale',
                  header: 'Locale',
                  render: (row: any) => (
                    <div>
                      <p className="font-bold text-primary">{row.locale || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{row.language || 'Unknown'}</p>
                    </div>
                  ),
                },
                {
                  key: 'currency',
                  header: 'Currency',
                  render: (row: any) => <p className="text-sm text-primary/75">{row.currency || 'Unknown'}</p>,
                },
                {
                  key: 'timezone',
                  header: 'Timezone',
                  render: (row: any) => <p className="text-sm text-primary/75">{row.timezone || 'Unknown'}</p>,
                },
                {
                  key: 'rtl',
                  header: 'Direction',
                  render: (row: any) => (
                    <AdminStatusPill label={row.rtl ? 'RTL' : 'LTR'} tone={row.rtl ? 'violet' : 'blue'} />
                  ),
                },
              ]}
            />
          )}
        </AdminPanel>

        <AdminPanel eyebrow="Platform default" title="Locale Behavior">
          <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
            <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Default locale</span>
            <AppSelect
              value={defaultLocale}
              onChange={(event) => setDefaultLocale(event.target.value)}
              className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
            >
              {localizationData.map((locale: any) => (
                <option key={locale.id} value={locale.locale}>
                  {locale.locale}
                </option>
              ))}
            </AppSelect>
          </label>

          <div className="mt-3 space-y-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-bold text-primary">Exchange Rate Source</p>
              <p className="text-xs text-primary/60 mt-1">Daily sync at 02:00 UTC from configured exchange provider.</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-bold text-primary">Date and Number Format</p>
              <p className="text-xs text-primary/60 mt-1">Localized formatting enabled for calendar, invoices, and exports.</p>
            </article>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}

