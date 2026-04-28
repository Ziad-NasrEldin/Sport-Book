"use client"

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api/client'
import { APIError } from '@/lib/api/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const email = (new FormData(event.currentTarget)).get('email') as string

    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      const apiError = err as APIError
      setError(apiError.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px]" />
        <div className="absolute bottom-0 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
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
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] border border-primary/5 backdrop-blur-sm animate-soft-rise">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Forgot Password</h1>
          <p className="mt-3 text-sm md:text-base font-sans font-medium text-primary/70">
            Enter your account email and we will send a reset link.
          </p>

          {sent ? (
            <div className="mt-8 rounded-[1.5rem] border-2 border-emerald-500/20 bg-emerald-500/10 p-5 text-sm font-medium text-emerald-800 flex items-start gap-4 shadow-sm animate-soft-rise">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
              <p className="pt-0.5 leading-relaxed">Reset link sent. Check your inbox and follow the instructions to securely reset your password.</p>
            </div>
          ) : (
            <form className="mt-8 space-y-5 animate-soft-rise" onSubmit={handleSubmit}>
              <label className="block space-y-2 group">
                <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2 group-focus-within:text-primary transition-colors duration-200">Email</span>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="alex@example.com"
                    className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
                  />
                </div>
              </label>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-medium px-5 py-3 rounded-[1rem] animate-[shake_0.5s_ease-in-out]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full h-14 rounded-full bg-primary text-tertiary-fixed font-sans font-bold uppercase tracking-[0.1em] text-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(0,17,58,0.2)]"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm font-sans font-medium text-primary/60">
            Remembered your password?{' '}
            <Link href="/auth/sign-in" className="font-bold text-primary hover:text-primary/70 transition-colors underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
