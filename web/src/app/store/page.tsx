"use client"

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
import {
  STORE_CART_UPDATED_EVENT,
  clearStoreCart,
  getStoreCartItems,
  removeStoreCartItem,
  type StoreCartItem,
  updateStoreCartItemQuantity,
} from '@/lib/storeCart'

export default function StorePage() {
  const { data: productsData, loading, error } = useApiCall('/store/products')
  const products: any[] = useMemo(() => Array.isArray(productsData) ? productsData : (Array.isArray(productsData?.data) ? productsData.data : []), [productsData])

  const categoryLabel = (cat: any): string => stringValue(cat)

  const productCategories = useMemo(
    () => ['All Items', ...Array.from(new Set(products.map((product: any) => categoryLabel(product.category))))],
    [products],
  )

  const [activeCategory, setActiveCategory] = useState('All Items')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<StoreCartItem[]>([])

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
      .filter((product: any) => activeCategory === 'All Items' || categoryLabel(product.category) === activeCategory)
      .filter((product: any) => {
        if (!searchQuery.trim()) return true

        const searchableText = `${product.title || product.name} ${categoryLabel(product.category)} ${stringValue(product.facility || product.facilityName)} ${stringValue(product.location)}`.toLowerCase()
        return searchableText.includes(searchQuery.toLowerCase().trim())
      })
  }, [products, activeCategory, searchQuery])

  const cartDetails = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((entry: any) => entry.id === item.productId)
          if (!product) return null
          return { item, product }
        })
        .filter((entry: any) => entry !== null),
    [cartItems, products],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const cartSubtotal = useMemo(
    () =>
      cartDetails.reduce((sum: number, entry: any) => {
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
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-16 -left-20 h-72 w-72 rounded-full bg-primary-container/10 blur-[95px]" />
        <div className="absolute bottom-10 -right-16 h-80 w-80 rounded-full bg-secondary-container/15 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface-container-low/90 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">Facility Store</h1>
            <p className="text-sm md:text-base text-primary/60 mt-1 max-w-[38ch]">Sports gear sold directly by verified facilities</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center hover:bg-surface-container-lowest transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-secondary-container text-primary text-[10px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <span className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-primary text-xs font-lexend font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              New Arrivals
            </span>
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/45" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            type="text"
            placeholder="Search products, facilities, categories..."
            className="w-full bg-surface-container-high rounded-[var(--radius-lg)] py-4 pl-12 pr-4 text-primary placeholder:text-primary/55 outline-none"
          />
        </div>
      </header>

      {loading ? (
        <section className="px-5 md:px-10 lg:px-14 md:max-w-6xl md:mx-auto py-12 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </section>
      ) : (
        <section className="px-5 md:px-10 lg:px-14 md:max-w-6xl md:mx-auto space-y-5 md:space-y-6">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
            {productCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-[12px] font-lexend font-bold uppercase tracking-widest transition-colors ${
                  activeCategory === category
                    ? 'bg-tertiary-fixed text-primary'
                    : 'bg-surface-container-high text-primary/75 hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 pb-2">
            {filteredProducts.map((product: any) => (
              <article key={product.id} className="bg-surface-container-lowest rounded-[var(--radius-lg)] overflow-hidden shadow-ambient">
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

                <div className="p-5">
                  <p className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-secondary">{categoryLabel(product.category)}</p>
                  <h3 className="text-lg md:text-xl font-bold text-primary mt-2 leading-tight">{product.title || product.name}</h3>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                      <p className="text-[10px] font-lexend uppercase tracking-widest text-primary/45">Price</p>
                      <p className="text-2xl font-black text-primary">{product.price} EGP</p>
                    </div>

                    <Link
                      href={`/store/${product.id}`}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-sm hover:opacity-90 transition-opacity text-center"
                    >
                      View Item
                    </Link>
                  </div>

                  <div className="mt-4 text-sm text-primary/70 min-w-0">
                    <p className="font-semibold text-primary break-words">{stringValue(product.facility || product.facilityName)}</p>
                    <p className="inline-flex items-center gap-1.5 mt-1 break-words">
                      <MapPin className="w-4 h-4 text-primary/40" />
                      {stringValue(product.location)}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            {filteredProducts.length === 0 && !loading && (
              <div className="md:col-span-2 xl:col-span-3 bg-surface-container-lowest rounded-[var(--radius-lg)] p-8 text-center shadow-ambient">
                <p className="text-lg font-bold text-primary">No matching products</p>
                <p className="text-sm text-primary/65 mt-1">
                  Try another category or search term to find facility-listed items.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {isCartOpen && (
        <div
          className="fixed inset-0 z-[90] bg-primary/35 backdrop-blur-sm p-4 md:p-6 flex justify-end"
          onClick={() => setIsCartOpen(false)}
        >
          <aside
            className="w-full max-w-md h-full bg-surface-container-lowest rounded-[var(--radius-xl)] shadow-ambient flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-primary">My Cart</h2>
                <p className="text-xs text-primary/60">{cartCount} item(s)</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container-high text-primary flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartDetails.length === 0 && (
                <div className="h-full flex items-center justify-center text-center px-4">
                  <div>
                    <p className="text-lg font-bold text-primary">Your cart is empty</p>
                    <p className="text-sm text-primary/65 mt-1">Add items from product details to see them here.</p>
                  </div>
                </div>
              )}

              {cartDetails.map(({ item, product }: any) => (
                <article key={item.productId} className="bg-surface-container-high rounded-[var(--radius-md)] p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-[var(--radius-default)] overflow-hidden shrink-0">
                      <Image src={product.image} alt={product.title || product.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-primary truncate">{product.title || product.name}</h3>
                      <p className="text-xs text-primary/60 mt-0.5 truncate">{stringValue(product.facility || product.facilityName)}</p>
                      <p className="text-sm font-black text-primary mt-1">{product.price * item.quantity} EGP</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-2 py-1.5">
                      <button
                        onClick={() => handleDecreaseQuantity(item.productId, item.quantity)}
                        className="w-7 h-7 rounded-full bg-surface-container-high text-primary flex items-center justify-center"
                        aria-label="Decrease cart quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-black text-primary">{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(item.productId, item.quantity)}
                        className="w-7 h-7 rounded-full bg-surface-container-high text-primary flex items-center justify-center"
                        aria-label="Increase cart quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/store/checkout?product=${encodeURIComponent(item.productId)}&qty=${item.quantity}&fulfillment=${item.fulfillment}`}
                        className="px-3 py-2 rounded-full bg-primary-container text-surface-container-lowest text-xs font-bold"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Checkout
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center"
                        aria-label="Remove cart item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="p-4 border-t border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary/70">Cart Subtotal</span>
                <span className="text-xl font-black text-primary">{cartSubtotal} EGP</span>
              </div>

              <button
                onClick={handleClearCart}
                disabled={cartDetails.length === 0}
                className="w-full py-2.5 rounded-full bg-surface-container-high text-primary font-bold disabled:opacity-40 disabled:cursor-not-allowed"
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