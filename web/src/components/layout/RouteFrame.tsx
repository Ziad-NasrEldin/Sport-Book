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
    <div className="min-h-screen md:bg-surface-container-low md:px-6 md:py-8 lg:px-10 lg:py-10">
      <div className="w-full max-w-[1200px] mx-auto min-h-screen bg-surface relative md:rounded-[2rem] md:shadow-ambient">
        {children}
      </div>
    </div>
  )
}
