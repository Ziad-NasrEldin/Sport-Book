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

  const user = profileData.user || {}
  const wallet = profileData.wallet || {}
  const nextBooking = profileData.nextBooking || {}

  return (
    <main className="min-h-screen bg-surface-container-low pb-32 font-sans">
      {/* Editorial Header with Hero Background */}
      <section className="relative w-full h-[40vh] md:h-[50vh] flex flex-col justify-end p-6 md:p-8">
        <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[var(--radius-xl)] md:rounded-b-[var(--radius-full)]">
          <Image
            src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2070&auto=format&fit=crop"
            alt="Profile Background"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Tonal Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/60 to-transparent"></div>
        </div>

        {/* User Info (Glassmorphism layer) */}
        <div className="relative z-10 w-full max-w-3xl mx-auto flex items-end justify-between backdrop-blur-2xl bg-primary-container/40 p-6 md:p-8 rounded-[var(--radius-xl)] shadow-ambient">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-surface-container-lowest flex-shrink-0">
              <Image 
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1064&auto=format&fit=crop"} 
                alt="User Avatar"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-surface-container-lowest">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{user.fullName || 'Loading...'}</h1>
              <p className="text-sm md:text-base font-lexend opacity-90 mt-1">{user.email || ''}</p>
              <p className="text-xs md:text-sm font-lexend opacity-80 mt-1">{user.phone || ''}</p>
            </div>
          </div>
          <Link
            href="/profile/account-details"
            className="hidden md:flex items-center justify-center p-3 md:p-4 bg-surface-container-lowest text-primary rounded-[var(--radius-full)] shadow-ambient hover:scale-105 transition-transform"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Main Profile Content: Nesting & Layering */}
      <section className="relative z-20 -mt-6 md:-mt-8 max-w-3xl mx-auto px-4 md:px-8 flex flex-col gap-6 md:gap-8">
        
        {/* Row 1: Wallet & Bookings Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Wallet Summary */}
          <div className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-surface-container-low rounded-[var(--radius-full)]">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-primary">Wallet</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-primary opacity-50" />
            </div>
            
            <div>
              {loading ? (
                <SkeletonStat />
              ) : (
                <>
                  <p className="text-sm font-lexend text-primary opacity-60 uppercase tracking-widest mb-1">Current Balance</p>
                  <h3 className="text-5xl md:text-6xl font-bold text-primary tracking-tighter mb-4">
                    {wallet.balance || 0}<span className="text-2xl text-primary/50"> EGP</span>
                  </h3>
                  <Link
                    href="/profile/wallet/topup"
                    className="block w-full py-4 text-center bg-gradient-to-br from-secondary to-secondary-container text-on-secondary-container font-bold rounded-[var(--radius-full)] shadow-ambient transition-all hover:opacity-90"
                  >
                    Top Up Balance
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Bookings Summary */}
          <div className="bg-surface-container-lowest rounded-[var(--radius-lg)] p-6 md:p-8 shadow-ambient flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-surface-container-low rounded-[var(--radius-full)]">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-primary">Next Match</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-primary opacity-50" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {loading ? (
                <SkeletonStat />
              ) : nextBooking.id ? (
                <>
                  <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-[var(--radius-default)] mb-4">
                    <div className="w-16 h-16 rounded-[var(--radius-default)] overflow-hidden flex-shrink-0 relative">
                      <Image 
                        src={nextBooking.courtImage || "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200&h=200&fit=crop"}
                        alt="Court"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">{nextBooking.courtName || 'Unknown'}</h4>
                      <p className="text-sm font-lexend text-primary opacity-70 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {nextBooking.courtDetails || 'Court'}
                      </p>
                      <p className="text-xs font-lexend font-bold text-secondary-container mt-2">{nextBooking.date || ''} • {nextBooking.time || ''}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile/bookings"
                    className="w-full py-4 bg-primary-container text-surface-container-lowest font-bold rounded-[var(--radius-full)] shadow-ambient transition-all hover:bg-primary text-center"
                  >
                    Open My Bookings
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-primary/60">No upcoming bookings</p>
                  <Link
                    href="/book"
                    className="inline-block mt-4 py-3 px-6 bg-primary-container text-surface-container-lowest font-bold rounded-full"
                  >
                    Book a Court
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Settings & Preferences */}
        <div className="flex flex-col gap-4">
          {/* Favorites */}
          <Link
            href="/favorites"
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-6 shadow-ambient transition-transform hover:scale-[1.02] cursor-pointer group block"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-surface-container-low rounded-[var(--radius-full)] text-secondary-container">
                  <Heart className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-primary group-hover:text-secondary-container transition-colors">Saved Favorites</h3>
                  <p className="text-sm font-lexend text-primary opacity-60 mt-1">{favorites.courts.length} Facilities, {favorites.coaches.length} Coach</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Preferences */}
          <Link
            href="/preferences"
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-6 shadow-ambient transition-transform hover:scale-[1.02] cursor-pointer group block"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-surface-container-low rounded-[var(--radius-full)] text-primary">
                  <Globe className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-primary group-hover:text-secondary-container transition-colors">Preferences</h3>
                  <p className="text-sm font-lexend text-primary opacity-60 mt-1">{user.language || 'English'} • {user.favoriteSports?.join(', ') || 'Tennis, Padel'}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Bookings */}
          <Link
            href="/profile/bookings"
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-6 shadow-ambient transition-transform hover:scale-[1.02] cursor-pointer group block"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-surface-container-low rounded-[var(--radius-full)] text-primary-container">
                  <CalendarClock className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-primary group-hover:text-secondary-container transition-colors">Bookings</h3>
                  <p className="text-sm font-lexend text-primary opacity-60 mt-1">View sessions and booking history</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Store Purchases */}
          <Link
            href="/profile/store-purchases"
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-6 shadow-ambient transition-transform hover:scale-[1.02] cursor-pointer group block"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-surface-container-low rounded-[var(--radius-full)] text-primary-container">
                  <ShoppingBag className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-primary group-hover:text-secondary-container transition-colors">Store Purchases</h3>
                  <p className="text-sm font-lexend text-primary opacity-60 mt-1">Track all orders from facility shops</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Profile Settings (Mobile) */}
          <Link
            href="/profile/account-details"
            className="bg-surface-container-lowest rounded-[var(--radius-md)] p-6 shadow-ambient transition-transform hover:scale-[1.02] cursor-pointer group md:hidden block"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-surface-container-low rounded-[var(--radius-full)] text-primary">
                  <Settings className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-primary group-hover:text-secondary-container transition-colors">Account Details</h3>
                  <p className="text-sm font-lexend text-primary opacity-60 mt-1">Personal info, security</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={async () => {
              try {
                await api.post('/auth/logout')
              } catch {
              }
              clearTokens()
              router.push('/auth/sign-in')
            }}
            className="w-full bg-surface-container-lowest rounded-[var(--radius-md)] p-6 shadow-ambient transition-transform hover:scale-[1.02] cursor-pointer group block text-left"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-red-500/10 rounded-[var(--radius-full)] text-red-500">
                  <LogOut className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-red-500 group-hover:text-red-600 transition-colors">Log Out</h3>
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm font-bold text-primary/60">
          <Link href="/privacy-policy" className="hover:text-secondary-container transition-colors">
            Privacy Policy
          </Link>
          <span className="text-primary/25">|</span>
          <Link href="/terms-of-service" className="hover:text-secondary-container transition-colors">
            Terms of Service
          </Link>
          <span className="text-primary/25">|</span>
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
