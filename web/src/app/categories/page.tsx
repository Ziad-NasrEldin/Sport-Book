'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Trophy, Sparkles } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

const categories = [
  { id: 'cat-tennis', name: 'Tennis', courts: 124, fromPrice: 400, tone: 'from-[#002366] to-[#153e8d]' },
  { id: 'cat-padel', name: 'Padel', courts: 48, fromPrice: 550, tone: 'from-[#fd8b00] to-[#d36a00]' },
  { id: 'cat-squash', name: 'Squash', courts: 32, fromPrice: 300, tone: 'from-[#1e2b56] to-[#00113a]' },
  { id: 'cat-football', name: 'Football', courts: 22, fromPrice: 850, tone: 'from-[#14532d] to-[#0f3f24]' },
  { id: 'cat-basketball', name: 'Basketball', courts: 17, fromPrice: 620, tone: 'from-[#7c2d12] to-[#9a3412]' },
  { id: 'cat-badminton', name: 'Badminton', courts: 28, fromPrice: 260, tone: 'from-[#1e3a8a] to-[#1d4ed8]' },
]

export default function CategoriesPage() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/')
  }

  return (
    <main className="w-full min-h-screen bg-surface pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-primary-container/12 blur-[100px]" />
        <div className="absolute bottom-8 -right-14 h-80 w-80 rounded-full bg-secondary-container/20 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl px-5 pt-6 pb-4 md:px-10 lg:px-14 md:pt-8 md:pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-low transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-primary stroke-[2.5]" />
          </button>

          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-primary">All Categories</h1>
            <p className="text-sm md:text-base text-primary/60">Browse sports categories and discover available courts</p>
          </div>
        </div>
      </header>

      <section className="px-5 md:px-10 lg:px-14 md:max-w-5xl md:mx-auto space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Sports</span>
              <Trophy className="w-5 h-5 text-primary-container" />
            </div>
            <p className="text-4xl font-black tracking-tight text-primary">{categories.length}</p>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Total Courts</span>
              <Sparkles className="w-5 h-5 text-secondary-container" />
            </div>
            <p className="text-4xl font-black tracking-tight text-primary">
              {categories.reduce((sum, category) => sum + category.courts, 0)}
            </p>
          </article>

          <article className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-[0.18em] text-primary/50">Starting From</span>
              <span className="text-xs font-lexend font-bold uppercase tracking-widest text-secondary-container">EGP</span>
            </div>
            <p className="text-4xl font-black tracking-tight text-primary">260</p>
          </article>
        </div>

        <section className="space-y-4 md:space-y-5">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-primary">Choose Your Sport</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/courts?sport=${encodeURIComponent(category.name)}`}
                className={`group relative min-h-[210px] rounded-[var(--radius-lg)] overflow-hidden bg-gradient-to-br ${category.tone} p-5 md:p-6 shadow-ambient text-white flex flex-col justify-between`}
              >
                <div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">{category.name}</h3>
                  <p className="mt-2 text-xs font-lexend uppercase tracking-widest text-white/70">{category.courts} Courts Available</p>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-lexend uppercase tracking-widest text-white/70">From</p>
                    <p className="text-xl font-extrabold">{category.fromPrice} EGP/hr</p>
                  </div>

                  <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-5 h-5" />
                  </span>
                </div>

                <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full border-[12px] border-white/15" />
              </Link>
            ))}
          </div>
        </section>
      </section>

      <FloatingNav />
    </main>
  )
}