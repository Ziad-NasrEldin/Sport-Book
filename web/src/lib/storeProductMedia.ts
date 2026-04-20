const STORE_PRODUCT_FALLBACK_IMAGE = '/favicon.ico'

export function getStoreProductImage(product: unknown): string {
  if (!product || typeof product !== 'object') {
    return STORE_PRODUCT_FALLBACK_IMAGE
  }

  const candidate = product as {
    image?: unknown
    images?: unknown
  }

  if (typeof candidate.image === 'string' && candidate.image.trim()) {
    return candidate.image.trim()
  }

  if (Array.isArray(candidate.images)) {
    const firstValidImage = candidate.images.find(
      (image): image is string => typeof image === 'string' && image.trim().length > 0,
    )

    if (firstValidImage) {
      return firstValidImage.trim()
    }
  }

  return STORE_PRODUCT_FALLBACK_IMAGE
}
