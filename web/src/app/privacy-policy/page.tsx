import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

const sections = [
  {
    title: 'Information We Collect',
    body: 'SportBook collects account details, booking activity, payment references, location preferences, support messages, and device data needed to operate sports booking, coaching, store, wallet, and facility services.',
  },
  {
    title: 'How We Use Information',
    body: 'We use information to create accounts, process bookings, manage payments, personalize sport preferences, prevent fraud, send service updates, improve reliability, and support customer requests.',
  },
  {
    title: 'Social Login',
    body: 'When you sign in with Google or Facebook, we receive verified profile details such as email, name, profile image, provider ID, and email verification status. We use this only to create or connect your SportBook account.',
  },
  {
    title: 'Sharing',
    body: 'We share limited information with coaches, operators, payment processors, analytics providers, and service vendors only when needed to provide SportBook services, comply with law, or protect users.',
  },
  {
    title: 'Security',
    body: 'We protect sessions with access tokens and secure refresh cookies. No method is perfectly secure, so users should keep devices, passwords, and social accounts protected.',
  },
  {
    title: 'Your Choices',
    body: 'You can update account details, manage preferences, log out of active sessions, and request account support through SportBook contact channels.',
  },
]

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Privacy Policy</h1>
            <p className="text-[10px] md:text-xs text-primary/60 font-sans font-bold uppercase tracking-[0.2em] mt-1.5">Effective April 23, 2026</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-4xl md:mx-auto pt-2 flex flex-col gap-6 md:gap-8 pb-12">
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]">
          <p className="text-sm md:text-base font-sans font-medium text-primary/70 leading-relaxed max-w-2xl">
            This policy explains how SportBook handles personal information for players, coaches,
            operators, and admins using our booking platform.
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
              This page is provided as a practical product policy template and should be reviewed by
              qualified legal counsel before public launch.
            </p>
          </div>
        </article>
      </section>

      <FloatingNav />
    </main>
  )
}
