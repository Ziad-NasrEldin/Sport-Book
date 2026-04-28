'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarClock, PackageCheck, ReceiptText, Truck } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useInView } from '@/lib/useInView'

export default function ProfileStorePurchasesPage() {
  return (
    <AuthGuard>
      <ProfileStorePurchasesPageContent />
    </AuthGuard>
  )
}

function ProfileStorePurchasesPageContent() {
  const router = useRouter()
  const { data: ordersData, loading, error, refetch } = useApiCall<any>('/users/me/orders')
  const cardsReveal = useInView({ once: true })

  const orders = Array.isArray(ordersData) ? ordersData : (Array.isArray(ordersData?.data) ? ordersData.data : [])

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push('/profile')
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface flex items-center justify-center px-5">
        <APIErrorFallback error={error} onRetry={refetch} />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative selection:bg-tertiary-fixed selection:text-primary">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-20 h-[30rem] w-[30rem] rounded-full bg-primary-container/5 blur-[120px]" />
        <div className="absolute bottom-[20%] -right-20 h-[25rem] w-[25rem] rounded-full bg-secondary-container/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-5 pt-8 pb-6 md:px-10 lg:px-14 md:pt-12 md:pb-8 flex items-center gap-5 justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleBack}
            className="w-12 h-12 flex items-center justify-center rounded-[1.25rem] bg-white shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] hover:bg-surface-container-low hover:scale-95 transition-all duration-200"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-primary stroke-[2.5]" />
          </button>
          <div className="pt-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary leading-none">Store Purchases</h1>
            <p className="text-[10px] md:text-xs text-primary/60 font-sans font-bold uppercase tracking-[0.2em] mt-1.5">Your orders from facilities</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-4xl md:mx-auto pt-2 flex flex-col gap-6 md:gap-8 pb-12" ref={cardsReveal.ref}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-8 animate-pulse h-56 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]" />
          ))
        ) : !Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-20 animate-fade-in bg-surface-container-lowest rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]">
            <div className="inline-block mb-6 animate-empty-bob">
              <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mx-auto">
                <PackageCheck className="w-10 h-10 text-tertiary-fixed stroke-[2.5]" />
              </div>
            </div>
            <p className="font-display text-3xl uppercase font-medium text-primary tracking-tight leading-none">No store purchases yet</p>
            <p className="text-primary/60 text-[10px] md:text-xs uppercase font-sans font-bold tracking-widest mt-3">Your orders will appear here</p>
          </div>
        ) : (
          orders.map((order: any, i: number) => {
            const statusStyle = order.status === 'DELIVERED' || order.status === 'Delivered'
              ? 'bg-tertiary-fixed text-primary shadow-[0_2px_0_0_#00113a]'
              : order.status === 'PROCESSING' || order.status === 'Processing'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-primary/10 text-primary'

            const statusLabel = order.status === 'DELIVERED' ? 'Delivered'
              : order.status === 'PROCESSING' ? 'Processing'
              : order.status === 'SHIPPED' ? 'Shipped'
              : order.status

            const fulfillment = order.fulfillment || order.fulfillmentType || 'Delivery'
            const price = order.total || order.amount || 0
            const quantity = order.quantity || 1
            const date = order.date || order.createdAt || ''
            const orderId = order.orderId || order.id || ''

            return (
              <article
                key={orderId}
                className="bg-surface-container-lowest rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)]"
                style={{
                  animation: cardsReveal.inView ? `card-stagger 0.45s cubic-bezier(0.22, 1, 0.36, 1) both` : 'none',
                  animationDelay: cardsReveal.inView ? `${i * 80}ms` : '0ms',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="relative h-32 w-32 md:h-36 md:w-36 rounded-[2rem] overflow-hidden shrink-0 shadow-[0_4px_20px_-8px_rgba(0,17,58,0.15)]">
                    <Image src={order.productImage || order.image || 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1200&q=80'} alt={order.productName || order.title || 'Product'} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-secondary-container">{stringValue(order.category || order.productCategory)}</p>
                      <span
                        className={`text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider px-4 py-2 rounded-full animate-badge-pop ${statusStyle}`}
                        style={{ animationDelay: `${i * 80 + 200}ms` }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-display font-medium uppercase tracking-tight text-primary truncate leading-none">{order.productName || order.title || 'Product'}</h3>

                    <div className="mt-4 flex flex-wrap gap-4 text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest text-primary/60">
                      <span className="inline-flex items-center gap-2">
                        <ReceiptText className="w-4 h-4 text-tertiary-fixed stroke-[2.5]" />
                        {orderId}
                      </span>
                      {date && (
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-tertiary-fixed stroke-[2.5]" />
                          {date}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2">
                        {fulfillment === 'Delivery' || fulfillment === 'DELIVERY' ? (
                          <Truck className="w-4 h-4 text-tertiary-fixed stroke-[2.5]" />
                        ) : (
                          <PackageCheck className="w-4 h-4 text-tertiary-fixed stroke-[2.5]" />
                        )}
                        {fulfillment === 'DELIVERY' ? 'Delivery' : fulfillment === 'PICKUP' || fulfillment === 'Pick Up' ? 'Pick Up' : fulfillment}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className={loading ? '' : 'animate-number-pop'} style={!loading ? { animationDelay: `${i * 80 + 300}ms` } : undefined}>
                      <p className="font-display text-4xl md:text-5xl font-bold text-primary tracking-tight leading-none">{price} <span className="text-xl md:text-2xl text-primary/40 font-medium">EGP</span></p>
                      <p className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-tertiary-fixed mt-2">
                        Qty {quantity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t-2 border-primary/5">
                  <Link
                    href={`/store/${order.productId || order.id}`}
                    className="inline-flex items-center justify-center px-6 py-4 rounded-[2rem] bg-surface-container-high text-primary/60 font-sans font-bold uppercase tracking-widest text-[10px] md:text-xs hover:text-primary transition-all border-2 border-transparent hover:border-primary/10 hover:translate-y-[2px]"
                  >
                    View Product
                  </Link>

                  <Link
                    href={`/store/checkout?product=${encodeURIComponent(order.productId || order.id)}&qty=1&fulfillment=${fulfillment === 'PICKUP' || fulfillment === 'Pick Up' ? 'pickup' : 'delivery'}`}
                    className="inline-flex items-center justify-center px-6 py-4 rounded-[2rem] bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-[10px] md:text-xs shadow-[0_4px_0_0_#00113a] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#00113a] active:shadow-none active:translate-y-[4px] transition-all"
                  >
                    Buy Again
                  </Link>
                </div>
              </article>
            )
          })
        )}
      </section>

      <FloatingNav />
    </main>
  )
}
