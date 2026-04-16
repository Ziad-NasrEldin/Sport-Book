'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { coachProfile } from '@/lib/coach/mockData'

export default function CoachProfilePage() {
  const [displayName, setDisplayName] = useState(coachProfile.displayName)
  const [headline, setHeadline] = useState(coachProfile.headline)
  const [bio, setBio] = useState(coachProfile.bio)
  const [city, setCity] = useState(coachProfile.city)
  const [isPublicProfileVisible, setIsPublicProfileVisible] = useState(true)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Profile"
        subtitle="Shape how athletes discover you: your headline, credentials, and coaching identity directly affect conversion."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        }
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <AdminPanel eyebrow="Public identity" title="Coach Card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-28 h-28 rounded-[var(--radius-md)] overflow-hidden shrink-0 bg-surface-container-low">
              <Image
                src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80"
                alt="Coach avatar"
                fill
                className="object-cover"
              />
              <button
                type="button"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary-container text-surface-container-lowest grid place-items-center"
                aria-label="Change profile image"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <label className="block space-y-1">
                <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Display Name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Headline</span>
                <input
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">City</span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
                />
              </label>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Visibility" title="Profile Reach">
          <div className="space-y-3">
            <div className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-bold text-primary">Public Profile Status</p>
              <p className="text-xs text-primary/60 mt-1">Control whether athletes can discover your services now.</p>
              <button
                type="button"
                onClick={() => setIsPublicProfileVisible((current) => !current)}
                className={`mt-3 px-3 py-2 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.14em] ${
                  isPublicProfileVisible
                    ? 'bg-primary-container text-surface-container-lowest'
                    : 'bg-surface-container-high text-primary/70'
                }`}
              >
                {isPublicProfileVisible ? 'Visible to athletes' : 'Hidden from listing'}
              </button>
            </div>

            <div className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="text-sm font-bold text-primary">Completeness</p>
              <p className="text-xs text-primary/60 mt-1">84% complete • Add 2 achievements to unlock priority ranking.</p>
            </div>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="About" title="Coach Story">
        <label className="block space-y-1">
          <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none resize-none"
          />
        </label>
      </AdminPanel>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <AdminPanel eyebrow="Sports" title="Specialties">
          <div className="flex flex-wrap gap-2">
            {coachProfile.sports.map((sport) => (
              <span
                key={sport}
                className="px-3 py-1.5 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.12em] bg-primary-container text-surface-container-lowest"
              >
                {sport}
              </span>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Proof" title="Certifications">
          <ul className="space-y-2 text-sm text-primary">
            {coachProfile.certifications.map((certification) => (
              <li key={certification} className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5 font-semibold">
                {certification}
              </li>
            ))}
          </ul>
        </AdminPanel>

        <AdminPanel eyebrow="Language" title="Communication">
          <ul className="space-y-2 text-sm text-primary">
            {coachProfile.languages.map((language) => (
              <li key={language} className="rounded-[var(--radius-default)] bg-surface-container-low px-3 py-2.5 font-semibold">
                {language}
              </li>
            ))}
          </ul>
        </AdminPanel>
      </section>
    </div>
  )
}
