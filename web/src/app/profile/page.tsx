'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Wallet, 
  Clock, 
  CalendarClock,
  ShoppingBag,
  Heart, 
  Globe, 
  LogOut, 
  ChevronRight,
  MapPin
} from 'lucide-react';
import Image from 'next/image';
import { FloatingNav } from '@/components/layout/FloatingNav';
import { useApiCall } from '@/lib/api/hooks';
import { api, clearTokens } from '@/lib/api/client';
import { APIErrorFallback } from '@/components/ui/ErrorBoundary';
import { SkeletonStat } from '@/components/ui/SkeletonLoader';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  FAVORITES_UPDATED_EVENT,
  getFavorites,
} from '@/lib/favorites';

function ProfilePageContent() {
  const router = useRouter()
  const { data: profileResponse, loading, error, refetch } = useApiCall('/player/profile')
  const profileData = profileResponse?.data || profileResponse || {}
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === 'undefined') return { courts: [], coaches: [] }
    return getFavorites()
  })

  useEffect(() => {
    const refreshFavorites = () => {
      setFavorites(getFavorites())
    }
    window.addEventListener(FAVORITES_UPDATED_EVENT, refreshFavorites)
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, refreshFavorites)
    }
  }, [])

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  const user = profileData || {}
  const wallet = profileData.wallet || {}
  const nextBooking = profileData.nextBooking || {}

  const menuItems = [
    { href: '/favorites', icon: Heart, label: 'Saved Favorites', desc: `${favorites.courts.length} Facilities, ${favorites.coaches.length} Coaches` },
    { href: '/preferences', icon: Globe, label: 'Preferences', desc: `${user.language || 'English'} • ${user.favoriteSports?.join(', ') || 'Tennis, Padel'}` },
    { href: '/profile/bookings', icon: CalendarClock, label: 'Bookings', desc: 'View sessions and booking history' },
    { href: '/profile/store-purchases', icon: ShoppingBag, label: 'Store Purchases', desc: 'Track all orders from facility shops' },
  ]

  return (
    <main className="min-h-screen bg-surface-container-low pb-32 font-sans">
      {/* HERO: Full-bleed with squircle bottom mask */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex flex-col justify-end">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem]">
          <Image
            src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2070&auto=format&fit=crop"
            alt="Profile Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/20" />
          <div 
            className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
          />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 md:px-8 pb-8 md:pb-14 animate-hero-reveal">
          <div className="flex items-end gap-5 md:gap-8">
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-tertiary-fixed shadow-[0_0_0_4px_#00113a] flex-shrink-0 -mb-8 md:-mb-12 relative z-20">
              <Image 
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1064&auto=format&fit=crop"} 
                alt="User Avatar"
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <h1 className="font-display text-5xl md:text-7xl uppercase font-bold tracking-tighter text-white leading-[0.85]">
                {user.name || 'Loading...'}
              </h1>
              <p className="text-sm md:text-base font-sans font-medium text-white/70 mt-2 tracking-wide">
                {user.email || ''}
              </p>
              <p className="text-xs md:text-sm font-sans font-medium text-white/50 mt-1 tracking-wide">
                {user.phone || ''}
              </p>
            </div>
            <Link
              href="/profile/account-details"
              className="hidden md:flex items-center justify-center w-14 h-14 rounded-[1.25rem] bg-tertiary-fixed text-primary hover:bg-white transition-colors flex-shrink-0"
            >
              <Settings className="w-7 h-7" />
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 pt-16 md:pt-24 flex flex-col gap-6 md:gap-8">
        
        {/* ROW 1: Wallet & Next Match */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
          {/* WALLET */}
          <div className="md:col-span-3 bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between shadow-[0_8px_40px_-12px_rgba(0,17,58,0.12)] animate-spring-in">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl uppercase font-bold text-primary tracking-tight">Wallet</h2>
              </div>
              <ChevronRight className="w-6 h-6 text-primary/30" />
            </div>
            
            <div>
              {loading ? (
                <SkeletonStat />
              ) : (
                <>
                  <p className="text-[10px] font-sans font-bold text-primary/50 uppercase tracking-[0.2em] mb-2">Current Balance</p>
                  <h3 className="font-display text-7xl md:text-8xl font-bold text-primary tracking-tighter leading-none">
                    {wallet.balance || 0}<span className="text-3xl md:text-4xl text-primary/40 ml-2">EGP</span>
                  </h3>
                  <Link
                    href="/profile/wallet/topup"
                    className="block w-full mt-8 py-4 text-center bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-sm rounded-[2rem] shadow-[0_4px_0_0_#00113a] hover:shadow-[0_2px_0_0_#00113a] hover:translate-y-[2px] transition-all active:shadow-none active:translate-y-[4px]"
                  >
                    Top Up Balance
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* NEXT MATCH */}
          <div className="md:col-span-2 bg-primary text-white rounded-[2.5rem] p-8 md:p-10 flex flex-col animate-spring-in animation-delay-150 shadow-[0_8px_40px_-12px_rgba(0,17,58,0.25)]">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[1rem] bg-white/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-tertiary-fixed" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl uppercase font-bold tracking-tight">Next Match</h2>
              </div>
              <ChevronRight className="w-6 h-6 text-white/30" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {loading ? (
                <SkeletonStat />
              ) : nextBooking.id ? (
                <>
                  <div className="mb-6">
                    <div className="w-full h-32 md:h-40 overflow-hidden mb-4 rounded-[1.5rem]">
                      <Image 
                        src={nextBooking.courtImage || "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200&h=200&fit=crop"}
                        alt="Court"
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-display text-xl md:text-2xl uppercase font-bold tracking-tight">{nextBooking.courtName || 'Unknown'}</h4>
                    <p className="text-sm font-sans text-white/70 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-tertiary-fixed" /> {nextBooking.courtDetails || 'Court'}
                    </p>
                    <p className="text-xs font-sans font-bold text-tertiary-fixed mt-2 uppercase tracking-widest">{nextBooking.date || ''} • {nextBooking.time || ''}</p>
                  </div>
                  <Link
                    href="/profile/bookings"
                    className="w-full py-4 bg-tertiary-fixed text-primary font-sans font-bold uppercase tracking-widest text-sm text-center rounded-[2rem] hover:bg-white transition-colors"
                  >
                    Open My Bookings
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-white/60 font-sans">No upcoming bookings</p>
                  <Link
                    href="/book"
                    className="inline-block mt-6 py-3 px-8 bg-tertiary-fixed text-primary font-bold uppercase tracking-widest text-xs rounded-[2rem]"
                  >
                    Book a Court
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Squircle Menu Cards */}
        <div className="flex flex-col gap-4 md:gap-5 animate-fade-in animation-delay-200">
          {menuItems.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-6 md:px-8 py-6 md:py-7 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] group hover:bg-primary hover:text-white transition-all duration-200 animate-row-reveal"
              style={{ animationDelay: `${idx * 75 + 200}ms` }}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <item.icon className="w-6 h-6 text-tertiary-fixed flex-shrink-0" />
                </div>
                <div>
                  <h3 className="font-display text-xl md:text-3xl uppercase font-bold tracking-tight group-hover:text-white transition-colors">{item.label}</h3>
                  <p className="text-sm font-sans text-primary/60 group-hover:text-white/70 mt-1 transition-colors">{item.desc}</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5 text-primary/30 group-hover:text-tertiary-fixed transition-colors" />
              </div>
            </Link>
          ))}
          
          {/* Mobile-only Account Details */}
          <Link
            href="/profile/account-details"
            className="md:hidden flex items-center justify-between px-6 py-6 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] group hover:bg-primary hover:text-white transition-all duration-200"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1rem] bg-primary/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Settings className="w-6 h-6 text-tertiary-fixed flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-display text-xl uppercase font-bold tracking-tight group-hover:text-white">Account Details</h3>
                <p className="text-sm font-sans text-primary/60 group-hover:text-white/70 mt-1">Personal info, security</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-primary/30 group-hover:text-tertiary-fixed transition-colors" />
            </div>
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={async () => {
              try { await api.post('/auth/logout') } catch {}
              clearTokens()
              router.push('/auth/sign-in')
            }}
            className="w-full flex items-center justify-between px-6 md:px-8 py-6 md:py-7 bg-surface-container-lowest rounded-[2rem] shadow-[0_4px_20px_-8px_rgba(0,17,58,0.08)] group hover:bg-red-600 transition-all duration-200 text-left"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1rem] bg-red-500/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <LogOut className="w-6 h-6 text-red-500 group-hover:text-white flex-shrink-0 transition-colors" />
              </div>
              <h3 className="font-display text-xl md:text-3xl uppercase font-bold tracking-tight text-red-500 group-hover:text-white transition-colors">Log Out</h3>
            </div>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-sans font-bold text-primary/50 uppercase tracking-widest">
          <Link href="/privacy-policy" className="hover:text-secondary-container transition-colors">
            Privacy Policy
          </Link>
          <span className="text-primary/20">|</span>
          <Link href="/terms-of-service" className="hover:text-secondary-container transition-colors">
            Terms of Service
          </Link>
          <span className="text-primary/20">|</span>
          <Link href="/data-deletion" className="hover:text-secondary-container transition-colors">
            Data Deletion
          </Link>
        </div>
      </section>

      <FloatingNav />
    </main>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  )
}