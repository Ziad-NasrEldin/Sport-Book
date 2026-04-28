'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, UserRound, Mail, Phone, Globe, ShieldCheck, Save } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AppSelect } from '@/components/ui/AppSelect'

const favoriteSports = ['Tennis', 'Padel']

function AccountDetailsPageContent() {
  const router = useRouter()
  const { data: userData, loading, error, refetch } = useApiCall<any>('/users/me')
  const user = userData?.data || userData
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (user) {
      const fullName = user.name || ''
      const parts = fullName.split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/profile')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await api.patch('/users/me', {
        name: `${firstName} ${lastName}`.trim(),
        phone,
      })
      setSaveSuccess(true)
      refetch()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans flex items-center justify-center">
        <APIErrorFallback error={error} onRetry={refetch} />
      </main>
    )
  }

  if (loading) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans">
        <section className="w-full h-[40vh] md:h-[50vh] bg-primary/20 animate-pulse" />
        <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-10 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-8 animate-pulse h-48 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]" />
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-8 animate-pulse h-64 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]" />
        </section>
      </main>
    )
  }

  const avatarUrl = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans">
      {/* HERO */}
      <section className="relative w-full h-[40vh] md:h-[50vh] flex flex-col justify-end overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <Image
          src="https://images.unsplash.com/photo-1470165518248-ff1947d8b4f9?auto=format&fit=crop&w=1600&q=80"
          alt="Account details header"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/20" />
        <div 
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 pb-8 md:pb-12">
          <div className="flex items-end gap-4 md:gap-5">
            <button
              type="button"
              onClick={handleBack}
              className="w-12 h-12 rounded-[1rem] bg-tertiary-fixed text-primary flex items-center justify-center flex-shrink-0 hover:bg-white transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-white">
              <h1 className="font-display text-4xl md:text-6xl uppercase font-bold tracking-tighter leading-[0.85]">Account Details</h1>
              <p className="text-sm md:text-base font-sans font-medium text-white/70 mt-2">Manage your personal information and security</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-10 md:pt-16 flex flex-col gap-6 md:gap-8">
        {/* Profile Photo */}
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in">
          <h2 className="font-display text-2xl md:text-3xl uppercase font-bold text-primary tracking-tight mb-6">Profile Photo</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-tertiary-fixed shadow-[0_0_0_4px_#00113a] shrink-0">
              <Image
                src={avatarUrl}
                alt="User profile photo"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm md:text-base text-primary/70 mb-4 font-sans">
                Use a clear headshot so teammates and facility staff can identify you quickly.
              </p>
              <button
                onClick={() => alert('Coming soon — photo upload is not yet available.')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[2rem] bg-primary text-white font-sans font-bold uppercase tracking-widest text-xs shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px]"
              >
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
            </div>
          </div>
        </article>

        {/* Personal Information */}
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in animation-delay-100">
          <h2 className="font-display text-2xl md:text-3xl uppercase font-bold text-primary tracking-tight mb-6">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50">First Name</span>
              <div className="flex items-center gap-3 bg-surface-container-low rounded-[1.5rem] px-5 py-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">
                <UserRound className="w-5 h-5 text-primary/40" />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-transparent outline-none font-sans font-semibold text-primary"
                  type="text"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50">Last Name</span>
              <div className="flex items-center gap-3 bg-surface-container-low rounded-[1.5rem] px-5 py-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">
                <UserRound className="w-5 h-5 text-primary/40" />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-transparent outline-none font-sans font-semibold text-primary"
                  type="text"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50">Email</span>
              <div className="flex items-center gap-3 bg-surface-container-low rounded-[1.5rem] px-5 py-4 opacity-60">
                <Mail className="w-5 h-5 text-primary/40" />
                <input
                  value={email}
                  disabled
                  className="w-full bg-transparent outline-none font-sans font-semibold text-primary cursor-not-allowed"
                  type="email"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50">Phone Number</span>
              <div className="flex items-center gap-3 bg-surface-container-low rounded-[1.5rem] px-5 py-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20">
                <Phone className="w-5 h-5 text-primary/40" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent outline-none font-sans font-semibold text-primary"
                  type="tel"
                />
              </div>
            </label>
          </div>
        </article>

        {/* Preferences */}
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in animation-delay-150">
          <h2 className="font-display text-2xl md:text-3xl uppercase font-bold text-primary tracking-tight mb-6">Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50">Preferred Language</span>
              <div className="flex items-center gap-3 bg-surface-container-low rounded-[1.5rem] px-5 py-4">
                <Globe className="w-5 h-5 text-primary/40" />
                <AppSelect
                  defaultValue="English"
                  className="w-full bg-transparent outline-none font-sans font-semibold text-primary"
                >
                  <option>English</option>
                  <option>Arabic</option>
                </AppSelect>
              </div>
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50">Favorite Sports</span>
              <div className="bg-surface-container-low rounded-[1.5rem] px-5 py-4 flex flex-wrap gap-2">
                {favoriteSports.map((sport) => (
                  <span
                    key={sport}
                    className="px-4 py-2 text-sm font-sans font-bold rounded-full bg-tertiary-fixed text-primary uppercase tracking-wider"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Security */}
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in animation-delay-200">
          <h2 className="font-display text-2xl md:text-3xl uppercase font-bold text-primary tracking-tight mb-6">Security</h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-container-low rounded-[2rem] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-sans font-bold text-primary">Password & Sign-in</p>
                <p className="text-sm text-primary/65 font-sans">Manage your password and authentication</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/auth/forgot-password')}
              className="px-6 py-3 rounded-[2rem] bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-xs shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px]"
            >
              Change Password
            </button>
          </div>
        </article>

        {saveError && (
          <div className="bg-red-500/10 rounded-[1.5rem] px-5 py-4 text-sm text-red-500 font-sans font-bold">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-500/10 rounded-[1.5rem] px-5 py-4 text-sm text-green-600 font-sans font-bold">
            Changes saved successfully!
          </div>
        )}

        <div className="pb-1">
          <button
            onClick={handleSave}
            disabled={saving || saveSuccess}
            className={`w-full py-4 md:py-5 rounded-[2rem] text-primary font-sans font-black text-lg uppercase tracking-widest inline-flex items-center justify-center gap-2 transition-all ${
              saveSuccess 
                ? 'bg-green-400 text-primary' 
                : saving
                  ? 'bg-primary/20 cursor-wait'
                  : 'bg-tertiary-fixed shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]'
            } ${saving ? 'animate-pulse' : ''}`}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </section>

      <FloatingNav />
    </main>
  )
}

export default function AccountDetailsPage() {
  return (
    <AuthGuard>
      <AccountDetailsPageContent />
    </AuthGuard>
  )
}
