import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <main className="w-full min-h-screen bg-surface relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-container/12 blur-[110px]" />
        <div className="absolute bottom-0 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
      </div>

      <section className="px-5 py-8 md:px-10 lg:px-14">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 text-primary/75 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </section>

      <section className="px-5 pb-12 md:px-10 lg:px-14">
        <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient border border-primary/5">
          <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-primary">Forgot Password</h1>
          <p className="mt-2 text-sm md:text-base text-primary/60">
            Enter your account email and we will send a reset link.
          </p>

          <form className="mt-6 space-y-4">
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

            <button
              type="button"
              className="w-full h-12 rounded-[var(--radius-full)] bg-secondary-container text-white font-extrabold tracking-wide hover:opacity-90 transition-all"
            >
              Send Reset Link
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-primary/65">
            Remembered your password?{' '}
            <Link href="/auth/sign-in" className="font-bold text-secondary-container hover:text-secondary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
