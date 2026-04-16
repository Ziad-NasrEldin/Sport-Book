"use client"

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LockKeyhole, Mail, Eye } from 'lucide-react'
import {
  accountTypeOptions,
  getActiveAccountType,
  getPostLoginRouteForAccountType,
  setActiveAccountType,
} from '@/lib/accountType'
import { api, setTokens } from '@/lib/api/client'
import { APIError } from '@/lib/api/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const loginAccountTypeOptions = accountTypeOptions.filter((option) => option.value !== 'facility')
type LoginAccountType = (typeof loginAccountTypeOptions)[number]['value']

function getInitialLoginAccountType(): LoginAccountType {
  const activeAccountType = getActiveAccountType()

  if (activeAccountType === 'facility') {
    setActiveAccountType('player')
    return 'player'
  }

  return activeAccountType
}

export default function SignInPage() {
  const router = useRouter()
  const [accountType, setAccountTypeState] = useState<LoginAccountType>(() => {
    if (typeof window === 'undefined') return 'player'
    return getInitialLoginAccountType()
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedAccountLabel =
    loginAccountTypeOptions.find((option) => option.value === accountType)?.label ?? 'Player'

  const handleAccountTypeSelect = (nextType: LoginAccountType) => {
    setAccountTypeState(nextType)
    setActiveAccountType(nextType)
  }

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await api.post('/auth/login', { email, password })
      const { accessToken, refreshToken, user } = response.data || response

      setTokens(accessToken, refreshToken)
      setActiveAccountType(user.role.toLowerCase() as LoginAccountType)

      router.push(getPostLoginRouteForAccountType(user.role.toLowerCase() as LoginAccountType))
    } catch (err) {
      const apiError = err as APIError
      setError(apiError.message || 'Failed to sign in. Please check your credentials.')
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

      <section className="px-5 py-8 md:px-10 lg:px-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </section>

      <section className="px-5 pb-12 md:px-10 lg:px-14">
        <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
          <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary">Welcome Back</h1>
          <p className="mt-2 text-sm md:text-base text-primary/60">Sign in to continue booking courts and coaches.</p>

          <div className="mt-6">
            <p className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Account Type</p>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {loginAccountTypeOptions.map((option) => {
                const isActive = accountType === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAccountTypeSelect(option.value)}
                    className={`h-10 rounded-full text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-primary-container text-surface-container-lowest'
                        : 'bg-surface-container-low text-primary/75 hover:text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-primary/55">Quick switch enabled for testing account experiences.</p>
          </div>

          <form className="space-y-4 mt-6" onSubmit={handleSignIn}>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Email</span>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type="email"
                  name="email"
                  placeholder="alex@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Password</span>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-10 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                />
                <Eye className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-primary/45" />
              </div>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-primary/70">
                <input type="checkbox" className="accent-primary-container" /> Remember me
              </label>
              <Link href="/auth/forgot-password" className="font-bold text-secondary-container hover:text-secondary transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                `Sign In as ${selectedAccountLabel}`
              )}
            </button>

            {accountType === 'admin' ? (
              <Link
                href="/admin/dashboard"
                className="w-full h-11 rounded-[var(--radius-full)] bg-primary-container text-surface-container-lowest font-bold inline-flex items-center justify-center hover:opacity-90 transition-all"
              >
                Open Admin Dashboard
              </Link>
            ) : null}
          </form>

          <div className="my-6 flex items-center gap-3 text-primary/35">
            <div className="h-px bg-primary/10 flex-1" />
            <span className="text-[10px] font-lexend uppercase tracking-[0.16em]">Or Continue With</span>
            <div className="h-px bg-primary/10 flex-1" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-white text-primary-container text-sm font-black inline-flex items-center justify-center">
                G
              </span>
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white text-sm font-black inline-flex items-center justify-center">
                f
              </span>
              Continue with Facebook
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-primary/65">
            New here?{' '}
            <Link href="/auth/sign-up" className="font-bold text-secondary-container hover:text-secondary transition-colors">
              Create account
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
