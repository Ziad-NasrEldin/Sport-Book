'use client'

import { useState, useEffect } from 'react'
import { Eye, Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

export default function AdminCmsPage() {
  const { data: cmsResponse, loading, error, refetch } = useApiCall('/admin/cms')
  const saveMutation = useApiMutation('/admin/cms/:id', 'PUT')

  const cmsData = cmsResponse?.data || cmsResponse || []

  const [selectedPage, setSelectedPage] = useState(cmsData[0]?.page ?? 'Terms of Service')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')

  useEffect(() => {
    if (cmsData.length > 0) {
      setSelectedPage(cmsData[0].page)
      setContent(cmsData[0].content || '')
      setStatus(cmsData[0].status || 'DRAFT')
    }
  }, [cmsData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const handlePublish = async () => {
    try {
      const currentPage = cmsData.find((item: any) => item.page === selectedPage)
      if (currentPage) {
        await saveMutation.mutate({ id: currentPage.id, content, status: 'PUBLISHED' })
        setStatus('PUBLISHED')
        refetch()
      }
    } catch (err) {
      console.error('Failed to publish:', err)
    }
  }

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
                onClick={handlePublish}
                disabled={saveMutation.loading}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-surface-container-lowest disabled:opacity-50"
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
          {loading ? (
            <SkeletonTable rows={10} />
          ) : (
            <AdminTable
              items={cmsData}
              getRowKey={(row: any) => row.id}
              columns={[
                {
                  key: 'page',
                  header: 'Page',
                  render: (row: any) => (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPage(row.page)
                        setContent(row.content || '')
                        setStatus(row.status || 'DRAFT')
                      }}
                      className="text-left"
                    >
                      <p className="font-bold text-primary">{row.page || 'Unknown'}</p>
                      <p className="text-xs text-primary/60 mt-1">{row.language || 'Unknown'}</p>
                    </button>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row: any) => <AdminStatusPill label={row.status || 'Unknown'} tone={statusTone(row.status || 'Unknown')} />,
                },
                {
                  key: 'version',
                  header: 'Version',
                  render: (row: any) => <p className="text-sm text-primary/75">{row.version || '1.0'}</p>,
                },
              ]}
            />
          )}
        </AdminPanel>
      </section>
    </div>
  )
}
