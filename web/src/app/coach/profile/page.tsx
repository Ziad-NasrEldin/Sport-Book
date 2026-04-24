'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Camera, Plus, X, Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import type { CoachProfileData } from '@/lib/coach/types'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80'

export default function CoachProfilePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { data: profileData, error, refetch } = useApiCall<CoachProfileData>('/coach/profile')
  const updateMutation = useApiMutation<CoachProfileData, Partial<CoachProfileData>>('/coach/profile', 'PUT')

  const [displayName, setDisplayName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR)
  const [isPublicProfileVisible, setIsPublicProfileVisible] = useState(true)
  const [certifications, setCertifications] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [draftCertification, setDraftCertification] = useState('')
  const [draftLanguage, setDraftLanguage] = useState('')
  const [draftSpecialty, setDraftSpecialty] = useState('')

  useEffect(() => {
    if (!profileData) return
    setDisplayName(profileData.displayName)
    setHeadline(profileData.headline)
    setBio(profileData.bio)
    setCity(profileData.city)
    setAvatar(profileData.avatar || DEFAULT_AVATAR)
    setIsPublicProfileVisible(profileData.isPublicProfileVisible)
    setCertifications(profileData.certifications)
    setLanguages(profileData.languages)
    setSpecialties(profileData.specialties)
  }, [profileData])

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  const handleSave = async () => {
    await updateMutation.mutate({
      displayName,
      headline,
      bio,
      city,
      avatar,
      isPublicProfileVisible,
      certifications,
      languages,
      specialties,
    })
    await refetch()
  }

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <AdminPageHeader
        title="Profile"
        subtitle="Shape how athletes discover you: your headline, credentials, and coaching identity directly affect conversion."
        actions={
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={updateMutation.loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        }
      />

      <section className={`grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <AdminPanel eyebrow="Public identity" title="Coach Card">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative w-32 h-32 rounded-[var(--radius-lg)] overflow-hidden shrink-0 bg-surface-container-low shadow-lg transition-transform duration-300 hover:scale-105">
              <Image
                src={avatar || DEFAULT_AVATAR}
                alt="Coach avatar"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setAvatar(window.prompt('Paste a public image URL for your profile photo', avatar) || avatar)}
                className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary-container text-surface-container-lowest grid place-items-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Change profile image"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <label className="block space-y-2">
                <span className="text-[11px] font-lexend uppercase tracking-[0.2em] text-primary/40 font-bold">Display Name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full rounded-[var(--radius-md)] bg-surface-container-low px-5 py-3 text-base text-primary outline-none shadow-sm"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-lexend uppercase tracking-[0.2em] text-primary/40 font-bold">Headline</span>
                <input
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  className="w-full rounded-[var(--radius-md)] bg-surface-container-low px-5 py-3 text-base text-primary outline-none shadow-sm"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-[11px] font-lexend uppercase tracking-[0.2em] text-primary/40 font-bold">City</span>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-[var(--radius-md)] bg-surface-container-low px-5 py-3 text-base text-primary outline-none shadow-sm"
                />
              </label>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Visibility" title="Profile Reach">
          <div className="space-y-4">
            <div className="rounded-[var(--radius-md)] bg-surface-container-low p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <p className="text-base font-black text-primary">Public Profile Status</p>
              <p className="text-sm text-primary/70 mt-1.5 font-semibold">Control whether athletes can discover your services now.</p>
              <button
                type="button"
                onClick={() => setIsPublicProfileVisible((current) => !current)}
                className={`mt-4 px-4 py-2.5 rounded-full text-xs font-lexend font-black uppercase tracking-[0.2em] shadow-sm ${
                  isPublicProfileVisible
                    ? 'bg-primary-container text-surface-container-lowest shadow-md'
                    : 'bg-surface-container-high text-primary/70 hover:bg-surface-container-higher transition-colors'
                }`}
              >
                {isPublicProfileVisible ? 'Visible to athletes' : 'Hidden from listing'}
              </button>
            </div>

            <div className="rounded-[var(--radius-md)] bg-surface-container-low p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <p className="text-base font-black text-primary">Completeness</p>
              <p className="text-sm text-primary/70 mt-1.5 font-semibold">
                {[displayName, headline, bio, city].filter(Boolean).length * 25}% complete.
              </p>
            </div>
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="About" title="Coach Story" className={`transition-all duration-500 delay-100 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <label className="block space-y-2">
          <span className="text-[11px] font-lexend uppercase tracking-[0.2em] text-primary/40 font-bold">Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            className="w-full rounded-[var(--radius-md)] bg-surface-container-low px-5 py-3 text-base text-primary outline-none resize-none shadow-sm"
          />
        </label>
      </AdminPanel>

      <section className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-all duration-500 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <TagEditorPanel
          eyebrow="Sports"
          title="Specialties"
          values={specialties}
          draft={draftSpecialty}
          onDraftChange={setDraftSpecialty}
          onAdd={() => {
            if (!draftSpecialty.trim()) return
            setSpecialties((current) => [...current, draftSpecialty.trim()])
            setDraftSpecialty('')
          }}
          onRemove={(value) => setSpecialties((current) => current.filter((entry) => entry !== value))}
        />

        <TagEditorPanel
          eyebrow="Proof"
          title="Certifications"
          values={certifications}
          draft={draftCertification}
          onDraftChange={setDraftCertification}
          onAdd={() => {
            if (!draftCertification.trim()) return
            setCertifications((current) => [...current, draftCertification.trim()])
            setDraftCertification('')
          }}
          onRemove={(value) => setCertifications((current) => current.filter((entry) => entry !== value))}
        />

        <TagEditorPanel
          eyebrow="Language"
          title="Communication"
          values={languages}
          draft={draftLanguage}
          onDraftChange={setDraftLanguage}
          onAdd={() => {
            if (!draftLanguage.trim()) return
            setLanguages((current) => [...current, draftLanguage.trim()])
            setDraftLanguage('')
          }}
          onRemove={(value) => setLanguages((current) => current.filter((entry) => entry !== value))}
        />
      </section>
    </div>
  )
}

type TagEditorPanelProps = {
  eyebrow: string
  title: string
  values: string[]
  draft: string
  onDraftChange: (value: string) => void
  onAdd: () => void
  onRemove: (value: string) => void
}

function TagEditorPanel({ eyebrow, title, values, draft, onDraftChange, onAdd, onRemove }: TagEditorPanelProps) {
  return (
    <AdminPanel eyebrow={eyebrow} title={title}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-lexend font-black uppercase tracking-[0.2em] bg-primary-container text-surface-container-lowest shadow-sm"
            >
              {value}
              <button type="button" onClick={() => onRemove(value)} aria-label={`Remove ${value}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            className="flex-1 rounded-[var(--radius-md)] bg-surface-container-low px-5 py-3 text-base text-primary outline-none shadow-sm"
            placeholder={`Add ${title.toLowerCase()}`}
          />
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-5 py-2.5 text-sm font-bold text-primary hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </AdminPanel>
  )
}
