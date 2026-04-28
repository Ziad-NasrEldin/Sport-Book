'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { ProfileBookingsSection } from '@/components/profile/ProfileBookingsSection'
import { AuthGuard } from '@/components/auth/AuthGuard'

function ProfileBookingsPageContent() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/profile')
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans">
      {/* HERO */}
      <section className="relative w-full h-[35vh] md:h-[42vh] flex flex-col justify-end overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-primary" />
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 pb-8 md:pb-12">
          <div className="flex items-end gap-4 md:gap-5">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="w-12 h-12 rounded-[1rem] bg-tertiary-fixed text-primary flex items-center justify-center flex-shrink-0 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-white">
              <h1 className="font-display text-4xl md:text-6xl uppercase font-bold tracking-tighter leading-[0.85]">My Bookings</h1>
              <p className="text-sm md:text-base font-sans font-medium text-white/70 mt-2">Upcoming sessions overview</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 md:px-8 pt-10 md:pt-16 md:max-w-5xl md:mx-auto">
        <ProfileBookingsSection />
      </section>

      <FloatingNav />
    </main>
  )
}

export default function ProfileBookingsPage() {
  return (
    <AuthGuard>
      <ProfileBookingsPageContent />
    </AuthGuard>
  )
}
