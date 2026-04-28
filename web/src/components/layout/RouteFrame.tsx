'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const fullViewportPrefixes = ['/admin', '/coach', '/operator']

function usesFullViewport(pathname: string): boolean {
  return fullViewportPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function RouteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const fullViewport = pathname ? usesFullViewport(pathname) : false

  if (fullViewport) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  )
}
