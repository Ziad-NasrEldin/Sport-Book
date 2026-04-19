"use client"

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { api, APIError } from '@/lib/api/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useSession } from '@/lib/auth/session'

type RequestedRole = 'coach' | 'facility'
type RoleUpgradeRequestStatus = 'pending' | 'approved' | 'rejected' | 'needs-info'

type RoleUpgradeRequest = {
  id: string
  requestedRole: RequestedRole
  fullName: string
  email: string
  phone: string
  city: string
  specialization?: string
  experienceYears?: number
  certifications?: string
  facilityName?: string
  registrationNumber?: string
  facilityAddress?: string
  requestMessage: string
  status: RoleUpgradeRequestStatus
  submittedAt: string
  reviewedAt?: string
}

type RequestFormState = {
  fullName: string
  email: string
  phone: string
  city: string
  specialization: string
  experienceYears: string
  certifications: string
  facilityName: string
  registrationNumber: string
  facilityAddress: string
  requestMessage: string
}

const initialFormState: RequestFormState = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  specialization: '',
  experienceYears: '',
  certifications: '',
  facilityName: '',
  registrationNumber: '',
  facilityAddress: '',
  requestMessage: '',
}

function formatStatusLabel(status: RoleUpgradeRequestStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'needs-info') return 'Needs Info'
  return 'Pending Review'
}

function getStatusClasses(status: RoleUpgradeRequestStatus) {
  if (status === 'approved') return 'bg-emerald-500/20 text-emerald-700'
  if (status === 'rejected') return 'bg-red-500/15 text-red-700'
  if (status === 'needs-info') return 'bg-amber-500/20 text-amber-800'
  return 'bg-primary/10 text-primary'
}

