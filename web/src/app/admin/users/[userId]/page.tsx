'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, MessageCircle, PencilLine, ShieldCheck, UserRound } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { statusTone } from '@/lib/admin/ui'

function buildWhatsAppHref(userName: string, userId: string) {
  const message = `Hi ${userName}, this is the SportBook admin team regarding your account (${userId}).`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export default function AdminUserDetailsPage() {
  const params = useParams<{ userId: string }>()
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId

  const { data: userResponse, loading, error } = useApiCall(`/admin/users/${userId}`)
  const user = userResponse?.data || userResponse

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  if (loading) {
    return <SkeletonStat />
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="User Not Found"
          subtitle="This user id does not exist in the system."
        />
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to User Directory
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Account Details"
        subtitle="Review account profile, role assignment, status, and moderation context before taking admin action."
        actions={
          <>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to User Directory
            </Link>
            <Link
              href={`/admin/users/${encodeURIComponent(user.id)}/edit`}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <PencilLine className="w-4 h-4" />
              Edit Account
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Identity" title={user.name}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">User ID</p>
              <p className="mt-1 text-sm font-semibold text-primary">{user.id}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Email</p>
              <p className="mt-1 text-sm font-semibold text-primary">{user.email}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Role</p>
              <p className="mt-1 text-sm font-semibold text-primary">{user.role}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Region</p>
              <p className="mt-1 text-sm font-semibold text-primary">{user.country}</p>
            </article>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <AdminStatusPill label={user.status} tone={statusTone(user.status)} />
            <span className="text-xs text-primary/60">Joined {user.joinedAt}</span>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Actions" title="Quick Admin Controls">
          <div className="space-y-3">
            <Link
              href={`/admin/users/${encodeURIComponent(user.id)}/edit`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-2.5 text-sm font-semibold text-surface-container-lowest"
            >
              <PencilLine className="w-4 h-4" />
              Edit Account
            </Link>

            <a
              href={buildWhatsAppHref(user.name, user.id)}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366]/20 px-4 py-2.5 text-sm font-semibold text-[#128C7E]"
            >
              <MessageCircle className="w-4 h-4" />
              Quick Chat on WhatsApp
            </a>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-primary"
            >
              <ShieldCheck className="w-4 h-4" />
              Trigger Security Review
            </button>
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AdminPanel eyebrow="Profile" title="Public Account Snapshot">
          <div className="rounded-[var(--radius-default)] bg-surface-container-low p-4">
            <p className="text-sm font-semibold text-primary inline-flex items-center gap-2">
              <UserRound className="w-4 h-4" />
              {user.name}
            </p>
            <p className="text-xs text-primary/60 mt-2">This profile is currently visible in discovery and can receive new interactions based on role permissions.</p>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Moderation" title="Account Health">
          <div className="space-y-2.5">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Fraud flags</p>
              <p className="mt-1 text-sm font-semibold text-primary">No critical risk signals in last 30 days</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Policy history</p>
              <p className="mt-1 text-sm font-semibold text-primary">No unresolved violations</p>
            </article>
          </div>
        </AdminPanel>
      </section>
    </div>
  )
}
