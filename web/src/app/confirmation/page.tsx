'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, QrCode, CalendarPlus, Share2, Check } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'

// Adjust standard styles and imports matching the rest of the application
export default function ConfirmationPage() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push('/checkout')
  }

  return (
    <main className="w-full bg-surface min-h-screen relative pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:pb-[11rem] font-sans">
      {/* Top Navigation */}
      <header className="flex justify-between items-center w-full px-5 py-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl md:px-10 lg:px-14">
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent hover:bg-black/5 transition-colors active:scale-95 duration-200 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-primary stroke-[2]" />
          </button>
          <h1 className="text-primary font-extrabold tracking-tight text-xl mx-auto flex-1 text-center">
            Court Booking
          </h1>
        </div>
      </header>

      <div className="px-5 md:max-w-xl md:mx-auto md:px-0 flex flex-col items-center mt-6">
        {/* Success Icon */}
        <div className="w-24 h-24 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 shadow-ambient">
           <div className="w-14 h-14 rounded-full bg-[#8c4a00] flex items-center justify-center">
             <Check className="w-6 h-6 text-white stroke-[3.5]" />
           </div>
        </div>

        <h2 className="text-3xl font-extrabold text-primary tracking-tight mb-2">Your court is ready!</h2>
        <p className="text-primary/70 text-center mb-10 text-[15px] font-medium px-4 leading-relaxed">
          Get your rackets ready for a great match at the club.
        </p>

        {/* Booking Card container */}
        <div className="w-full bg-surface-container-lowest rounded-[2rem] shadow-ambient overflow-hidden flex flex-col font-sans relative">
          
          {/* Top Half: White Details section */}
          <div className="p-7 relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/50">
                Booking Reference
              </span>
              <span className="bg-tertiary-fixed text-[#0a1631] text-[10px] font-lexend font-extrabold px-3 py-1 rounded-full tracking-widest shadow-sm">
                PAID
              </span>
            </div>
            {/* Darker secondary text just for bold aesthetics */}
            <h3 className="text-[22px] font-extrabold tracking-wide text-primary mb-10 font-lexend">
              #TNS-882190
            </h3>

            <div className="flex flex-col gap-6">
              {/* Location Row */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-surface text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 fill-primary/10" strokeWidth={2.5} />
                </div>
                <div className="pt-0.5">
                   <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/50 block mb-1">Location</span>
                   <span className="font-bold text-primary block leading-tight text-base mb-1">Center Court</span>
                   <span className="text-[13px] text-primary/60 font-medium">Hard Surface</span>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-surface text-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 fill-primary/10" strokeWidth={2.5} />
                </div>
                <div className="pt-0.5">
                   <span className="text-[10px] font-lexend font-bold uppercase tracking-widest text-primary/50 block mb-1">Date & Time</span>
                   <span className="font-bold text-primary block leading-tight text-base mb-1">Oct 24, 2023</span>
                   <span className="text-[13px] text-primary/60 font-medium">09:00 AM</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Half: QR Code Section (Dark Blue) */}
          <div className="bg-[#17244a] p-7 pt-8 relative overflow-hidden flex flex-col items-center">
             
             {/* Faint crosshairs overlay background for sporty look */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                 <div className="absolute top-[48%] left-0 right-0 h-[1.5px] bg-white"></div>
                 <div className="absolute left-[48%] top-0 bottom-0 w-[1.5px] bg-white"></div>
             </div>

             <div className="relative z-10 w-full flex flex-col items-center">
               <h4 className="text-[9px] text-center font-lexend font-bold uppercase tracking-[0.2em] text-white/80 mb-7">
                 Scan at the venue gate for entry
               </h4>

               <div className="bg-white rounded-[1.5rem] p-6 w-[200px] h-[200px] flex items-center justify-center mb-8 shadow-xl">
                 <QrCode className="w-full h-full text-[#0f1935] stroke-[1.5]" />
               </div>

               <div className="grid grid-cols-2 gap-3 w-full">
                 <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-[1rem] py-3.5 px-2 flex items-center justify-center gap-2 border border-white/5 active:scale-95">
                   <CalendarPlus className="w-[18px] h-[18px] text-white stroke-[2]" />
                   <span className="text-white text-[13px] font-bold tracking-tight">Add to Calendar</span>
                 </button>
                 <button className="bg-white/10 hover:bg-white/20 transition-colors rounded-[1rem] py-3.5 px-2 flex items-center justify-center gap-2 border border-white/5 active:scale-95">
                   <Share2 className="w-[18px] h-[18px] text-white stroke-[2]" />
                   <span className="text-white text-[13px] font-bold tracking-tight">Share with Friends</span>
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Go to Home Button */}
        <div className="w-full relative z-20 mt-6 mb-12">
          <Link href="/" className="w-full block">
            <button className="w-full bg-[#d67200] hover:bg-[#c26700] text-white font-extrabold tracking-wide py-[18px] rounded-full shadow-[0_12px_24px_-8px_rgba(214,114,0,0.5)] active:scale-[0.98] transition-transform text-lg">
              Go to Home
            </button>
          </Link>
        </div>
      </div>

      <FloatingNav />
    </main>
  )
}

