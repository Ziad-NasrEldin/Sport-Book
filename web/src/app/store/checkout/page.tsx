"use client"

import { Suspense, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  Circle,
  CheckCircle2,
  Wallet,
  Truck,
  PackageCheck,
  Percent,
  Banknote,
  ShieldCheck,
} from 'lucide-react'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getStoreProductImage } from '@/lib/storeProductMedia'
import { showToast } from '@/lib/toast'

const SHIPPING_FEE = 45

type StoreApiProduct = {
  id: string
  title?: string
  name?: string
  category?: unknown
  price: number
  facility?: unknown
  facilityName?: unknown
  image?: string
  images?: string[]
}

type StoreProductResponse = StoreApiProduct | { data?: StoreApiProduct }

type CreateOrderResponse = {
  id?: string
  data?: {
    id?: string
  }
}

function hasProductData(productData: { data?: StoreApiProduct } | StoreApiProduct): productData is { data: StoreApiProduct } {
  return 'data' in productData && Boolean(productData.data)
}

function unwrapProductResponse(productData: { data?: StoreApiProduct } | StoreApiProduct): StoreApiProduct {
  return hasProductData(productData) ? productData.data : (productData as StoreApiProduct)
}

function StoreCheckoutPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const productId = searchParams.get('product') ?? ''
  const rawQty = Number(searchParams.get('qty') ?? '1')
  const initialQty = Number.isFinite(rawQty) && rawQty > 0 ? Math.floor(rawQty) : 1
  const queryFulfillment = searchParams.get('fulfillment')

  const { data: productData, loading: productLoading, error: productError } = useApiCall<StoreProductResponse>(
    productId ? `/store/products/${productId}` : '',
  )
  const product = useMemo<StoreApiProduct | null>(() => {
    if (!productData) return null
    return unwrapProductResponse(productData)
  }, [productData])

  const [quantity, setQuantity] = useState(initialQty)
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>(
    queryFulfillment === 'delivery' ? 'delivery' : 'pickup',
  )
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cash'>('card')
  const [promoCode, setPromoCode] = useState('')
  const [isPromoApplied, setIsPromoApplied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const createOrderMutation = useApiMutation<CreateOrderResponse, Record<string, unknown>>('/store/orders', 'POST')

  const subtotal = product ? product.price * quantity : 0
  const shipping = deliveryMethod === 'delivery' ? SHIPPING_FEE : 0
  const promoDiscount = isPromoApplied ? Math.round(subtotal * 0.1) : 0
  const total = subtotal + shipping - promoDiscount

  if (productError) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <APIErrorFallback error={productError} onRetry={() => window.location.reload()} />
      </main>
    )
  }

  if (productLoading || !product) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <LoadingSpinner size="lg" />
      </main>
    )
  }

  const handlePlaceOrder = async () => {
    setSubmitting(true)
    try {
      const orderBody: Record<string, unknown> = {
        items: [{ productId: product.id, quantity }],
        fulfillment: deliveryMethod,
      }
      if (deliveryMethod === 'delivery') {
        const addressInputs = document.querySelectorAll<HTMLInputElement>('input[placeholder^="Street"], input[placeholder^="City"], input[placeholder^="Postal"]')
        orderBody.deliveryAddress = Array.from(addressInputs).map((el) => el.value).filter(Boolean).join(', ')
      }
      if (isPromoApplied) {
        orderBody.couponCode = promoCode.trim().toUpperCase()
      }
      const result = await createOrderMutation.mutate(orderBody)
      const orderId = result?.id || result?.data?.id || ''
      router.push(`/store/confirmation?orderId=${encodeURIComponent(orderId)}`)
    } catch {
      showToast('Failed to place order. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-36 md:pb-40 relative">
      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 py-4 md:px-10 lg:px-14 md:py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push(`/store/${product.id}`)
              }
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-lowest transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Store Checkout</h1>
            <p className="text-sm text-primary/60 mt-0.5">Secure payment for sports equipment orders</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-5 md:gap-6 mt-5">
        <div className="space-y-5">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient">
            <h2 className="text-lg md:text-xl font-bold text-primary mb-4">Item Details</h2>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                <Image src={getStoreProductImage(product)} alt={product.title || product.name || 'Store product'} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-lexend uppercase tracking-[0.18em] text-secondary">{stringValue(product.category)}</p>
                <h3 className="text-base md:text-lg font-bold text-primary mt-1 leading-tight">{product.title || product.name || 'Store product'}</h3>
                <p className="text-sm text-primary/65 mt-1">Sold by {stringValue(product.facility || product.facilityName)}</p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-2">
                  <button
                    onClick={() => setQuantity((count) => Math.max(1, count - 1))}
                    className="w-7 h-7 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center font-black text-primary">{quantity}</span>
                  <button
                    onClick={() => setQuantity((count) => count + 1)}
                    className="w-7 h-7 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Delivery Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryMethod('pickup')}
                className={`rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors ${
                  deliveryMethod === 'pickup'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-bold">
                  <PackageCheck className="w-4 h-4" />
                  Pick Up
                </span>
                <p className="text-xs mt-1 opacity-80">Collect from facility desk.</p>
              </button>

              <button
                onClick={() => setDeliveryMethod('delivery')}
                className={`rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors ${
                  deliveryMethod === 'delivery'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-bold">
                  <Truck className="w-4 h-4" />
                  Delivery
                </span>
                <p className="text-xs mt-1 opacity-80">Ships in 2-4 business days.</p>
              </button>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Contact & Shipping</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                defaultValue="Alex Rivera"
                className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3 text-primary outline-none"
                placeholder="Full name"
              />
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3 text-primary outline-none"
                placeholder="Phone number"
              />
              <input
                type="text"
                defaultValue="14 Market Street"
                className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3 text-primary outline-none sm:col-span-2"
                placeholder="Street address"
              />
              <input
                type="text"
                defaultValue="London"
                className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3 text-primary outline-none"
                placeholder="City"
              />
              <input
                type="text"
                defaultValue="NW1 6XE"
                className="bg-surface-container-high rounded-[var(--radius-md)] px-4 py-3 text-primary outline-none"
                placeholder="Postal code"
              />
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-primary">Payment Method</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <CreditCard className="w-4 h-4" />
                  Credit / Debit Card
                </span>
                {paymentMethod === 'card' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                  paymentMethod === 'wallet'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Wallet className="w-4 h-4" />
                  Wallet Balance (850 EGP)
                </span>
                {paymentMethod === 'wallet' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setPaymentMethod('cash')}
                className={`w-full flex items-center justify-between rounded-[var(--radius-md)] px-4 py-3 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/80'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Banknote className="w-4 h-4" />
                  Cash On Delivery
                </span>
                {paymentMethod === 'cash' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient space-y-4 lg:sticky lg:top-28">
            <h2 className="text-lg md:text-xl font-bold text-primary">Order Summary</h2>

            <div className="flex items-center gap-2 bg-surface-container-high rounded-[var(--radius-md)] px-3 py-2.5">
              <Percent className="w-4 h-4 text-primary/60" />
              <input
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Promo code"
                className="flex-1 bg-transparent outline-none text-sm text-primary placeholder:text-primary/45"
              />
              <button
                onClick={() => setIsPromoApplied(promoCode.trim().toUpperCase() === 'SPORT10')}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>

            {promoCode.length > 0 && (
              <p className={`text-xs ${isPromoApplied ? 'text-[#0d7a44]' : 'text-secondary'}`}>
                {isPromoApplied ? 'Promo applied: 10% discount.' : 'Use code SPORT10 for 10% off.'}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Item Subtotal</span>
                <span className="font-lexend font-bold text-primary">{subtotal} EGP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Shipping</span>
                <span className="font-lexend font-bold text-primary">{shipping} EGP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary/70">Discount</span>
                <span className="font-lexend font-bold text-[#0d7a44]">-{promoDiscount} EGP</span>
              </div>
              <div className="h-4 w-[110%] -ml-[5%] border-b-[2px] border-dashed border-primary/10" />
              <div className="flex items-center justify-between">
                <span className="text-xl font-extrabold text-primary">Total</span>
                <span className="text-xl font-black font-lexend text-primary">{total} EGP</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-primary/70 bg-surface-container-high rounded-full px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              SSL encrypted checkout session
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-gradient-to-br from-secondary to-secondary-container text-white font-extrabold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </article>
        </aside>
      </section>
    </main>
  )
}

export default function StoreCheckoutPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <main className="w-full min-h-screen bg-surface px-5 md:px-10 lg:px-14 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg font-bold text-primary">Loading checkout...</p>
            </div>
          </main>
        }
      >
        <StoreCheckoutPageContent />
      </Suspense>
    </AuthGuard>
  )
}
