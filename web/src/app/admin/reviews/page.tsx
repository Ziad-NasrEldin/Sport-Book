'use client'

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { SkeletonList } from '@/components/ui/SkeletonLoader'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'PENDING', 'APPROVED', 'REJECTED'] as const

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('All')

  const { data: reviewsResponse, loading, error, refetch } = useApiCall('/admin/reviews')
  const updateMutation = useApiMutation('/admin/reviews/:id/status', 'PATCH')

  const reviewsData = reviewsResponse?.data || reviewsResponse || []

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return reviewsData.filter((review: any) => {
      const authorName = review.user?.name || review.userId || ''
      const targetName = review.facility?.name || review.coach?.name || review.targetId || ''
      const matchesSearch =
        query.length === 0 ||
        authorName.toLowerCase().includes(query) ||
        targetName.toLowerCase().includes(query) ||
        review.id?.toLowerCase()?.includes(query)
      const matchesStatus = statusFilter === 'All' || review.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [reviewsData, search, statusFilter])

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateMutation.mutate({ id, status })
      refetch()
    } catch (err) {
      console.error('Failed to update review status:', err)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Review Moderation"
        subtitle="Protect community quality by reviewing user feedback, handling abuse reports, and applying moderation actions."
      />

      <AdminPanel eyebrow="Moderation queue" title="Flagged and Pending Reviews">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by author, target, or review id"
          controls={
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
              className="rounded-full bg-surface-container-low px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          }
        />

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {loading ? (
            <SkeletonList items={6} />
          ) : filteredRows.length === 0 ? (
            <div className="col-span-full text-center py-8 text-sm text-primary/60">
              No reviews found.
            </div>
          ) : (
            filteredRows.map((review: any) => (
              <article key={review.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{review.user?.name || review.userId || 'Unknown'}</p>
                    <p className="text-xs text-primary/60 mt-1">Target: {review.facility?.name || review.coach?.name || review.targetId || 'Unknown'}</p>
                  </div>
                  <AdminStatusPill label={review.status || 'Unknown'} tone={statusTone(review.status || 'Unknown')} />
                </div>

                <div className="mt-3 text-xs text-primary/60 space-y-1">
                  <p>Review ID: {review.id || 'Unknown'}</p>
                  <p>Rating: {review.rating || 0}/5</p>
                  <p>Comment: {review.comment || review.reason || 'No comment'}</p>
                  <p>Submitted: {new Date(review.createdAt).toLocaleString()}</p>
                </div>

                {review.status === 'PENDING' && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updateMutation.loading}
                      onClick={() => updateStatus(review.id, 'APPROVED')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={updateMutation.loading}
                      onClick={() => updateStatus(review.id, 'REJECTED')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-red-700 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
