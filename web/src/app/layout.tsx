import type { Metadata } from 'next'
import { Saira, Teko } from 'next/font/google'
import { RouteFrame } from '@/components/layout/RouteFrame'
import { ToastContainer } from '@/components/ui/Toast'
import './globals.css'

const saira = Saira({
  subsets: ['latin'],
  variable: '--font-saira',
  weight: ['400', '500', '600', '700'],
})

const teko = Teko({
  subsets: ['latin'],
  variable: '--font-teko',
  weight: ['400', '500', '600', '700'],
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
        className={`${saira.variable} ${teko.variable} font-sans bg-surface text-primary antialiased min-h-screen`}
      >
        <RouteFrame>{children}</RouteFrame>
        <ToastContainer />
      </body>
    </html>
  )
}
