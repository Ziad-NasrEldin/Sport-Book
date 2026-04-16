import type { MetadataRoute } from 'next'
import { coaches } from '@/lib/coaches'
import { storeProducts } from '@/lib/storeProducts'

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

type PublicRouteConfig = {
  path: string
  priority: number
  changeFrequency: ChangeFrequency
}

const DEFAULT_SITE_URL = 'http://localhost:3000'

const publicStaticRoutes: PublicRouteConfig[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/book', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/categories', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/courts', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/coaches', priority: 0.9, changeFrequency: 'daily' },
  { path: '/store', priority: 0.9, changeFrequency: 'daily' },
  { path: '/teams', priority: 0.7, changeFrequency: 'daily' },
]

function normalizeBaseUrl(rawUrl: string) {
  const trimmedUrl = rawUrl.trim()

  if (!trimmedUrl) {
    return DEFAULT_SITE_URL
  }

  return trimmedUrl.endsWith('/') ? trimmedUrl.slice(0, -1) : trimmedUrl
}

function resolveBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL
  return normalizeBaseUrl(configuredUrl)
}

function toAbsoluteUrl(baseUrl: string, path: string) {
  if (path === '/') {
    return `${baseUrl}/`
  }

  return `${baseUrl}${path}`
}

function buildStaticEntries(baseUrl: string): MetadataRoute.Sitemap {
  return publicStaticRoutes.map((route) => ({
    url: toAbsoluteUrl(baseUrl, route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}

function buildCoachEntries(baseUrl: string): MetadataRoute.Sitemap {
  return coaches.map((coach) => ({
    url: toAbsoluteUrl(baseUrl, `/coaches/${coach.slug}`),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
}

function buildStoreEntries(baseUrl: string): MetadataRoute.Sitemap {
  return storeProducts.map((product) => ({
    url: toAbsoluteUrl(baseUrl, `/store/${product.id}`),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = resolveBaseUrl()

  return [...buildStaticEntries(baseUrl), ...buildCoachEntries(baseUrl), ...buildStoreEntries(baseUrl)]
}
