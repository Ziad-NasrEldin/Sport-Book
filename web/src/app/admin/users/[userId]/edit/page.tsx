'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, RefreshCcw, Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'

const roleOptions = ['PLAYER', 'COACH', 'OPERATOR', 'ADMIN'] as const
const statusOptions = ['ACTIVE', 'PENDING', 'SUSPENDED', 'ARCHIVED'] as const

type ToastState = {
  tone: 'success' | 'error' | 'info'
  message: string
}

type ChangeLogItem = {
  id: string
  at: string
  actor: string
  summary: string
}

function nowStamp() {
  if (typeof window === 'undefined') return '2026-04-16 09:14'
  return new Date().toLocaleString('en-GB', { hour12: false })
}

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value)
}

export default function AdminUserEditPage() {
  const params = useParams<{ userId: string }>()
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId

  const { data: userResponse, loading, error } = useApiCall(`/admin-workspace/users/${userId}`)
  const saveMutation = useApiMutation(`/admin-workspace/users/${userId}`, 'PUT')

  const historyIdCounter = useRef(0)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<typeof roleOptions[number]>('PLAYER')
  const [status, setStatus] = useState<typeof statusOptions[number]>('PENDING')
  const [country, setCountry] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [changeHistory, setChangeHistory] = useState<ChangeLogItem[]>([
    {
      id: 'seed-opened-editor',
      at: nowStamp(),
      actor: 'Admin Console',
      summary: 'Opened account editor.',
    },
  ])

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 2800)

    return () => window.clearTimeout(timer)
  }, [toast])

  const user = userResponse?.data || userResponse

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email ?? '')
      setRole(user.role ?? 'PLAYER')
      setStatus(user.status ?? 'PENDING')
      setCountry(user.country ?? '')
    }
  }, [user])

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
          title="Account Not Found"
          subtitle="The user id you tried to edit does not exist in the current mock dataset."
          actions={
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to User Directory
            </Link>
          }
        />
      </div>
    )
  }

  const initialSnapshot = {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    country: user.country,
  }

  const changedFields: string[] = [
    name.trim() !== initialSnapshot.name ? 'name' : '',
    email.trim() !== initialSnapshot.email ? 'email' : '',
    role !== initialSnapshot.role ? 'role' : '',
    status !== initialSnapshot.status ? 'status' : '',
    country.trim() !== initialSnapshot.country ? 'region' : '',
  ].filter((entry): entry is string => entry.length > 0)

  const hasChanges = changedFields.length > 0
  const emailLooksValid = isValidEmail(email.trim())
  const canSave =
    !isSaving &&
    hasChanges &&
    name.trim().length >= 2 &&
    country.trim().length >= 2 &&
    emailLooksValid

  const addHistory = (summary: string) => {
    historyIdCounter.current += 1
    setChangeHistory((prev) => [
      {
        id: `history-${historyIdCounter.current}`,
        at: nowStamp(),
        actor: 'Current Admin',
        summary,
      },
      ...prev,
    ])
  }

  const handleReset = () => {
    setName(initialSnapshot.name)
    setEmail(initialSnapshot.email)
    setRole(initialSnapshot.role)
    setStatus(initialSnapshot.status)
    setCountry(initialSnapshot.country)
    setToast({ tone: 'info', message: 'Unsaved changes were reverted.' })
    addHistory('Reverted unsaved changes to last saved snapshot.')
  }

  const handleSave = async () => {
    if (isSaving) return

    if (name.trim().length < 2) {
      setToast({ tone: 'error', message: 'Name must be at least 2 characters.' })
      addHistory('Save blocked: name validation failed.')
      return
    }

    if (!emailLooksValid) {
      setToast({ tone: 'error', message: 'Please enter a valid email address.' })
      addHistory('Save blocked: email validation failed.')
      return
    }

    if (country.trim().length < 2) {
      setToast({ tone: 'error', message: 'Region must be at least 2 characters.' })
      addHistory('Save blocked: region validation failed.')
      return
    }

    if (!hasChanges) {
      setToast({ tone: 'info', message: 'No changes to save.' })
      return
    }

    setIsSaving(true)
    setToast({ tone: 'info', message: 'Saving account changes...' })

    try {
      await saveMutation.mutate({
        name: name.trim(),
        email: email.trim(),
        role,
        status,
        country: country.trim(),
      })
      setIsSaving(false)
      setToast({ tone: 'success', message: 'Account changes saved successfully.' })
      addHistory(`Saved changes: ${changedFields.join(', ')}.`)
    } catch (err) {
      setIsSaving(false)
      setToast({ tone: 'error', message: 'Failed to save account changes.' })
      addHistory('Save failed: API error.')
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Account"
        subtitle="Update account identity, role, and operational status. Changes here are mocked for workflow visualization."
        actions={
          <>
            <Link
              href={`/admin/users/${encodeURIComponent(user.id)}`}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              View Account
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      />

      {toast ? (
        <article
          className={`rounded-[var(--radius-default)] px-4 py-3 text-sm font-semibold inline-flex items-center gap-2 ${
            toast.tone === 'success'
              ? 'bg-emerald-500/15 text-emerald-700'
              : toast.tone === 'error'
                ? 'bg-red-500/15 text-red-700'
                : 'bg-primary/10 text-primary'
          }`}
        >
          {toast.tone === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </article>
      ) : null}

      <AdminPanel eyebrow="Account editor" title={user.id}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Full Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Email Address</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
            />
            {!emailLooksValid && email.length > 0 ? (
              <span className="text-xs text-red-700 font-semibold">Enter a valid email format.</span>
            ) : null}
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as typeof roleOptions[number])}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof statusOptions[number])}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1 md:col-span-2">
            <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Country / Region</span>
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-surface-container-lowest disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-xs font-lexend font-bold uppercase tracking-[0.12em] text-primary disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </AdminPanel>

      <AdminPanel eyebrow="Audit impact" title="Change Preview">
        <div className="rounded-[var(--radius-default)] bg-surface-container-low p-4">
          <p className="text-sm font-semibold text-primary">Pending update summary</p>
          <ul className="mt-2 space-y-1 text-xs text-primary/65">
            <li>Name: {name || 'N/A'}</li>
            <li>Email: {email || 'N/A'}</li>
            <li>Role: {role}</li>
            <li>Status: {status}</li>
            <li>Region: {country || 'N/A'}</li>
          </ul>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.12em] ${
                hasChanges ? 'bg-amber-500/20 text-amber-800' : 'bg-emerald-500/15 text-emerald-700'
              }`}
            >
              {hasChanges ? `${changedFields.length} field${changedFields.length === 1 ? '' : 's'} changed` : 'No unsaved changes'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.12em] bg-primary/10 text-primary">
              Validation {canSave ? 'passed' : 'pending'}
            </span>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel eyebrow="Audit trail" title="Save History Timeline">
        <div className="space-y-2.5">
          {changeHistory.map((item) => (
            <article key={item.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-semibold text-primary">{item.summary}</p>
              <p className="text-xs text-primary/55 mt-1">{item.actor} • {item.at}</p>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  )
}
