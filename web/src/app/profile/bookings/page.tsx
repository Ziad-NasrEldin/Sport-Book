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
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary-container/12 blur-[90px]" />
        <div className="absolute bottom-10 -right-10 h-72 w-72 rounded-full bg-secondary-container/18 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">My Bookings</h1>
            <p className="text-sm md:text-base text-primary/60">Upcoming sessions overview</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-5 md:space-y-8">
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