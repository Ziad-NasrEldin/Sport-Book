"use client"

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Send, Dumbbell, Building2 } from 'lucide-react'
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

function AnimatedCheckmark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        className="animate-[check-circle_0.35s_cubic-bezier(0.22,1,0.36,1)_forwards]"
        style={{ strokeDasharray: 63, strokeDashoffset: 63 }}
      />
      <path
        d="M8 12.5L11 15.5L16.5 9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-[check-draw_0.4s_ease-out_0.2s_forwards]"
        style={{ strokeDasharray: 16, strokeDashoffset: 16 }}
      />
    </svg>
  )
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
  const [mounted, setMounted] = useState(false)
  const hasPendingRequest = submittedRequests.some((request) => request.status === 'pending')

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const baseEntrance = mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
  const entranceTransition = 'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'

  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <style>{`
        @keyframes check-circle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes check-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes slide-in-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -25px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes float-blob-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.03); }
          66% { transform: translate(15px, -30px) scale(0.97); }
        }
        @keyframes field-group-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badge-pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px] animate-[float-blob_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px] animate-[float-blob-slow_10s_ease-in-out_infinite]" />
      </div>

      <section className="px-5 py-8 md:px-10 lg:px-14">
        <Link
          href="/auth/sign-in"
          className={`inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-all duration-200 group ${entranceTransition}`}
          style={{ transitionDelay: mounted ? '0ms' : '0ms' }}
        >
          <span className={baseEntrance} style={{ transitionDelay: '0ms' }}>
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </span>
          <span className={`${baseEntrance} ${entranceTransition}`} style={{ transitionDelay: '0ms' }}>
            Back to Sign In
          </span>
        </Link>
      </section>

      <section className="px-5 pb-12 md:px-10 lg:px-14">
        <div
          className={`w-full max-w-2xl mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5 ${entranceTransition}`}
          style={{ transitionDelay: '80ms' }}
        >
          <div className={`mt-1 ${entranceTransition}`} style={{ transitionDelay: '200ms' }}>
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight text-primary ${baseEntrance} ${entranceTransition}`} style={{ transitionDelay: '200ms' }}>
              Send a Request
            </h1>
            <p className={`mt-2 text-sm md:text-base text-primary/60 ${baseEntrance} ${entranceTransition}`} style={{ transitionDelay: '200ms' }}>
              Request access as a coach or facility partner. Our team will review your submission.
            </p>
          </div>

          {!sessionLoading && !user ? (
            <div className="mt-5 rounded-[var(--radius-default)] border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-900 animate-[slide-in-down_0.3s_cubic-bezier(0.22,1,0.36,1)]">
              Sign in to submit and track a role-upgrade request.
            </div>
          ) : null}

          {hasPendingRequest ? (
            <div className="mt-5 rounded-[var(--radius-default)] border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-900 animate-[slide-in-down_0.3s_cubic-bezier(0.22,1,0.36,1)]">
              You already have a pending role upgrade request. Our team will review it before you can submit another.
            </div>
          ) : null}

          {isSubmitted ? (
            <div className="mt-5 rounded-[var(--radius-default)] border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-800 flex items-start gap-3">
              <AnimatedCheckmark />
              <div>
                <p className="font-bold">Request submitted successfully</p>
                <p className="mt-0.5 text-emerald-700/80">We'll review your details and get back to you shortly.</p>
              </div>
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
                  <article key={request.id} className="rounded-[var(--radius-default)] bg-surface-container-lowest px-3 py-2.5 flex items-center justify-between gap-3 hover:shadow-ambient hover:-translate-y-px transition-all duration-200">
                    <div>
                      <p className="text-sm font-bold text-primary">
                        {request.requestedRole === 'coach' ? 'Coach' : 'Facility'} request
                      </p>
                      <p className="text-xs text-primary/60 mt-1">
                        Submitted {new Date(request.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-lexend font-bold uppercase tracking-[0.14em] animate-badge-pop ${getStatusClasses(request.status)}`}>
                      {formatStatusLabel(request.status)}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            <div className={`${entranceTransition}`} style={{ transitionDelay: '300ms' }}>
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 block mb-1.5">
                I Want To Apply As
              </span>
              <div className="relative flex bg-surface-container-low p-1 border border-primary/5 rounded-[var(--radius-default)]">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-8px)] rounded-[var(--radius-default)] bg-secondary-container/15 border border-secondary-container/20 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ left: requestedRole === 'coach' ? '4px' : 'calc(50% - 8px)' }}
                />
                <button
                  type="button"
                  onClick={() => setRequestedRole('coach')}
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--radius-default)] transition-all duration-200 font-bold text-sm ${requestedRole === 'coach' ? 'text-secondary-container' : 'text-primary/50 hover:text-primary/70'}`}
                >
                  <Dumbbell className={`w-4 h-4 transition-transform duration-300 ${requestedRole === 'coach' ? 'scale-100' : 'scale-85'}`} style={{ transform: requestedRole === 'coach' ? 'scale(1)' : 'scale(0.85)' }} />
                  Coach
                </button>
                <button
                  type="button"
                  onClick={() => setRequestedRole('facility')}
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--radius-default)] transition-all duration-200 font-bold text-sm ${requestedRole === 'facility' ? 'text-secondary-container' : 'text-primary/50 hover:text-primary/70'}`}
                >
                  <Building2 className={`w-4 h-4 transition-transform duration-300`} style={{ transform: requestedRole === 'facility' ? 'scale(1)' : 'scale(0.85)' }} />
                  Facility
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${baseEntrance} ${entranceTransition}`} style={{ transitionDelay: '350ms' }}>
              <label className="block space-y-1.5 group">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Full Name</span>
                <input
                  type="text"
                  required
                  value={formState.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  placeholder="Your full name"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                />
              </label>

              <label className="block space-y-1.5 group">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Email</span>
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="name@example.com"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                />
              </label>

              <label className="block space-y-1.5 group">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Phone Number</span>
                <input
                  type="tel"
                  required
                  value={formState.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  placeholder="+20 10 0000 0000"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                />
              </label>

              <label className="block space-y-1.5 group">
                <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">City</span>
                <input
                  type="text"
                  required
                  value={formState.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Cairo"
                  disabled={!user || sessionLoading || submitting || hasPendingRequest}
                  className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                />
              </label>
            </div>

            {requestedRole === 'coach' ? (
              <div key="coach" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[field-group-in_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
                <label className="block space-y-1.5 group">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Sport Specialization</span>
                  <input
                    type="text"
                    required
                    value={formState.specialization}
                    onChange={(event) => updateField('specialization', event.target.value)}
                    placeholder="Padel, Tennis, Squash"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5 group">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Years of Experience</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formState.experienceYears}
                    onChange={(event) => updateField('experienceYears', event.target.value)}
                    placeholder="4"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5 md:col-span-2 group">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Certifications (Optional)</span>
                  <input
                    type="text"
                    value={formState.certifications}
                    onChange={(event) => updateField('certifications', event.target.value)}
                    placeholder="PTR, ITF level, national federation certificate"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                  />
                </label>
              </div>
            ) : (
              <div key="facility" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[field-group-in_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
                <label className="block space-y-1.5 group">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Facility Name</span>
                  <input
                    type="text"
                    required
                    value={formState.facilityName}
                    onChange={(event) => updateField('facilityName', event.target.value)}
                    placeholder="Your venue or business name"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5 group">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Registration Number</span>
                  <input
                    type="text"
                    required
                    value={formState.registrationNumber}
                    onChange={(event) => updateField('registrationNumber', event.target.value)}
                    placeholder="Business registration ID"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5 md:col-span-2 group">
                  <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Facility Address</span>
                  <input
                    type="text"
                    required
                    value={formState.facilityAddress}
                    onChange={(event) => updateField('facilityAddress', event.target.value)}
                    placeholder="Street, district, city"
                    disabled={!user || sessionLoading || submitting || hasPendingRequest}
                    className="w-full h-12 px-3 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest focus:border-primary-container transition-all duration-200 disabled:opacity-60"
                  />
                </label>
              </div>
            )}

            <label className={`block space-y-1.5 group ${baseEntrance} ${entranceTransition}`} style={{ transitionDelay: '400ms' }}>
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Request Message</span>
              <textarea
                required
                value={formState.requestMessage}
                onChange={(event) => updateField('requestMessage', event.target.value)}
                rows={4}
                placeholder="Share your background and why you want to join SportBook."
                disabled={!user || sessionLoading || submitting || hasPendingRequest}
                className="w-full px-3 py-2 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest transition-all duration-200 resize-y disabled:opacity-60"
              />
            </label>

            {error ? (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg animate-[shake_0.5s_ease-in-out,slide-in-down_0.3s_cubic-bezier(0.22,1,0.36,1)]">
                {error}
              </div>
            ) : null}

            <div className={`${baseEntrance} ${entranceTransition}`} style={{ transitionDelay: '460ms' }}>
              <button
                type="submit"
                disabled={!user || sessionLoading || submitting || hasPendingRequest}
                className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 hover:shadow-[0_4px_14px_-4px_oklch(var(--color-secondary-container)/0.45)] active:scale-[0.97] active:shadow-none transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </form>

          <p className={`mt-5 text-center text-sm text-primary/65 ${baseEntrance} ${entranceTransition}`} style={{ transitionDelay: '580ms' }}>
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