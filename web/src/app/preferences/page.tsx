'use client'

import { useEffect, useState, useRef } from 'react'
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
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'

export default function PreferencesPage() {
  const router = useRouter()
  const { data: prefsData, loading, error, refetch } = useApiCall<any>('/users/me/preferences')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

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

  useEffect(() => {
    const prefs = !prefsData ? null : (prefsData.data && typeof prefsData.data === 'object' ? prefsData.data : prefsData)
    if (prefs) {
      if (prefs.language) setLanguage(prefs.language)
      if (prefs.favoriteSports) setSports(prefs.favoriteSports)
      if (prefs.notificationSettings) {
        setNotifications({
          bookingReminders: prefs.notificationSettings.bookingReminders ?? true,
          courtAvailability: prefs.notificationSettings.courtAvailability ?? true,
          promotions: prefs.notificationSettings.promotions ?? false,
        })
      }
      if (prefs.privacySettings) {
        setPrivacy({
          profileVisible: prefs.privacySettings.profileVisible ?? true,
          showStats: prefs.privacySettings.showStats ?? false,
        })
      }
    }
  }, [prefsData])

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


  const handleSavePreferences = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await api.patch('/users/me/preferences', {
        language,
        favoriteSports: sports,
        notificationSettings: notifications,
        privacySettings: privacy,
      })
      setSaveSuccess(true)
      refetch()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <APIErrorFallback error={error} onRetry={refetch} />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative selection:bg-tertiary-fixed selection:text-primary">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-20 h-[30rem] w-[30rem] rounded-full bg-primary-container/5 blur-[120px]" />
        <div className="absolute bottom-[20%] -right-20 h-[25rem] w-[25rem] rounded-full bg-secondary-container/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-8 pb-6 md:px-10 lg:px-14 md:pt-12 md:pb-8 flex items-center gap-5 justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-surface-container-low hover:scale-95 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-primary stroke-[2.5]" />
          </button>
          <div className="pt-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Preferences</h1>
            <p className="text-[10px] md:text-xs text-primary/60 font-sans font-bold uppercase tracking-[0.2em] mt-1.5">Language, sports & alerts</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-4xl md:mx-auto pt-2 flex flex-col gap-6 md:gap-8 pb-12" ref={containerRef}>
        <article className={`bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '0ms' }}>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center shrink-0">
              <Globe2 className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">Language</h2>
              <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 mt-1.5">Choose your app language</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {languageOptions.map((item) => {
              const isActive = language === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={`w-full py-4 text-center font-sans font-bold uppercase tracking-widest text-sm rounded-[2rem] transition-all ${
                    isActive
                      ? 'bg-tertiary-fixed text-primary shadow-[0_4px_0_0_#00113a] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]'
                      : 'bg-surface-container-high text-primary/60 hover:text-primary border-2 border-transparent hover:border-primary/10'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </article>

        <article className={`bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">Favorite Sports</h2>
              <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 mt-1.5">Pick sports you play most</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {sportsOptions.map((sport) => {
              const isSelected = sports.includes(sport)
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-sans font-bold uppercase tracking-widest text-xs rounded-[2rem] transition-all ${
                    isSelected
                      ? 'bg-tertiary-fixed text-primary shadow-[0_4px_0_0_#00113a] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]'
                      : 'bg-surface-container-high text-primary/60 hover:text-primary border-2 border-transparent hover:border-primary/10'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  {sport}
                </button>
              )
            })}
          </div>
        </article>

        <article className={`bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">Match Defaults</h2>
              <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 mt-1.5">Set preferred match duration</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {durationOptions.map((item) => {
              const isSelected = duration === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDuration(item)}
                  className={`w-full py-3 text-center font-sans font-bold uppercase tracking-widest text-xs rounded-[2rem] transition-all ${
                    isSelected 
                      ? 'bg-tertiary-fixed text-primary shadow-[0_4px_0_0_#00113a] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]'
                      : 'bg-surface-container-high text-primary/60 hover:text-primary border-2 border-transparent hover:border-primary/10'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </article>

        <article className={`bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">Notifications</h2>
              <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 mt-1.5">Control your updates</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              label="Booking reminders"
              description="Reminders before sessions"
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
              description="Notify when courts free up"
              enabled={notifications.courtAvailability}
              onToggle={() =>
                setNotifications((prev) => ({
                  ...prev,
                  courtAvailability: !prev.courtAvailability,
                }))
              }
            />
            <ToggleRow
              label="Offers & promotions"
              description="Occasional discounts"
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

        <article className={`bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-tertiary-fixed stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">Privacy</h2>
              <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 mt-1.5">Manage visibility</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              label="Profile visible"
              description="Allow others to find you"
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
              description="Include in leaderboards"
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

        {saveError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[1.5rem] px-5 py-4 text-xs font-sans font-bold uppercase tracking-widest text-red-500 animate-shake text-center">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="bg-primary/5 border border-primary/10 rounded-[1.5rem] px-5 py-4 text-xs font-sans font-bold uppercase tracking-widest text-primary animate-scale-in text-center">
            Preferences saved successfully!
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="block w-full py-5 text-center bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-sm rounded-[2rem] shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px] disabled:opacity-60 disabled:pointer-events-none"
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
                Saving...
              </span>
            ) : 'Save Preferences'}
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
    <button
      type="button"
      onClick={onToggle}
      className="group w-full flex items-center justify-between gap-5 p-5 md:p-6 bg-surface-container-high rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-primary transition-all duration-200"
    >
      <div className="text-left flex-1 min-w-0">
        <h3 className="text-xl md:text-2xl font-display font-medium uppercase tracking-tight text-primary group-hover:text-white truncate transition-colors">{label}</h3>
        <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60 group-hover:text-tertiary-fixed mt-1 truncate transition-colors">{description}</p>
      </div>

      <div
        className={`shrink-0 w-14 h-8 rounded-full p-1.5 transition-all duration-300 ${enabled ? 'bg-tertiary-fixed' : 'bg-primary/20 group-hover:bg-white/20'}`}
        aria-pressed={enabled}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`}
        />
      </div>
    </button>
  )
}
