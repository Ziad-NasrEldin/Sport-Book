'use client'

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
import { getStoreProductImage } from '@/lib/storeProductMedia'
import { addStoreCartItem, getStoreCartItems } from '@/lib/storeCart'
import { useAuth } from '@/lib/auth/useAuth'

export default function ProductDetailsPage() {
  const router = useRouter()
  const params = useParams<{ productId: string }>()
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId
  const { isAuthenticated, requireAuth } = useAuth()

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
    if (!isAuthenticated) {
      requireAuth()
      return
    }
    addStoreCartItem({
      productId: product.id,
      quantity,
      fulfillment,
    })

    setIsAddedToCart(true)
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      {/* Geometric background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px)`,
      }} />
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#c3f400]/6 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/4" />

      {/* HERO: Full-bleed product image */}
      <header className="relative bg-[#0a1631] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#c3f400]" />

        <div className="relative max-w-[1440px] mx-auto px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
          <div className="flex items-center gap-4 pb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back()
                } else {
                  router.push('/store')
                }
              }}
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#c3f400] hover:text-[#0a1631] transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[#c3f400] text-xs font-black uppercase tracking-[0.3em]">Product</p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Details</h1>
            </div>
          </div>
        </div>

        {/* Full-bleed product image */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[50vh]">
          <Image
            src={getStoreProductImage(product)}
            alt={product.title || product.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#0a1631]/20" />

          <span
            className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              product.status === 'In Stock'
                ? 'bg-[#c3f400] text-[#0a1631]'
                : 'bg-white/90 text-[#8c4a00]'
            }`}
          >
            {product.status === 'In Stock' ? <CircleCheck className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
            {product.status}
          </span>

          {/* Price overlay on image */}
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Price</p>
            <p className="text-4xl md:text-6xl font-black text-white leading-none">{product.price} <span className="text-lg md:text-2xl">EGP</span></p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-5 py-4 md:py-6">
        {/* Product info */}
        <article className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">{stringValue(product.category)}</p>
          <h2 className="text-3xl md:text-3xl font-black text-primary leading-tight">{product.title || product.name}</h2>
          <p className="text-base md:text-lg text-primary/70 max-w-2xl leading-relaxed">{product.description}</p>
        </article>

        {/* Quantity selector */}
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">Quantity</span>
          <div className="inline-flex items-center gap-1 bg-surface-container-high">
            <button
              onClick={() => setQuantity((count) => Math.max(1, count - 1))}
              className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-[#0a1631] hover:text-white active:scale-95 transition-all duration-200"
              aria-label="Decrease quantity"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="min-w-12 text-center text-xl font-black text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity((count) => count + 1)}
              className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-[#0a1631] hover:text-white active:scale-95 transition-all duration-200"
              aria-label="Increase quantity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <span className="text-sm font-bold text-primary/60">Subtotal: <span className="text-lg font-black text-[#0a1631]">{subtotal} EGP</span></span>
        </div>

        {/* Fulfillment */}
        <article className="bg-surface-container-lowest p-4 md:p-6 space-y-4">
          <h3 className="text-lg md:text-xl font-black text-primary">Fulfillment</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setFulfillment('pickup')}
              className={`px-5 py-4 rounded-[var(--radius-md)] text-left border-l-4 transition-all duration-200 ${
                fulfillment === 'pickup'
                  ? 'bg-[#0a1631] text-white border-[#c3f400]'
                  : 'bg-surface-container-high text-primary/80 border-transparent hover:border-primary/20'
              }`}
            >
              <span className="inline-flex items-center gap-2 font-black">
                <PackageCheck className="w-5 h-5" />
                Pick Up At Facility
              </span>
              <p className={`text-xs mt-2 ${fulfillment === 'pickup' ? 'text-white/70' : 'text-primary/60'}`}>Ready the same day for most products.</p>
            </button>

            <button
              onClick={() => setFulfillment('delivery')}
              className={`px-5 py-4 rounded-[var(--radius-md)] text-left border-l-4 transition-all duration-200 ${
                fulfillment === 'delivery'
                  ? 'bg-[#0a1631] text-white border-[#c3f400]'
                  : 'bg-surface-container-high text-primary/80 border-transparent hover:border-primary/20'
              }`}
            >
              <span className="inline-flex items-center gap-2 font-black">
                <Truck className="w-5 h-5" />
                Home Delivery
              </span>
              <p className={`text-xs mt-2 ${fulfillment === 'delivery' ? 'text-white/70' : 'text-primary/60'}`}>Estimated delivery in 2-4 days.</p>
            </button>
          </div>

          <div className="bg-surface-container-high rounded-[var(--radius-md)] p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">Sold By</p>
            <p className="font-black text-primary inline-flex items-center gap-2">
              <Store className="w-5 h-5" />
              {stringValue(product.facility || product.facilityName)}
            </p>
            <p className="text-sm text-primary/70 inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary/40" />
              {stringValue(product.location)}
            </p>
          </div>
        </article>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddToCart}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
              isAddedToCart
                ? 'bg-[#c3f400] text-[#0a1631] hover:shadow-[0_12px_24px_-8px_rgba(195,244,0,0.4)]'
                : 'bg-[#0a1631] text-white hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(10,22,49,0.4)]'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {isAddedToCart ? 'Update Cart' : 'Add To Cart'}
          </button>

          <Link
            href={`/store/checkout?product=${encodeURIComponent(product.id)}&qty=${quantity}&fulfillment=${fulfillment}`}
            className="flex-1 inline-flex items-center justify-center py-4 rounded-full bg-surface-container-high text-primary font-black text-sm uppercase tracking-wider hover:bg-[#c3f400] hover:text-[#0a1631] active:scale-[0.98] transition-all duration-200"
          >
            Buy Now
          </Link>
        </div>
      </section>

      <FloatingNav />
    </main>
  )
}
