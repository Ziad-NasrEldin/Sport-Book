"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CircleCheck,
  CircleDashed,
  Minus,
  Plus,
  MapPin,
  Store,
  ShoppingCart,
  PackageCheck,
  Truck,
} from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { addStoreCartItem, getStoreCartItems } from '@/lib/storeCart'

export default function ProductDetailsPage() {
  const router = useRouter()
  const params = useParams<{ productId: string }>()
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId

  const { data: productData, loading, error } = useApiCall(`/store/products/${productId}`)
  const product = productData?.data || productData

  const [quantity, setQuantity] = useState(1)
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  const [isAddedToCart, setIsAddedToCart] = useState(() =>
    getStoreCartItems().some((item) => item.productId === productId),
  )

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low flex items-center justify-center px-5">
        <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
      </main>
    )
  }

  if (loading || !product) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low flex items-center justify-center px-5">
        <LoadingSpinner size="lg" />
      </main>
    )
  }

  const subtotal = product.price * quantity

  const handleAddToCart = () => {
    addStoreCartItem({
      productId: product.id,
      quantity,
      fulfillment,
    })

    setIsAddedToCart(true)
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-primary-container/10 blur-[95px]" />
        <div className="absolute bottom-10 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/store')
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-primary hover:bg-surface-container-lowest transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Product Details</h1>
            <p className="text-sm md:text-base text-primary/60 mt-1">Sold by verified facilities</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-5 md:space-y-6 pb-2">
        <article className="bg-surface-container-lowest rounded-[var(--radius-xl)] overflow-hidden shadow-ambient">
          <div className="relative w-full aspect-[4/3]">
            <Image src={product.image} alt={product.title || product.name} fill className="object-cover" />

            <span
              className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-lexend font-bold uppercase tracking-widest ${
                product.status === 'In Stock'
                  ? 'bg-[#d8f7e8] text-[#0d7a44]'
                  : 'bg-[#ffe8cc] text-[#8c4a00]'
              }`}
            >
              {product.status === 'In Stock' ? <CircleCheck className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
              {product.status}
            </span>
          </div>

          <div className="p-5 md:p-6">
            <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-secondary">{stringValue(product.category)}</p>
            <h2 className="text-xl md:text-3xl font-extrabold text-primary mt-2 leading-tight">{product.title || product.name}</h2>

            <p className="mt-3 text-sm md:text-base text-primary/75">{product.description}</p>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[10px] font-lexend uppercase tracking-widest text-primary/45">Price</p>
                <p className="text-3xl md:text-4xl font-black text-primary">{product.price} EGP</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-2">
                <button
                  onClick={() => setQuantity((count) => Math.max(1, count - 1))}
                  className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-surface transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="min-w-8 text-center font-black text-primary">{quantity}</span>

                <button
                  onClick={() => setQuantity((count) => count + 1)}
                  className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-surface transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient space-y-4">
          <h3 className="text-lg md:text-xl font-bold text-primary">Fulfillment</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setFulfillment('pickup')}
              className={`rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors ${
                fulfillment === 'pickup'
                  ? 'bg-tertiary-fixed text-primary'
                  : 'bg-surface-container-high text-primary/80'
              }`}
            >
              <span className="inline-flex items-center gap-2 font-bold">
                <PackageCheck className="w-4 h-4" />
                Pick Up At Facility
              </span>
              <p className="text-xs mt-1 opacity-80">Ready the same day for most products.</p>
            </button>

            <button
              onClick={() => setFulfillment('delivery')}
              className={`rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors ${
                fulfillment === 'delivery'
                  ? 'bg-tertiary-fixed text-primary'
                  : 'bg-surface-container-high text-primary/80'
              }`}
            >
              <span className="inline-flex items-center gap-2 font-bold">
                <Truck className="w-4 h-4" />
                Home Delivery
              </span>
              <p className="text-xs mt-1 opacity-80">Estimated delivery in 2-4 days.</p>
            </button>
          </div>

          <div className="bg-surface-container-high rounded-[var(--radius-md)] p-4 space-y-1">
            <p className="text-[10px] font-lexend uppercase tracking-widest text-primary/45">Sold By</p>
            <p className="font-bold text-primary inline-flex items-center gap-2">
              <Store className="w-4 h-4" />
              {stringValue(product.facility || product.facilityName)}
            </p>
            <p className="text-sm text-primary/70 inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary/45" />
              {stringValue(product.location)}
            </p>
          </div>

          <div className="pt-1">
            <p className="text-[10px] font-lexend uppercase tracking-widest text-primary/45">Subtotal</p>
            <p className="text-2xl font-black text-primary">{subtotal} EGP</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold transition-colors ${
                isAddedToCart
                  ? 'bg-[#d8f7e8] text-[#0d7a44]'
                  : 'bg-primary-container text-surface-container-lowest hover:bg-primary'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddedToCart ? 'Update Cart' : 'Add To Cart'}
            </button>

            <Link
              href={`/store/checkout?product=${encodeURIComponent(product.id)}&qty=${quantity}&fulfillment=${fulfillment}`}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-5 py-3 rounded-full bg-secondary-container text-on-secondary-container font-bold hover:opacity-90 transition-opacity"
            >
              Buy Now
            </Link>
          </div>
        </article>
      </section>

      <FloatingNav />
    </main>
  )
}