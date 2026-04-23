'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, ClipboardList, Plus, RefreshCcw, Save, Sparkles, Upload } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { useApiCall, useApiMutation } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { SkeletonStat } from '@/components/ui/SkeletonLoader'

type SportStatus = 'Draft' | 'Enabled'

type MockSport = {
  id: string
  name: string
  slug: string
  categoriesCount: number
  sessionMinutes: number
  status: SportStatus
  createdAt: string
}

type TemplateName = 'Padel Club Pack' | 'Tennis Academy Pack' | 'Community Badminton Pack'

type SportTemplate = {
  minPlayers: number
  maxPlayers: number
  sessionMinutes: number
  categories: string[]
  requiresEquipmentCheck: boolean
  requiresReferee: boolean
  supportsMixedTeams: boolean
}

const templates: Record<TemplateName, SportTemplate> = {
  'Padel Club Pack': {
    minPlayers: 2,
    maxPlayers: 4,
    sessionMinutes: 90,
    categories: ['Open Play', 'Private Session', 'Corporate League'],
    requiresEquipmentCheck: true,
    requiresReferee: false,
    supportsMixedTeams: true,
  },
  'Tennis Academy Pack': {
    minPlayers: 2,
    maxPlayers: 2,
    sessionMinutes: 60,
    categories: ['Beginner Coaching', 'Performance Training', 'Court Rental'],
    requiresEquipmentCheck: true,
    requiresReferee: false,
    supportsMixedTeams: true,
  },
  'Community Badminton Pack': {
    minPlayers: 2,
    maxPlayers: 4,
    sessionMinutes: 75,
    categories: ['Social Sessions', 'Weekend Ladder', 'Kids Group'],
    requiresEquipmentCheck: false,
    requiresReferee: false,
    supportsMixedTeams: true,
  },
}

