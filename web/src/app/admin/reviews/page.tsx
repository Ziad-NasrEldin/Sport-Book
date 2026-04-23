'use client'

import { useCallback, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { SkeletonList } from '@/components/ui/SkeletonLoader'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import { AppSelect } from '@/components/ui/AppSelect'

const statusOptions = ['All', 'PENDING', 'APPROVED', 'REJECTED'] as const

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('All')

  const { data: reviewsResponse, loading, error, refetch } = useApiCall('/admin-workspace/reviews')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const reviewsData = reviewsResponse?.data || reviewsResponse || []

  const reviewStats = useMemo(() => {
    return reviewsData.reduce(
      (acc: { total: number; pending: number; approved: number; rejected: number; avgRating: number }, review: any) => {
        acc.total += 1
        if (review.status === 'PENDING') acc.pending += 1
        if (review.status === 'APPROVED') acc.approved += 1
        if (review.status === 'REJECTED') acc.rejected += 1
        acc.avgRating += Number(review.rating || 0)
        return acc
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, avgRating: 0 }
    )
  }, [reviewsData])

  const handleStatusFilterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as (typeof statusOptions)[number])
  }, [])

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
      setUpdatingId(id)
      await api.patch(`/admin-workspace/reviews/${id}/status`, { status })
      await refetch()
    } catch (err) {
      console.error('Failed to update review status:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Review Moderation"
        subtitle="Protect community quality by reviewing user feedback, handling abuse reports, and applying moderation actions."
        className="px-4 py-5 md:px-6"
      />

      <section className="grid gap-4 md:grid-cols-4">
        <article className="relative overflow-hidden rounded-[1.35rem] border-2 border-[#1a237e]/20 bg-gradient-to-br from-[#1a237e] to-[#283593] p-5 shadow-[0_28px_56px_-28px_rgba(26,35,126,0.5)] animate-[var(--animate-soft-rise)]">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl" />
          <p className="relative text-[10px] uppercase tracking-[0.18em] font-lexend text-white/60">Total Cases</p>
          <p className="relative mt-3 text-4xl font-extrabold text-white tracking-tight">{reviewStats.total}</p>
        </article>
        <article className="relative overflow-hidden rounded-[1.35rem] border-2 border-amber-500/30 bg-gradient-to-br from-amber-500 to-amber-600 p-5 shadow-[0_28px_56px_-28px_rgba(245,158,11,0.5)] animate-[var(--animate-soft-rise)] animation-delay-100">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <p className="relative text-[10px] uppercase tracking-[0.18em] font-lexend text-white/80">Pending Action</p>
          <p className="relative mt-3 text-4xl font-extrabold text-white tracking-tight">{reviewStats.pending}</p>
        </article>
        <article className="relative overflow-hidden rounded-[1.35rem] border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 shadow-[0_28px_56px_-28px_rgba(16,185,129,0.5)] animate-[var(--animate-soft-rise)] animation-delay-200">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <p className="relative text-[10px] uppercase tracking-[0.18em] font-lexend text-white/80">Approved</p>
          <p className="relative mt-3 text-4xl font-extrabold text-white tracking-tight">{reviewStats.approved}</p>
        </article>
        <article className="relative overflow-hidden rounded-[1.35rem] border-2 border-primary/10 bg-surface-container-lowest p-5 shadow-[0_20px_45px_-34px_rgba(0,17,58,0.75)] animate-[var(--animate-soft-rise)] animation-delay-300">
          <p className="text-[10px] uppercase tracking-[0.18em] font-lexend text-primary/60">Avg Rating</p>
          <p className="mt-3 text-4xl font-extrabold text-primary tracking-tight">
            {reviewStats.total > 0 ? (reviewStats.avgRating / reviewStats.total).toFixed(1) : '0.0'}
            <span className="ml-1 text-lg font-semibold text-primary/50">/5</span>
          </p>
        </article>
      </section>

      <AdminPanel eyebrow="Moderation queue" title="Flagged and Pending Reviews" className="border-2 border-primary/10 bg-surface-container-lowest/95 shadow-[0_26px_54px_-36px_rgba(0,17,58,0.85)]">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by author, target, or review id"
          controls={
            <AppSelect
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="rounded-full border-2 border-primary/15 bg-surface-container-low px-4 py-2.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary outline-none transition-colors hover:bg-surface-container-medium focus:border-amber-500/50"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </AppSelect>
          }
        />

        <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {loading ? (
            <SkeletonList items={6} />
          ) : filteredRows.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 h-16 w-16 rounded-2xl bg-primary/5" />
              <p className="text-sm font-semibold text-primary/40">No reviews found in queue</p>
            </div>
          ) : (
            filteredRows.map((review: any, idx: number) => {
              const isPending = review.status === 'PENDING'
              const isApproved = review.status === 'APPROVED'
              const isRejected = review.status === 'REJECTED'
              return (
                <article
                  key={review.id}
                  className={`relative overflow-hidden bg-surface-container-low shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-[var(--animate-soft-rise)] ${
                    isPending ? 'shadow-amber-500/10' : isApproved ? 'shadow-emerald-500/5' : 'shadow-red-500/5'
                  }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className={`absolute top-0 left-0 h-2 w-full bg-gradient-to-r ${
                    isPending ? 'from-amber-500 to-amber-400' : isApproved ? 'from-emerald-500 to-emerald-400' : 'from-red-500 to-red-400'
                  }`} />
                  <div className={`absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl ${
                    isPending ? 'bg-amber-500/5' : isApproved ? 'bg-emerald-500/5' : 'bg-red-500/5'
                  }`} />
                  <div className={`absolute top-4 right-4 h-8 w-8 rounded-bl-lg ${
                    isPending ? 'bg-amber-500/20' : isApproved ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`} />
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-6">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-extrabold text-3xl ${
                        isPending ? 'bg-amber-500/10 text-amber-600' : isApproved ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                        {(review.user?.name || review.userId || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xl font-extrabold text-primary tracking-tight">{review.user?.name || review.userId || 'Unknown'}</p>
                            <p className="text-xs font-bold text-primary/40 mt-1 uppercase tracking-widest">Case #{review.id?.slice(-8) || 'Unknown'}</p>
                          </div>
                          <AdminStatusPill label={review.status || 'Unknown'} tone={statusTone(review.status || 'Unknown')} />
                        </div>
                        
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-surface-container-lowest p-4 border border-primary/5">
                            <p className="text-[10px] uppercase tracking-wider font-lexend text-primary/30">Target</p>
                            <p className="mt-1 text-sm font-bold text-primary truncate">{review.facility?.name || review.coach?.name || review.targetId || 'Unknown'}</p>
                          </div>
                          <div className="rounded-xl bg-surface-container-lowest p-4 border border-primary/5">
                            <p className="text-[10px] uppercase tracking-wider font-lexend text-primary/30">Rating</p>
                            <p className="mt-1 text-2xl font-extrabold text-amber-600">{review.rating || 0}<span className="text-sm font-semibold text-primary/40">/5</span></p>
                          </div>
                        </div>
                        
                        <div className="mt-3 rounded-xl bg-surface-container-lowest p-4 border border-primary/5">
                          <p className="text-[10px] uppercase tracking-wider font-lexend text-primary/30">Comment</p>
                          <p className="mt-1 text-sm text-primary/80 leading-relaxed">{review.comment || review.reason || 'No comment'}</p>
                        </div>
                        
                        <p className="mt-4 text-xs text-primary/40">Submitted {new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {review.status === 'PENDING' && (
                      <div className="relative mt-6 flex items-center gap-3 border-t-2 border-primary/10 pt-5">
                        <button
                          type="button"
                          disabled={updatingId === review.id}
                          onClick={() => updateStatus(review.id, 'APPROVED')}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/20 disabled:opacity-40 disabled:hover:border-emerald-500/30 disabled:hover:bg-emerald-500/10"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === review.id}
                          onClick={() => updateStatus(review.id, 'REJECTED')}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-500/30 bg-red-500/10 px-5 py-3.5 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-red-700 transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/20 disabled:opacity-40 disabled:hover:border-red-500/30 disabled:hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      </AdminPanel>
    </div>
  )
}


