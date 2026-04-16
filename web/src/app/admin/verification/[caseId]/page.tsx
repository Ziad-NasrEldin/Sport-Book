'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Check, FileWarning, UserPlus2, X } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'
import { riskTone, statusTone } from '@/lib/admin/ui'

type CaseStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Needs Info'

type ChecklistItem = {
  id: string
  label: string
  verified: boolean
}

type TimelineItem = {
  id: string
  message: string
  at: string
}

function nowStamp() {
  return new Date().toLocaleString('en-GB', { hour12: false })
}

export default function AdminVerificationCasePage() {
  const params = useParams<{ caseId: string }>()
  const caseId = params.caseId

  const { data: caseResponse, loading, error } = useApiCall(`/admin/verification/${caseId}`)
  const updateStatusMutation = useApiMutation(`/admin/verification/${caseId}/status`, 'PUT')

  const verificationCase = caseResponse?.data || caseResponse

  const [status, setStatus] = useState<CaseStatus>(verificationCase?.status || 'Pending Review')
  const [assignee, setAssignee] = useState<string | null>(verificationCase?.assignee || 'Compliance Team')
  const [adminNote, setAdminNote] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>(verificationCase?.checklist || [
    { id: 'doc-id', label: 'National ID / Passport validation', verified: true },
    { id: 'doc-face', label: 'Face match and selfie confidence', verified: false },
    { id: 'doc-license', label: 'Business or coaching license authenticity', verified: true },
    { id: 'doc-bank', label: 'Bank account ownership proof', verified: false },
  ])
  const [timeline, setTimeline] = useState<TimelineItem[]>(verificationCase?.timeline || [
    { id: 'seed-1', message: 'Case created and queued for review.', at: '2026-04-16 09:14' },
    { id: 'seed-2', message: 'Automated risk scoring completed.', at: '2026-04-16 09:15' },
  ])

  useEffect(() => {
    if (verificationCase?.status) {
      setStatus(verificationCase.status as CaseStatus)
    }
  }, [verificationCase])

  const addTimeline = (message: string) => {
    setTimeline((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
        at: nowStamp(),
      },
      ...prev,
    ])
  }

  const updateStatus = async (nextStatus: CaseStatus) => {
    try {
      await updateStatusMutation.mutate({ status: nextStatus })
      setStatus(nextStatus)
      addTimeline(`Status changed to ${nextStatus}.`)
    } catch (err) {
      addTimeline(`Could not persist decision.`)
    }
  }

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return { ...item, verified: !item.verified }
      }),
    )
    addTimeline(`Checklist item updated: ${id}.`)
  }

  const markAllVerified = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, verified: true })))
    addTimeline('All checklist items marked as verified.')
  }

  const assignToCurrentAdmin = () => {
    setAssignee('Current Admin')
    addTimeline('Case assigned to Current Admin.')
  }

  const submitNote = () => {
    if (!adminNote.trim()) return
    addTimeline(`Admin note added: ${adminNote.trim()}`)
    setAdminNote('')
  }

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  if (loading) {
    return <SkeletonStat />
  }

  if (!verificationCase) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Verification Case Not Found"
          subtitle="This case id does not exist in the current verification queue mock data."
        />
        <Link
          href="/admin/verification"
          className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to queue
        </Link>
      </div>
    )
  }

  const verifiedCount = checklist.filter((item) => item.verified).length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Case ${verificationCase.id}`}
        subtitle={`Detailed review page for ${verificationCase.entity}. Validate documents and finalize a decision.`}
        actions={
          <>
            <Link
              href="/admin/verification"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to queue
            </Link>
            <button
              type="button"
              onClick={assignToCurrentAdmin}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <UserPlus2 className="w-4 h-4" />
              Assign to me
            </button>
          </>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <AdminPanel eyebrow="Entity summary" title={verificationCase.entity}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Document type</p>
              <p className="mt-1 text-sm font-semibold text-primary">{verificationCase.type}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Submitted</p>
              <p className="mt-1 text-sm font-semibold text-primary">{verificationCase.submittedAt}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Region</p>
              <p className="mt-1 text-sm font-semibold text-primary">{verificationCase.region}</p>
            </article>
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Current assignee</p>
              <p className="mt-1 text-sm font-semibold text-primary">{assignee ?? 'Unassigned'}</p>
            </article>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <AdminStatusPill label={verificationCase.riskLevel} tone={riskTone(verificationCase.riskLevel)} />
            <AdminStatusPill label={status} tone={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'amber'} />
            <span className="text-xs text-primary/60">{verifiedCount} / {checklist.length} checks verified</span>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Decision controls" title="Case actions">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateStatus('Approved')}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-emerald-700"
            >
              <Check className="w-3.5 h-3.5" />
              Approve case
            </button>
            <button
              type="button"
              onClick={() => updateStatus('Rejected')}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-red-700"
            >
              <X className="w-3.5 h-3.5" />
              Reject case
            </button>
            <button
              type="button"
              onClick={() => updateStatus('Needs Info')}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-amber-800"
            >
              <FileWarning className="w-3.5 h-3.5" />
              Request info
            </button>
            <button
              type="button"
              onClick={markAllVerified}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary"
            >
              Mark all verified
            </button>
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Checklist" title="Document validation">
          <div className="space-y-2.5">
            {checklist.map((item) => (
              <article key={item.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">{item.label}</p>
                  <p className="text-xs text-primary/55 mt-1">Control id: {item.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleChecklist(item.id)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] ${
                    item.verified
                      ? 'bg-emerald-500/20 text-emerald-700'
                      : 'bg-amber-500/20 text-amber-800'
                  }`}
                >
                  {item.verified ? 'Verified' : 'Pending'}
                </button>
              </article>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Review notes" title="Decision notes">
          <div className="space-y-3">
            <textarea
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              placeholder="Write a review note or rejection reason"
              className="w-full min-h-[110px] rounded-[var(--radius-default)] bg-surface-container-low p-3 text-sm text-primary outline-none resize-y"
            />
            <button
              type="button"
              onClick={submitNote}
              className="rounded-full bg-primary-container px-4 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-surface-container-lowest"
            >
              Add note
            </button>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Timeline" title="Case activity">
        <div className="space-y-2.5">
          {timeline.map((item) => (
            <article key={item.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-semibold text-primary">{item.message}</p>
              <p className="text-xs text-primary/55 mt-1">{item.at}</p>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  )
}
