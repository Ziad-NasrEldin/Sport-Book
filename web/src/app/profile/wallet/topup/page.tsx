'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Circle,
  CheckCircle2,
} from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { AuthGuard } from '@/components/auth/AuthGuard'

const quickAmounts = [100, 200, 300, 500, 800, 1000]

type PaymentMethod = 'card' | 'apple-pay' | 'wallet'

export default function WalletTopUpPage() {
  return (
    <AuthGuard>
      <WalletTopUpPageContent />
    </AuthGuard>
  )
}

function WalletTopUpPageContent() {
  const router = useRouter()
  const { data: walletData, loading: walletLoading, error: walletError, refetch: refetchWallet } = useApiCall<any>('/users/me/wallet')
  const [selectedAmount, setSelectedAmount] = useState<number>(200)
  const [customAmount, setCustomAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const wallet = (!walletData || Array.isArray(walletData)) ? {} : (walletData.data && typeof walletData.data === 'object' && !Array.isArray(walletData.data) ? walletData.data : walletData)

  const activeAmount = useMemo(() => {
    const parsedCustom = Number(customAmount)
    if (!Number.isNaN(parsedCustom) && parsedCustom > 0) {
      return parsedCustom
    }
    return selectedAmount
  }, [customAmount, selectedAmount])

  const fee = useMemo(() => Number((activeAmount * 0.015).toFixed(2)), [activeAmount])
  const total = useMemo(() => Number((activeAmount + fee).toFixed(2)), [activeAmount, fee])

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/profile')
  }

  const handleConfirmTopUp = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const intent = await api.post('/payments/intent', {
        amount: total,
        paymentMethod: 'WALLET_TOPUP',
      })

      if (intent?.clientSecret || intent?.id) {
        await api.post('/payments/process', {
          paymentIntentId: intent.id || intent.paymentIntentId,
          paymentMethod: selectedMethod === 'apple-pay' ? 'APPLE_PAY' : selectedMethod === 'wallet' ? 'SAVED_CARD' : 'CARD',
          amount: total,
        })
      }

      refetchWallet()
      router.push('/profile/wallet')
    } catch {
      setSubmitError('Payment failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (walletError) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans flex items-center justify-center">
        <APIErrorFallback error={walletError} onRetry={refetchWallet} />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-32 font-sans relative">
      {/* HERO */}
      <section className="relative w-full h-[35vh] md:h-[42vh] flex flex-col justify-end overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
        <div className="absolute inset-0 bg-primary" />
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
        />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 pb-8 md:pb-12">
          <div className="flex items-end gap-4 md:gap-5">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="w-12 h-12 rounded-[1rem] bg-tertiary-fixed text-primary flex items-center justify-center flex-shrink-0 hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-white">
              <h1 className="font-display text-4xl md:text-6xl uppercase font-bold tracking-tighter leading-[0.85]">Top Up Wallet</h1>
              <p className="text-sm md:text-base font-sans font-medium text-white/70 mt-2">Add funds to your SportBook wallet</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 md:px-8 pt-10 md:pt-16 md:max-w-4xl md:mx-auto flex flex-col gap-6 md:gap-8">
        {/* Balance Card */}
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50">Current Balance</p>
              <h2 className="font-display text-6xl md:text-7xl font-bold text-primary tracking-tighter leading-none mt-2">
                {walletLoading ? '...' : (wallet.balance ?? 0)} <span className="text-3xl text-primary/40">EGP</span>
              </h2>
            </div>
            <div className="w-14 h-14 rounded-[1rem] bg-primary/5 flex items-center justify-center text-primary">
              <Wallet className="w-7 h-7" />
            </div>
          </div>

          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50 mb-3">Quick Amounts</p>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {quickAmounts.map((amount) => {
              const isSelected = customAmount === '' && selectedAmount === amount

              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setCustomAmount('')
                    setSelectedAmount(amount)
                  }}
                  className={`rounded-[2rem] px-2 py-3.5 md:py-4 text-center font-sans font-bold text-sm md:text-base transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-[0_4px_0_0_#00113a]'
                      : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
                  }`}
                >
                  {amount} EGP
                </button>
              )
            })}
          </div>

          <div className="mt-6">
            <label htmlFor="custom-amount" className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary/50 block mb-3">
              Custom Amount
            </label>
            <div className="relative">
              <input
                id="custom-amount"
                type="number"
                min={1}
                inputMode="numeric"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                className="w-full h-14 md:h-16 rounded-[2rem] border-2 border-primary/10 bg-surface-container-low px-6 pr-20 text-primary font-sans font-semibold text-lg outline-none focus:border-primary transition-colors"
              />
              <span className="absolute inset-y-0 right-6 flex items-center text-primary/40 text-sm font-sans font-bold uppercase tracking-widest">EGP</span>
            </div>
          </div>
        </article>

        {/* Payment Method */}
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in animation-delay-100">
          <h3 className="font-display text-2xl md:text-3xl uppercase font-bold text-primary tracking-tight mb-6">Payment Method</h3>

          <div className="space-y-3 md:space-y-4">
            {[
              { id: 'card' as PaymentMethod, icon: CreditCard, label: 'Credit Card' },
              { id: 'apple-pay' as PaymentMethod, icon: Smartphone, label: 'Apple Pay' },
              { id: 'wallet' as PaymentMethod, icon: Wallet, label: 'Saved Wallet Card' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full rounded-[2rem] p-4 md:p-5 flex items-center justify-between transition-all ${
                  selectedMethod === method.id
                    ? 'bg-primary text-white shadow-[0_4px_0_0_#00113a]'
                    : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
                }`}
              >
                <span className="flex items-center gap-4 font-sans font-bold">
                  <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center ${selectedMethod === method.id ? 'bg-white/10' : 'bg-primary/5'}`}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  {method.label}
                </span>
                {selectedMethod === method.id ? <CheckCircle2 className="w-6 h-6 text-tertiary-fixed" /> : <Circle className="w-6 h-6 text-primary/30" />}
              </button>
            ))}
          </div>
        </article>

        {/* Summary */}
        <article className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-10 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in animation-delay-200">
          <h3 className="font-display text-2xl md:text-3xl uppercase font-bold text-primary tracking-tight mb-6">Summary</h3>

          <div className="space-y-3 text-sm md:text-base font-sans">
            <div className="flex items-center justify-between text-primary/70">
              <span>Top-up amount</span>
              <span className="font-bold text-primary">{activeAmount.toFixed(2)} EGP</span>
            </div>
            <div className="flex items-center justify-between text-primary/70">
              <span>Processing fee (1.5%)</span>
              <span className="font-bold text-primary">{fee.toFixed(2)} EGP</span>
            </div>
            <div className="h-px bg-primary/10 my-2" />
            <div className="flex items-center justify-between text-primary">
              <span className="font-bold uppercase tracking-wider text-xs">Total charge</span>
              <span className="font-display text-3xl md:text-4xl font-bold tracking-tight">{total.toFixed(2)} EGP</span>
            </div>
          </div>

          {submitError && (
            <div className="mt-5 bg-red-500/10 rounded-[1.5rem] px-5 py-4 text-sm text-red-500 font-sans font-bold">
              {submitError}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirmTopUp}
            disabled={submitting}
            className="w-full mt-6 py-4 bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-sm rounded-[2rem] shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px] disabled:opacity-60"
          >
            {submitting ? 'Processing...' : 'Confirm Top Up'}
          </button>

          <p className="mt-4 inline-flex items-center gap-2 text-xs font-sans text-primary/50">
            <ShieldCheck className="w-4 h-4" />
            Secured payment powered by encrypted checkout.
          </p>

          <Link
            href="/profile"
            className="block w-full mt-3 py-3 text-center text-sm font-sans font-bold rounded-[2rem] bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </Link>
        </article>
      </section>

      <FloatingNav />
    </main>
  )
}
