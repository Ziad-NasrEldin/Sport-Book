"use client"

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LockKeyhole, Mail, Eye, EyeOff, User, Dumbbell, Building2, Shield, Wrench } from 'lucide-react'
import { api, setAccessToken, APIError, NetworkError } from '@/lib/api/client'
import { getPostLoginRoute } from '@/lib/auth/session'
import { consumeRedirectUrl } from '@/lib/auth/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { showToast } from '@/lib/toast'
import { accountTypeOptions, getActiveAccountType, setActiveAccountType, type AccountType } from '@/lib/accountType'

const accountIcons: Record<AccountType, typeof User> = {
  player: User,
  coach: Dumbbell,
  facility: Building2,
  operator: Wrench,
  admin: Shield,
}

function getSignInErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'The API is not reachable on localhost:3001. Start the backend and try again.'
  }

  if (error instanceof APIError) {
    return error.message || 'Failed to sign in. Please check your credentials.'
  }

  return 'Failed to sign in. Please try again.'
}

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>('player')

  useEffect(() => {
    setMounted(true)
    setAccountType(getActiveAccountType())
  }, [])

  const activeIndex = accountTypeOptions.findIndex((o) => o.value === accountType)

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await api.post('/auth/login', { email, password })
      const data = response.data || response
      const accessToken = data.accessToken
      const user = data.user || data

      setAccessToken(accessToken)
      setActiveAccountType(accountType)
      const redirectUrl = consumeRedirectUrl()
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push(getPostLoginRoute(user.role))
      }
    } catch (err) {
      setError(getSignInErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <style>{`
        @keyframes float-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
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
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px] animate-[float-blob_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px] animate-[float-blob_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-tertiary-container/8 blur-[140px] animate-[float-blob_12s_ease-in-out_infinite_4s]" />
      </div>

      <header className={`absolute top-0 left-0 w-full z-40 px-5 pt-8 md:px-10 lg:px-14 md:pt-12 flex items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <Link
          href="/"
          className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-surface-container-low hover:scale-95 transition-all duration-200"
          aria-label="Go back to Home"
        >
          <ArrowLeft className="w-6 h-6 text-primary stroke-[2.5]" />
        </Link>
      </header>

      <section className={`px-5 pt-32 pb-12 md:px-10 lg:px-14 md:pt-40 z-10 relative flex justify-center transition-all duration-700 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] border border-primary/5 backdrop-blur-sm">

          <h1 className={`text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none transition-all duration-500 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            Welcome Back
          </h1>
          <p className={`mt-3 text-sm md:text-base font-sans font-medium text-primary/70 transition-all duration-500 delay-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            Sign in to continue booking courts and coaches.
          </p>

          <div className={`mt-8 transition-all duration-500 delay-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="relative flex bg-surface-container-low rounded-full p-1.5 gap-1 border-2 border-primary/5">
              <div
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  left: `calc((${activeIndex} * (100% - 1.25rem)) / ${accountTypeOptions.length} + 0.375rem)`,
                  width: `calc((100% - 1.25rem) / ${accountTypeOptions.length})`,
                }}
              />
              {accountTypeOptions.map((option) => {
                const Icon = accountIcons[option.value]
                const isActive = option.value === accountType
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAccountType(option.value)}
                    className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[var(--radius-full)] text-[10px] uppercase font-sans font-bold tracking-widest transition-all duration-200 ${isActive ? 'text-primary' : 'text-primary/40 hover:text-primary/60'}`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <form className={`space-y-5 mt-8 transition-all duration-500 delay-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} onSubmit={handleSignIn}>
            <label className="block space-y-2 group">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2 group-focus-within:text-primary transition-colors duration-200">Email</span>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type="email"
                  name="email"
                  placeholder="alex@example.com"
                  required
                  className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
                />
              </div>
            </label>

            <label className="block space-y-2 group">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.14em] text-primary/60 ml-2 group-focus-within:text-primary transition-colors duration-200">Password</span>
              <div className="relative">
                <LockKeyhole className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  required
                  className="w-full h-14 pl-12 pr-12 rounded-[1.5rem] border-2 border-primary/5 bg-surface-container-low text-primary outline-none focus:border-primary/20 focus:bg-white transition-all duration-200 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center -mr-1 text-primary/45 hover:text-primary transition-colors"
                >
                  <span className="relative w-5 h-5 flex items-center justify-center">
                    <Eye className={`w-5 h-5 absolute transition-all duration-200 ${showPassword ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
                    <EyeOff className={`w-5 h-5 absolute transition-all duration-200 ${showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`} />
                  </span>
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-sm px-1">
              <label className="inline-flex items-center gap-2 text-primary/70 cursor-pointer font-sans font-medium">
                <input type="checkbox" className="peer w-4 h-4 rounded border-primary/20 text-tertiary-fixed cursor-pointer" />
                <span className="peer-checked:text-primary transition-colors duration-200">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="font-sans font-bold text-primary hover:text-primary/70 hover:underline underline-offset-4 transition-all duration-200">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium px-5 py-3 rounded-[1rem] animate-[shake_0.5s_ease-in-out]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full h-14 rounded-full bg-primary text-tertiary-fixed font-sans font-bold uppercase tracking-[0.1em] text-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(0,17,58,0.2)]"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={`my-8 flex items-center gap-3 text-primary/30 transition-all duration-500 delay-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="h-[2px] bg-primary/5 flex-1 rounded-full" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.16em]">Or Continue With</span>
            <div className="h-[2px] bg-primary/5 flex-1 rounded-full" />
          </div>

          <div className={`space-y-4 transition-all duration-500 delay-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-14 rounded-[1.5rem] bg-surface-container-low text-primary font-sans font-bold text-sm flex items-center justify-center gap-3 hover:bg-surface-container-high transition-all duration-200 border-2 border-transparent hover:border-primary/5"
            >
              <span className="w-6 h-6 rounded-full bg-white text-primary-container text-sm font-black inline-flex items-center justify-center shadow-sm">
                G
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-14 rounded-[1.5rem] bg-surface-container-low text-primary font-sans font-bold text-sm flex items-center justify-center gap-3 hover:bg-surface-container-high transition-all duration-200 border-2 border-transparent hover:border-primary/5"
            >
              <span className="w-6 h-6 rounded-[0.75rem] inset-0 bg-[#1877F2] text-white text-sm font-black flex items-center justify-center shadow-sm">
                f
              </span>
              Continue with Facebook
            </button>
          </div>

          <p className={`mt-8 text-center text-sm font-sans font-medium text-primary/60 transition-all duration-500 delay-800 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            New here?{' '}
            <Link href="/auth/sign-up" className="font-bold text-primary hover:text-primary/70 transition-colors underline underline-offset-4">
              Create account
            </Link>
          </p>

          <p className={`mt-4 text-center text-xs font-sans font-medium text-primary/60 transition-all duration-500 delay-900 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <Link href="/auth/send-request" className="font-bold text-primary/70 hover:text-primary transition-colors underline underline-offset-4">
              Want to be a coach or a facility?
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}