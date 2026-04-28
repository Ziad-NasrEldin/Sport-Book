import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'

interface CourtCardProps {
  title: string
  image: string
  rating: number
  distance: string
  location: string
  price: number
  status: 'AVAILABLE' | 'BUSY'
  type: string
}

export function CourtCard({
  title,
  image,
  rating,
  distance,
  location,
  price,
  status,
  type,
}: CourtCardProps) {
  const isAvailable = status === 'AVAILABLE'

  return (
    <div className="group relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-[0_16px_40px_-12px_rgba(0,17,58,0.12)] hover:-translate-y-1">
      <div className="relative h-[180px] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1631]/80 via-transparent to-transparent transition-opacity duration-300" />

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-badge-pop ${isAvailable ? 'bg-[#c3f400] text-[#0a1631]' : 'bg-white/90 text-red-700'}`}
          >
            {status}
          </span>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-0.5 flex items-center gap-0.5 transition-transform duration-200 group-hover:scale-105">
          <Star className="fill-[#c3f400] text-[#c3f400] w-3 h-3" />
          <span className="text-[#0a1631] font-black text-[10px]">{rating.toFixed(1)}</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[#c3f400]/80 font-bold text-[9px] tracking-wider uppercase mb-0.5">{type}</p>
          <h3 className="text-white text-lg font-black tracking-tight leading-tight">{title}</h3>
        </div>
      </div>

      <div className="p-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-primary/60 mb-1">
            <MapPin className="w-3 h-3 flex-none" />
            <p className="text-[11px] font-medium truncate max-w-[150px]">{location} · <span className="font-bold">{distance}</span></p>
          </div>
          <p className="flex items-baseline gap-0.5">
            <span className="text-lg font-black text-[#0a1631]">{price}</span>
            <span className="text-[10px] text-primary/50 font-bold">EGP</span>
            <span className="text-[10px] text-primary/40">/hr</span>
          </p>
        </div>

        {isAvailable ? (
          <Link
            href="/book"
            className="flex items-center justify-center h-9 px-4 rounded-full font-bold text-[11px] uppercase tracking-wide bg-[#0a1631] text-white hover:bg-[#c3f400] hover:text-[#0a1631] transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Book
          </Link>
        ) : (
          <button disabled className="h-9 px-4 rounded-full font-bold text-[11px] uppercase tracking-wide bg-surface-container-high text-primary/40 cursor-not-allowed">
            Full
          </button>
        )}
      </div>
    </div>
  )
}
