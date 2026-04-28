import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

const sections = [
  {
    title: 'Using SportBook',
    body: 'You may use SportBook to discover venues, book courts, hire coaches, join sport activities, purchase store items, and manage account preferences. You must provide accurate information and keep account access secure.',
  },
  {
    title: 'Bookings And Payments',
    body: 'Bookings, cancellations, refunds, wallet transactions, and store purchases depend on facility, coach, and payment-provider rules shown during checkout or communicated by SportBook support.',
  },
  {
    title: 'User Conduct',
    body: 'Users must not misuse SportBook, submit false information, interfere with platform security, harass other users, abuse venues, or violate applicable law.',
  },
  {
    title: 'Coaches And Operators',
    body: 'Coaches and facility operators are responsible for accurate listings, availability, prices, service quality, licenses, staff behavior, and compliance with local requirements.',
  },
  {
    title: 'Account Access',
    body: 'SportBook supports email/password and social login. We may suspend access for fraud, security risk, policy violations, chargebacks, or unsafe behavior.',
  },
  {
    title: 'Limitations',
    body: 'SportBook is provided as available. We are not responsible for delays, venue closures, third-party payment failures, social provider outages, or user-submitted inaccuracies beyond our reasonable control.',
  },
]

export default function TermsOfServicePage() {
  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative selection:bg-tertiary-fixed selection:text-primary">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-20 h-[30rem] w-[30rem] rounded-full bg-primary-container/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-20 h-[25rem] w-[25rem] rounded-full bg-secondary-container/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-8 pb-6 md:px-10 lg:px-14 md:pt-12 md:pb-8 flex items-center gap-5 justify-between">
        <div className="flex items-center gap-5">
          <Link
            href="/profile"
            className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-surface-container-low hover:scale-95 transition-all duration-200"
            aria-label="Go back to Profile"
          >
            <ArrowLeft className="w-6 h-6 text-primary stroke-[2.5]" />
          </Link>
          <div className="pt-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Terms of Service</h1>
            <p className="text-[10px] md:text-xs text-primary/60 font-sans font-bold uppercase tracking-[0.2em] mt-1.5">Effective April 23, 2026</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-4xl md:mx-auto pt-2 flex flex-col gap-6 md:gap-8 pb-12">
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]">
          <p className="text-sm md:text-base font-sans font-medium text-primary/70 leading-relaxed max-w-2xl">
            These terms describe rules for using SportBook services across player, coach, operator,
            and admin experiences.
          </p>

          <div className="mt-10 space-y-8 md:space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="border-t-2 border-primary/5 pt-8">
                <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm md:text-base text-primary/70 font-sans leading-relaxed max-w-2xl">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-12 bg-primary/5 rounded-[2rem] p-6 md:p-8 text-center">
            <p className="text-xs md:text-sm font-sans font-bold uppercase tracking-widest text-primary/60 leading-relaxed max-w-xl mx-auto">
              This page is provided as a practical product terms template and should be reviewed by
              qualified legal counsel before public launch.
            </p>
          </div>
        </article>
      </section>

      <FloatingNav />
    </main>
  )
}