export default function SendRequestPage() {
  const { user, loading: sessionLoading } = useSession()
  const [requestedRole, setRequestedRole] = useState<RequestedRole>('coach')
  const [formState, setFormState] = useState<RequestFormState>(initialFormState)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedRequests, setSubmittedRequests] = useState<RoleUpgradeRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasPendingRequest = submittedRequests.some((request) => request.status === 'pending')

  useEffect(() => {
    if (sessionLoading) return

    if (!user) {
      setLoadingRequests(false)
      return
    }

    let cancelled = false

    async function loadRequests() {
      try {
        const requests = await api.get<RoleUpgradeRequest[]>('/auth/send-request')
        if (!cancelled) {
          setSubmittedRequests(requests)
        }
      } catch (err) {
        if (!cancelled) {
          const apiError = err as APIError
          setError(apiError.message || 'Failed to load your submitted requests.')
        }
      } finally {
        if (!cancelled) {
          setLoadingRequests(false)
        }
      }
    }

    void loadRequests()

    return () => {
      cancelled = true
    }
  }, [sessionLoading, user])

  useEffect(() => {
    if (!user) return

    setFormState((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name,
      email: prev.email || user.email,
    }))
  }, [user])

  const updateField = (field: keyof RequestFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user) {
      setError('You need to sign in before submitting a role upgrade request.')
      return
    }

    if (hasPendingRequest) {
      setError('You already have a pending role upgrade request.')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload =
      requestedRole === 'coach'
        ? {
            requestedRole: 'COACH',
            fullName: formState.fullName.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
            city: formState.city.trim(),
            specialization: formState.specialization.trim(),
            experienceYears: formState.experienceYears ? Number(formState.experienceYears) : undefined,
            certifications: formState.certifications.trim() || undefined,
            requestMessage: formState.requestMessage.trim(),
            bio: formState.requestMessage.trim(),
          }
        : {
            requestedRole: 'FACILITY',
            fullName: formState.fullName.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
            city: formState.city.trim(),
            facilityName: formState.facilityName.trim(),
            registrationNumber: formState.registrationNumber.trim(),
            facilityAddress: formState.facilityAddress.trim(),
            requestMessage: formState.requestMessage.trim(),
            businessName: formState.facilityName.trim(),
            businessAddress: formState.facilityAddress.trim(),
            licenseNumber: formState.registrationNumber.trim(),
          }

    try {
      await api.post('/auth/send-request', payload)
      const requests = await api.get<RoleUpgradeRequest[]>('/auth/send-request')
      setSubmittedRequests(requests)
      setIsSubmitted(true)
      setFormState((prev) => ({
        ...initialFormState,
        fullName: prev.fullName,
        email: prev.email,
      }))
    } catch (err) {
      const apiError = err as APIError
      setError(apiError.message || 'Failed to submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px]" />
        <div className="absolute bottom-0 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
      </div>

      <section className="px-5 py-8 md:px-10 lg:px-14">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </section>

      <section className="px-5 pb-12 md:px-10 lg:px-14">
        <div className="w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
          <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary">Send a Request</h1>
          <p className="mt-2 text-sm md:text-base text-primary/60">
            Request access as a coach or facility partner. Our team will review your submission.
          </p>

          {!sessionLoading && !user ? (
            <div className="mt-5 rounded-[var(--radius-default)] border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-900">
              Sign in to submit and track a role-upgrade request.
            </div>
          ) : null}

          {hasPendingRequest ? (
            <div className="mt-5 rounded-[var(--radius-default)] border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-900">
              You already have a pending role upgrade request. Our team will review it before you can submit another.
            </div>
          ) : null}

          {isSubmitted ? (
            <div className="mt-5 rounded-[var(--radius-default)] border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Request submitted successfully. We will review your details and contact you soon.</p>
            </div>
          ) : null}

          {loadingRequests ? (
            <div className="mt-5 inline-flex items-center gap-2 text-sm text-primary/60">
              <LoadingSpinner size="sm" />
              Loading your submitted requests...
            </div>
          ) : submittedRequests.length > 0 ? (
            <div className="mt-5 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low p-4">
              <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">
                Your Submitted Requests
              </p>
              <div className="mt-3 space-y-2.5">
                {submittedRequests.slice(0, 3).map((request) => (
                  <article key={request.id} className="rounded-[var(--radius-default)] bg-surface-container-lowest px-3 py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {request.requestedRole === 'coach' ? 'Coach' : 'Facility'} request
                      </p>
                      <p className="text-xs text-primary/60 mt-1">
                        Submitted {new Date(request.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.14em] ${getStatusClasses(request.status)}`}>
                      {formatStatusLabel(request.status)}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">
                I Want To Apply As
              </span>
              <select
                value={requestedRole}
                onChange={(event) => setRequestedRole(event.target.value as RequestedRole)}
                className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                disabled={!user || sessionLoading || submitting || hasPendingRequest}
              >
                <option value="coach">Coach</option>
                <option value="facility">Facility</option>
              </select>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Full Name</span>
                <input
                  type="text"
                  required
                  value={formState.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  placeholder="Your full name"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Email</span>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="name@example.com"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Phone Number</span>
                <input
                  type="tel"
                  required
                  value={formState.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="+20 10 0000 0000"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">City</span>
                <input
                  type="text"
                  required
                  value={formState.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Cairo"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                />
              </label>
            </div>

            {requestedRole === 'coach' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Sport Specialization</span>
                  <input
                    type="text"
                    required
                    value={formState.specialization}
                    onChange={(event) => updateField('specialization', event.target.value)}
                    placeholder="Padel, Tennis, Squash"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Years of Experience</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formState.experienceYears}
                    onChange={(event) => updateField('experienceYears', event.target.value)}
                    placeholder="4"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Certifications (Optional)</span>
                  <input
                    type="text"
                    value={formState.certifications}
                    onChange={(event) => updateField('certifications', event.target.value)}
                    placeholder="PTR, ITF level, national federation certificate"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility Name</span>
                  <input
                    type="text"
                    required
                    value={formState.facilityName}
                    onChange={(event) => updateField('facilityName', event.target.value)}
                    placeholder="Your venue or business name"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Registration Number</span>
                  <input
                    type="text"
                    required
                    value={formState.registrationNumber}
                    onChange={(event) => updateField('registrationNumber', event.target.value)}
                    placeholder="Business registration ID"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5 md:col-span-2">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Facility Address</span>
                  <input
                    type="text"
                    required
                    value={formState.facilityAddress}
                    onChange={(event) => updateField('facilityAddress', event.target.value)}
                    placeholder="Street, district, city"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container disabled:opacity-60"
                  />
                </label>
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Request Message</span>
              <textarea
                required
                value={formState.requestMessage}
                onChange={(event) => updateField('requestMessage', event.target.value)}
                rows={4}
                placeholder="Share your background and why you want to join SportBook."
                disabled={!user || sessionLoading || submitting || hasPendingRequest}
                className="w-full px-3 py-2 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container resize-y disabled:opacity-60"
              />
            </label>

            {error ? (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!user || sessionLoading || submitting || hasPendingRequest}
              className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-primary/65">
            Looking for a player account?{' '}
            <Link href="/auth/sign-up" className="font-bold text-secondary-container hover:text-secondary transition-colors">
              Create a regular account
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