export default function AdminCreateSportPage() {
  const { data: sportsResponse } = useApiCall('/admin-workspace/sports')
  const sportsData = sportsResponse?.data || sportsResponse || []
  const createMutation = useApiMutation('/admin-workspace/sports', 'POST')

  const [name, setName] = useState('Pickleball')
  const [slug, setSlug] = useState('pickleball')
  const [description, setDescription] = useState('Fast-paced racket sport with doubles-heavy participation and high repeat bookings.')
  const [minPlayers, setMinPlayers] = useState('2')
  const [maxPlayers, setMaxPlayers] = useState('4')
  const [sessionMinutes, setSessionMinutes] = useState('90')
  const [categoryInput, setCategoryInput] = useState('')
  const [categories, setCategories] = useState<string[]>(['Social Match', 'Private Coaching'])
  const [requiresEquipmentCheck, setRequiresEquipmentCheck] = useState(true)
  const [requiresReferee, setRequiresReferee] = useState(false)
  const [supportsMixedTeams, setSupportsMixedTeams] = useState(true)
  const [template, setTemplate] = useState<TemplateName>('Padel Club Pack')
  const [banner, setBanner] = useState('Configure sport metadata, then save draft or publish.')
  const [createdSports, setCreatedSports] = useState<MockSport[]>([])

  const validationMessage = useMemo(() => {
    if (!name.trim()) return 'Sport name is required.'
    if (!slug.trim()) return 'Sport slug is required.'
    if (!description.trim()) return 'Add a short sport description.'

    const min = Number(minPlayers || 0)
    const max = Number(maxPlayers || 0)

    if (!min || !max) return 'Min and max players are required.'
    if (min > max) return 'Minimum players cannot exceed maximum players.'
    if (Number(sessionMinutes || 0) <= 0) return 'Session duration must be greater than zero.'
    if (categories.length === 0) return 'Add at least one category.'

    const duplicate = sportsData.some((sport: any) => sport.name.toLowerCase() === name.trim().toLowerCase())
    if (duplicate) return 'A sport with this name already exists in the catalog.'

    return ''
  }, [categories.length, description, maxPlayers, minPlayers, name, sessionMinutes, slug, sportsData])

  const applyTemplate = () => {
    const chosen = templates[template]
    setMinPlayers(String(chosen.minPlayers))
    setMaxPlayers(String(chosen.maxPlayers))
    setSessionMinutes(String(chosen.sessionMinutes))
    setCategories(chosen.categories)
    setRequiresEquipmentCheck(chosen.requiresEquipmentCheck)
    setRequiresReferee(chosen.requiresReferee)
    setSupportsMixedTeams(chosen.supportsMixedTeams)
    setBanner(`Template ${template} applied.`)
  }

  const generateSlug = () => {
    const nextSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    setSlug(nextSlug)
    setBanner(`Generated slug: ${nextSlug}`)
  }

  const addCategory = () => {
    const next = categoryInput.trim()
    if (!next) {
      setBanner('Enter a category name first.')
      return
    }
    if (categories.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setBanner(`Category ${next} already exists.`)
      return
    }

    setCategories((prev) => [...prev, next])
    setCategoryInput('')
    setBanner(`Added category ${next}.`)
  }

  const removeCategory = (target: string) => {
    setCategories((prev) => prev.filter((category) => category !== target))
    setBanner(`Removed category ${target}.`)
  }

  const saveSport = async (status: SportStatus) => {
    if (validationMessage) {
      setBanner(validationMessage)
      return
    }

    try {
      await createMutation.mutate({
        name,
        displayName: name,
        description,
        active: status === 'Enabled',
      })
      setBanner(`${status === 'Draft' ? 'Saved draft for' : 'Published'} ${name}.`)
      resetForm()
    } catch (err) {
      setBanner('Failed to save sport. Please try again.')
    }
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setMinPlayers('2')
    setMaxPlayers('2')
    setSessionMinutes('60')
    setCategoryInput('')
    setCategories([])
    setRequiresEquipmentCheck(false)
    setRequiresReferee(false)
    setSupportsMixedTeams(true)
    setBanner('Form reset. Start adding a new sport from scratch.')
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Sport"
        subtitle="Define gameplay constraints, categories, and platform readiness before enabling a new sport."
        actions={
          <>
            <Link
              href="/admin/sports"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sports
            </Link>
            <button
              type="button"
              onClick={generateSlug}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <Sparkles className="w-4 h-4" />
              Generate Slug
            </button>
          </>
        }
      />

      <div className="rounded-[var(--radius-default)] bg-tertiary-fixed/80 px-4 py-3 text-sm font-semibold text-primary">
        {banner}
      </div>

      <section className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
        <AdminPanel eyebrow="Sport Details" title="Core Setup" className="2xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Sport Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Pickleball"
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Slug</span>
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="pickleball"
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Session Duration (minutes)</span>
              <input
                type="number"
                min={15}
                value={sessionMinutes}
                onChange={(event) => setSessionMinutes(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Minimum Players</span>
              <input
                type="number"
                min={1}
                value={minPlayers}
                onChange={(event) => setMinPlayers(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Maximum Players</span>
              <input
                type="number"
                min={1}
                value={maxPlayers}
                onChange={(event) => setMaxPlayers(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none resize-none"
              />
            </label>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Live Preview" title="Sport Card">
          <div className="rounded-[var(--radius-default)] bg-surface-container-low p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Catalog Name</p>
                <p className="mt-1 text-xl font-extrabold text-primary">{name || '---'}</p>
              </div>
              <AdminStatusPill label="Drafting" tone="blue" />
            </div>
            <p className="mt-3 text-sm text-primary/70">{description || 'Description preview appears here.'}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <article className="rounded-xl bg-surface-container-lowest p-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] font-lexend text-primary/55">Players</p>
                <p className="text-sm font-bold text-primary mt-1">{minPlayers || 0} - {maxPlayers || 0}</p>
              </article>
              <article className="rounded-xl bg-surface-container-lowest p-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] font-lexend text-primary/55">Duration</p>
                <p className="text-sm font-bold text-primary mt-1">{sessionMinutes || 0} min</p>
              </article>
            </div>
            <p className="mt-4 text-xs text-primary/65">Slug: /sports/{slug || 'new-sport'}</p>
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
        <AdminPanel eyebrow="Template Setup" title="Auto Populate">
          <div className="flex flex-col md:flex-row gap-2">
            <select
              value={template}
              onChange={(event) => setTemplate(event.target.value as TemplateName)}
              className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
            >
              {Object.keys(templates).map((nameKey) => (
                <option key={nameKey} value={nameKey}>
                  {nameKey}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={applyTemplate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary"
            >
              <ClipboardList className="w-4 h-4" />
              Apply Template
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <button
              type="button"
              onClick={() => setRequiresEquipmentCheck((prev) => !prev)}
              className={`rounded-xl px-3 py-2 font-semibold ${
                requiresEquipmentCheck
                  ? 'bg-emerald-500/20 text-emerald-800'
                  : 'bg-surface-container-low text-primary'
              }`}
            >
              {requiresEquipmentCheck ? 'Equipment check: ON' : 'Equipment check: OFF'}
            </button>
            <button
              type="button"
              onClick={() => setRequiresReferee((prev) => !prev)}
              className={`rounded-xl px-3 py-2 font-semibold ${
                requiresReferee ? 'bg-emerald-500/20 text-emerald-800' : 'bg-surface-container-low text-primary'
              }`}
            >
              {requiresReferee ? 'Referee required' : 'No referee needed'}
            </button>
            <button
              type="button"
              onClick={() => setSupportsMixedTeams((prev) => !prev)}
              className={`rounded-xl px-3 py-2 font-semibold ${
                supportsMixedTeams
                  ? 'bg-emerald-500/20 text-emerald-800'
                  : 'bg-surface-container-low text-primary'
              }`}
            >
              {supportsMixedTeams ? 'Mixed teams enabled' : 'Single-gender only'}
            </button>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Categories" title="Activity Segments">
          <div className="flex gap-2">
            <input
              value={categoryInput}
              onChange={(event) => setCategoryInput(event.target.value)}
              placeholder="Add category"
              className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
            />
            <button
              type="button"
              onClick={addCategory}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {categories.length === 0 ? (
              <div className="rounded-xl bg-surface-container-low p-3 text-sm text-primary/70">
                No categories added yet.
              </div>
            ) : (
              categories.map((category) => (
                <article
                  key={category}
                  className="rounded-xl bg-surface-container-low p-3 flex items-center justify-between gap-3"
                >
                  <p className="text-sm font-semibold text-primary">{category}</p>
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="rounded-full bg-red-500/15 px-3 py-1.5 text-[10px] font-lexend font-bold uppercase tracking-[0.12em] text-red-700"
                  >
                    Remove
                  </button>
                </article>
              ))
            )}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel
        eyebrow="Publish Controls"
        title="Finalize Sport"
        actions={
          <>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => saveSport('Draft')}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => saveSport('Enabled')}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Upload className="w-4 h-4" />
              Publish Sport
            </button>
          </>
        }
      >
        {validationMessage ? (
          <p className="text-sm font-semibold text-red-700">Validation: {validationMessage}</p>
        ) : (
          <p className="text-sm font-semibold text-emerald-700">Sport setup is valid and ready to publish.</p>
        )}

        <div className="mt-4 space-y-2">
          {createdSports.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low p-4 text-sm text-primary/70">
              No mock sports created yet.
            </div>
          ) : (
            createdSports.map((sport) => (
              <article
                key={sport.id}
                className="rounded-xl bg-surface-container-low p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-primary">{sport.name}</p>
                  <p className="text-xs text-primary/65 mt-1">/{sport.slug} • {sport.categoriesCount} categories • {sport.sessionMinutes} minutes</p>
                  <p className="text-[11px] text-primary/55 mt-1">{sport.createdAt}</p>
                </div>
                <AdminStatusPill label={sport.status} tone={sport.status === 'Enabled' ? 'green' : 'amber'} />
              </article>
            ))
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
