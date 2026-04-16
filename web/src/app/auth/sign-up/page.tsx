import Link from 'next/link'
import { ArrowLeft, UserRound, Mail, LockKeyhole } from 'lucide-react'

export default function SignUpPage() {
  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px]" />
        <div className="absolute bottom-0 -left-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
      </div>

      <section className="px-5 py-8 md:px-10 lg:px-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </section>

      <section className="px-5 pb-12 md:px-10 lg:px-14">
        <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
          <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary">Create Account</h1>
          <p className="mt-2 text-sm md:text-base text-primary/60">Sign up to unlock fast booking and wallet checkout.</p>

          <form className="space-y-4 mt-6">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Full Name</span>
              <div className="relative">
                <UserRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Email</span>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type="email"
                  placeholder="alex@example.com"
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.14em] text-primary/55">Password</span>
              <div className="relative">
                <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/45" />
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low text-primary outline-none focus:border-primary-container"
                />
              </div>
            </label>

            <button
              type="button"
              className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 transition-all"
            >
              Sign Up
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-primary/35">
            <div className="h-px bg-primary/10 flex-1" />
            <span className="text-[10px] font-lexend uppercase tracking-[0.16em]">Or Continue With</span>
            <div className="h-px bg-primary/10 flex-1" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-white text-primary-container text-sm font-black inline-flex items-center justify-center">
                G
              </span>
              Sign up with Google
            </button>
            <button
              type="button"
              className="w-full h-12 rounded-[var(--radius-default)] bg-surface-container-low text-primary font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white text-sm font-black inline-flex items-center justify-center">
                f
              </span>
              Sign up with Facebook
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-primary/65">
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="font-bold text-secondary-container hover:text-secondary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
