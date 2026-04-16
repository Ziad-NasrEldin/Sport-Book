'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BellRing,
  Check,
  Globe2,
  Shield,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { resetOnboardingCompleted } from '@/lib/onboarding'

export default function PreferencesPage() {
  const router = useRouter()
  const [language, setLanguage] = useState('English')
  const [sports, setSports] = useState<string[]>(['Tennis', 'Padel'])
  const [duration, setDuration] = useState('90 min')

  const [notifications, setNotifications] = useState({
    bookingReminders: true,
    courtAvailability: true,
    promotions: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showStats: false,
  })

  const sportsOptions = ['Tennis', 'Padel', 'Squash', 'Pickleball']
  const languageOptions = ['English', 'Arabic']
  const durationOptions = ['60 min', '90 min', '120 min']

  const toggleSport = (sport: string) => {
    setSports((prev) => (prev.includes(sport) ? prev.filter((item) => item !== sport) : [...prev, sport]))
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/profile')
  }

  const handleReplayOnboarding = () => {
    resetOnboardingCompleted()
    router.push('/onboarding')
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] font-sans">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-container-high text-primary flex items-center justify-center shadow-ambient hover:scale-105 transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Preferences</h1>
            <p className="text-sm md:text-base text-primary/60">Personalize language, sports, and notifications</p>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 md:px-8 pt-2 flex flex-col gap-5 md:gap-7">
        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
              <Globe2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">Language</h2>
              <p className="text-sm text-primary/60">Choose your app language</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {languageOptions.map((item) => {
              const isActive = language === item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={`rounded-[var(--radius-md)] px-4 py-4 font-semibold transition-all ${
                    isActive
                      ? 'bg-tertiary-fixed text-primary shadow-[0_10px_25px_-10px_rgba(195,244,0,0.6)]'
                      : 'bg-surface-container-high text-primary/70 hover:bg-surface-container-low'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-secondary-container">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">Favorite Sports</h2>
              <p className="text-sm text-primary/60">Pick one or multiple sports you play most</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {sportsOptions.map((sport) => {
              const isSelected = sports.includes(sport)

              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-primary-container text-surface-container-lowest'
                      : 'bg-surface-container-high text-primary/70 hover:text-primary'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {sport}
                </button>
              )
            })}
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">Match Defaults</h2>
              <p className="text-sm text-primary/60">Set your preferred match duration</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {durationOptions.map((item) => {
              const isSelected = duration === item

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDuration(item)}
                  className={`rounded-full px-3 py-2.5 text-sm font-bold transition-colors ${
                    isSelected ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-primary/70'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
              <BellRing className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">Notifications</h2>
              <p className="text-sm text-primary/60">Control what updates you receive</p>
            </div>
          </div>

          <div className="space-y-3">
            <ToggleRow
              label="Booking reminders"
              description="Remind me before my sessions"
              enabled={notifications.bookingReminders}
              onToggle={() =>
                setNotifications((prev) => ({
                  ...prev,
                  bookingReminders: !prev.bookingReminders,
                }))
              }
            />
            <ToggleRow
              label="Court availability"
              description="Notify me when favorite courts are free"
              enabled={notifications.courtAvailability}
              onToggle={() =>
                setNotifications((prev) => ({
                  ...prev,
                  courtAvailability: !prev.courtAvailability,
                }))
              }
            />
            <ToggleRow
              label="Offers and promotions"
              description="Send occasional discounts and campaigns"
              enabled={notifications.promotions}
              onToggle={() =>
                setNotifications((prev) => ({
                  ...prev,
                  promotions: !prev.promotions,
                }))
              }
            />
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center text-primary">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">Privacy</h2>
              <p className="text-sm text-primary/60">Manage profile visibility and stats sharing</p>
            </div>
          </div>

          <div className="space-y-3">
            <ToggleRow
              label="Profile visible"
              description="Allow others to discover your profile"
              enabled={privacy.profileVisible}
              onToggle={() =>
                setPrivacy((prev) => ({
                  ...prev,
                  profileVisible: !prev.profileVisible,
                }))
              }
            />
            <ToggleRow
              label="Share match stats"
              description="Include results in public leaderboards"
              enabled={privacy.showStats}
              onToggle={() =>
                setPrivacy((prev) => ({
                  ...prev,
                  showStats: !prev.showStats,
                }))
              }
            />
          </div>
        </article>

        <div className="pb-1">
          <button className="w-full py-4 md:py-5 rounded-[var(--radius-full)] bg-gradient-to-br from-secondary to-secondary-container text-white font-black text-lg shadow-ambient hover:opacity-90 transition-opacity">
            Save Preferences
          </button>

          <button
            type="button"
            onClick={handleReplayOnboarding}
            className="mt-3 w-full py-3.5 rounded-[var(--radius-full)] bg-surface-container-lowest border border-primary/10 text-primary font-bold hover:bg-surface-container-high transition-colors"
          >
            Replay Onboarding
          </button>
        </div>
      </section>

      <FloatingNav />
    </main>
  )
}

type ToggleRowProps = {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3.5">
      <div>
        <p className="font-bold text-primary leading-tight">{label}</p>
        <p className="text-xs text-primary/60 mt-1">{description}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`w-12 h-7 rounded-full p-1 transition-colors ${enabled ? 'bg-tertiary-fixed' : 'bg-primary/20'}`}
        aria-pressed={enabled}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}