import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  title: string
  courtsCount: number
  color: string
  href: string
}

export function CategoryCard({ title, courtsCount, color, href }: CategoryCardProps) {
  const initial = title.charAt(0).toUpperCase()
  const isLight = color?.includes('white') || color?.includes('surface') || color?.includes('bg-white')
  const cardColor = isLight ? 'bg-[#0a1631]' : color || 'bg-[#0a1631]'

  return (
    <Link
      href={href}
      className={`group relative flex-none w-[165px] h-[130px] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.06] hover:-translate-y-1 active:scale-95 ${cardColor}`}
    >
      {/* Expanding lime accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#c3f400] z-20 transition-all duration-300 ease-out group-hover:w-2.5" />

      {/* Giant watermark initial */}
      <span className="absolute -right-1 -bottom-5 text-[5.5rem] font-black text-white/[0.07] leading-none rotate-[-14deg] select-none transition-all duration-500 ease-out group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:text-white/[0.12]">
        {initial}
      </span>

      {/* Diagonal slash decoration */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/[0.03] rotate-45 transition-transform duration-500 group-hover:rotate-[60deg] group-hover:scale-125" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-4 pl-4">
        <h3 className="text-white text-[1.65rem] font-black tracking-tighter leading-none">
          {title}
        </h3>

        <div className="mt-auto">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#c3f400]/15 text-[#c3f400] text-[9px] font-black uppercase tracking-wider border border-[#c3f400]/20">
            {courtsCount} Courts
          </span>

          <p className="text-white/40 text-[10px] font-bold tracking-wider uppercase flex items-center gap-0.5 mt-2 group-hover:text-[#c3f400] transition-colors duration-200">
            Explore
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </p>
        </div>
      </div>

      {/* Hover overlay glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#c3f400]/0 to-[#c3f400]/0 group-hover:from-[#c3f400]/[0.07] group-hover:to-transparent transition-all duration-500 pointer-events-none" />
    </Link>
  )
}