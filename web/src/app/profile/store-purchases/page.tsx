'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CalendarClock, PackageCheck, ReceiptText, Truck, AlertCircle } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { AuthGuard } from '@/components/auth/AuthGuard'

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
      <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative flex items-center justify-center">
        <APIErrorFallback error={error} onRetry={refetch} />
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
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Store Purchases</h1>
            <p className="text-sm md:text-base text-primary/60">Your orders and purchase history from facilities</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-4 md:space-y-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient animate-pulse h-48" />
          ))
        ) : !Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-primary/60 text-lg font-semibold">No store purchases yet</p>
            <p className="text-primary/40 text-sm mt-2">Your orders will appear here</p>
          </div>
        ) : (
          orders.map((order: any) => {
            const statusStyle = order.status === 'DELIVERED' || order.status === 'Delivered'
              ? 'bg-[#d8f7e8] text-[#0d7a44]'
              : order.status === 'PROCESSING' || order.status === 'Processing'
                ? 'bg-[#ffe8cc] text-[#8c4a00]'
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
                className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-4 md:p-5 shadow-ambient"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                    <Image src={order.productImage || order.image || 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1200&q=80'} alt={order.productName || order.title || 'Product'} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-[10px] font-lexend uppercase tracking-[0.18em] text-secondary">{stringValue(order.category || order.productCategory)}</p>
                      <span
                        className={`text-[10px] font-lexend font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyle}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-primary truncate">{order.productName || order.title || 'Product'}</h3>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-primary/70">
                      <span className="inline-flex items-center gap-1.5">
                        <ReceiptText className="w-3.5 h-3.5" />
                        {orderId}
                      </span>
                      {date && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="w-3.5 h-3.5" />
                          {date}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        {fulfillment === 'Delivery' || fulfillment === 'DELIVERY' ? (
                          <Truck className="w-3.5 h-3.5" />
                        ) : (
                          <PackageCheck className="w-3.5 h-3.5" />
                        )}
                        {fulfillment === 'DELIVERY' ? 'Delivery' : fulfillment === 'PICKUP' || fulfillment === 'Pick Up' ? 'Pick Up' : fulfillment}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-2xl md:text-3xl font-black text-primary">{price} EGP</p>
                    <p className="text-xs font-lexend uppercase tracking-widest text-primary/45">
                      Qty {quantity}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    href={`/store/${order.productId || order.id}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-surface-container-high text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
                  >
                    View Product
                  </Link>

                  <Link
                    href={`/store/checkout?product=${encodeURIComponent(order.productId || order.id)}&qty=1&fulfillment=${fulfillment === 'PICKUP' || fulfillment === 'Pick Up' ? 'pickup' : 'delivery'}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-primary-container text-surface-container-lowest font-bold text-sm hover:bg-primary transition-colors"
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