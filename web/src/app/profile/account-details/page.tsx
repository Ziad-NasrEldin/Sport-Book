'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, UserRound, Mail, Phone, Globe, ShieldCheck, Save } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

const favoriteSports = ['Tennis', 'Padel']

export default function AccountDetailsPage() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/profile')
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] font-sans">
      <section className="relative w-full h-[34vh] md:h-[42vh] flex flex-col justify-end p-5 md:p-8 overflow-hidden rounded-b-[var(--radius-xl)] md:rounded-b-[var(--radius-full)]">
        <Image
          src="https://images.unsplash.com/photo-1470165518248-ff1947d8b4f9?auto=format&fit=crop&w=1600&q=80"
          alt="Account details header"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/60 to-transparent" />

        <div className="relative z-10 w-full max-w-4xl mx-auto flex items-end justify-between gap-4">
          <div className="flex items-center gap-4 md:gap-5">
            <button
              type="button"
              onClick={handleBack}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-container-lowest/90 text-primary flex items-center justify-center shadow-ambient hover:scale-105 transition-transform"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="text-surface-container-lowest">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">Account Details</h1>
              <p className="text-sm md:text-base font-lexend opacity-90">Manage your personal information and security</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-6 md:-mt-8 max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-5 md:gap-7">
        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-5">Profile Photo</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-surface-container-high shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                alt="User profile photo"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="text-sm md:text-base text-primary/70 mb-4">
                Use a clear headshot so teammates and facility staff can identify you quickly.
              </p>
              <button className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--radius-full)] bg-primary-container text-surface-container-lowest font-bold hover:bg-primary transition-colors">
                <Camera className="w-4 h-4" />
                Change Photo
              </button>
            </div>
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-5">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-lexend uppercase tracking-widest text-primary/50">First Name</span>
              <div className="flex items-center gap-2 bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5">
                <UserRound className="w-4 h-4 text-primary/50" />
                <input
                  defaultValue="Alex"
                  className="w-full bg-transparent outline-none font-semibold text-primary"
                  type="text"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-lexend uppercase tracking-widest text-primary/50">Last Name</span>
              <div className="flex items-center gap-2 bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5">
                <UserRound className="w-4 h-4 text-primary/50" />
                <input
                  defaultValue="Rivera"
                  className="w-full bg-transparent outline-none font-semibold text-primary"
                  type="text"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-lexend uppercase tracking-widest text-primary/50">Email Address</span>
              <div className="flex items-center gap-2 bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5">
                <Mail className="w-4 h-4 text-primary/50" />
                <input
                  defaultValue="alex.rivera@example.com"
                  className="w-full bg-transparent outline-none font-semibold text-primary"
                  type="email"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-lexend uppercase tracking-widest text-primary/50">Phone Number</span>
              <div className="flex items-center gap-2 bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5">
                <Phone className="w-4 h-4 text-primary/50" />
                <input
                  defaultValue="+1 (555) 123-4567"
                  className="w-full bg-transparent outline-none font-semibold text-primary"
                  type="tel"
                />
              </div>
            </label>
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-5">Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-lexend uppercase tracking-widest text-primary/50">Preferred Language</span>
              <div className="flex items-center gap-2 bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5">
                <Globe className="w-4 h-4 text-primary/50" />
                <select
                  defaultValue="English"
                  className="w-full bg-transparent outline-none font-semibold text-primary"
                >
                  <option>English</option>
                  <option>Arabic</option>
                </select>
              </div>
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-lexend uppercase tracking-widest text-primary/50">Favorite Sports</span>
              <div className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5 flex flex-wrap gap-2">
                {favoriteSports.map((sport) => (
                  <span
                    key={sport}
                    className="px-3 py-1.5 text-sm font-semibold rounded-[var(--radius-full)] bg-tertiary-fixed text-primary"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-5">Security</h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-container-high rounded-[var(--radius-md)] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <p className="font-bold text-primary">Password & Sign-in</p>
                <p className="text-sm text-primary/65">Last changed 45 days ago</p>
              </div>
            </div>

            <button className="px-5 py-2.5 rounded-[var(--radius-full)] bg-primary-container text-surface-container-lowest font-bold hover:bg-primary transition-colors">
              Change Password
            </button>
          </div>
        </article>

        <div className="pb-1">
          <button className="w-full py-4 md:py-5 rounded-[var(--radius-full)] bg-gradient-to-br from-secondary to-secondary-container text-white font-black text-lg shadow-ambient hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </section>

      <FloatingNav />
    </main>
  )
}
