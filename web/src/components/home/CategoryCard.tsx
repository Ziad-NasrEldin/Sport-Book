import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  title: string
  courtsCount: number
  color: string
  href: string
}

export function CategoryCard({ title, courtsCount, color, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={`relative snap-center shrink-0 w-[160px] h-[220px] rounded-lg flex flex-col p-5 overflow-hidden transition-transform active:scale-95 md:w-full md:h-[260px] md:rounded-[2rem] md:p-7 ${color}`}
    >
      <h3 className="text-white text-2xl font-bold font-sans tracking-tight text-left md:text-4xl">
        {title}
      </h3>
      <p className="text-white/80 text-xs font-semibold tracking-wider flex items-center gap-1 mt-1 uppercase md:text-sm md:mt-2 md:gap-2">
        Discover <ArrowRight className="w-3 h-3" />
      </p>

      {/* Side Rotated Text */}
      <span className="absolute bottom-6 -left-3 -rotate-90 origin-bottom-left text-white/40 text-[10px] font-lexend tracking-[0.2em] uppercase md:text-xs md:-left-2">
        {courtsCount} Courts
      </span>
      
      {/* Decorative Icon/Shape - simplified placeholder */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full border-[12px] border-white/10" />
    </Link>
  )
}
