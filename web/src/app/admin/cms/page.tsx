'use client'

import { useState, useEffect } from 'react'
import { Eye, Save, Loader2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { SkeletonTable } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

export default function AdminCmsPage() {
  const { data: cmsResponse, loading, error, refetch } = useApiCall('/admin-workspace/cms')
  const [saving, setSaving] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const cmsData = cmsResponse?.data || cmsResponse || []

  const [selectedPage, setSelectedPage] = useState('Terms of Service')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [statusKey, setStatusKey] = useState(0)

  useEffect(() => {
    if (cmsData.length > 0) {
      setSelectedPage(cmsData[0].page)
      setContent(cmsData[0].content || '')
      setStatus(cmsData[0].status || 'DRAFT')
      setSelectedRowId(cmsData[0].id)
      setStatusKey((k) => k + 1)
    }
  }, [cmsData])

  const handlePublish = async () => {
    try {
      const currentPage = cmsData.find((item: any) => item.page === selectedPage)
      if (currentPage) {
        setSaving(true)
        await api.put(`/admin-workspace/cms/${currentPage.id}`, { content, status: 'PUBLISHED' })
        setStatus('PUBLISHED')
        setStatusKey((k) => k + 1)
        await refetch()
      }
    } catch (err) {
      console.error('Failed to publish:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectRow = (row: any) => {
    setSelectedPage(row.page)
    setContent(row.content || '')
    setStatus(row.status || 'DRAFT')
    setStatusKey((k) => k + 1)
    setSelectedRowId(row.id)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="CMS, Legal and FAQ"
        subtitle="Manage regulatory pages and support content with draft and publish workflows across languages."
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4 animate-soft-rise animation-delay-100">
        <AdminPanel
          className="animate-card-stagger animation-delay-150"
          eyebrow="Content editor"
          title={selectedPage}
          actions={
            <>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary transition-all duration-150 ease-out-quart hover:scale-[1.03] hover:shadow-sm active:scale-[0.97]"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-surface-container-lowest transition-all duration-150 ease-out-quart hover:scale-[1.03] hover:shadow-md active:scale-[0.97] disabled:opacity-50 disabled:scale-100"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? 'Saving...' : 'Publish'}
              </button>
            </>
          }
        >
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full min-h-[280px] rounded-[var(--radius-default)] bg-surface-container-low p-3.5 text-sm text-primary outline-none resize-y transition-all duration-200 ease-out-quart focus:ring-2 focus:ring-primary/15 focus:shadow-[0_8px_28px_-12px_rgba(0,17,58,0.18)]"
          />
          <div className="mt-3 flex items-center gap-2">
            <span
              key={statusKey}
              className="animate-status-flip inline-block"
            >
              <AdminStatusPill label={status} tone={statusTone(status)} />
            </span>
            <p className="text-xs text-primary/60">Autosave every 20 seconds (mocked).</p>
          </div>
        </AdminPanel>

        <AdminPanel
          className="animate-card-stagger animation-delay-250"
          eyebrow="Pages"
          title="Published Inventory"
        >
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
                      onClick={() => handleSelectRow(row)}
                      className={`text-left w-full transition-all duration-150 active:scale-[0.98] rounded-lg px-2 py-1 -mx-2 -my-1 ${selectedRowId === row.id ? 'bg-primary/[0.04] ring-1 ring-primary/10' : 'hover:bg-primary/[0.02]'}`}
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
