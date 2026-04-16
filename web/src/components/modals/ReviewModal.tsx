'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'

// Dummy properties for the previous booking context
interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function ReviewModal({ isOpen, onClose, onComplete }: ReviewModalProps) {
  const [rating, setRating] = useState(4) // Pre-select to 4 for visual alignment
  const [hoveredRating, setHoveredRating] = useState(0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 font-sans bg-primary/40 backdrop-blur-sm transition-all duration-300">
      {/* Modal Container */}
      <div 
        className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,17,58,0.2)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Image Area with Dark Blue overlay */}
        <div className="relative w-full h-[140px] bg-primary flex items-center justify-center pt-4">
          <Image
            src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80"
            alt="Tennis Ball Background"
            fill
            className="object-cover opacity-20 mix-blend-overlay object-top"
          />
          {/* Centered Star Icon Badge */}
          <div className="relative z-10 w-[72px] h-[72px] rounded-full border-[1.5px] border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-8 flex flex-col items-center bg-white relative z-20">
          <h2 className="text-[24px] font-extrabold text-primary tracking-tight mb-6 text-center px-2 leading-tight">
            Rate Your Previous Match
          </h2>

          {/* Previous Booking Info Bubble */}
          <div className="w-full bg-surface-container-low rounded-[2rem] py-5 px-4 mb-8 text-center flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-[14px] h-[14px] text-primary fill-primary" />
              <span className="text-[11px] font-lexend font-bold uppercase tracking-[0.15em] text-primary/80">
                Previous Booking
              </span>
            </div>
            <h3 className="text-[19px] font-bold text-primary mb-1">
              The Regent's Park - Court 04
            </h3>
            <p className="text-primary/60 text-[13px] font-medium pt-0.5">October 24, 2023</p>
          </div>

          {/* Interactive Star Rating */}
          <div className="flex items-center justify-center gap-3.5 mb-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90 hover:scale-110 focus:outline-none p-1"
                aria-label={`Rate ${star} stars`}
              >
                <Star 
                  className={`w-9 h-9 transition-colors duration-200 ${
                    (hoveredRating || rating) >= star 
                      ? 'fill-[#f98801] text-[#f98801]' 
                      : 'fill-[#c8c9ce] text-[#c8c9ce]'
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Review Textarea */}
          <div className="w-full mb-8 text-left">
            <label className="text-[11px] font-lexend font-bold uppercase tracking-widest text-[#00113a]/90 block mb-3 pl-1">
              Experience Notes
            </label>
            <textarea
              className="w-full h-[140px] bg-[#eceaf3] rounded-[1.25rem] p-5 border-none outline-none focus:ring-2 focus:ring-primary/20 text-primary placeholder:text-primary/40 text-[15px] font-medium resize-none transition-all"
              placeholder="Tell us about your experience..."
            />
          </div>

          {/* Submission Action */}
          <button 
            onClick={onComplete}
            className="w-full bg-[#da7702] hover:bg-[#c26700] text-white font-extrabold tracking-wide py-5 rounded-full shadow-[0_12px_24px_-8px_rgba(214,114,0,0.5)] active:scale-[0.98] transition-transform text-[17px] mb-7"
          >
            Submit & Continue Booking
          </button>

          {/* Dismiss Action */}
          <button 
            onClick={onClose}
            className="text-[12px] font-lexend font-bold uppercase tracking-[0.2em] text-[#00113a]/60 hover:text-primary transition-colors active:scale-95"
            aria-label="Dismiss Review"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
