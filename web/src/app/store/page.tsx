'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Sparkles,
  CircleCheck,
  CircleDashed,
  ShoppingCart,
  X,
  Trash2,
  Minus,
  Plus,
} from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useApiCall } from '@/lib/api/hooks'
import { stringValue } from '@/lib/api/extract'
import { getStoreProductImage } from '@/lib/storeProductMedia'
import {
  STORE_CART_UPDATED_EVENT,
  clearStoreCart,
  getStoreCartItems,
  removeStoreCartItem,
  type StoreCartItem,
  updateStoreCartItemQuantity,
} from '@/lib/storeCart'

type StoreApiProduct = {
  id: string
  title?: string
  name?: string
  category?: unknown
  price: number
  facility?: unknown
  facilityName?: unknown
  location?: unknown
  status?: string
  image?: string
  images?: string[]
}

type CartDetail = {
  item: StoreCartItem
  product: StoreApiProduct
}

export default function StorePage() {
  const { data: productsData, loading, error } = useApiCall<{ data?: StoreApiProduct[] } | StoreApiProduct[]>('/store/products')
  const products = useMemo<StoreApiProduct[]>(
    () => Array.isArray(productsData) ? productsData : (Array.isArray(productsData?.data) ? productsData.data : []),
    [productsData],
  )

  const categoryLabel = (cat: unknown): string => stringValue(cat)

  const productCategories = useMemo(
    () => ['All Items', ...Array.from(new Set(products.map((product) => categoryLabel(product.category))))],
    [products],
  )

  const [activeCategory, setActiveCategory] = useState('All Items')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<StoreCartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const refreshCart = () => {
      setCartItems(getStoreCartItems())
    }

    refreshCart()

    const handleCartUpdated = () => {
      refreshCart()
    }

    window.addEventListener(STORE_CART_UPDATED_EVENT, handleCartUpdated)

    return () => {
      window.removeEventListener(STORE_CART_UPDATED_EVENT, handleCartUpdated)
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => activeCategory === 'All Items' || categoryLabel(product.category) === activeCategory)
      .filter((product) => {
        if (!searchQuery.trim()) return true

        const searchableText = `${product.title || product.name} ${categoryLabel(product.category)} ${stringValue(product.facility || product.facilityName)} ${stringValue(product.location)}`.toLowerCase()
        return searchableText.includes(searchQuery.toLowerCase().trim())
      })
  }, [products, activeCategory, searchQuery])

  const cartDetails = useMemo(
    (): CartDetail[] =>
      cartItems.reduce<CartDetail[]>((entries, item) => {
        const product = products.find((entry) => entry.id === item.productId)
        if (!product) return entries
        entries.push({ item, product })
        return entries
      }, []),
    [cartItems, products],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const cartSubtotal = useMemo(
    () =>
      cartDetails.reduce((sum: number, entry) => {
        return sum + entry.product.price * entry.item.quantity
      }, 0),
    [cartDetails],
  )

  const handleIncreaseQuantity = (productId: string, currentQuantity: number) => {
    updateStoreCartItemQuantity(productId, currentQuantity + 1)
    setCartItems(getStoreCartItems())
  }

  const handleDecreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) return
    updateStoreCartItemQuantity(productId, currentQuantity - 1)
    setCartItems(getStoreCartItems())
  }

  const handleRemoveItem = (productId: string) => {
    removeStoreCartItem(productId)
    setCartItems(getStoreCartItems())
  }

  const handleClearCart = () => {
    clearStoreCart()
    setCartItems([])
  }

  if (error) {
    return (
      <main className="w-full min-h-screen bg-surface-container-low flex items-center justify-center px-5">
        <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-surface-container-low pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      {/* Geometric background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 80px)`,
      }} />
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-[#c3f400]/6 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/4" />

      {/* HERO: Editorial sportswear header */}
      <header className={`relative z-40 bg-[#0a1631] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-[#c3f400]" />
        <div className="absolute bottom-0 right-0 w-1/3 h-2 bg-[#c3f400]" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 pt-10 pb-8 md:px-8 md:pt-14 md:pb-10">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[#c3f400] text-xs font-black uppercase tracking-[0.3em] animate-soft-rise">Verified Facilities</p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.04em] text-white leading-[0.85]">
                STORE
              </h1>
              <p className="text-white/50 text-sm md:text-base max-w-md mt-3 leading-relaxed">
                Premium sports gear sold directly by verified facilities. No middlemen.
              </p>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className={`group flex-none relative w-14 h-14 rounded-full bg-[#c3f400] text-[#0a1631] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(195,244,0,0.5)] active:scale-95 ${mounted ? 'animate-soft-rise' : 'opacity-0'}`}
              style={{ animationDelay: '150ms' }}
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1 bg-white text-[#0a1631] text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className={`relative mt-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type="text"
              placeholder="Search products, facilities, categories..."
              className="w-full bg-white/5 border-l-4 border-[#c3f400] rounded-[var(--radius-lg)] py-5 pl-14 pr-5 text-white placeholder:text-white/40 outline-none focus:bg-white/10 transition-colors duration-200"
            />
          </div>
        </div>
      </header>

      {loading ? (
        <section className="px-5 md:px-6 lg:px-8 max-w-[1440px] mx-auto py-6 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </section>
      ) : (
        <section className="px-5 md:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-5 py-4 md:py-6">
          {/* Category filters */}
          <div className={`flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '250ms' }}>
            {productCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-[#0a1631] text-white'
                    : 'bg-surface-container-high text-primary/70 hover:text-primary hover:bg-surface-container-lowest'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products grid - editorial asymmetric */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => {
              const isFeatured = index === 0 && filteredProducts.length > 1
              return (
              <article
                key={product.id}
                className={`group relative bg-surface-container-lowest rounded-[var(--radius-lg)] overflow-hidden shadow-ambient transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-20px_rgba(0,17,58,0.3)] ${
                  isFeatured ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
                } ${mounted ? 'animate-soft-rise' : 'opacity-0'}`}
                style={{ animationDelay: `${300 + index * 80}ms` }}
              >
                {/* Image */}
                <div className={`relative w-full overflow-hidden ${isFeatured ? 'aspect-[4/3] lg:aspect-[3/4]' : 'aspect-[4/3]'}`}>
                  <Image
                    src={getStoreProductImage(product)}
                    alt={product.title || product.name || 'Store product'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#0a1631]/0 group-hover:bg-[#0a1631]/10 transition-colors duration-300" />

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
                </div>

                {/* Content */}
                <div className="p-4 md:p-5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">{categoryLabel(product.category)}</p>
                      <h3 className={`font-black text-primary leading-tight mt-1 group-hover:translate-x-1 transition-transform duration-300 ${isFeatured ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
                        {product.title || product.name || 'Store product'}
                      </h3>
                    </div>
                    <div className="text-right flex-none">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Price</p>
                      <p className="text-xl md:text-2xl font-black text-[#0a1631]">{product.price}</p>
                      <p className="text-xs font-bold text-primary/50">EGP</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20">
                    <p className="font-bold text-primary text-sm">{stringValue(product.facility || product.facilityName)}</p>
                    <p className="inline-flex items-center gap-1.5 text-xs text-primary/60 mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-none" />
                      {stringValue(product.location)}
                    </p>
                  </div>

                  <Link
                    href={`/store/${product.id}`}
                    className="block w-full text-center py-3 rounded-full bg-[#0a1631] text-white font-black text-sm uppercase tracking-wider hover:bg-[#c3f400] hover:text-[#0a1631] active:scale-[0.98] transition-all duration-200"
                  >
                    View Item
                  </Link>
                </div>
              </article>
            )
            })}

            {filteredProducts.length === 0 && !loading && (
              <div className="md:col-span-2 lg:col-span-4 bg-surface-container-high rounded-[var(--radius-lg)] px-8 py-6 text-center">
                <Sparkles className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <p className="text-2xl font-black text-primary">No matching products</p>
                <p className="text-sm text-primary/60 mt-2">Try another category or search term.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cart sidebar */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-[90] bg-[#0a1631]/60 backdrop-blur-sm flex justify-end"
          onClick={() => setIsCartOpen(false)}
        >
          <aside
            className="w-full max-w-md h-full bg-white flex flex-col rounded-[var(--radius-xl)] shadow-[0_0_60px_-20px_rgba(0,17,58,0.4)]"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="px-6 py-5 border-b-2 border-[#0a1631] flex items-center justify-between bg-[#0a1631]">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">My Cart</h2>
                <p className="text-xs text-white/60 font-bold">{cartCount} item(s)</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-[#c3f400] hover:text-[#0a1631] transition-colors duration-200"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartDetails.length === 0 && (
                <div className="h-full flex items-center justify-center text-center px-4">
                  <div>
                    <ShoppingCart className="w-16 h-16 text-primary/15 mx-auto mb-4" />
                    <p className="text-lg font-black text-primary">Your cart is empty</p>
                    <p className="text-sm text-primary/60 mt-1">Add items from product details to see them here.</p>
                  </div>
                </div>
              )}

              {cartDetails.map(({ item, product }) => (
                <article key={item.productId} className="bg-surface-container-high p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-[var(--radius-default)] overflow-hidden shrink-0 bg-surface-container-lowest">
                      <Image src={getStoreProductImage(product)} alt={product.title || product.name || 'Store product'} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-primary leading-tight">{product.title || product.name || 'Store product'}</h3>
                      <p className="text-xs text-primary/50 mt-0.5">{stringValue(product.facility || product.facilityName)}</p>
                      <p className="text-lg font-black text-[#0a1631] mt-1">{product.price * item.quantity} EGP</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-1 bg-surface-container-lowest">
                      <button
                        onClick={() => handleDecreaseQuantity(item.productId, item.quantity)}
                        className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-[#0a1631] hover:text-white transition-colors duration-200"
                        aria-label="Decrease cart quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-black text-primary">{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.productId, item.quantity)}
                        className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-[#0a1631] hover:text-white transition-colors duration-200"
                        aria-label="Increase cart quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/store/checkout?product=${encodeURIComponent(item.productId)}&qty=${item.quantity}&fulfillment=${item.fulfillment}`}
                        className="px-4 py-2 rounded-full bg-[#0a1631] text-white text-xs font-black uppercase tracking-wider hover:bg-[#c3f400] hover:text-[#0a1631] transition-colors duration-200"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Checkout
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="w-9 h-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors duration-200"
                        aria-label="Remove cart item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="p-5 border-t-2 border-[#0a1631] space-y-4 bg-surface-container-lowest">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-primary/70 uppercase tracking-wider">Subtotal</span>
                <span className="text-3xl font-black text-[#0a1631]">{cartSubtotal} EGP</span>
              </div>

              <button
                onClick={handleClearCart}
                disabled={cartDetails.length === 0}
                className="w-full py-3 rounded-full bg-surface-container-high text-primary font-black text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500 hover:text-white transition-colors duration-200"
              >
                Clear Cart
              </button>
            </footer>
          </aside>
        </div>
      )}

      <FloatingNav />
    </main>
  )
}
