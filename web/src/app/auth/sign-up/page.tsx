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

      <header className="absolute top-0 left-0 w-full z-40 px-5 pt-8 md:px-10 lg:px-14 md:pt-12 flex items-center">
        <Link
          href="/"
          className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-surface-container-low hover:scale-95 transition-all duration-200"
          aria-label="Go back to Home"
        >
          <ArrowLeft className="w-6 h-6 text-primary stroke-[2.5]" />
        </Link>
      </header>

      <section className="px-5 pt-32 pb-12 md:px-10 lg:px-14 md:pt-40 z-10 relative flex justify-center">
        <div style={{ animationDelay: '100ms' }} className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] border border-primary/5 animate-soft-rise">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Create Account</h1>
          <p className="mt-3 text-sm md:text-base font-sans font-medium text-primary/70">Sign up to unlock fast booking and wallet checkout.</p>

          <form className="space-y-5 mt-8" onSubmit={handleSignUp}>
            <label style={{ animationDelay: '150ms' }} className="block space-y-2 animate-soft-rise">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2">Full Name</span>
              <div className="relative">
                <UserRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="name"
                  type="text"
                  placeholder="Alex Rivera"
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
                />
              </div>
            </label>

            <label style={{ animationDelay: '200ms' }} className="block space-y-2 animate-soft-rise">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2">Email</span>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
                />
              </div>
            </label>

            <label style={{ animationDelay: '250ms' }} className="block space-y-2 animate-soft-rise">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2">Password</span>
              <div className="relative">
                <LockKeyhole className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  required
                  className="w-full h-14 pl-12 pr-12 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/45 hover:text-primary transition-colors"
                >
                  <span className="transition-transform duration-200 inline-flex">
                    {showPassword ? <EyeOff className="w-5 h-5 animate-scale-in" /> : <Eye className="w-5 h-5 animate-scale-in" />}
                  </span>
                </button>
              </div>
            </label>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium px-5 py-3 rounded-[1rem] animate-shake">
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
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-primary/30">
            <div className="h-[2px] bg-primary/5 flex-1 rounded-full" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.16em]">Or Continue With</span>
            <div className="h-[2px] bg-primary/5 flex-1 rounded-full" />
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-14 rounded-[1.5rem] bg-surface-container-low text-primary font-sans font-bold text-sm flex items-center justify-center gap-3 hover:bg-surface-container-high transition-all duration-200 border-2 border-transparent hover:border-primary/5"
            >
              <span className="w-6 h-6 rounded-full bg-white text-primary-container text-sm font-black inline-flex items-center justify-center shadow-sm">
                G
              </span>
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-14 rounded-[1.5rem] bg-surface-container-low text-primary font-sans font-bold text-sm flex items-center justify-center gap-3 hover:bg-surface-container-high transition-all duration-200 border-2 border-transparent hover:border-primary/5"
            >
              <span className="w-6 h-6 rounded-[0.75rem] inset-0 bg-[#1877F2] text-white text-sm font-black flex items-center justify-center shadow-sm">
                f
              </span>
              Sign up with Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-sm font-sans font-medium text-primary/60">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="font-bold text-primary hover:text-primary/70 transition-colors underline underline-offset-4">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs font-sans font-medium text-primary/60">
            <Link href="/auth/send-request" className="font-bold text-primary/70 hover:text-primary transition-colors underline underline-offset-4">
              Want to be a coach or a facility?
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
