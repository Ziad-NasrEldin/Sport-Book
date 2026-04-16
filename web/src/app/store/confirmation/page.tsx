"use client"

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, Package, Truck, Store } from 'lucide-react'
import { storeProducts } from '@/lib/storeProducts'

function StoreConfirmationPageContent() {
  const searchParams = useSearchParams()

  const productId = searchParams.get('product') ?? ''
  const quantity = Number(searchParams.get('qty') ?? '1') || 1
  const total = Number(searchParams.get('total') ?? '0') || 0
  const delivery = searchParams.get('delivery') === 'delivery' ? 'delivery' : 'pickup'

  const product = storeProducts.find((item) => item.id === productId)

  return (
    <main className="w-full min-h-screen bg-surface px-5 py-8 md:px-10 lg:px-14 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest rounded-[var(--radius-xl)] p-6 md:p-8 shadow-ambient text-center">
          <div className="w-20 h-20 rounded-full bg-[#d8f7e8] mx-auto flex items-center justify-center mb-5">
            <div className="w-12 h-12 rounded-full bg-[#0d7a44] text-white flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Order Confirmed</h1>
          <p className="text-primary/70 mt-2">Your store purchase is now being processed.</p>

          <div className="mt-6 bg-surface-container-high rounded-[var(--radius-lg)] p-4 text-left space-y-3">
            <p className="text-sm text-primary/75">
              <span className="font-bold text-primary">Item:</span> {product?.title ?? 'Store Product'}
            </p>
            <p className="text-sm text-primary/75">
              <span className="font-bold text-primary">Quantity:</span> {quantity}
            </p>
            <p className="text-sm text-primary/75">
              <span className="font-bold text-primary">Total Paid:</span> {total} EGP
            </p>
            <p className="text-sm text-primary/75 inline-flex items-center gap-2">
              {delivery === 'delivery' ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              <span>
                <span className="font-bold text-primary">Fulfillment:</span> {delivery === 'delivery' ? 'Delivery' : 'Pick Up'}
              </span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/store"
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-primary-container text-surface-container-lowest font-bold"
            >
              <Store className="w-4 h-4" />
              Back To Store
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center py-3 px-5 rounded-full bg-secondary-container text-on-secondary-container font-bold"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function StoreConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full min-h-screen bg-surface px-5 py-8 md:px-10 lg:px-14 md:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg font-bold text-primary">Loading confirmation...</p>
          </div>
        </main>
      }
    >
      <StoreConfirmationPageContent />
    </Suspense>
  )
}