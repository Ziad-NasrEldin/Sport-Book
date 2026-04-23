"use client"

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserRound, Mail, LockKeyhole, Eye, EyeOff } from 'lucide-react'
import { api, setAccessToken } from '@/lib/api/client'
import { APIError } from '@/lib/api/client'
import { getPostLoginRoute } from '@/lib/auth/session'
import { consumeRedirectUrl } from '@/lib/auth/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { showToast } from '@/lib/toast'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

try {
      const response = await api.post('/auth/register', { name, email, password })
      const responseData = response?.data || response
      const accessToken = responseData?.accessToken
      const user = responseData?.user

setAccessToken(accessToken)
      const redirectUrl = consumeRedirectUrl()
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push(getPostLoginRoute(user?.role || 'player'))
      }
    } catch (err) {
      const apiError = err as APIError
      setError(apiError.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px]" />
        <div className="absolute bottom-0 -left-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
      </div>

      <section className="px-5 py-8 md:px-10 lg:px-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </section>

<section className="px-5 pb-12 md:px-10 lg:px-14">
        <div style={{ animationDelay: '100ms' }} className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5 animate-soft-rise">
          <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary">Create Account</h1>
          <p className="mt-2 text-sm md:text-base text-primary/60">Sign up to unlock fast booking and wallet checkout.</p>

          <form className="space-y-4 mt-6" onSubmit={handleSignUp}>
            <label style={{ animationDelay: '150ms' }} className="block space-y-1.5 animate-soft-rise">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Full Name</span>
              <div className="relative">
                <UserRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="name"
                  type="text"
                  placeholder="Alex Rivera"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none transition-[border-color,transform,box-shadow] duration-200 focus:border-primary-container focus:-translate-y-0.5 focus:shadow-[0_12px_24px_-12px_rgba(0,17,58,0.35)]"
                />
              </div>
            </label>

            <label style={{ animationDelay: '200ms' }} className="block space-y-1.5 animate-soft-rise">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Email</span>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none transition-[border-color,transform,box-shadow] duration-200 focus:border-primary-container focus:-translate-y-0.5 focus:shadow-[0_12px_24px_-12px_rgba(0,17,58,0.35)]"
                />
              </div>
            </label>

            <label style={{ animationDelay: '250ms' }} className="block space-y-1.5 animate-soft-rise">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Password</span>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  required
                  className="w-full h-12 pl-10 pr-10 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none transition-[border-color,transform,box-shadow] duration-200 focus:border-primary-container focus:-translate-y-0.5 focus:shadow-[0_12px_24px_-12px_rgba(0,17,58,0.35)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/45 hover:text-primary transition-colors"
                >
                  <span className="transition-transform duration-200 inline-flex">
                    {showPassword ? <EyeOff className="w-4 h-4 animate-scale-in" /> : <Eye className="w-4 h-4 animate-scale-in" />}
                  </span>
                </button>
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Email</span>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Password</span>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  required
                  className="w-full h-12 pl-10 pr-10 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center -mr-1 text-primary/45 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide transition-all duration-200 hover:shadow-[0_8px_20px_-6px_rgba(253,139,0,0.5)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-primary/35">
            <div className="h-px bg-primary/10 flex-1" />
            <span className="text-[10px] font-lexend uppercase tracking-[0.16em]">Or Continue With</span>
            <div className="h-px bg-primary/10 flex-1" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="w-6 h-6 rounded-full bg-white text-primary-container text-sm font-black inline-flex items-center justify-center">
                G
              </span>
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white text-sm font-black inline-flex items-center justify-center">
                f
              </span>
              Sign up with Facebook
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-primary/65">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="font-bold text-secondary-container hover:text-secondary transition-colors">
              Sign in
            </Link>
          </p>

          <p className="mt-3 text-center text-xs text-primary/65">
            <Link href="/auth/send-request" className="font-bold text-primary/80 hover:text-primary transition-colors underline underline-offset-2">
              Do you want to be a coach or a facility?
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
