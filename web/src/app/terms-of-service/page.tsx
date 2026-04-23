import Link from 'next/link'

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
    <main className="min-h-screen bg-surface-container-low px-5 py-10 md:px-10">
      <section className="mx-auto max-w-3xl rounded-[var(--radius-lg)] bg-surface-container-lowest p-6 shadow-ambient md:p-10">
        <Link href="/profile" className="text-sm font-bold text-secondary-container hover:text-secondary">
          Back to Profile
        </Link>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-primary/55">
          Effective April 23, 2026
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-primary md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-base leading-7 text-primary/70">
          These terms describe rules for using SportBook services across player, coach, operator,
          and admin experiences.
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-primary/10 pt-6">
              <h2 className="text-xl font-extrabold text-primary">{section.title}</h2>
              <p className="mt-2 leading-7 text-primary/70">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 rounded-[var(--radius-default)] bg-surface-container-low p-4 text-sm leading-6 text-primary/65">
          This page is provided as a practical product terms template and should be reviewed by
          qualified legal counsel before public launch.
        </p>
      </section>
    </main>
  )
}
