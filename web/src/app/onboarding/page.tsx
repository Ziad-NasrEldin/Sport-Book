'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Bolt, CircleOff, Sparkles, Star, Users2 } from 'lucide-react'
import { hasCompletedOnboarding, markOnboardingCompleted } from '@/lib/onboarding'

type OnboardingSlide = {
  id: 'instant-booking' | 'expert-coaching' | 'e-commerce' | 'team-matchmaking'
  kicker: string
  title: string
  subtitle: string
  primaryCta: string
  secondaryCta?: string
  image: string
  badgeLabel: string
  badgeIcon: 'bolt' | 'star' | 'shop' | 'team'
  panelToneClass: string
  heroOverlayClass: string
  statA: { label: string; value: string }
  statB: { label: string; value: string }
}

const slides: OnboardingSlide[] = [
  {
    id: 'instant-booking',
    kicker: 'Speed Mode',
    title: 'Instant Booking',
    subtitle: 'Secure your court in under 30 seconds.',
    primaryCta: 'Get Started',
    secondaryCta: 'Learn how it works',
    image: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1400&q=80',
    badgeLabel: 'Quick Reserve',
    badgeIcon: 'bolt',
    panelToneClass: 'bg-surface/90',
    heroOverlayClass: 'bg-gradient-to-b from-surface/15 via-surface/35 to-surface/75',
    statA: { label: 'Live Availability', value: '24 Courts' },
    statB: { label: 'Fastest Slot', value: '11:30 AM' },
  },
  {
    id: 'expert-coaching',
    kicker: 'Evolution',
    title: 'Expert Coaching',
    subtitle: 'Professional guidance to level up your game. Unlock your potential with personalized training.',
    primaryCta: 'Find a Coach',
    secondaryCta: 'Explore coach profiles',
    image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80',
    badgeLabel: 'Top Rated',
    badgeIcon: 'star',
    panelToneClass: 'bg-surface-container-lowest',
    heroOverlayClass: 'bg-gradient-to-b from-primary/10 via-surface/20 to-surface/72',
    statA: { label: 'Certified Experts', value: '120+' },
    statB: { label: 'Avg. Rating', value: '4.9/5' },
  },
  {
    id: 'e-commerce',
    kicker: 'Elite Equipment',
    title: 'Pro Shop',
    subtitle: 'Shop the best gear from your favorite facilities. Hand-curated performance equipment for the modern athlete.',
    primaryCta: 'Start Shopping',
    secondaryCta: 'View catalogue',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1400&q=80',
    badgeLabel: 'Store Access',
    badgeIcon: 'shop',
    panelToneClass: 'bg-surface',
    heroOverlayClass: 'bg-gradient-to-b from-primary/70 via-primary/60 to-surface/70',
    statA: { label: 'Active Products', value: '8K+' },
    statB: { label: 'Top Category', value: 'Rackets' },
  },
  {
    id: 'team-matchmaking',
    kicker: 'Pro Matchmaking',
    title: 'Team Matchmaking',
    subtitle: 'Find and challenge players at your level. Precision pairing for the perfect set.',
    primaryCta: 'Find Partners',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1400&q=80',
    badgeLabel: 'Smart Pairing',
    badgeIcon: 'team',
    panelToneClass: 'bg-surface/92',
    heroOverlayClass: 'bg-gradient-to-b from-surface/25 via-surface/40 to-surface/84',
    statA: { label: 'Active Cities', value: '12' },
    statB: { label: 'Weekly Matches', value: '3.4K' },
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canRender, setCanRender] = useState(false)
  const touchStartXRef = useRef<number | null>(null)

  const isLastSlide = currentIndex === slides.length - 1

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const finishOnboarding = () => {
    markOnboardingCompleted()
    router.replace('/auth/sign-in')
  }

  const onPrimaryAction = () => {
    if (isLastSlide) {
      finishOnboarding()
      return
    }

    goToNext()
  }

  const onSecondaryAction = () => {
    if (isLastSlide) {
      finishOnboarding()
      return
    }

    goToNext()
  }

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartXRef.current === null) return

    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current
    const delta = endX - touchStartXRef.current
    const threshold = 45

    if (delta < -threshold) {
      goToNext()
    } else if (delta > threshold) {
      goToPrevious()
    }

    touchStartXRef.current = null
  }

  useEffect(() => {
    if (hasCompletedOnboarding()) {
      router.replace('/')
      return
    }

    setCanRender(true)
  }, [router])

  if (!canRender) {
    return <main className="w-full min-h-screen bg-surface" />
  }

  return (
    <main className="w-full min-h-screen bg-surface overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="relative min-h-screen">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex

          return (
            <section
              key={slide.id}
              className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive
                  ? 'opacity-100 translate-x-0 pointer-events-auto'
                  : index < currentIndex
                    ? 'opacity-0 -translate-x-8 pointer-events-none'
                    : 'opacity-0 translate-x-8 pointer-events-none'
              }`}
            >
              <div className="absolute inset-x-0 top-0 z-30 px-6 pt-7 flex items-center justify-between md:px-8 md:pt-8">
                <div className="flex items-center gap-2.5">
                  {slide.id === 'team-matchmaking' && (
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </span>
                  )}
                  <span className="font-lexend uppercase tracking-[0.28em] text-primary font-extrabold text-[20px] md:text-[22px]">
                    Kinetic
                  </span>
                </div>

                <button
                  type="button"
                  onClick={finishOnboarding}
                  className="text-primary/80 hover:text-primary transition-colors font-bold text-[18px] md:text-[20px]"
                >
                  Skip
                </button>
              </div>

              <OnboardingSlideView
                slide={slide}
                onPrimaryAction={onPrimaryAction}
                onSecondaryAction={slide.secondaryCta ? onSecondaryAction : undefined}
              />
            </section>
          )
        })}

        <div className="absolute bottom-7 left-0 right-0 z-30 flex items-center justify-center gap-2">
          {slides.map((slide, index) => {
            const active = index === currentIndex

            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all duration-300 ${active ? 'w-8 h-1.5 bg-secondary-container' : 'w-2.5 h-1.5 bg-primary/20'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

function OnboardingSlideView({
  slide,
  onPrimaryAction,
  onSecondaryAction,
}: {
  slide: OnboardingSlide
  onPrimaryAction: () => void
  onSecondaryAction?: () => void
}) {
  const badgeIcon =
    slide.badgeIcon === 'bolt' ? (
      <Bolt className="w-4 h-4 text-primary fill-primary" />
    ) : slide.badgeIcon === 'star' ? (
      <Star className="w-4 h-4 text-secondary-container fill-secondary-container" />
    ) : slide.badgeIcon === 'shop' ? (
      <CircleOff className="w-4 h-4 text-tertiary-fixed" />
    ) : (
      <Users2 className="w-4 h-4 text-primary-container" />
    )

  return (
    <div className="relative h-full w-full bg-surface">
      <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden">
        <Image src={slide.image} alt={slide.title} fill priority={slide.id === 'instant-booking'} className="object-cover" />
        <div className={`absolute inset-0 ${slide.heroOverlayClass}`} />

        <div className="absolute left-6 bottom-5 inline-flex items-center gap-2 rounded-full bg-primary-container/88 px-4 py-2 text-white md:left-8 md:bottom-6">
          {badgeIcon}
          <span className="text-[11px] md:text-xs font-lexend uppercase tracking-[0.15em] font-bold">{slide.badgeLabel}</span>
        </div>
      </div>

      <div className={`absolute inset-x-0 bottom-0 z-10 rounded-t-[2.2rem] px-6 pt-8 pb-20 md:px-8 ${slide.panelToneClass}`}>
        <p className="text-[10px] md:text-xs font-lexend uppercase tracking-[0.2em] font-bold text-primary/45">{slide.kicker}</p>

        <h1 className="mt-3 text-[44px] leading-[0.95] tracking-[-0.03em] font-black text-primary md:text-[58px]">
          {slide.title}
        </h1>

        <p className="mt-5 text-[20px] leading-[1.35] text-primary/72 md:text-[24px] max-w-[640px]">{slide.subtitle}</p>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="mt-8 w-full h-14 rounded-full bg-gradient-to-r from-secondary to-secondary-container text-white text-[18px] font-extrabold inline-flex items-center justify-center gap-2 shadow-[0_16px_25px_-14px_rgba(253,139,0,0.65)] md:h-16 md:text-[20px]"
        >
          {slide.primaryCta}
          <ArrowRight className="w-5 h-5" />
        </button>

        {onSecondaryAction && slide.secondaryCta && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="mt-5 w-full text-center text-[14px] md:text-[15px] font-lexend uppercase tracking-[0.13em] font-bold text-primary"
          >
            {slide.secondaryCta}
          </button>
        )}

        <div className="mt-8 pt-5 border-t border-primary/10 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-lexend font-bold text-primary/45">
              {slide.statA.label}
            </p>
            <p className="text-[22px] md:text-[26px] font-black text-primary mt-1.5">{slide.statA.value}</p>
          </div>

          <div className="pl-4 border-l border-primary/10">
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-lexend font-bold text-primary/45">
              {slide.statB.label}
            </p>
            <p className="text-[22px] md:text-[26px] font-black text-primary mt-1.5">{slide.statB.value}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
