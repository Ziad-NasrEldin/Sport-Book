'use client'

import { useEffect, useRef, useState } from 'react'

export function useInView(options?: IntersectionObserverInit & { once?: boolean }) {
  const { once = true, ...observerOptions } = options ?? {}
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: 0.15, ...observerOptions }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [once, JSON.stringify(observerOptions)])

  return { ref, inView }
}