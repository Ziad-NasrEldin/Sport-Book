import type { MetadataRoute } from 'next'

const DEFAULT_SITE_URL = 'http://localhost:3000'

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

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/coach/', '/operator/', '/dashboard/', '/profile/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}