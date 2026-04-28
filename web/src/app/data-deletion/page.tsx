import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

const steps = [
  'Sign in to your SportBook account.',
  'Open Profile, then Account Details.',
  'Confirm which data you want deleted, including bookings, wallet records, social login links, and profile details.',
  'Send a deletion request to SportBook support with your account email.',
  'SportBook will verify ownership before deleting or anonymizing eligible data.',
]

export default function DataDeletionPage() {
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
            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Data Deletion</h1>
            <p className="text-[10px] md:text-xs text-primary/60 font-sans font-bold uppercase tracking-[0.2em] mt-1.5">Effective April 23, 2026</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-4xl md:mx-auto pt-2 flex flex-col gap-6 md:gap-8 pb-12">
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]">
          <p className="text-sm md:text-base font-sans font-medium text-primary/70 leading-relaxed max-w-2xl">
            SportBook users can request deletion of personal account data connected to email,
            Google, or Facebook sign-in.
          </p>

          <div className="mt-10 space-y-8 md:space-y-10">
            <section className="border-t-2 border-primary/5 pt-8">
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">
                How To Request Deletion
              </h2>
              <ol className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-4 p-5 rounded-[2rem] bg-surface-container-low">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-tertiary-fixed text-primary flex items-center justify-center font-sans font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm md:text-base text-primary/80 font-sans leading-relaxed pt-1">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="border-t-2 border-primary/5 pt-8">
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">
                What May Be Kept
              </h2>
              <p className="mt-4 text-sm md:text-base text-primary/70 font-sans leading-relaxed max-w-2xl">
                Some records may be retained when required for fraud prevention, payment disputes,
                accounting, legal compliance, booking history integrity, or active support cases.
                Retained records will be limited and protected.
              </p>
            </section>

            <section className="border-t-2 border-primary/5 pt-8">
              <h2 className="text-2xl md:text-3xl font-display font-medium uppercase tracking-tight text-primary leading-none">
                Support Contact
              </h2>
              <p className="mt-4 text-sm md:text-base text-primary/70 font-sans leading-relaxed max-w-2xl">
                Send deletion requests to SportBook support with your account email and preferred
                contact method. Add <span className="font-bold text-primary">“Data Deletion Request”</span> to the message subject.
              </p>
            </section>
          </div>
        </article>
      </section>

      <FloatingNav />
    </main>
  )
}
