'use client'

import { useMemo, useState, useEffect } from 'react'
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'
import type { CoachAvailabilityData, CoachAvailabilityException, CoachAvailabilityWindow } from '@/lib/coach/types'
import { api } from '@/lib/api/client'
import { AppSelect } from '@/components/ui/AppSelect'

const EMPTY_WINDOW: {
  day: string
  start: string
  end: string
  venue: string
  mode: 'ACTIVE' | 'PAUSED'
} = {
  day: 'Sunday',
  start: '09:00',
  end: '12:00',
  venue: 'SportBook Club - Main Arena',
  mode: 'ACTIVE',
}

const EMPTY_EXCEPTION = {
  date: new Date().toISOString().slice(0, 10),
  reason: '',
  impact: 'Unavailable all day',
  isAvailable: false,
}

export default function CoachAvailabilityPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { data: availabilityData, loading, error, refetch } = useApiCall<CoachAvailabilityData>('/coach/availability')
  const { data: templatesData } = useApiCall<{ id: string; title: string; description: string }[]>('/coach/availability-templates')

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsLoaded(true), 50)
      return () => clearTimeout(timer)
    }
  }, [loading])

  const templateCards = templatesData || []

  const [windowForm, setWindowForm] = useState(EMPTY_WINDOW)
  const [editingWindowId, setEditingWindowId] = useState<string | null>(null)
  const [exceptionForm, setExceptionForm] = useState(EMPTY_EXCEPTION)
  const [editingExceptionId, setEditingExceptionId] = useState<string | null>(null)

  const availabilityWindows = availabilityData?.windows ?? []
  const availabilityExceptions = availabilityData?.exceptions ?? []

  const availableDays = useMemo(
    () => Array.from(new Set(availabilityWindows.map((window) => window.day))),
    [availabilityWindows],
  )
  const [selectedDay, setSelectedDay] = useState('Sunday')

  const filteredWindows = useMemo(
    () => availabilityWindows.filter((window) => window.day === selectedDay),
    [availabilityWindows, selectedDay],
  )

  if (error) {
    return <APIErrorFallback error={error} onRetry={refetch} />
  }

  const handleWindowSubmit = async () => {
    if (editingWindowId) {
      await api.patch(`/coach/availability/${editingWindowId}`, windowForm)
    } else {
      await api.post('/coach/availability', windowForm)
    }
    await refetch()
    setWindowForm(EMPTY_WINDOW)
    setEditingWindowId(null)
  }

  const handleExceptionSubmit = async () => {
    if (editingExceptionId) {
      await api.patch(`/coach/availability/exceptions/${editingExceptionId}`, exceptionForm)
    } else {
      await api.post('/coach/availability/exceptions', exceptionForm)
    }
    await refetch()
    setExceptionForm(EMPTY_EXCEPTION)
    setEditingExceptionId(null)
  }

  return (
    <div className={`space-y-8 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <AdminPageHeader
        title="Availability"
        subtitle="Control your working windows, exceptions, and seasonal templates before sessions go live to athletes."
        actions={
          <button
            type="button"
            onClick={handleWindowSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Plus className="w-4 h-4" />
            {editingWindowId ? 'Save Availability Block' : 'Add Availability Block'}
          </button>
        }
      />

      <section className={`grid grid-cols-1 xl:grid-cols-2 gap-6 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <AdminPanel eyebrow="Create window" title={editingWindowId ? 'Edit Availability Block' : 'Add Availability Block'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Day" value={windowForm.day} onChange={(value) => setWindowForm((current) => ({ ...current, day: value }))} options={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']} />
            <SelectField label="Mode" value={windowForm.mode} onChange={(value) => setWindowForm((current) => ({ ...current, mode: value as 'ACTIVE' | 'PAUSED' }))} options={['ACTIVE', 'PAUSED']} />
            <InputField label="Start" type="time" value={windowForm.start} onChange={(value) => setWindowForm((current) => ({ ...current, start: value }))} />
            <InputField label="End" type="time" value={windowForm.end} onChange={(value) => setWindowForm((current) => ({ ...current, end: value }))} />
            <InputField label="Venue" value={windowForm.venue} onChange={(value) => setWindowForm((current) => ({ ...current, venue: value }))} className="md:col-span-2" />
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Exceptions" title={editingExceptionId ? 'Edit Exception' : 'Add Availability Exception'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Date" type="date" value={exceptionForm.date} onChange={(value) => setExceptionForm((current) => ({ ...current, date: value }))} />
            <SelectField label="Availability" value={exceptionForm.isAvailable ? 'Available' : 'Blocked'} onChange={(value) => setExceptionForm((current) => ({ ...current, isAvailable: value === 'Available' }))} options={['Blocked', 'Available']} />
            <InputField label="Reason" value={exceptionForm.reason} onChange={(value) => setExceptionForm((current) => ({ ...current, reason: value }))} className="md:col-span-2" />
            <InputField label="Impact" value={exceptionForm.impact} onChange={(value) => setExceptionForm((current) => ({ ...current, impact: value }))} className="md:col-span-2" />
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => void handleExceptionSubmit()} className="rounded-full bg-primary-container px-5 py-2.5 text-sm font-bold text-surface-container-lowest shadow-md hover:shadow-lg transition-shadow">
              {editingExceptionId ? 'Save Exception' : 'Add Exception'}
            </button>
            {editingExceptionId && (
              <button type="button" onClick={() => { setEditingExceptionId(null); setExceptionForm(EMPTY_EXCEPTION) }} className="rounded-full bg-surface-container-low px-5 py-2.5 text-sm font-bold text-primary hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
            )}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Day selector" title="Weekly Coverage" className={`transition-all duration-500 delay-100 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex flex-wrap gap-3">
          {(availableDays.length > 0 ? availableDays : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).map((day) => {
            const active = day === selectedDay

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2.5 rounded-full text-xs font-lexend font-black uppercase tracking-[0.2em] shadow-sm ${
                  active
                    ? 'bg-primary-container text-surface-container-lowest shadow-md'
                    : 'bg-surface-container-low text-primary/75 hover:bg-surface-container-high transition-colors'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </AdminPanel>

      <section className={`grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 transition-all duration-500 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <AdminPanel eyebrow="Selected day" title={`${selectedDay} Session Windows`}>
          <div className="space-y-4">
            {filteredWindows.map((window) => (
              <article key={window.id} className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-primary">{window.start} - {window.end}</p>
                    <p className="text-sm text-primary/70 mt-1.5 font-semibold">{window.venue}</p>
                  </div>
                  <AdminStatusPill label={window.mode} tone={statusTone(window.mode)} />
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWindowId(window.id)
                      setWindowForm({
                        day: window.day,
                        start: toTimeValue(window.start),
                        end: toTimeValue(window.end),
                        venue: window.venue,
                        mode: window.mode === 'PAUSED' ? 'PAUSED' : 'ACTIVE',
                      })
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-black text-primary hover:bg-surface-container-high transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.delete(`/coach/availability/${window.id}`)
                      await refetch()
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-black text-secondary hover:bg-surface-container-high transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Exceptions" title="Blocked Dates & Overrides">
          <div className="space-y-4">
            {availabilityExceptions.map((exception) => (
              <article key={exception.id} className="rounded-[var(--radius-md)] bg-surface-container-low px-5 py-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transition-shadow">
                <p className="text-base font-black text-primary">{new Date(exception.date).toLocaleDateString()}</p>
                <p className="text-sm text-primary/70 mt-1.5 font-semibold">{exception.reason}</p>
                <p className="text-sm font-bold text-primary mt-2.5">{exception.impact}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExceptionId(exception.id)
                      setExceptionForm({
                        date: exception.date.slice(0, 10),
                        reason: exception.reason,
                        impact: exception.impact,
                        isAvailable: exception.isAvailable,
                      })
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-black text-primary hover:bg-surface-container-high transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.delete(`/coach/availability/exceptions/${exception.id}`)
                      await refetch()
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-black text-secondary hover:bg-surface-container-high transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Automation" title="Reusable Templates" className={`transition-all duration-500 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {templateCards.map((template) => (
            <article key={template.id} className="rounded-[var(--radius-md)] bg-surface-container-low p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transition-shadow">
              <p className="text-base font-black text-primary">{template.title}</p>
              <p className="text-sm text-primary/70 mt-2.5 leading-relaxed font-semibold">{template.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[var(--radius-md)] bg-primary-container/10 p-5 text-sm text-primary/75 inline-flex items-start gap-3 shadow-sm">
          <CalendarClock className="w-5 h-5 shrink-0 mt-0.5" />
          Publish updates here first, then sync to booking surfaces so athletes only see finalized windows.
        </div>
      </AdminPanel>
    </div>
  )
}

function toTimeValue(label: string) {
  const [time, suffix] = label.split(' ')
  const [hour] = time.split(':').map(Number)
  let normalizedHour = hour % 12
  if (suffix === 'PM') normalizedHour += 12
  return `${String(normalizedHour).padStart(2, '0')}:00`
}

type InputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  className?: string
}

function InputField({ label, value, onChange, type = 'text', className }: InputFieldProps) {
  return (
    <label className={`space-y-1 ${className ?? ''}`}>
      <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
      />
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="space-y-1">
      <span className="text-[11px] font-lexend uppercase tracking-[0.14em] text-primary/55">{label}</span>
      <AppSelect
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-2.5 text-sm text-primary outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </AppSelect>
    </label>
  )
}


