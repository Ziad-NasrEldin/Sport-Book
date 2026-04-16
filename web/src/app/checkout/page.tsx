'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle2, Circle, Banknote } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/book')
  }

  return (
    <main className="w-full bg-surface min-h-screen pb-36 relative">
      {/* Top Navigation */}
      <header className="flex justify-between items-center w-full px-5 py-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl md:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-black/5 transition-colors active:scale-95 duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-primary stroke-[2]" />
          </button>
          <h1 className="text-primary font-extrabold tracking-tight text-xl">
            Checkout
          </h1>
        </div>
      </header>

      <div className="px-5 md:max-w-2xl md:mx-auto md:px-0">
        {/* Court Summary Card */}
        <section className="bg-surface-container-lowest rounded-[2rem] shadow-ambient overflow-hidden mt-2 mb-8">
          <div className="relative w-full h-[200px]">
            <Image
              src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
              alt="Tennis Court"
              fill
              className="object-cover object-bottom"
            />
          </div>
          <div className="p-6">
            <h3 className="text-[10px] font-lexend font-bold uppercase tracking-[0.2em] text-secondary mb-1">
              The Regent&apos;s Park
            </h3>
            <h2 className="text-2xl font-extrabold text-primary mb-6">
              Court 04 –<br />Championship
            </h2>

            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/40 mb-1">
                  Date
                </p>
                <p className="font-semibold text-primary">Oct 24, 2023</p>
              </div>
              <div>
                <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/40 mb-1">
                  Time
                </p>
                <p className="font-semibold text-primary">09:00 AM</p>
              </div>
              <div>
                <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/40 mb-1">
                  Duration
                </p>
                <p className="font-semibold text-primary">1 hour</p>
              </div>
              <div>
                <p className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/40 mb-1">
                  Price
                </p>
                <p className="font-bold text-secondary font-lexend">400 EGP</p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="mb-8">
          <h3 className="text-lg font-bold text-primary mb-4">Payment Method</h3>
          <div className="flex flex-col gap-3">
            {/* Credit/Debit Card - Selected */}
            <button className="flex items-center justify-between w-full p-4 md:p-5 rounded-3xl bg-tertiary-fixed shadow-sm active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-4">
                <CreditCard className="w-6 h-6 text-primary" />
                <span className="font-semibold text-primary">Credit/Debit Card</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-primary fill-primary text-tertiary-fixed" />
            </button>

            {/* Apple Pay - Unselected */}
            <button className="flex items-center justify-between w-full p-4 md:p-5 rounded-3xl bg-surface-container-lowest shadow-ambient active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-4 text-primary/70">
                <Smartphone className="w-5 h-5" />
                <span className="font-medium text-primary">Apple Pay</span>
              </div>
              <Circle className="w-6 h-6 text-primary/20" />
            </button>

            {/* Wallet Balance - Unselected */}
            <button className="flex items-center justify-between w-full p-4 md:p-5 rounded-3xl bg-surface-container-lowest shadow-ambient active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-4 text-primary/70">
                <Wallet className="w-5 h-5" />
                <div className="text-left">
                  <span className="font-medium text-primary block">Wallet Balance</span>
                  <span className="text-[10px] font-lexend font-medium text-primary/40">850.00 EGP Available</span>
                </div>
              </div>
              <Circle className="w-6 h-6 text-primary/20" />
            </button>
          </div>
        </section>

        {/* Promo Code */}
        <section className="mb-8">
          <h3 className="text-lg font-bold text-primary mb-4">Promo Code</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-surface-container-high rounded-full overflow-hidden px-5 py-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input 
                type="text" 
                placeholder="Enter code"
                className="w-full bg-transparent border-none outline-none text-primary placeholder:text-primary/30 font-medium"
              />
            </div>
            <button className="bg-primary text-white font-bold tracking-wide px-8 py-4 rounded-full active:scale-95 transition-transform">
              APPLY
            </button>
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-surface-container-low rounded-[2rem] p-6 mb-4 relative overflow-hidden">
          <h3 className="text-lg font-bold text-primary mb-4">Order Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-primary/70 font-medium">Subtotal</span>
              <span className="font-lexend font-bold text-primary">400.00 EGP</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-primary/70 font-medium">Service Fee</span>
              <span className="font-lexend font-bold text-primary">15.00 EGP</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-primary/70 font-medium">VAT 14%</span>
              <span className="font-lexend font-bold text-primary">56.00 EGP</span>
            </div>
          </div>
          
          {/* Faux divider using a pseudo-element rather than a 1px border so it feels "printed" */}
          <div className="h-4 w-[110%] -ml-[5%] border-b-[2px] border-dashed border-primary/10 mb-6" />

          <div className="flex justify-between items-center">
            <span className="text-xl font-extrabold text-primary">Total</span>
            <span className="text-xl font-black font-lexend text-primary">471.00 EGP</span>
          </div>
        </section>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-5 md:p-8 bg-surface/80 backdrop-blur-xl z-50">
        <div className="w-full max-w-2xl mx-auto">
          <Link href="/confirmation" className="w-full block">
            <button className="w-full bg-gradient-to-br from-secondary to-secondary-container text-white py-4 md:py-5 px-10 rounded-full font-extrabold text-lg md:text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_-5px_rgba(253,139,0,0.35)]">
              Pay Now
              <Banknote className="w-6 h-6 stroke-[2]" />
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
