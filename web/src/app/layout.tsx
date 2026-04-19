import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Lexend } from 'next/font/google'
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
        <div className="min-h-screen md:bg-surface-container-low md:px-6 md:py-8 lg:px-10 lg:py-10">
          <div className="w-full max-w-[1200px] mx-auto min-h-screen bg-surface relative md:rounded-[2rem] md:shadow-ambient">
            {children}
          </div>
        </div>
        <ToastContainer />
      </body>
    </html>
  )
}

