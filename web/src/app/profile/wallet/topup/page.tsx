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

const quickAmounts = [100, 200, 300, 500, 800, 1000]

type PaymentMethod = 'card' | 'apple-pay' | 'wallet'

export default function WalletTopUpPage() {
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
      <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] font-sans flex items-center justify-center">
        <APIErrorFallback error={walletError} onRetry={refetchWallet} />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary-container/12 blur-[90px]" />
        <div className="absolute bottom-10 -right-10 h-72 w-72 rounded-full bg-secondary-container/18 blur-[110px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Top Up Wallet</h1>
            <p className="text-sm md:text-base text-primary/60">Add funds instantly to book faster</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-4xl md:mx-auto space-y-5 md:space-y-7">
        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 md:p-7 shadow-ambient">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] md:text-xs font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Current Balance</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary mt-1">
                {walletLoading ? '...' : (wallet.balance ?? 0)} EGP
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary-container">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
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
                  className={`rounded-[var(--radius-default)] px-2 py-3 md:py-3.5 text-center font-bold text-sm md:text-base transition-colors ${
                    isSelected
                      ? 'bg-primary-container text-surface-container-lowest'
                      : 'bg-surface-container-low text-primary hover:bg-surface-container-high'
                  }`}
                >
                  {amount} EGP
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            <label htmlFor="custom-amount" className="text-sm md:text-base font-semibold text-primary block mb-2">
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
                className="w-full h-12 md:h-14 rounded-[var(--radius-default)] border border-primary/10 bg-surface-container-low px-4 pr-16 text-primary font-semibold outline-none focus:border-primary-container"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-primary/60 text-sm font-bold">EGP</span>
            </div>
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 md:p-7 shadow-ambient">
          <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-primary mb-4">Payment Method</h3>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`w-full rounded-[var(--radius-default)] p-4 flex items-center justify-between transition-colors border ${
                selectedMethod === 'card'
                  ? 'border-primary-container bg-primary-container/10'
                  : 'border-primary/10 bg-surface-container-low hover:bg-surface-container-high'
              }`}
            >
              <span className="flex items-center gap-3 text-primary font-semibold">
                <CreditCard className="w-5 h-5" />
                Credit Card
              </span>
              {selectedMethod === 'card' ? <CheckCircle2 className="w-5 h-5 text-primary-container" /> : <Circle className="w-5 h-5 text-primary/45" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('apple-pay')}
              className={`w-full rounded-[var(--radius-default)] p-4 flex items-center justify-between transition-colors border ${
                selectedMethod === 'apple-pay'
                  ? 'border-primary-container bg-primary-container/10'
                  : 'border-primary/10 bg-surface-container-low hover:bg-surface-container-high'
              }`}
            >
              <span className="flex items-center gap-3 text-primary font-semibold">
                <Smartphone className="w-5 h-5" />
                Apple Pay
              </span>
              {selectedMethod === 'apple-pay' ? <CheckCircle2 className="w-5 h-5 text-primary-container" /> : <Circle className="w-5 h-5 text-primary/45" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('wallet')}
              className={`w-full rounded-[var(--radius-default)] p-4 flex items-center justify-between transition-colors border ${
                selectedMethod === 'wallet'
                  ? 'border-primary-container bg-primary-container/10'
                  : 'border-primary/10 bg-surface-container-low hover:bg-surface-container-high'
              }`}
            >
              <span className="flex items-center gap-3 text-primary font-semibold">
                <Wallet className="w-5 h-5" />
                Saved Wallet Card
              </span>
              {selectedMethod === 'wallet' ? <CheckCircle2 className="w-5 h-5 text-primary-container" /> : <Circle className="w-5 h-5 text-primary/45" />}
            </button>
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 md:p-7 shadow-ambient">
          <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-primary mb-4">Summary</h3>

          <div className="space-y-2.5 text-sm md:text-base">
            <div className="flex items-center justify-between text-primary/75">
              <span>Top-up amount</span>
              <span className="font-bold text-primary">{activeAmount.toFixed(2)} EGP</span>
            </div>
            <div className="flex items-center justify-between text-primary/75">
              <span>Processing fee (1.5%)</span>
              <span className="font-bold text-primary">{fee.toFixed(2)} EGP</span>
            </div>
            <div className="h-px bg-primary/10 my-2" />
            <div className="flex items-center justify-between text-primary">
              <span className="font-bold">Total charge</span>
              <span className="text-xl md:text-2xl font-black tracking-tight">{total.toFixed(2)} EGP</span>
            </div>
          </div>

          {submitError && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-[var(--radius-md)] px-4 py-3 text-sm text-red-400 font-semibold">
              {submitError}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirmTopUp}
            disabled={submitting}
            className="w-full mt-5 py-4 bg-gradient-to-br from-secondary to-secondary-container text-on-secondary-container font-bold rounded-[var(--radius-full)] shadow-ambient transition-all hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Processing...' : 'Confirm Top Up'}
          </button>

          <p className="mt-3 inline-flex items-center gap-2 text-xs md:text-sm text-primary/60">
            <ShieldCheck className="w-4 h-4" />
            Secured payment powered by encrypted checkout.
          </p>

          <Link
            href="/profile"
            className="block w-full mt-3 py-3 text-center text-sm md:text-base font-bold rounded-[var(--radius-full)] bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </Link>
        </article>
      </section>

      <FloatingNav />
    </main>
  )
}