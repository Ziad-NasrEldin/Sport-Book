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
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient md:rounded-[2rem] card-lift">
      <div className="relative h-[220px] w-full md:h-[280px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover object-center"
        />
        {/* Deep gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />

        <div className="absolute top-4 left-4 md:top-5 md:left-5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide md:text-sm md:px-4 md:py-1.5 ${
              isAvailable
                ? 'bg-tertiary-fixed text-primary'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1 shadow-sm md:top-5 md:right-5 md:px-4 md:py-1.5 md:gap-2">
          <Star className="fill-orange-400 text-orange-400 w-3 h-3 md:w-4 md:h-4" />
          <span className="text-white font-bold font-lexend text-xs md:text-base">
            {rating.toFixed(1)}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
          <p className="text-tertiary-fixed/90 font-bold text-[10px] tracking-[0.15em] mb-1 font-sans uppercase md:text-xs md:mb-2">
            {type}
          </p>
          <h3 className="text-white text-xl font-bold font-sans tracking-tight md:text-4xl">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between md:p-7">
        <div>
          <div className="flex items-center gap-1.5 text-primary pb-2 md:gap-2 md:pb-3">
            <span className="flex-shrink-0 bg-surface-container-low rounded-full p-1">
              <MapPin className="w-3 h-3 text-primary/70 md:w-4 md:h-4" />
            </span>
            <p className="text-xs font-medium text-primary/70 truncate pr-2 max-w-[180px] md:max-w-[300px] md:text-sm">
              {location} &bull; <span className="font-lexend">{distance}</span>
            </p>
          </div>
          <p className="font-lexend font-bold text-primary group">
            <span className="text-xl leading-none md:text-4xl">{price} EGP</span>
            <span className="text-xs text-primary/60 ml-1 font-medium pb-0.5 inline-block align-bottom font-sans md:text-base">
              / hr
            </span>
          </p>
        </div>

        {isAvailable ? (
          <Link
            href="/book"
            className="flex items-center justify-center h-12 px-6 rounded-full font-bold text-sm tracking-wide transition-transform active:scale-[0.98] md:h-14 md:px-8 md:text-lg bg-gradient-to-br from-secondary to-secondary-container text-white shadow-md"
          >
            Book Now
          </Link>
        ) : (
          <button
            disabled
            className="h-12 px-6 rounded-full font-bold text-sm tracking-wide md:h-14 md:px-8 md:text-lg bg-surface-container-high text-primary/50 cursor-not-allowed"
          >
            Full
          </button>
        )}
      </div>
    </div>
  )
}
