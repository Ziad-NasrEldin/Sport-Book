import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Lexend } from 'next/font/google'
import { RouteFrame } from '@/components/layout/RouteFrame'
import { ToastContainer } from '@/components/ui/Toast'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
})

export const metadata: Metadata = {
  title: 'Court Advantage',
  description: 'Book sports courts seamlessly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${lexend.variable} font-sans bg-surface text-primary antialiased min-h-screen`}
      >
        <RouteFrame>{children}</RouteFrame>
        <ToastContainer />
      </body>
    </html>
  )
}
