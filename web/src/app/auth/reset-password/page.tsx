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
    <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] border border-primary/5 backdrop-blur-sm animate-soft-rise">
      <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Reset Password</h1>
      <p className="mt-3 text-sm md:text-base font-sans font-medium text-primary/70">
        Choose a new password for your SportBook account.
      </p>

      {success ? (
        <div className="mt-8 rounded-[1.5rem] border-2 border-emerald-500/20 bg-emerald-500/10 p-5 text-sm font-medium text-emerald-800 flex flex-col gap-4 shadow-sm animate-soft-rise">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
            <p className="pt-0.5 leading-relaxed">Your password has been updated successfully.</p>
          </div>
          <Link 
            href="/auth/sign-in" 
            className="flex items-center justify-center h-12 w-full bg-emerald-600 rounded-full text-white font-sans font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Continue to Sign In
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-5 animate-soft-rise" onSubmit={handleSubmit}>
          <label className="block space-y-2 group">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2 group-focus-within:text-primary transition-colors duration-200">New Password</span>
            <div className="relative">
              <LockKeyhole className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
              <input
                type="password"
                name="password"
                minLength={8}
                required
                className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
              />
            </div>
          </label>

          <label className="block space-y-2 group">
            <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2 group-focus-within:text-primary transition-colors duration-200">Confirm Password</span>
            <div className="relative">
              <LockKeyhole className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
              <input
                type="password"
                name="confirmPassword"
                minLength={8}
                required
                className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
              />
            </div>
          </label>

          {error ? (
            <div className="bg-red-50 text-red-600 text-sm font-medium px-5 py-3 rounded-[1rem] animate-[shake_0.5s_ease-in-out]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full h-14 rounded-full bg-primary text-tertiary-fixed font-sans font-bold uppercase tracking-[0.1em] text-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(0,17,58,0.2)]"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Updating...
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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px]" />
        <div className="absolute bottom-0 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-tertiary-container/8 blur-[140px] animate-[float-blob_12s_ease-in-out_infinite_4s]" />
      </div>

      <header className="absolute top-0 left-0 w-full z-40 px-5 pt-8 md:px-10 lg:px-14 md:pt-12 flex items-center">
        <Link
          href="/auth/sign-in"
          className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-surface-container-low hover:scale-95 transition-all duration-200"
          aria-label="Go back to Sign In"
        >
          <ArrowLeft className="w-6 h-6 text-primary stroke-[2.5]" />
        </Link>
      </header>

      <section className="px-5 pt-32 pb-12 md:px-10 lg:px-14 md:pt-40 z-10 relative flex justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] border border-primary/5">
              <div className="inline-flex items-center gap-3 font-sans font-medium text-sm text-primary/70">
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
