'use client'

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { AdminFilterBar } from '@/components/admin/AdminFilterBar'
import { AdminDonut } from '@/components/admin/AdminDonut'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTrendBars } from '@/components/admin/AdminTrendBars'
import {
  bookingsData,
  coachesData,
  facilitiesData,
  reviewsData,
  type ReviewRecord,
} from '@/lib/admin/mockData'
import { statusTone } from '@/lib/admin/ui'

const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'] as const
const reviewTabs = ['Facilities', 'Coaches'] as const
const chartPalette = ['#002366', '#fd8b00', '#c3f400']

type ReviewTab = (typeof reviewTabs)[number]

type Performer = {
  id: string
  name: string
  bookings: number
  avgRating: number
  approvedReviews: number
  totalReviews: number
}

function toShortName(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.slice(0, 2).join(' ')
}

function toBookingShareSegments(performers: Performer[]) {
  const topPerformers = performers.slice(0, 3)
  const totalBookings = topPerformers.reduce((sum, performer) => sum + performer.bookings, 0) || 1

  return topPerformers.map((performer, index) => ({
    label: toShortName(performer.name),
    value: Math.round((performer.bookings / totalBookings) * 100),
    color: chartPalette[index] ?? '#002366',
  }))
}

function toAverageRating(reviews: ReviewRecord[], fallback: number) {
  if (reviews.length === 0) return fallback

  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Number((total / reviews.length).toFixed(1))
}

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('All')
  const [activeTab, setActiveTab] = useState<ReviewTab>('Facilities')
  const [rows, setRows] = useState<ReviewRecord[]>(reviewsData)

  const facilityNames = useMemo(
    () => new Set(facilitiesData.map((facility) => facility.name.toLowerCase())),
    [],
  )

  const coachNames = useMemo(
    () => new Set(coachesData.map((coach) => coach.name.toLowerCase())),
    [],
  )

  const isFacilityReview = (review: ReviewRecord) => facilityNames.has(review.target.toLowerCase())

  const isCoachReview = (review: ReviewRecord) => {
    const normalizedTarget = review.target.toLowerCase().replace(/^coach\s+/, '')
    return coachNames.has(normalizedTarget)
  }

  const facilityPerformers = useMemo<Performer[]>(() => {
    return facilitiesData
      .map((facility) => {
        const relatedReviews = rows.filter((review) => review.target.toLowerCase() === facility.name.toLowerCase())
        const bookings = bookingsData.filter(
          (booking) =>
            booking.facility.toLowerCase() === facility.name.toLowerCase() &&
            booking.status !== 'Cancelled',
        ).length

        return {
          id: facility.id,
          name: facility.name,
          bookings,
          avgRating: toAverageRating(relatedReviews, 4.2),
          approvedReviews: relatedReviews.filter((review) => review.status === 'Approved').length,
          totalReviews: relatedReviews.length,
        }
      })
      .sort((a, b) => b.bookings - a.bookings || b.avgRating - a.avgRating)
  }, [rows])

  const coachPerformers = useMemo<Performer[]>(() => {
    return coachesData
      .map((coach) => {
        const relatedReviews = rows.filter((review) => {
          const normalizedTarget = review.target.toLowerCase().replace(/^coach\s+/, '')
          return normalizedTarget === coach.name.toLowerCase()
        })

        return {
          id: coach.id,
          name: coach.name,
          bookings: coach.sessionsThisMonth,
          avgRating: toAverageRating(relatedReviews, coach.rating),
          approvedReviews: relatedReviews.filter((review) => review.status === 'Approved').length,
          totalReviews: relatedReviews.length,
        }
      })
      .sort((a, b) => b.bookings - a.bookings || b.avgRating - a.avgRating)
  }, [rows])

  const activePerformers = activeTab === 'Facilities' ? facilityPerformers : coachPerformers
  const activeReviewsCount = rows.filter((review) =>
    activeTab === 'Facilities' ? isFacilityReview(review) : isCoachReview(review),
  ).length
  const activeAverageRating =
    activePerformers.length === 0
      ? 0
      : Number(
          (
            activePerformers.reduce((sum, performer) => sum + performer.avgRating, 0) /
            activePerformers.length
          ).toFixed(1),
        )
  const activeBookings = activePerformers.reduce((sum, performer) => sum + performer.bookings, 0)
  const trendValues = activePerformers.slice(0, 6).map((performer) => performer.bookings)
  const bookingShareSegments = toBookingShareSegments(activePerformers)

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((review) => {
      const matchesTab = activeTab === 'Facilities' ? isFacilityReview(review) : isCoachReview(review)
      const matchesSearch =
        query.length === 0 ||
        review.author.toLowerCase().includes(query) ||
        review.target.toLowerCase().includes(query) ||
        review.id.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'All' || review.status === statusFilter

      return matchesTab && matchesSearch && matchesStatus
    })
  }, [rows, activeTab, search, statusFilter])

  const updateStatus = (id: string, status: ReviewRecord['status']) => {
    setRows((prev) => prev.map((review) => (review.id === id ? { ...review, status } : review)))
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Review Moderation"
        subtitle="Protect community quality by reviewing user feedback, handling abuse reports, and applying moderation actions."
      />

      <AdminPanel eyebrow="Performance analytics" title="Facilities vs Coaches">
        <div className="flex flex-wrap gap-2">
          {reviewTabs.map((tab) => {
            const active = activeTab === tab

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.14em] ${
                  active
                    ? 'bg-primary-container text-surface-container-lowest'
                    : 'bg-surface-container-low text-primary/70'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <AdminStatCard
            label={`Top ${activeTab === 'Facilities' ? 'Facility' : 'Coach'}`}
            value={activePerformers[0]?.name ?? 'N/A'}
            delta="Highest booking volume"
            trend="up"
          />
          <AdminStatCard
            label="Average Rating"
            value={`${activeAverageRating.toFixed(1)} / 5`}
            delta="Across current leaderboard"
            trend="flat"
          />
          <AdminStatCard
            label="Total Bookings"
            value={String(activeBookings)}
            delta={`${activeReviewsCount} moderated reviews`}
            trend="up"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-3">
          <div className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
            <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/55">Booking trend by top performers</p>
            <div className="mt-3">
              <AdminTrendBars values={trendValues.length > 0 ? trendValues : [1]} colorClassName="bg-secondary-container" />
            </div>
          </div>

          <div className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
            <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/55">Top-3 booking share</p>
            <div className="mt-3">
              <AdminDonut
                segments={
                  bookingShareSegments.length > 0
                    ? bookingShareSegments
                    : [{ label: 'No Data', value: 100, color: '#002366' }]
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
          <p className="text-[10px] uppercase tracking-[0.14em] font-lexend text-primary/55">
            Best performing {activeTab === 'Facilities' ? 'facilities' : 'coaches'}
          </p>
          <div className="mt-3 grid grid-cols-1 xl:grid-cols-3 gap-2.5">
            {activePerformers.slice(0, 6).map((performer, index) => (
              <article key={performer.id} className="rounded-[var(--radius-default)] bg-surface-container-lowest px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">#{index + 1} {performer.name}</p>
                    <p className="text-xs text-primary/60 mt-1">
                      {performer.bookings} bookings • {performer.avgRating.toFixed(1)} rating
                    </p>
                  </div>
                  <AdminStatusPill label="Top performer" tone="green" />
                </div>
                <p className="text-xs text-primary/55 mt-2">
                  Approved reviews: {performer.approvedReviews} / {performer.totalReviews}
                </p>
              </article>
            ))}
          </div>
        </div>
      </AdminPanel>

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
          {filteredRows.map((review) => (
            <article key={review.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-primary">{review.author}</p>
                  <p className="text-xs text-primary/60 mt-1">Target: {review.target}</p>
                </div>
                <AdminStatusPill label={review.status} tone={statusTone(review.status)} />
              </div>

              <div className="mt-3 text-xs text-primary/60 space-y-1">
                <p>Review ID: {review.id}</p>
                <p>Rating: {review.rating}/5</p>
                <p>Reason: {review.reason}</p>
                <p>Submitted: {review.createdAt}</p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(review.id, 'Approved')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(review.id, 'Rejected')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-red-700"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  )
}
