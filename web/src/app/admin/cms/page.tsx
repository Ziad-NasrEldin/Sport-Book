'use client'

import { useState } from 'react'
import { Eye, Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { cmsData } from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

export default function AdminCmsPage() {
  const [selectedPage, setSelectedPage] = useState(cmsData[0]?.page ?? 'Terms of Service')
  const [content, setContent] = useState(
    '## Terms\n\nThis is a structured mock editor for legal and FAQ content.\n\n- Update sections\n- Save draft\n- Publish to all locales',
  )
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft')

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="CMS, Legal and FAQ"
        subtitle="Manage regulatory pages and support content with draft and publish workflows across languages."
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <AdminPanel
          eyebrow="Content editor"
          title={selectedPage}
          actions={
            <>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => setStatus('Published')}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-surface-container-lowest"
              >
                <Save className="w-3.5 h-3.5" />
                Publish
              </button>
            </>
          }
        >
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full min-h-[280px] rounded-[var(--radius-default)] bg-surface-container-low p-3.5 text-sm text-primary outline-none resize-y"
          />
          <div className="mt-3 flex items-center gap-2">
            <AdminStatusPill label={status} tone={statusTone(status)} />
            <p className="text-xs text-primary/60">Autosave every 20 seconds (mocked).</p>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Pages" title="Published Inventory">
          <AdminTable
            items={cmsData}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: 'page',
                header: 'Page',
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => setSelectedPage(row.page)}
                    className="text-left"
                  >
                    <p className="font-bold text-primary">{row.page}</p>
                    <p className="text-xs text-primary/60 mt-1">{row.language}</p>
                  </button>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminStatusPill label={row.status} tone={statusTone(row.status)} />,
              },
              {
                key: 'version',
                header: 'Version',
                render: (row) => <p className="text-sm text-primary/75">{row.version}</p>,
              },
            ]}
          />
        </AdminPanel>
      </section>
    </div>
  )
}
