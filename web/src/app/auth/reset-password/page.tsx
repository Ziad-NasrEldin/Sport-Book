"use client"

import { FormEvent, Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react'
import { api, APIError } from '@/lib/api/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!token) {
      setError('This reset link is missing its token.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      await api.post('/auth/reset-password', { token, password })
      setSuccess(true)
    } catch (err) {
      const apiError = err as APIError
      setError(apiError.message || 'Failed to reset your password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
      <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary">Reset Password</h1>
      <p className="mt-2 text-sm md:text-base text-primary/60">
        Choose a new password for your SportBook account.
      </p>

      {success ? (
        <div className="mt-6 rounded-[var(--radius-default)] border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p>Your password has been updated successfully.</p>
            <Link href="/auth/sign-in" className="mt-2 inline-flex font-bold text-emerald-900 underline underline-offset-2">
              Continue to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">New Password</span>
            <div className="relative">
              <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
              <input
                type="password"
                name="password"
                minLength={8}
                required
                className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Confirm Password</span>
            <div className="relative">
              <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
              <input
                type="password"
                name="confirmPassword"
                minLength={8}
                required
                className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
              />
            </div>
          </label>

          {error ? (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Updating password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <section className="px-5 py-8 md:px-10 lg:px-14">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </section>

      <section className="px-5 pb-12 md:px-10 lg:px-14">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
              <div className="inline-flex items-center gap-2 text-sm text-primary/70">
                <LoadingSpinner size="sm" />
                Loading reset form...
              </div>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </section>
    </main>
  )
}
