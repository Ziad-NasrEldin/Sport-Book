'use client'

import { useState } from 'react'
import { Globe2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { localizationData } from '@/lib/admin/mockData'

export default function AdminLocalizationPage() {
  const [defaultLocale, setDefaultLocale] = useState('en-EG')

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Localization"
        subtitle="Manage locale packs, regional currency settings, and RTL experience controls for international users."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Globe2 className="w-4 h-4" />
            Publish Locale Pack
          </button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Regional presets" title="Locale Registry">
          <AdminTable
            items={localizationData}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: 'locale',
                header: 'Locale',
                render: (row) => (
                  <div>
                    <p className="font-bold text-primary">{row.locale}</p>
                    <p className="text-xs text-primary/60 mt-1">{row.language}</p>
                  </div>
                ),
              },
              {
                key: 'currency',
                header: 'Currency',
                render: (row) => <p className="text-sm text-primary/75">{row.currency}</p>,
              },
              {
                key: 'timezone',
                header: 'Timezone',
                render: (row) => <p className="text-sm text-primary/75">{row.timezone}</p>,
              },
              {
                key: 'rtl',
                header: 'Direction',
                render: (row) => (
                  <AdminStatusPill label={row.rtl ? 'RTL' : 'LTR'} tone={row.rtl ? 'violet' : 'blue'} />
                ),
              },
            ]}
          />
        </AdminPanel>

        <AdminPanel eyebrow="Platform default" title="Locale Behavior">
          <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
            <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Default locale</span>
            <select
              value={defaultLocale}
              onChange={(event) => setDefaultLocale(event.target.value)}
              className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
            >
              {localizationData.map((locale) => (
                <option key={locale.id} value={locale.locale}>
                  {locale.locale}
                </option>
              ))}
            </select>
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
