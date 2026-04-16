"use client"

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { api, APIError } from '@/lib/api/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      if (!token) {
        setError('This verification link is missing its token.')
        setLoading(false)
        return
      }

      try {
        await api.post('/auth/verify-email', { token })
        if (!cancelled) {
          setSuccess(true)
        }
      } catch (err) {
        if (!cancelled) {
          const apiError = err as APIError
          setError(apiError.message || 'Email verification failed.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
      <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary">Verify Email</h1>
      <p className="mt-2 text-sm md:text-base text-primary/60">
        We are confirming your email address before you continue.
      </p>

      {loading ? (
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-primary/70">
          <LoadingSpinner size="sm" />
          Verifying your email...
        </div>
      ) : success ? (
        <div className="mt-6 rounded-[var(--radius-default)] border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p>Your email has been verified successfully.</p>
            <Link href="/auth/sign-in" className="mt-2 inline-flex font-bold text-emerald-900 underline underline-offset-2">
              Continue to sign in
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
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
                Verifying your email...
              </div>
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </section>
    </main>
  )
}
