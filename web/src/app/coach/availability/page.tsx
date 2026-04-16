'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Plus } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { useApiCall } from '@/lib/api/hooks'
import { APIErrorFallback } from '@/components/ui/ErrorBoundary'
import { statusTone } from '@/lib/admin/ui'

const templateCards = [
  {
    id: 'temp-1',
    title: 'Competition Week Template',
    description: 'Shifts evening sessions to match-play slots and blocks Friday recovery window.',
  },
  {
    id: 'temp-2',
    title: 'Academy Launch Template',
    description: 'Adds additional beginner windows on Tuesday and Thursday afternoons.',
  },
  {
    id: 'temp-3',
    title: 'Travel Week Template',
    description: 'Consolidates sessions to two days and auto-markets limited availability.',
  },
]

export default function CoachAvailabilityPage() {
  const { data: availabilityResponse, loading, error } = useApiCall('/coach/availability')
  const availabilityData = availabilityResponse?.data || availabilityResponse || {}

  const availabilityWindows = availabilityData.windows || []
  const availabilityExceptions = availabilityData.exceptions || []

  const availableDays = useMemo(
    () => Array.from(new Set(availabilityWindows.map((window: any) => window.day))),
    [availabilityWindows],
  )
  const [selectedDay, setSelectedDay] = useState(availableDays[0] ?? 'Monday')

  const filteredWindows = useMemo(
    () => availabilityWindows.filter((window: any) => window.day === selectedDay),
    [availabilityWindows, selectedDay],
  )

  if (error) {
    return <APIErrorFallback error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Availability"
        subtitle="Control your working windows, exceptions, and seasonal templates before sessions go live to athletes."
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Plus className="w-4 h-4" />
            Add Availability Block
          </button>
        }
      />

      <AdminPanel eyebrow="Day selector" title="Weekly Coverage">
        <div className="flex flex-wrap gap-2">
          {availableDays.map((day: any) => {
            const active = day === selectedDay

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-2 rounded-full text-xs font-lexend font-bold uppercase tracking-[0.14em] ${
                  active
                    ? 'bg-primary-container text-surface-container-lowest'
                    : 'bg-surface-container-low text-primary/75'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </AdminPanel>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <AdminPanel eyebrow="Selected day" title={`${selectedDay} Session Windows`}>
          <div className="space-y-3">
            {filteredWindows.map((window: any) => (
              <article key={window.id} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{window.start || 'Unknown'} - {window.end || 'Unknown'}</p>
                    <p className="text-xs text-primary/60 mt-1">{window.venue || 'Unknown'}</p>
                  </div>
                  <AdminStatusPill label={window.mode || 'Unknown'} tone={statusTone(window.mode || 'Unknown')} />
                </div>
              </article>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Exceptions" title="Blocked Dates & Overrides">
          <div className="space-y-3">
            {availabilityExceptions.map((exception: any) => (
              <article key={exception.id} className="rounded-[var(--radius-default)] bg-surface-container-low px-3.5 py-3">
                <p className="text-sm font-bold text-primary">{new Date(exception.date).toLocaleDateString()}</p>
                <p className="text-xs text-primary/60 mt-1">{exception.reason || 'Unknown'}</p>
                <p className="text-xs font-semibold text-primary mt-2">{exception.impact || 'Unknown'}</p>
              </article>
            ))}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel eyebrow="Automation" title="Reusable Templates">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {templateCards.map((template) => (
            <article key={template.id} className="rounded-[var(--radius-default)] bg-surface-container-low p-4">
              <p className="text-sm font-bold text-primary">{template.title}</p>
              <p className="text-xs text-primary/60 mt-2 leading-relaxed">{template.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-[var(--radius-default)] bg-primary-container/10 p-3.5 text-xs text-primary/75 inline-flex items-start gap-2">
          <CalendarClock className="w-4 h-4 shrink-0 mt-0.5" />
          Publish updates here first, then sync to booking surfaces so athletes only see finalized windows.
        </div>
      </AdminPanel>
    </div>
  )
}
