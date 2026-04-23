import Link from 'next/link'

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
    <main className="min-h-screen bg-surface-container-low px-5 py-10 md:px-10">
      <section className="mx-auto max-w-3xl rounded-[var(--radius-lg)] bg-surface-container-lowest p-6 shadow-ambient md:p-10">
        <Link href="/profile" className="text-sm font-bold text-secondary-container hover:text-secondary">
          Back to Profile
        </Link>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-primary/55">
          Effective April 23, 2026
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-primary md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-base leading-7 text-primary/70">
          This policy explains how SportBook handles personal information for players, coaches,
          operators, and admins using our booking platform.
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
          This page is provided as a practical product policy template and should be reviewed by
          qualified legal counsel before public launch.
        </p>
      </section>
    </main>
  )
}
