import Link from 'next/link'

const steps = [
  'Sign in to your SportBook account.',
  'Open Profile, then Account Details.',
  'Confirm which data you want deleted, including bookings, wallet records, social login links, and profile details.',
  'Send a deletion request to SportBook support with your account email.',
  'SportBook will verify ownership before deleting or anonymizing eligible data.',
]

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-surface-container-low px-5 py-10 md:px-10">
      <section className="mx-auto max-w-3xl rounded-[var(--radius-lg)] bg-surface-container-lowest p-6 shadow-ambient md:p-10">
        <Link href="/profile" className="text-sm font-bold text-secondary-container hover:text-secondary">
          Back to Profile
        </Link>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-primary/55">
          Effective April 23, 2026
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-primary md:text-5xl">
          Data Deletion Instructions
        </h1>
        <p className="mt-4 text-base leading-7 text-primary/70">
          SportBook users can request deletion of personal account data connected to email,
          Google, or Facebook sign-in.
        </p>

        <section className="mt-8 border-t border-primary/10 pt-6">
          <h2 className="text-xl font-extrabold text-primary">How To Request Deletion</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step) => (
              <li key={step} className="rounded-[var(--radius-default)] bg-surface-container-low p-4 text-primary/75">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 border-t border-primary/10 pt-6">
          <h2 className="text-xl font-extrabold text-primary">What May Be Kept</h2>
          <p className="mt-2 leading-7 text-primary/70">
            Some records may be retained when required for fraud prevention, payment disputes,
            accounting, legal compliance, booking history integrity, or active support cases.
            Retained records will be limited and protected.
          </p>
        </section>

        <section className="mt-8 border-t border-primary/10 pt-6">
          <h2 className="text-xl font-extrabold text-primary">Support Contact</h2>
          <p className="mt-2 leading-7 text-primary/70">
            Send deletion requests to SportBook support with your account email and preferred
            contact method. Add “Data Deletion Request” to the message subject.
          </p>
        </section>
      </section>
    </main>
  )
}
