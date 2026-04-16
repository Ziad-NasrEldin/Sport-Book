import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Medal, Clock3, Star, Check, ArrowRight } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { coaches } from '@/lib/coaches'

type CoachDetailsPageProps = {
  params: Promise<{ slug: string }>
}

const slotBands = [
  { h: 0, c: 'bg-[#6366f1]' },
  { h: 1, c: 'bg-[#6366f1]' },
  { h: 2, c: 'bg-[#6366f1]' },
  { h: 3, c: 'bg-[#6366f1]' },
  { h: 4, c: 'bg-[#6366f1]' },
  { h: 5, c: 'bg-[#6366f1]' },
  { h: 6, c: 'bg-[#6366f1]' },
  { h: 7, c: 'bg-[#f59e0b]' },
  { h: 8, c: 'bg-[#f59e0b]' },
  { h: 9, c: 'bg-[#f59e0b]' },
  { h: 10, c: 'bg-[#f59e0b]' },
  { h: 11, c: 'bg-[#10b981]' },
  { h: 12, c: 'bg-[#10b981]' },
  { h: 13, c: 'bg-[#10b981]' },
  { h: 14, c: 'bg-[#10b981]' },
  { h: 15, c: 'bg-[#10b981]' },
  { h: 16, c: 'bg-[#ef4444]' },
  { h: 17, c: 'bg-[#ef4444]' },
  { h: 18, c: 'bg-[#ef4444]' },
  { h: 19, c: 'bg-[#ef4444]' },
  { h: 20, c: 'bg-[#ef4444]' },
  { h: 21, c: 'bg-[#ef4444]' },
  { h: 22, c: 'bg-[#ef4444]' },
  { h: 23, c: 'bg-[#ef4444]' },
]

export default async function CoachDetailsPage({ params }: CoachDetailsPageProps) {
  const { slug } = await params
  const coach = coaches.find((entry) => entry.slug === slug)

  if (!coach) {
    notFound()
  }

  const confirmBookingHref = `/coaches/${coach.slug}/confirm-booking?${new URLSearchParams({
    date: 'Apr 20, 2026',
    time: '06:00 PM',
    duration: '60',
    type: 'private',
    location: 'SportBook Club - Main Arena',
  }).toString()}`

  return (
    <main className="w-full bg-surface min-h-screen pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-tertiary-fixed/10 rounded-full blur-[100px]" />
      </div>

      <header className="flex justify-between items-center w-full px-5 py-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl md:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <Link
            href="/coaches"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors active:scale-95 duration-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-primary-container stroke-[2]" />
          </Link>
          <h1 className="text-primary-container font-extrabold tracking-tight text-lg md:text-xl">{coach.name}</h1>
        </div>
      </header>

      <div className="md:max-w-4xl md:mx-auto">
        <section className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden md:rounded-[2rem] md:mt-4 md:shadow-ambient">
          <Image src={coach.image} alt={coach.name} fill className="object-cover object-center" priority />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent">
            <div className="space-y-2 md:space-y-3">
              <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <Star className="w-3 h-3 fill-primary" /> 4.9
              </span>
              <h2 className="text-3xl font-extrabold text-white leading-none md:text-5xl">{coach.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-white/85 text-sm md:text-base">
                <span className="inline-flex items-center gap-1.5">
                  <Medal className="w-4 h-4" /> {coach.experienceYears} years experience
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="w-4 h-4" /> {coach.sport} Coach
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="px-5 py-8 space-y-10 md:px-0 md:py-10 md:space-y-12">
          <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 md:p-8 shadow-ambient">
            <p className="text-xs font-lexend font-bold uppercase tracking-[0.16em] text-primary/50 mb-2">About Coach</p>
            <p className="text-sm md:text-base text-primary/80 leading-relaxed">{coach.bio}</p>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-extrabold text-primary md:text-[28px]">Available Time Slots</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-8 gap-2 md:gap-3">
                {slotBands.map((slot) => {
                  let boxColor = 'bg-[#10b981]'
                  if (slot.h === 2 || slot.h === 14) boxColor = 'bg-[#d1d5db]'
                  if (slot.h === 18 || slot.h === 19) boxColor = 'bg-[#ef4444]'

                  return (
                    <div key={slot.h} className="flex flex-col gap-[3px] active:scale-95 transition-transform cursor-pointer">
                      <div
                        className={`h-10 sm:h-12 md:h-14 ${slot.c} rounded-md flex items-center justify-center text-white font-bold font-lexend text-xs sm:text-sm shadow-sm`}
                      >
                        {slot.h}
                      </div>
                      <div className={`h-8 sm:h-10 md:h-12 ${boxColor} rounded-md shadow-sm`} />
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-center gap-6 pt-3 md:gap-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary/60 uppercase tracking-widest font-lexend">unavailable</span>
                  <span className="w-5 h-5 rounded-full bg-[#d1d5db] shadow-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary/60 uppercase tracking-widest font-lexend">booked</span>
                  <span className="w-5 h-5 rounded-full bg-[#ef4444] shadow-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary/60 uppercase tracking-widest font-lexend">available</span>
                  <span className="w-5 h-5 rounded-full bg-[#10b981] shadow-sm" />
                </div>
              </div>

              <div className="bg-surface-container-low p-4 md:p-6 rounded-[1.5rem] flex flex-wrap items-center justify-center gap-3">
                <span className="px-5 py-2.5 bg-[#6366f1] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Night: 40 EGP/hr</span>
                <span className="px-5 py-2.5 bg-[#f59e0b] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Morning: 50 EGP/hr</span>
                <span className="px-5 py-2.5 bg-[#10b981] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Afternoon: 60 EGP/hr</span>
                <span className="px-5 py-2.5 bg-[#ef4444] text-white rounded-full text-[11px] md:text-sm font-bold font-lexend shadow-sm">Evening: 70 EGP/hr</span>
              </div>
            </div>
          </section>

          <section className="bg-primary text-white rounded-[1.5rem] md:rounded-[2rem] p-7 md:p-10 space-y-6 overflow-hidden relative shadow-lg">
            <h3 className="text-xl md:text-2xl font-extrabold">Session Notes</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
                <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">
                  Bring your own racket and hydration for high-intensity drills.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-tertiary-fixed">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
                <p className="text-white/80 text-sm md:text-base leading-relaxed pt-1 font-medium">
                  Minimum notice for cancellation is 12 hours before slot start.
                </p>
              </li>
            </ul>
          </section>

          <section className="bg-surface-container-lowest rounded-[1.5rem] p-5 md:p-6 shadow-ambient flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.16em] text-primary/50">Next Step</p>
              <h3 className="text-xl font-extrabold text-primary mt-1">Confirm this coach session</h3>
              <p className="text-sm text-primary/65 mt-1">Review session setup, then continue to secure checkout.</p>
            </div>
            <Link
              href={confirmBookingHref}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-br from-secondary to-secondary-container text-white px-6 py-3.5 rounded-full font-extrabold text-sm md:text-base whitespace-nowrap"
            >
              Confirm Booking
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </div>
      </div>

      <FloatingNav />
    </main>
  )
}
