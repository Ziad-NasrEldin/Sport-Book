"use client"

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Mail, XCircle } from 'lucide-react'
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

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-8 md:p-10 shadow-ambient border border-primary/5 text-center mt-12 animate-soft-rise">
        <div className="mx-auto w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-primary/60 animate-[float-blob_6s_ease-in-out_infinite]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-primary leading-none">Check Your Inbox</h1>
        <p className="mt-3 text-sm md:text-base font-sans font-medium text-primary/70">
          We sent a verification link to your email address. Please click it to verify your account.
        </p>

        <div className="mt-8 pt-6 border-t-2 border-primary/5">
          <p className="text-sm font-sans font-medium text-primary/60">
            Didn't receive the email?{' '}
            <Link href="/auth/sign-in" className="font-bold text-primary hover:text-primary/70 transition-colors underline underline-offset-4">
              Return to sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] border border-primary/5 mt-12 animate-soft-rise">
      <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none text-center">Email Verification</h1>

      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <LoadingSpinner size="lg" />
            <p className="mt-6 text-sm font-sans font-medium text-primary/70">
              Verifying your email address...
            </p>
          </div>
        ) : success ? (
          <div className="rounded-[1.5rem] border-2 border-emerald-500/20 bg-emerald-500/10 p-5 text-sm font-medium flex flex-col items-center shadow-sm animate-soft-rise">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-3" />
            <p className="font-bold text-lg text-emerald-900">Email Verified!</p>
            <p className="mt-1 text-center text-emerald-800/80 leading-relaxed">
              Your account is now ready to use. You can sign in and start using SportBook.
            </p>
            <Link 
              href="/auth/sign-in" 
              className="mt-6 w-full flex items-center justify-center h-14 bg-emerald-600 rounded-[1.5rem] text-white font-sans font-bold uppercase tracking-[0.1em] text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
            >
              Continue to Sign In
            </Link>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border-2 border-red-500/20 bg-red-500/10 p-5 text-sm font-medium flex flex-col items-center shadow-sm animate-[shake_0.5s_ease-in-out]">
            <XCircle className="w-12 h-12 text-red-600 mb-3" />
            <p className="font-bold text-lg text-red-900">Verification Failed</p>
            <p className="mt-1 text-center text-red-800/80 leading-relaxed font-medium">
              {error}
            </p>
            <Link 
              href="/auth/sign-in" 
              className="mt-6 w-full flex items-center justify-center h-14 bg-primary rounded-[1.5rem] text-tertiary-fixed font-sans font-bold uppercase tracking-[0.1em] text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-[0_8px_20px_-8px_rgba(0,17,58,0.2)]"
            >
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden flex items-center justify-center">
      <style>{`
        @keyframes float-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -25px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
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

      <section className="w-full px-5 pt-20 pb-12 z-10 relative flex flex-col justify-center min-h-[calc(100vh-100px)]">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] border border-primary/5 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center py-6">
                <LoadingSpinner size="lg" />
                <p className="mt-6 text-sm font-sans font-medium text-primary/70">
                  Setting up verification...
                </p>
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
