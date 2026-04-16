'use client'

import { useState } from 'react'
import { Save, ShieldCheck, UserCircle2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'

export default function OperatorProfilePage() {
  const [fullName, setFullName] = useState('Nouran Mostafa')
  const [title, setTitle] = useState('Regional Facility Operator')
  const [email, setEmail] = useState('nouran.mostafa@sportbook.app')
  const [phone, setPhone] = useState('+20 100 321 8890')
  const [notifyApprovals, setNotifyApprovals] = useState(true)
  const [notifyIncidents, setNotifyIncidents] = useState(true)
  const [notifyReports, setNotifyReports] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operator Profile"
        subtitle="Manage personal details, communication preferences, and access posture for your operator account."
        actions={
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        }
      />

      {saved ? (
        <div className="rounded-[var(--radius-default)] bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-primary">
          Profile updated successfully.
        </div>
      ) : null}

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <AdminPanel eyebrow="Identity" title="Personal Details">
          <div className="space-y-3">
            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Role title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Email address</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>

            <label className="block rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <span className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Phone</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full bg-transparent text-lg font-bold text-primary outline-none"
              />
            </label>
          </div>
        </AdminPanel>

        <div className="space-y-4">
          <AdminPanel eyebrow="Preferences" title="Notification Controls">
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <div>
                  <p className="text-sm font-bold text-primary">Approval notifications</p>
                  <p className="text-xs text-primary/60 mt-1">Alert me when requests need a decision.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyApprovals}
                  onChange={(event) => setNotifyApprovals(event.target.checked)}
                  className="h-5 w-5 accent-primary-container"
                />
              </label>

              <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <div>
                  <p className="text-sm font-bold text-primary">Incident notifications</p>
                  <p className="text-xs text-primary/60 mt-1">Receive immediate branch incident alerts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyIncidents}
                  onChange={(event) => setNotifyIncidents(event.target.checked)}
                  className="h-5 w-5 accent-primary-container"
                />
              </label>

              <label className="flex items-center justify-between rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
                <div>
                  <p className="text-sm font-bold text-primary">Weekly report digest</p>
                  <p className="text-xs text-primary/60 mt-1">Receive a Monday summary report by email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyReports}
                  onChange={(event) => setNotifyReports(event.target.checked)}
                  className="h-5 w-5 accent-primary-container"
                />
              </label>
            </div>
          </AdminPanel>

          <AdminPanel eyebrow="Security" title="Account Posture">
            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5">
              <p className="inline-flex items-center gap-2 text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">
                <ShieldCheck className="w-3.5 h-3.5" />
                Security level
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">Two-factor authentication is enabled.</p>
            </article>

            <article className="rounded-[var(--radius-default)] bg-surface-container-low p-3.5 mt-3">
              <p className="inline-flex items-center gap-2 text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">
                <UserCircle2 className="w-3.5 h-3.5" />
                Last login
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">2026-04-16 08:42 from Cairo, EG</p>
            </article>
          </AdminPanel>
        </div>
      </section>
    </div>
  )
}
