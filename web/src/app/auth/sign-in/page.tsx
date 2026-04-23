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

      <section className={`px-5 py-8 md:px-10 lg:px-14 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="group-hover:gap-2.5 transition-all duration-300">Back to Home</span>
        </Link>
      </section>

      <section className={`px-5 pb-12 md:px-10 lg:px-14 transition-all duration-700 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5 backdrop-blur-sm">

          <h1 className={`mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary transition-all duration-500 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            Welcome Back
          </h1>
          <p className={`mt-2 text-sm md:text-base text-primary/60 transition-all duration-500 delay-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            Sign in to continue booking courts and coaches.
          </p>

          <div className={`mt-5 transition-all duration-500 delay-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="relative flex bg-surface-container-high rounded-[var(--radius-full)] p-1 gap-1">
              <div
                className="absolute top-1 bottom-1 rounded-[var(--radius-full)] bg-primary-container/20 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  left: `calc(${activeIndex} * (100% - 0.5rem) / ${accountTypeOptions.length} + 0.25rem)`,
                  width: `calc((100% - 0.5rem) / ${accountTypeOptions.length})`,
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
                    className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[var(--radius-full)] text-xs font-bold transition-all duration-200 ${isActive ? 'text-primary' : 'text-primary/50 hover:text-primary/70'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <form className={`space-y-4 mt-6 transition-all duration-500 delay-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} onSubmit={handleSignIn}>
            <label className="block space-y-1.5 group">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Email</span>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type="email"
                  name="email"
                  placeholder="alex@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest transition-all duration-200"
                />
              </div>
            </label>

            <label className="block space-y-1.5 group">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55 group-focus-within:text-secondary-container transition-colors duration-200">Password</span>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-10 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container focus:shadow-[0_0_0_3px_oklch(var(--color-primary-container)/0.12)] focus:bg-surface-container-lowest transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center -mr-1 text-primary/45 hover:text-primary transition-colors"
                >
                  <span className="relative w-4 h-4 flex items-center justify-center">
                    <Eye className={`w-4 h-4 absolute transition-all duration-200 ${showPassword ? 'opacity-0 scale-75 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
                    <EyeOff className={`w-4 h-4 absolute transition-all duration-200 ${showPassword ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90'}`} />
                  </span>
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-primary/70 cursor-pointer">
                <input type="checkbox" className="peer w-4 h-4 rounded border-primary/20 accent-primary-container cursor-pointer" />
                <span className="peer-checked:text-primary transition-colors duration-200">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="font-bold text-secondary-container hover:text-secondary hover:underline underline-offset-2 transition-all duration-200">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg animate-[shake_0.5s_ease-in-out]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 hover:shadow-[0_4px_14px_-4px_oklch(var(--color-secondary-container)/0.45)] active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
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

          <div className={`my-6 flex items-center gap-3 text-primary/35 transition-all duration-500 delay-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="h-px bg-primary/10 flex-1" />
            <span className="text-[10px] font-lexend uppercase tracking-[0.16em]">Or Continue With</span>
            <div className="h-px bg-primary/10 flex-1" />
          </div>

          <div className={`space-y-3 transition-all duration-500 delay-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high hover:shadow-ambient active:scale-[0.98] transition-all duration-200"
            >
              <span className="w-6 h-6 rounded-full bg-white text-primary-container text-sm font-black inline-flex items-center justify-center">
                G
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => showToast('Coming soon! This feature is not yet available.', 'info')}
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high hover:shadow-ambient active:scale-[0.98] transition-all duration-200"
            >
              <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white text-sm font-black inline-flex items-center justify-center">
                f
              </span>
              Continue with Facebook
            </button>
          </div>

          <p className={`mt-5 text-center text-sm text-primary/65 transition-all duration-500 delay-800 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            New here?{' '}
            <Link href="/auth/sign-up" className="font-bold text-secondary-container hover:text-secondary hover:underline underline-offset-2 transition-colors duration-200">
              Create account
            </Link>
          </p>

          <p className={`mt-3 text-center text-xs text-primary/65 transition-all duration-500 delay-900 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <Link href="/auth/send-request" className="font-bold text-primary/80 hover:text-primary hover:underline underline-offset-2 transition-colors duration-200">
              Do you want to be a coach or a facility?
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}