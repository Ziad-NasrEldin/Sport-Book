'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, Copy, FlaskConical, RefreshCcw, Save, Sparkles, TicketPercent, Upload } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'

type DiscountKind = 'Percentage' | 'Fixed Amount'
type MockCouponStatus = 'Draft' | 'Active'

type MockCreatedCoupon = {
  id: string
  code: string
  campaign: string
  status: MockCouponStatus
  valueLabel: string
  createdAt: string
}

const sportOptions = ['Padel', 'Tennis', 'Squash', 'Badminton']

export default function AdminCreateCouponPage() {
  const [campaignName, setCampaignName] = useState('Weekend Prime Time Boost')
  const [couponCode, setCouponCode] = useState('WEEKEND20')
  const [discountKind, setDiscountKind] = useState<DiscountKind>('Percentage')
  const [discountValue, setDiscountValue] = useState('20')
  const [minimumSpend, setMinimumSpend] = useState('300')
  const [maxDiscountCap, setMaxDiscountCap] = useState('150')
  const [startDate, setStartDate] = useState('2026-04-20')
  const [endDate, setEndDate] = useState('2026-05-20')
  const [totalRedemptions, setTotalRedemptions] = useState('3000')
  const [perUserLimit, setPerUserLimit] = useState('2')
  const [isStackable, setIsStackable] = useState(false)
  const [firstBookingOnly, setFirstBookingOnly] = useState(false)
  const [newUsersOnly, setNewUsersOnly] = useState(false)
  const [selectedSports, setSelectedSports] = useState<string[]>(['Padel', 'Tennis'])
  const [simulatedCart, setSimulatedCart] = useState('640')
  const [simulationResult, setSimulationResult] = useState('')
  const [banner, setBanner] = useState('Use the controls below to draft or publish a coupon.')
  const [createdCoupons, setCreatedCoupons] = useState<MockCreatedCoupon[]>([])

  const valueLabel = useMemo(() => {
    if (discountKind === 'Percentage') {
      return `${discountValue || 0}%`
    }

    return `EGP ${discountValue || 0}`
  }, [discountKind, discountValue])

  const validationMessage = useMemo(() => {
    if (!campaignName.trim()) return 'Campaign name is required.'
    if (!couponCode.trim()) return 'Coupon code is required.'
    if (!discountValue || Number(discountValue) <= 0) return 'Discount value must be greater than zero.'
    if (!startDate || !endDate) return 'Start and end dates are required.'
    if (new Date(endDate) < new Date(startDate)) return 'End date cannot be before start date.'
    if (selectedSports.length === 0) return 'Select at least one sport scope.'

    return ''
  }, [campaignName, couponCode, discountValue, endDate, selectedSports.length, startDate])

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((entry) => entry !== sport) : [...prev, sport],
    )
  }

  const generateCode = () => {
    const seed = campaignName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const head = seed.slice(0, 8) || 'SPORTBOOK'
    const tail = Math.floor(100 + Math.random() * 899)
    const nextCode = `${head}${tail}`
    setCouponCode(nextCode)
    setBanner(`Generated a unique code: ${nextCode}`)
  }

  const resetForm = () => {
    setCampaignName('')
    setCouponCode('')
    setDiscountKind('Percentage')
    setDiscountValue('')
    setMinimumSpend('')
    setMaxDiscountCap('')
    setStartDate('')
    setEndDate('')
    setTotalRedemptions('')
    setPerUserLimit('1')
    setIsStackable(false)
    setFirstBookingOnly(false)
    setNewUsersOnly(false)
    setSelectedSports([])
    setSimulationResult('')
    setBanner('Form reset. Fill details to create a new promotion.')
  }

  const saveCoupon = (status: MockCouponStatus) => {
    if (validationMessage) {
      setBanner(validationMessage)
      return
    }

    const nextId = `CP-MOCK-${String(createdCoupons.length + 1).padStart(2, '0')}`
    const entry: MockCreatedCoupon = {
      id: nextId,
      code: couponCode,
      campaign: campaignName,
      status,
      valueLabel,
      createdAt: new Date().toLocaleString(),
    }

    setCreatedCoupons((prev) => [entry, ...prev])
    setBanner(`${status === 'Draft' ? 'Saved draft' : 'Published'} coupon ${couponCode} successfully.`)
  }

  const runSimulation = () => {
    if (!discountValue || Number(discountValue) <= 0) {
      setSimulationResult('Add a valid discount value before simulation.')
      return
    }

    const cart = Number(simulatedCart || '0')
    const min = Number(minimumSpend || '0')

    if (cart < min) {
      setSimulationResult(`Cart EGP ${cart} does not meet minimum spend EGP ${min}.`)
      return
    }

    const rawDiscount =
      discountKind === 'Percentage'
        ? (cart * Number(discountValue || '0')) / 100
        : Number(discountValue || '0')
    const cap = Number(maxDiscountCap || '0')
    const appliedDiscount = cap > 0 ? Math.min(rawDiscount, cap) : rawDiscount
    const finalTotal = Math.max(cart - appliedDiscount, 0)

    setSimulationResult(
      `Discount applied: EGP ${Math.round(appliedDiscount)}. Final total: EGP ${Math.round(finalTotal)}.`,
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Create Coupon"
        subtitle="Build campaign rules, audience targeting, and limits with live simulation before publishing."
        actions={
          <>
            <Link
              href="/admin/coupons"
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Coupons
            </Link>
            <button
              type="button"
              onClick={generateCode}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <Sparkles className="w-4 h-4" />
              Generate Code
            </button>
          </>
        }
      />

      <div className="rounded-[var(--radius-default)] bg-tertiary-fixed/80 px-4 py-3 text-sm font-semibold text-primary">
        {banner}
      </div>

      <section className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
        <AdminPanel eyebrow="Campaign Details" title="Core Setup" className="2xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Campaign Name</span>
              <input
                value={campaignName}
                onChange={(event) => setCampaignName(event.target.value)}
                placeholder="Summer Growth Push"
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Coupon Code</span>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="WELCOME100"
                  className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!couponCode) return
                    navigator.clipboard.writeText(couponCode)
                    setBanner(`Copied coupon code ${couponCode}.`)
                  }}
                  className="rounded-xl bg-primary/10 px-3 py-2 text-primary"
                  aria-label="Copy coupon code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Discount Type</span>
              <select
                value={discountKind}
                onChange={(event) => setDiscountKind(event.target.value as DiscountKind)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed Amount">Fixed Amount</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Discount Value</span>
              <input
                type="number"
                min={0}
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder={discountKind === 'Percentage' ? '20' : '100'}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Minimum Spend (EGP)</span>
              <input
                type="number"
                min={0}
                value={minimumSpend}
                onChange={(event) => setMinimumSpend(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Max Discount Cap (EGP)</span>
              <input
                type="number"
                min={0}
                value={maxDiscountCap}
                onChange={(event) => setMaxDiscountCap(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Total Redemptions</span>
              <input
                type="number"
                min={1}
                value={totalRedemptions}
                onChange={(event) => setTotalRedemptions(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Per-User Limit</span>
              <input
                type="number"
                min={1}
                value={perUserLimit}
                onChange={(event) => setPerUserLimit(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Live Preview" title="Coupon Snapshot">
          <div className="rounded-[var(--radius-default)] bg-surface-container-low p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-lexend uppercase tracking-[0.14em] text-primary/55">Code</p>
                <p className="mt-1 text-xl font-extrabold text-primary">{couponCode || '---'}</p>
              </div>
              <AdminStatusPill label="Drafting" tone="blue" />
            </div>

            <p className="mt-4 text-sm text-primary/75">{campaignName || 'Campaign title appears here.'}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <article className="rounded-xl bg-surface-container-lowest p-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] font-lexend text-primary/55">Discount</p>
                <p className="text-sm font-bold text-primary mt-1">{valueLabel}</p>
              </article>
              <article className="rounded-xl bg-surface-container-lowest p-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] font-lexend text-primary/55">Min Spend</p>
                <p className="text-sm font-bold text-primary mt-1">EGP {minimumSpend || 0}</p>
              </article>
            </div>

            <p className="mt-4 text-xs text-primary/65">Applies to: {selectedSports.join(', ') || 'No sports selected'}</p>
            <p className="mt-1 text-xs text-primary/65">Window: {startDate || '--'} to {endDate || '--'}</p>
          </div>
        </AdminPanel>
      </section>

      <section className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
        <AdminPanel eyebrow="Eligibility" title="Scope and Rules">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sportOptions.map((sport) => {
              const active = selectedSports.includes(sport)
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                    active
                      ? 'bg-primary text-surface-container-lowest'
                      : 'bg-surface-container-low text-primary'
                  }`}
                >
                  {sport}
                </button>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <button
              type="button"
              onClick={() => setIsStackable((prev) => !prev)}
              className={`rounded-xl px-3 py-2 font-semibold ${
                isStackable ? 'bg-emerald-500/20 text-emerald-800' : 'bg-surface-container-low text-primary'
              }`}
            >
              {isStackable ? 'Stackable: ON' : 'Stackable: OFF'}
            </button>
            <button
              type="button"
              onClick={() => setFirstBookingOnly((prev) => !prev)}
              className={`rounded-xl px-3 py-2 font-semibold ${
                firstBookingOnly ? 'bg-emerald-500/20 text-emerald-800' : 'bg-surface-container-low text-primary'
              }`}
            >
              {firstBookingOnly ? 'First booking only' : 'All bookings'}
            </button>
            <button
              type="button"
              onClick={() => setNewUsersOnly((prev) => !prev)}
              className={`rounded-xl px-3 py-2 font-semibold ${
                newUsersOnly ? 'bg-emerald-500/20 text-emerald-800' : 'bg-surface-container-low text-primary'
              }`}
            >
              {newUsersOnly ? 'New users only' : 'All users'}
            </button>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Testing" title="Redemption Simulator">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <label className="space-y-1.5">
              <span className="text-xs font-lexend uppercase tracking-[0.12em] text-primary/55">Cart Amount (EGP)</span>
              <input
                type="number"
                value={simulatedCart}
                min={0}
                onChange={(event) => setSimulatedCart(event.target.value)}
                className="w-full rounded-xl bg-surface-container-low px-3 py-2.5 text-sm text-primary outline-none"
              />
            </label>
            <button
              type="button"
              onClick={runSimulation}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary"
            >
              <FlaskConical className="w-4 h-4" />
              Run Simulation
            </button>
          </div>

          <div className="mt-3 rounded-xl bg-surface-container-low p-3 text-sm text-primary/80 min-h-12">
            {simulationResult || 'Run a simulation to preview applied discount and final checkout value.'}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel
        eyebrow="Publish Controls"
        title="Finalize Campaign"
        actions={
          <>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-semibold text-primary"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => saveCoupon('Draft')}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => saveCoupon('Active')}
              className="inline-flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-sm font-semibold text-surface-container-lowest"
            >
              <Upload className="w-4 h-4" />
              Publish Coupon
            </button>
          </>
        }
      >
        {validationMessage ? (
          <p className="text-sm font-semibold text-red-700">Validation: {validationMessage}</p>
        ) : (
          <p className="text-sm font-semibold text-emerald-700">Form is valid and ready to publish.</p>
        )}

        <div className="mt-4 space-y-2">
          {createdCoupons.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low p-4 text-sm text-primary/70">
              No saved drafts yet. Use Save Draft or Publish Coupon.
            </div>
          ) : (
            createdCoupons.map((coupon) => (
              <article
                key={coupon.id}
                className="rounded-xl bg-surface-container-low p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <TicketPercent className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{coupon.code}</p>
                    <p className="text-xs text-primary/65 mt-1">{coupon.campaign} • {coupon.valueLabel}</p>
                    <p className="text-[11px] text-primary/55 mt-1">{coupon.createdAt}</p>
                  </div>
                </div>
                <AdminStatusPill label={coupon.status} tone={coupon.status === 'Active' ? 'green' : 'amber'} />
              </article>
            ))
          )}
        </div>
      </AdminPanel>
    </div>
  )
}
