'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Camera, Plus, Save, X } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import type { CoachProfileData } from '@/lib/coach/types'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80'

export default function CoachProfilePage() {
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
    <div className="space-y-6">
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

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <AdminPanel eyebrow="Public identity" title="Coach Card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-28 h-28 rounded-[var(--radius-md)] overflow-hidden shrink-0 bg-surface-container-low">
              <Image
                src={avatar || DEFAULT_AVATAR}
                alt="Coach avatar"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setAvatar(window.prompt('Paste a public image URL for your profile photo', avatar) || avatar)}
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
              <p className="text-xs text-primary/60 mt-1">
                {[displayName, headline, bio, city].filter(Boolean).length * 25}% complete.
              </p>
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
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.12em] bg-primary-container text-surface-container-lowest"
            >
              {value}
              <button type="button" onClick={() => onRemove(value)} aria-label={`Remove ${value}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            className="flex-1 rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
            placeholder={`Add ${title.toLowerCase()}`}
          />
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </AdminPanel>
  )
}
