export type StoreCartItem = {
  productId: string
  quantity: number
  fulfillment: 'pickup' | 'delivery'
}

const STORAGE_KEY = 'sportbook-store-cart-v1'
export const STORE_CART_UPDATED_EVENT = 'sportbook-store-cart-updated'

function normalizeCart(items: StoreCartItem[]): StoreCartItem[] {
  const deduped = new Map<string, StoreCartItem>()

  items.forEach((item) => {
    if (!item.productId) return

    deduped.set(item.productId, {
      productId: item.productId,
      quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? Math.floor(item.quantity) : 1,
      fulfillment: item.fulfillment === 'delivery' ? 'delivery' : 'pickup',
    })
  })

  return Array.from(deduped.values())
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

function dispatchCartUpdated(items: StoreCartItem[]) {
  if (!canUseStorage()) return

  window.dispatchEvent(
    new CustomEvent(STORE_CART_UPDATED_EVENT, {
      detail: items,
    }),
  )
}

export function getStoreCartItems(): StoreCartItem[] {
  if (!canUseStorage()) return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as StoreCartItem[]
    return normalizeCart(Array.isArray(parsed) ? parsed : [])
  } catch {
    return []
  }
}

export function setStoreCartItems(items: StoreCartItem[]) {
  if (!canUseStorage()) return

  const normalized = normalizeCart(items)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  dispatchCartUpdated(normalized)
}

export function addStoreCartItem(item: StoreCartItem) {
  const cart = getStoreCartItems()
  const existing = cart.find((entry) => entry.productId === item.productId)

  if (existing) {
    existing.quantity = item.quantity
    existing.fulfillment = item.fulfillment
    setStoreCartItems(cart)
    return
  }

  setStoreCartItems([...cart, item])
}

export function updateStoreCartItemQuantity(productId: string, quantity: number) {
  const cart = getStoreCartItems()
  const next = cart.map((item) =>
    item.productId === productId
      ? {
          ...item,
          quantity: Math.max(1, Math.floor(quantity)),
        }
      : item,
  )

  setStoreCartItems(next)
}

export function removeStoreCartItem(productId: string) {
  const cart = getStoreCartItems()
  setStoreCartItems(cart.filter((item) => item.productId !== productId))
}

export function clearStoreCart() {
  setStoreCartItems([])
}

export function getStoreCartCount() {
  return getStoreCartItems().reduce((sum, item) => sum + item.quantity, 0)
}