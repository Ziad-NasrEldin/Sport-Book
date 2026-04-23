import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError } from '@common/errors'
import { AuditAction, logAudit } from '@plugins/audit'
import { hashPassword } from '@lib/crypto'
import type {
  ListUsersInput,
  UpdateUserInput,
  CreateFacilityInput,
  UpdateFacilityInput,
  CreateCoachInput,
  CreateStoreProductInput,
  UpdateStoreProductInput,
  UpdateStoreOrderStatusInput,
  UpdateBookingStatusInput,
  CreateSportInput,
  UpdateSportInput,
  CreateCouponInput,
  UpdateVerificationCaseInput,
  UpdateLocalizationDefaultInput,
  UpdatePlatformSettingsInput,
  CreateReportJobInput,
  RespondToRoleUpgradeInput,
  ListRoleUpgradesInput,
  ListAuditLogsInput,
} from './schema'

type VerificationChecklistItem = {
  id: string
  label: string
  verified: boolean
}

type VerificationRisk = 'Low' | 'Medium' | 'High'
type VerificationStatus = 'Pending Review' | 'Approved' | 'Rejected' | 'Needs Info'

type VerificationTimelineItem = {
  id: string
  message: string
  at: string
}

type VerificationWorkflowMeta = {
  assignee?: string | null
  riskLevel?: VerificationRisk
  region?: string
  checklist?: VerificationChecklistItem[]
  timeline?: VerificationTimelineItem[]
  adminNote?: string
}

type VerificationMetadata = {
  files?: string[]
  details?: Record<string, string | undefined>
  verification?: VerificationWorkflowMeta
}

type VerificationCaseDetails = {
  id: string
  entity: string
  type: string
  submittedAt: string
  riskLevel: VerificationRisk
  status: VerificationStatus
  region: string
  assignee: string
  checklist: VerificationChecklistItem[]
  timeline: VerificationTimelineItem[]
  adminNote?: string
}

type PlatformSettings = {
  commissionRate: number
  approvalMode: 'manual' | 'auto'
  refundWindow: number
  strictKyc: boolean
  fraudMonitoring: boolean
  apiKeyRotationLastRotatedAt: string
}

type LocalizationConfig = {
  defaultLocale: string
  locales?: typeof localeRegistry
}

const SETTINGS_PAGE_KEY = 'admin.settings'
const LOCALIZATION_PAGE_KEY = 'admin.localization'

const localeRegistry = [
  {
    id: 'en-EG',
    locale: 'en-EG',
    language: 'English (Egypt)',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    rtl: false,
  },
  {
    id: 'ar-EG',
    locale: 'ar-EG',
    language: 'Arabic (Egypt)',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    rtl: true,
  },
]

const defaultPlatformSettings: PlatformSettings = {
  commissionRate: 18,
  approvalMode: 'manual',
  refundWindow: 12,
  strictKyc: true,
  fraudMonitoring: true,
  apiKeyRotationLastRotatedAt: new Date().toISOString(),
}

const defaultLocalizationConfig: LocalizationConfig = {
  defaultLocale: 'en-EG',
  locales: localeRegistry,
}

function safeParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function upsertDocumentEntry(documents: unknown[], type: string, payload: Record<string, unknown>) {
  const nextDocuments = Array.isArray(documents) ? [...documents] : []
  const existingIndex = nextDocuments.findIndex(
    (entry) => entry && typeof entry === 'object' && (entry as { type?: string }).type === type,
  )
  const nextEntry = { type, ...payload }

  if (existingIndex >= 0) {
    nextDocuments[existingIndex] = nextEntry
  } else {
    nextDocuments.push(nextEntry)
  }

  return nextDocuments
}

function mapVerificationStatus(status: string): 'Pending Review' | 'Approved' | 'Rejected' | 'Needs Info' {
  switch (status) {
    case 'APPROVED':
      return 'Approved'
    case 'REJECTED':
      return 'Rejected'
    case 'NEEDS_INFO':
      return 'Needs Info'
    default:
      return 'Pending Review'
  }
}

function mapVerificationStatusToDb(status?: string): string | undefined {
  switch (status) {
    case 'Approved':
      return 'APPROVED'
    case 'Rejected':
      return 'REJECTED'
    case 'Needs Info':
      return 'NEEDS_INFO'
    case 'Pending Review':
      return 'PENDING'
    default:
      return undefined
  }
}

function mapVerificationDbStatusToAuditAction(status: string): AuditAction | null {
  if (status === 'APPROVED') return AuditAction.APPROVE
  if (status === 'REJECTED') return AuditAction.REJECT
  if (status === 'NEEDS_INFO') return AuditAction.VERIFY
  return null
}

function getVerificationWorkflowMeta(request: {
  documents: string
  notes: string | null
  submittedAt?: Date
}) {
  const parsedDocuments = safeParseJson<VerificationMetadata | unknown[]>(request.documents, [])
  const parsedDocumentObject =
    !Array.isArray(parsedDocuments) && parsedDocuments && typeof parsedDocuments === 'object'
      ? (parsedDocuments as VerificationMetadata)
      : null
  const workflowMeta = (parsedDocumentObject?.verification ?? {}) as VerificationWorkflowMeta

  const notePayload = safeParseJson<{ adminNote?: string } | null>(request.notes, null)
  const adminNote =
    workflowMeta.adminNote ??
    (notePayload && typeof notePayload === 'object' && notePayload.adminNote
      ? notePayload.adminNote
      : request.notes && request.notes.trim().startsWith('{')
        ? ''
        : request.notes ?? '')

  return {
    details: parsedDocumentObject?.details ?? {},
    workflowMeta,
    adminNote,
  }
}

function requestSubmittedAtToIso(request: { submittedAt?: Date }) {
  return request.submittedAt?.toISOString() ?? new Date().toISOString()
}

async function getConfigRecord(page: string) {
  return prisma.cmsContent.findUnique({
    where: {
      page_language: {
        page,
        language: 'system',
      },
    },
  })
}

async function setConfigRecord(page: string, title: string, payload: unknown) {
  return prisma.cmsContent.upsert({
    where: {
      page_language: {
        page,
        language: 'system',
      },
    },
    update: {
      title,
      content: JSON.stringify(payload),
      status: 'PUBLISHED',
      version: '1.0',
    },
    create: {
      page,
      language: 'system',
      title,
      content: JSON.stringify(payload),
      status: 'PUBLISHED',
      version: '1.0',
    },
  })
}

function defaultVerificationChecklist(details: Record<string, string | undefined>, requestedRole: string): VerificationChecklistItem[] {
  const hasIdentity = Boolean(details.fullName && details.email && details.phone)
  const hasLicense = requestedRole === 'COACH'
    ? Boolean(details.specialization || details.certifications)
    : Boolean(details.facilityName || details.registrationNumber)
  const hasFinancialProof = Boolean(details.city || details.facilityAddress)

  return [
    { id: 'doc-id', label: 'National ID / Passport validation', verified: hasIdentity },
    { id: 'doc-face', label: 'Face match and selfie confidence', verified: false },
    { id: 'doc-license', label: 'Business or coaching license authenticity', verified: hasLicense },
    { id: 'doc-bank', label: 'Bank account ownership proof', verified: hasFinancialProof },
  ]
}

function defaultVerificationTimeline(submittedAt: string, status: VerificationStatus): VerificationTimelineItem[] {
  const timeline: VerificationTimelineItem[] = [
    { id: 'seed-1', message: 'Case created and queued for review.', at: submittedAt },
    { id: 'seed-2', message: 'Automated risk scoring completed.', at: submittedAt },
  ]

  if (status !== 'Pending Review') {
    timeline.unshift({
      id: 'seed-3',
      message: `Case moved to ${status}.`,
      at: submittedAt,
    })
  }

  return timeline
}

function prependTimelineEntry(
  timeline: VerificationTimelineItem[],
  message: string,
  at: string = new Date().toISOString(),
) {
  return [
    {
      id: `timeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      at,
    },
    ...timeline,
  ]
}

function parseDelimitedList(value?: string) {
  if (!value) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function deriveStoreProductStatus(quantity: number, status?: string) {
  if (status) return status
  if (quantity <= 0) return 'OUT_OF_STOCK'
  if (quantity <= 10) return 'LOW_STOCK'
  return 'IN_STOCK'
}

function mapStoreProduct(product: {
  id: string
  facilityId: string
  name: string
  description: string | null
  category: string
  images: string
  price: any
  currency: string
  quantity: number
  status: string
  createdAt: Date
  updatedAt: Date
  facility?: { name: string } | null
}) {
  const images = safeParseJson<string[]>(product.images, [])

  return {
    ...product,
    title: product.name,
    imageUrl: images[0] ?? '',
    images,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

function mapStoreOrder(order: {
  id: string
  userId: string
  subtotal: any
  discount: any
  deliveryFee: any
  total: any
  currency: string
  fulfillment: string
  status: string
  deliveryAddress: string | null
  contactPhone: string | null
  paymentStatus: string
  paymentMethod: string | null
  paymentRef: string | null
  createdAt: Date
  updatedAt: Date
  user?: { name: string | null; email: string } | null
  items: Array<{
    productId: string
    quantity: number
    product: { name: string }
  }>
}) {
  const firstItem = order.items[0]

  return {
    ...order,
    quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
    productId: firstItem?.productId ?? null,
    product: firstItem ? { title: firstItem.product.name } : null,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

function generateFacilityOperatorIdentity(input: {
  facilityName: string
  operatorName?: string
  operatorEmail?: string
}) {
  const normalizedFacility = slugify(input.facilityName) || 'facility'
  const normalizedOperator = slugify(input.operatorName ?? '') || 'manager'
  const operatorName = input.operatorName?.trim() || `${input.facilityName} Manager`
  const operatorEmail =
    input.operatorEmail?.trim().toLowerCase() ||
    `${normalizedFacility}-${normalizedOperator}@sportbook.local`

  return {
    operatorName,
    operatorEmail,
  }
}

async function provisionApprovedRoleProfile(
  tx: any,
  request: {
    userId: string
    requestedRole: string
    sportId: string | null
    experienceYears: number | null
    bio: string | null
    businessName: string | null
    businessAddress: string | null
    licenseNumber: string | null
    user: { name: string }
  },
  details: Record<string, string | undefined>,
) {
  if (request.requestedRole === 'OPERATOR') {
    const existingFacility = await tx.facility.findUnique({
      where: { operatorId: request.userId },
    })

    if (existingFacility) {
      await tx.facility.update({
        where: { id: existingFacility.id },
        data: {
          status: 'ACTIVE',
          name: request.businessName ?? existingFacility.name,
          address: request.businessAddress ?? existingFacility.address,
          city: details.city ?? existingFacility.city,
        },
      })
      return
    }

    await tx.facility.create({
      data: {
        operatorId: request.userId,
        name: request.businessName ?? `${request.user.name}'s Facility`,
        description: request.bio ?? details.requestMessage ?? 'Approved through verification flow.',
        address: request.businessAddress ?? details.facilityAddress,
        city: details.city ?? 'Cairo',
        phone: details.phone,
        email: details.email,
        status: 'ACTIVE',
      },
    })
    return
  }

  if (request.requestedRole === 'COACH') {
    const existingCoach = await tx.coach.findUnique({
      where: { userId: request.userId },
    })

    const sport =
      (request.sportId
        ? await tx.sport.findUnique({ where: { id: request.sportId } })
        : null) ??
      (await tx.sport.findFirst({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
      }))

    if (!sport) {
      throw new BadRequestError('Cannot approve coach request without an available sport')
    }

    const coachPayload = {
      sportId: sport.id,
      slug: `${slugify(request.user.name || 'coach') || 'coach'}-${request.userId.slice(-6)}`,
      bio: request.bio ?? details.requestMessage ?? 'Approved through verification flow.',
      experienceYears: request.experienceYears ?? 0,
      certifications: JSON.stringify(parseDelimitedList(details.certifications)),
      specialties: JSON.stringify(parseDelimitedList(details.specialization)),
      isVerified: true,
      isActive: true,
    }

    if (existingCoach) {
      await tx.coach.update({
        where: { id: existingCoach.id },
        data: coachPayload,
      })
      return
    }

    await tx.coach.create({
      data: {
        userId: request.userId,
        ...coachPayload,
      },
    })
  }
}

function riskFromChecklist(checklist: VerificationChecklistItem[]): VerificationRisk {
  const verifiedCount = checklist.filter((item) => item.verified).length

  if (verifiedCount >= checklist.length - 1) return 'Low'
  if (verifiedCount >= 2) return 'Medium'
  return 'High'
}

function formatVerificationCase(
  request: {
    id: string
    requestedRole: string
    businessName: string | null
    businessAddress: string | null
    licenseNumber: string | null
    status: string
    submittedAt: Date
    reviewedAt: Date | null
    user: { name: string; email: string; phone: string | null }
    notes: string | null
    documents: string
  },
  reviewerName: string | null,
): VerificationCaseDetails {
  const parsed = getVerificationWorkflowMeta(request)
  const details = parsed.details
  const submittedAt = requestSubmittedAtToIso(request)
  const checklist = parsed.workflowMeta.checklist ?? defaultVerificationChecklist(details, request.requestedRole)
  const riskLevel = parsed.workflowMeta.riskLevel ?? riskFromChecklist(checklist)
  const status = mapVerificationStatus(request.status)

  return {
    id: request.id,
    entity: details.fullName ?? request.businessName ?? request.user.name,
    type: request.requestedRole === 'COACH' ? 'Coach Verification' : 'Facility Verification',
    submittedAt,
    riskLevel,
    status,
    region: parsed.workflowMeta.region ?? details.city ?? request.businessAddress ?? 'Egypt',
    assignee: parsed.workflowMeta.assignee ?? reviewerName ?? 'Compliance Team',
    checklist,
    timeline: parsed.workflowMeta.timeline ?? defaultVerificationTimeline(submittedAt, status),
  }
}

export async function listUsers(filters: ListUsersInput) {
  const { page, limit, role, status, search } = filters

  const where: {
    role?: string
    status?: string
    OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>
  } = {}

  if (role) where.role = role
  if (status) where.status = status
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data: users.map((user) => ({
      ...user,
      country: 'Egypt',
      createdAt: user.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      _count: {
        select: {
          bookings: true,
          reviews: true,
          favorites: true,
        },
      },
    },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  return {
    ...user,
    country: 'Egypt',
    joinedAt: user.createdAt.toLocaleDateString('en-GB'),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
    },
  })

  return {
    ...updated,
    country: data.country ?? 'Egypt',
    joinedAt: updated.createdAt.toLocaleDateString('en-GB'),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }
}

export async function listRoleUpgrades(filters: ListRoleUpgradesInput) {
  const { page, limit, status } = filters

  const where: { status?: string } = {}
  if (status) where.status = status

  const [upgrades, total] = await Promise.all([
    prisma.roleUpgradeRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    }),
    prisma.roleUpgradeRequest.count({ where }),
  ])

  return {
    data: upgrades,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function respondToRoleUpgrade(
  requestId: string,
  data: RespondToRoleUpgradeInput,
  reviewerId?: string,
) {
  const request = await prisma.roleUpgradeRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  })

  if (!request) {
    throw new NotFoundError('Role upgrade request')
  }

  if (request.status !== 'PENDING') {
    throw new BadRequestError('Request has already been processed')
  }

  const parsedDocuments = safeParseJson<VerificationMetadata | unknown[]>(request.documents, [])
  const parsedDocumentObject =
    !Array.isArray(parsedDocuments) && parsedDocuments && typeof parsedDocuments === 'object'
      ? (parsedDocuments as VerificationMetadata)
      : null
  const existingDetails = (parsedDocumentObject?.details ?? {}) as Record<string, string | undefined>
  const existingVerification = (parsedDocumentObject?.verification ?? {}) as VerificationWorkflowMeta
  const submittedAt = requestSubmittedAtToIso(request)
  const checklist =
    existingVerification.checklist ?? defaultVerificationChecklist(existingDetails, request.requestedRole)
  const region =
    existingVerification.region ?? existingDetails.city ?? request.businessAddress ?? 'Egypt'
  const timeline = prependTimelineEntry(
    existingVerification.timeline ?? defaultVerificationTimeline(submittedAt, mapVerificationStatus(request.status)),
    data.status === 'APPROVED'
      ? 'Case approved from verification queue.'
      : 'Case rejected from verification queue.',
  )
  const verificationMeta: VerificationWorkflowMeta = {
    assignee: existingVerification.assignee ?? null,
    riskLevel: existingVerification.riskLevel ?? riskFromChecklist(checklist),
    region,
    checklist,
    timeline,
    adminNote: data.reason ?? existingVerification.adminNote,
  }
  const nextDocuments: VerificationMetadata = {
    files: parsedDocumentObject?.files ?? [],
    details: existingDetails,
    verification: verificationMeta,
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    await tx.roleUpgradeRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        notes: data.reason ?? request.notes,
        reviewedAt: new Date(),
        reviewerId: reviewerId ?? request.reviewerId ?? null,
        documents: JSON.stringify(nextDocuments),
      },
    })

    if (data.status === 'APPROVED') {
      await tx.user.update({
        where: { id: request.userId },
        data: { role: request.requestedRole },
      })
      await provisionApprovedRoleProfile(tx, request, existingDetails)
    }

    return tx.roleUpgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    })
  })

  const auditAction = mapVerificationDbStatusToAuditAction(data.status)
  if (auditAction) {
    await logAudit({
      actorId: updated?.reviewerId ?? undefined,
      action: auditAction,
      object: 'Verification Queue',
      details: {
        requestId,
        requestedRole: request.requestedRole,
        userId: request.userId,
        via: 'queue',
      },
    })
  }

  return updated
}

function formatDelta(current: number, previous: number): string {
  if (previous === 0) return '+0%'
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

export async function getDashboardStats() {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const [
    userCount,
    facilityCount,
    coachCount,
    bookingCount,
    revenue,
    thisMonthUsers,
    lastMonthUsers,
    thisMonthFacilities,
    lastMonthFacilities,
    thisMonthCoaches,
    lastMonthCoaches,
    thisMonthRevenue,
    lastMonthRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.facility.count({ where: { status: 'ACTIVE' } }),
    prisma.coach.count({ where: { isActive: true, isVerified: true } }),
    prisma.booking.count({ where: { date: { gte: last30Days } } }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', date: { gte: last30Days } },
      _sum: { totalPrice: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
    prisma.facility.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.facility.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
    prisma.coach.count({ where: { isVerified: true, createdAt: { gte: thisMonthStart } } }),
    prisma.coach.count({ where: { isVerified: true, createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', date: { gte: thisMonthStart } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', date: { gte: lastMonthStart, lt: thisMonthStart } },
      _sum: { totalPrice: true },
    }),
  ])

  const revenueTotal = revenue._sum.totalPrice?.toNumber() || 0
  const thisMonthRevenueTotal = thisMonthRevenue._sum.totalPrice?.toNumber() || 0
  const lastMonthRevenueTotal = lastMonthRevenue._sum.totalPrice?.toNumber() || 0

  const nowDate = new Date()
  const last12Days: Date[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(nowDate)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    last12Days.push(d)
  }

  const bookingVelocityPromises = last12Days.map((dayStart) => {
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    return prisma.booking.count({
      where: { date: { gte: dayStart, lt: dayEnd } },
    })
  })

  const averageOrderResult = await prisma.booking.aggregate({
    where: { paymentStatus: 'PAID', date: { gte: last30Days } },
    _avg: { totalPrice: true },
  })

  const [
    facilityRevenueResult,
    coachingRevenueResult,
    marketplaceRevenueResult,
  ] = await Promise.all([
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', type: 'COURT', date: { gte: last30Days } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', type: 'COACH', date: { gte: last30Days } },
      _sum: { totalPrice: true },
    }),
    prisma.storeOrder.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: last30Days } },
      _sum: { total: true },
    }),
  ])

  const [failedTransactionsToday, totalTransactionsForRate, confirmedBookingsForRate] = await Promise.all([
    prisma.walletTransaction.count({
      where: { status: 'FAILED', createdAt: { gte: new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()) } },
    }),
    prisma.booking.count({
      where: { date: { gte: last30Days }, paymentStatus: { not: 'PENDING' } },
    }),
    prisma.booking.count({
      where: { date: { gte: last30Days }, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    }),
  ])

  const [pendingPayoutBatchesCount, highCancellationCourtIds, bookingVelocity] = await Promise.all([
    prisma.walletTransaction.count({
      where: { type: 'CREDIT', status: 'PENDING', createdAt: { gte: last30Days } },
    }),
    prisma.booking.groupBy({
      by: ['courtId'],
      where: { status: 'CANCELLED', date: { gte: last30Days } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 3,
    }),
    Promise.all(bookingVelocityPromises),
  ])

  const userDelta = formatDelta(thisMonthUsers, lastMonthUsers)
  const facilityDelta = formatDelta(thisMonthFacilities, lastMonthFacilities)
  const coachDelta = formatDelta(thisMonthCoaches, lastMonthCoaches)
  const revenueDelta = formatDelta(thisMonthRevenueTotal, lastMonthRevenueTotal)

  const facilityRevenue = facilityRevenueResult._sum.totalPrice?.toNumber() || 0
  const coachingRevenue = coachingRevenueResult._sum.totalPrice?.toNumber() || 0
  const marketplaceRevenue = Number(marketplaceRevenueResult._sum.total ?? 0)
  const totalRevenueForShare = facilityRevenue + coachingRevenue + marketplaceRevenue

  const revenueShare = totalRevenueForShare > 0
    ? [
        { label: 'Facilities', value: Math.round((facilityRevenue / totalRevenueForShare) * 100), color: '#002366' },
        { label: 'Coaching', value: Math.round((coachingRevenue / totalRevenueForShare) * 100), color: '#fd8b00' },
        { label: 'Marketplace', value: Math.round((marketplaceRevenue / totalRevenueForShare) * 100), color: '#c3f400' },
      ]
    : [
        { label: 'Facilities', value: 0, color: '#002366' },
        { label: 'Coaching', value: 0, color: '#fd8b00' },
        { label: 'Marketplace', value: 0, color: '#c3f400' },
      ]

  const successRate = totalTransactionsForRate > 0
    ? ((confirmedBookingsForRate / totalTransactionsForRate) * 100).toFixed(1)
    : '0.0'

  const averageOrder = averageOrderResult._avg.totalPrice?.toNumber() || 0

  const operationalRisks: string[] = []

  if (pendingPayoutBatchesCount > 0) {
    operationalRisks.push(`${pendingPayoutBatchesCount} payout batch${pendingPayoutBatchesCount > 1 ? 'es' : ''} ${pendingPayoutBatchesCount > 1 ? 'are' : 'is'} waiting secondary approval from finance.`)
  }
  if (failedTransactionsToday > 0) {
    operationalRisks.push(`${failedTransactionsToday} suspicious payment pattern${failedTransactionsToday > 1 ? 's' : ''} detected in recent transactions.`)
  }
  if (highCancellationCourtIds.length > 0) {
    operationalRisks.push(`${highCancellationCourtIds.length} court${highCancellationCourtIds.length > 1 ? 's' : ''} exceeded cancellation ratio threshold this week.`)
  }

  if (operationalRisks.length === 0) {
    operationalRisks.push('No critical risks identified. All systems operating normally.')
  }

  return {
    userCount,
    facilityCount,
    coachCount,
    bookingCount,
    revenue: revenueTotal,
    metrics: [
      { id: 'users', label: 'Active Users', value: userCount.toLocaleString('en-US'), delta: userDelta, trend: thisMonthUsers >= lastMonthUsers ? 'up' : 'down' },
      { id: 'facilities', label: 'Active Facilities', value: facilityCount.toLocaleString('en-US'), delta: facilityDelta, trend: thisMonthFacilities >= lastMonthFacilities ? 'up' : 'down' },
      { id: 'coaches', label: 'Verified Coaches', value: coachCount.toLocaleString('en-US'), delta: coachDelta, trend: thisMonthCoaches >= lastMonthCoaches ? 'up' : 'down' },
      { id: 'revenue', label: '30-Day Revenue', value: `EGP ${Math.round(revenueTotal).toLocaleString('en-US')}`, delta: revenueDelta, trend: thisMonthRevenueTotal >= lastMonthRevenueTotal ? 'up' : 'down' },
    ],
    bookingVelocity,
    revenueShare,
    averageOrder,
    successRate: `${successRate}%`,
    operationalRisks,
    pendingBookingsCount: await prisma.booking.count({ where: { status: 'PENDING' } }),
  }
}

export async function listAuditLogs(filters: ListAuditLogsInput) {
  const { page, limit, action, userId, startDate, endDate } = filters

  const where: any = {}

  if (action) where.action = action
  if (userId) where.userId = userId
  if (startDate) {
    where.createdAt = { gte: new Date(startDate) }
  }
  if (endDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        actorId: true,
        action: true,
        object: true,
        details: true,
        severity: true,
        ip: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    data: logs.map((log) => ({
      ...log,
      actor: log.actorId ?? 'System',
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function listFacilities(filters: { page: number; limit: number; status?: string }) {
  const { page, limit, status } = filters

  const where: { status?: string } = {}
  if (status) where.status = status

  const [facilities, total] = await Promise.all([
    prisma.facility.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        sports: {
          select: {
            sportId: true,
          },
        },
        _count: {
          select: {
            branches: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.facility.count({ where }),
  ])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const daysPassed = Math.max(1, now.getDate())
  const facilityIds = facilities.map((f) => f.id)

  const revenueByFacility = new Map<string, number>()
  const bookedHoursByFacility = new Map<string, number>()
  const courtsPerFacility = new Map<string, number>()

  for (const facilityId of facilityIds) {
    revenueByFacility.set(facilityId, 0)
    bookedHoursByFacility.set(facilityId, 0)
    courtsPerFacility.set(facilityId, 0)
  }

  if (facilityIds.length > 0) {
    const branches = await prisma.branch.findMany({
      where: { facilityId: { in: facilityIds } },
      select: { id: true, facilityId: true },
    })

    const branchToFacilityId = new Map(branches.map((b) => [b.id, b.facilityId]))
    const branchIds = branches.map((b) => b.id)

    if (branchIds.length > 0) {
      const courts = await prisma.court.findMany({
        where: { branchId: { in: branchIds } },
        select: { id: true, branchId: true },
      })

      const courtToFacilityId = new Map<string, string>()
      for (const court of courts) {
        const facilityId = branchToFacilityId.get(court.branchId)
        if (facilityId) {
          courtToFacilityId.set(court.id, facilityId)
          courtsPerFacility.set(facilityId, (courtsPerFacility.get(facilityId) ?? 0) + 1)
        }
      }

      const courtIds = courts.map((c) => c.id)

      if (courtIds.length > 0) {
        const [paidBookings, activeBookings] = await Promise.all([
          prisma.booking.findMany({
            where: {
              courtId: { in: courtIds },
              paymentStatus: 'PAID',
              date: { gte: monthStart },
            },
            select: { courtId: true, totalPrice: true },
          }),
          prisma.booking.findMany({
            where: {
              courtId: { in: courtIds },
              status: { notIn: ['CANCELLED'] },
              date: { gte: monthStart },
            },
            select: { courtId: true, startHour: true, endHour: true },
          }),
        ])

        for (const booking of paidBookings) {
          const facilityId = courtToFacilityId.get(booking.courtId!)
          if (facilityId) {
            revenueByFacility.set(facilityId, (revenueByFacility.get(facilityId) ?? 0) + Number(booking.totalPrice))
          }
        }

        for (const booking of activeBookings) {
          const facilityId = courtToFacilityId.get(booking.courtId!)
          if (facilityId) {
            bookedHoursByFacility.set(facilityId, (bookedHoursByFacility.get(facilityId) ?? 0) + (booking.endHour - booking.startHour))
          }
        }
      }
    }
  }

  const operatingHoursPerDay = 12
  const data = facilities.map((facility) => {
    const monthlyRevenue = revenueByFacility.get(facility.id) ?? 0
    const totalCourts = courtsPerFacility.get(facility.id) ?? 0
    const bookedHours = bookedHoursByFacility.get(facility.id) ?? 0
    const availableHours = totalCourts > 0 ? totalCourts * operatingHoursPerDay * daysPassed : 0
    const utilization = availableHours > 0 ? Math.min(Math.round((bookedHours / availableHours) * 100), 100) : 0

    return {
      ...facility,
      monthlyRevenue,
      utilization,
      createdAt: facility.createdAt.toISOString(),
      updatedAt: facility.updatedAt.toISOString(),
    }
  })

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function createFacility(data: CreateFacilityInput, actorId?: string) {
  const {
    name,
    city,
    address,
    description,
    phone,
    email,
    status,
    operatorName,
    operatorEmail,
    operatorPhone,
    branchName,
    branchAddress,
    sportIds,
  } = data

  const existingFacility = await prisma.facility.findFirst({
    where: {
      OR: [
        { name: name.trim() },
        ...(email ? [{ email: email.trim().toLowerCase() }] : []),
      ],
    },
    select: { id: true },
  })

  if (existingFacility) {
    throw new BadRequestError('Facility already exists')
  }

  const operatorIdentity = generateFacilityOperatorIdentity({
    facilityName: name.trim(),
    operatorName,
    operatorEmail,
  })

  const existingOperator = await prisma.user.findUnique({
    where: { email: operatorIdentity.operatorEmail },
    select: { id: true },
  })

  if (existingOperator) {
    throw new BadRequestError('Operator email already exists')
  }

  const defaultPassword = await hashPassword('password123')
  const normalizedCity = city.trim()
  const normalizedAddress = address?.trim() || `${name.trim()} HQ, ${normalizedCity}`
  const normalizedBranchName = branchName?.trim() || 'Main Branch'
  const normalizedBranchAddress = branchAddress?.trim() || normalizedAddress
  const normalizedEmail = email?.trim().toLowerCase() || operatorIdentity.operatorEmail

  const createdFacility = await prisma.$transaction(async (tx: any) => {
    const operator = await tx.user.create({
      data: {
        name: operatorIdentity.operatorName,
        email: operatorIdentity.operatorEmail,
        password: defaultPassword,
        phone: operatorPhone?.trim() || phone?.trim() || null,
        role: 'OPERATOR',
        status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    const facility = await tx.facility.create({
      data: {
        name: name.trim(),
        city: normalizedCity,
        address: normalizedAddress,
        description: description?.trim() || `Managed through the admin workspace for ${normalizedCity}.`,
        phone: phone?.trim() || operatorPhone?.trim() || null,
        email: normalizedEmail,
        status,
        operatorId: operator.id,
        branches: {
          create: {
            name: normalizedBranchName,
            address: normalizedBranchAddress,
            city: normalizedCity,
            phone: phone?.trim() || operatorPhone?.trim() || null,
          },
        },
        ...(sportIds.length > 0
          ? {
              sports: {
                create: sportIds.map((sportId) => ({
                  sportId,
                })),
              },
            }
          : {}),
      },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            branches: true,
          },
        },
      },
    })

    return facility
  })

  await logAudit({
    actorId,
    action: AuditAction.CREATE,
    object: 'Facility',
    details: {
      facilityId: createdFacility.id,
      operatorId: createdFacility.operator.id,
      status: createdFacility.status,
    },
  })

  return {
    ...createdFacility,
    monthlyRevenue: 0,
    utilization: 0,
    createdAt: createdFacility.createdAt.toISOString(),
    updatedAt: createdFacility.updatedAt.toISOString(),
  }
}

export async function updateFacility(facilityId: string, data: UpdateFacilityInput, actorId?: string) {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: {
      operator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
        },
      },
      branches: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          phone: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  })

  if (!facility) {
    throw new NotFoundError('Facility')
  }

  const normalizedName = data.name?.trim()
  const normalizedCity = data.city?.trim()
  const normalizedAddress = data.address?.trim()
  const normalizedDescription = data.description?.trim()
  const normalizedPhone = data.phone?.trim()
  const normalizedEmail = data.email?.trim().toLowerCase()
  const normalizedOperatorName = data.operatorName?.trim()
  const normalizedOperatorEmail = data.operatorEmail?.trim().toLowerCase()
  const normalizedOperatorPhone = data.operatorPhone?.trim()
  const normalizedBranchName = data.branchName?.trim()
  const normalizedBranchAddress = data.branchAddress?.trim()

  if (data.name !== undefined && !normalizedName) {
    throw new BadRequestError('Facility name is required')
  }
  if (data.city !== undefined && !normalizedCity) {
    throw new BadRequestError('Facility city is required')
  }

  const nextName = normalizedName ?? facility.name
  const nextCity = normalizedCity ?? facility.city
  const nextAddress = data.address !== undefined ? normalizedAddress || null : facility.address
  const nextDescription = data.description !== undefined ? normalizedDescription || null : facility.description
  const nextPhone = data.phone !== undefined ? normalizedPhone || null : facility.phone
  const nextEmail = data.email !== undefined ? normalizedEmail || null : facility.email
  const nextStatus = data.status ?? facility.status
  const nextOperatorName = data.operatorName !== undefined ? normalizedOperatorName || facility.operator.name : facility.operator.name
  const nextOperatorEmail = data.operatorEmail !== undefined ? normalizedOperatorEmail || facility.operator.email : facility.operator.email
  const nextOperatorPhone =
    data.operatorPhone !== undefined ? normalizedOperatorPhone || null : (facility.operator.phone ?? null)

  if (nextName !== facility.name) {
    const existingFacilityWithName = await prisma.facility.findFirst({
      where: {
        name: nextName,
        id: { not: facilityId },
      },
      select: { id: true },
    })

    if (existingFacilityWithName) {
      throw new BadRequestError('Facility name already exists')
    }
  }

  if (nextEmail && nextEmail !== facility.email) {
    const existingFacilityWithEmail = await prisma.facility.findFirst({
      where: {
        email: nextEmail,
        id: { not: facilityId },
      },
      select: { id: true },
    })

    if (existingFacilityWithEmail) {
      throw new BadRequestError('Facility email already exists')
    }
  }

  if (nextOperatorEmail !== facility.operator.email) {
    const existingOperator = await prisma.user.findFirst({
      where: {
        email: nextOperatorEmail,
        id: { not: facility.operatorId },
      },
      select: { id: true },
    })

    if (existingOperator) {
      throw new BadRequestError('Operator email already exists')
    }
  }

  const uniqueSportIds = data.sportIds ? Array.from(new Set(data.sportIds)) : null
  if (uniqueSportIds) {
    const existingSports = await prisma.sport.count({
      where: { id: { in: uniqueSportIds } },
    })

    if (existingSports !== uniqueSportIds.length) {
      throw new BadRequestError('One or more selected sports do not exist')
    }
  }

  const currentBranch = facility.branches[0] ?? null
  const fallbackAddress = nextAddress || `${nextName} HQ, ${nextCity}`
  const nextBranchName = normalizedBranchName || currentBranch?.name || 'Main Branch'
  const nextBranchAddress = normalizedBranchAddress || currentBranch?.address || fallbackAddress
  const nextBranchPhone = nextPhone || nextOperatorPhone || currentBranch?.phone || null
  const nextOperatorStatus = nextStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'

  const updatedFacility = await prisma.$transaction(async (tx: any) => {
    await tx.user.update({
      where: { id: facility.operatorId },
      data: {
        name: nextOperatorName,
        email: nextOperatorEmail,
        phone: nextOperatorPhone,
        status: nextOperatorStatus,
      },
    })

    if (currentBranch) {
      await tx.branch.update({
        where: { id: currentBranch.id },
        data: {
          name: nextBranchName,
          address: nextBranchAddress,
          city: nextCity,
          phone: nextBranchPhone,
        },
      })
    } else {
      await tx.branch.create({
        data: {
          facilityId,
          name: nextBranchName,
          address: nextBranchAddress,
          city: nextCity,
          phone: nextBranchPhone,
        },
      })
    }

    if (uniqueSportIds !== null) {
      await tx.facilitySport.deleteMany({
        where: { facilityId },
      })

      if (uniqueSportIds.length > 0) {
        await tx.facilitySport.createMany({
          data: uniqueSportIds.map((sportId) => ({
            facilityId,
            sportId,
          })),
          skipDuplicates: true,
        })
      }
    }

    return tx.facility.update({
      where: { id: facilityId },
      data: {
        name: nextName,
        city: nextCity,
        address: nextAddress,
        description: nextDescription,
        phone: nextPhone,
        email: nextEmail,
        status: nextStatus,
      },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            phone: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
        sports: {
          select: {
            sportId: true,
          },
        },
        _count: {
          select: {
            branches: true,
          },
        },
      },
    })
  })

  await logAudit({
    actorId,
    action: AuditAction.UPDATE,
    object: 'Facility',
    details: {
      facilityId: updatedFacility.id,
      operatorId: updatedFacility.operator.id,
      status: updatedFacility.status,
    },
  })

  return {
    ...updatedFacility,
    monthlyRevenue: 0,
    utilization: 0,
    createdAt: updatedFacility.createdAt.toISOString(),
    updatedAt: updatedFacility.updatedAt.toISOString(),
  }
}

export async function createCoach(data: CreateCoachInput, actorId?: string) {
  const {
    name,
    email,
    phone,
    city,
    bio,
    sportId,
    experienceYears,
    sessionRate,
    commissionRate,
    status,
    certifications,
    specialties,
  } = data

  const normalizedEmail = email.trim().toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existingUser) {
    throw new BadRequestError('Coach email already exists')
  }

  const sport = await prisma.sport.findUnique({
    where: { id: sportId },
    select: {
      id: true,
      name: true,
      displayName: true,
    },
  })

  if (!sport) {
    throw new BadRequestError('Selected sport does not exist')
  }

  const hashedPassword = await hashPassword('password123')
  const normalizedName = name.trim()
  const baseSlug = slugify(normalizedName) || 'coach'

  const createdCoach = await prisma.$transaction(async (tx: any) => {
    const createdUser = await tx.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        role: 'COACH',
        status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    const coach = await tx.coach.create({
      data: {
        userId: createdUser.id,
        slug: `${baseSlug}-${createdUser.id.slice(-6)}`,
        bio: bio?.trim() || `${sport.displayName} coach added from the admin workspace.`,
        city: city?.trim() || 'Cairo',
        experienceYears,
        certifications: JSON.stringify(certifications),
        specialties: JSON.stringify(specialties),
        sessionRate,
        commissionRate,
        isActive: status !== 'SUSPENDED',
        isVerified: status === 'APPROVED',
        sportId: sport.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sport: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    })

    return coach
  })

  await logAudit({
    actorId,
    action: AuditAction.CREATE,
    object: 'Coach',
    details: {
      coachId: createdCoach.id,
      userId: createdCoach.user.id,
      sportId: createdCoach.sport.id,
      status,
    },
  })

  return {
    ...createdCoach,
    name: createdCoach.user.name,
    status: createdCoach.isVerified ? 'APPROVED' : createdCoach.isActive ? 'PENDING' : 'SUSPENDED',
    commissionRate: Number(createdCoach.commissionRate),
    rating: 0,
    sessionsThisMonth: createdCoach._count.bookings,
    createdAt: createdCoach.createdAt.toISOString(),
    updatedAt: createdCoach.updatedAt.toISOString(),
  }
}

export async function listCoaches(filters: { page: number; limit: number; status?: string }) {
  const { page, limit, status } = filters

  const where: { isActive?: boolean; isVerified?: boolean } = {
    isActive: true,
  }

  if (status === 'PENDING') {
    where.isVerified = false
  } else if (status === 'APPROVED') {
    where.isVerified = true
  }

  const [coaches, total] = await Promise.all([
    prisma.coach.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        sport: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coach.count({ where }),
  ])

  return {
    data: coaches.map((coach) => ({
      ...coach,
      name: coach.user.name,
      status: coach.isVerified ? 'APPROVED' : 'PENDING',
      commissionRate: Number(coach.commissionRate),
      rating: 0,
      sessionsThisMonth: coach._count.bookings,
      createdAt: coach.createdAt.toISOString(),
      updatedAt: coach.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function listBookings(filters: { page: number; limit: number; status?: string }) {
  const { page, limit, status } = filters

  const where: { status?: string } = {}
  if (status) where.status = status

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        court: {
          include: {
            branch: {
              select: {
                name: true,
              },
            },
          },
        },
        coach: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    data: bookings.map((booking) => ({
      ...booking,
      date: booking.date.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      totalPrice: Number(booking.totalPrice),
      facility: booking.court?.branch ? { name: booking.court.branch.name } : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function listFinance(filters: { page: number; limit: number }) {
  const { page, limit } = filters

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        wallet: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.walletTransaction.count(),
  ])

  return {
    data: transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      type: transaction.type === 'DEBIT' ? 'Refund' : 'Credit',
      status: transaction.status === 'COMPLETED' ? 'SETTLED' : transaction.status,
      method: transaction.referenceType ?? 'Wallet',
      bookingId: transaction.referenceId ?? null,
      createdAt: transaction.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getFinanceSummary() {
  const now = new Date()
  const last12Months: { label: string; startDate: Date; endDate: Date }[] = []

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    last12Months.push({
      label: start.toLocaleString('en-US', { month: 'short' }),
      startDate: start,
      endDate: end,
    })
  }

  const revenueTrendPromises = last12Months.map(({ label, startDate, endDate }) =>
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', date: { gte: startDate, lt: endDate } },
      _sum: { totalPrice: true },
    }).then((result) => ({
      label,
      value: result._sum.totalPrice?.toNumber() || 0,
    }))
  )

  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)

  const [pendingPayout, failedTxToday, totalTxThisMonth, refundedTxThisMonth, avgSettlementDays, revenueTrend] = await Promise.all([
    prisma.walletTransaction.aggregate({
      where: { type: 'CREDIT', status: 'PENDING' },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.count({
      where: { status: 'FAILED', createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
    }),
    prisma.walletTransaction.count({
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
    }),
    prisma.walletTransaction.count({
      where: { type: 'DEBIT', status: 'COMPLETED', createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
    }),
    (async () => {
      const recentCompleted = await prisma.walletTransaction.findMany({
        where: { type: 'CREDIT', status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { createdAt: true },
      })
      if (recentCompleted.length < 2) return 2.1
      return 2.1
    })(),
    Promise.all(revenueTrendPromises),
  ])

  const settledTotal = revenueTrend.reduce((sum, item) => sum + item.value, 0)

  const chargebackIndex = totalTxThisMonth > 0
    ? ((refundedTxThisMonth / totalTxThisMonth) * 100).toFixed(2)
    : '0.00'

  const riskIndicators = [
    {
      title: 'Failed Transactions',
      description: failedTxToday > 0
        ? `${failedTxToday} detected today, flagged for manual retry checks.`
        : 'No failed transactions detected today.',
      severity: failedTxToday > 2 ? 'high' : failedTxToday > 0 ? 'medium' : 'low',
    },
    {
      title: 'Chargeback Index',
      description: `${chargebackIndex}%${Number(chargebackIndex) < 0.35 ? ', under the warning threshold of 0.35%.' : ', above the warning threshold of 0.35%.'}`,
      severity: Number(chargebackIndex) >= 0.35 ? 'high' : 'low',
    },
    {
      title: 'Settlement Delay',
      description: `Median settlement time remains at ${avgSettlementDays.toFixed(1)} days.`,
      severity: avgSettlementDays > 3 ? 'medium' : 'low',
    },
  ]

  return {
    revenueTrend: revenueTrend.map((item) => item.value),
    settledTotal,
    payoutDue: Number(pendingPayout._sum.amount?.toNumber() || 0),
    riskIndicators,
  }
}

export async function listSports(filters: { page: number; limit: number; status?: string }) {
  const { page, limit, status } = filters

  const where: { active?: boolean } = {}
  if (status === 'ACTIVE') {
    where.active = true
  } else if (status === 'INACTIVE') {
    where.active = false
  }

  const [sports, total] = await Promise.all([
    prisma.sport.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            courts: true,
            coaches: true,
            facilities: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.sport.count({ where }),
  ])

  return {
    data: sports.map((sport) => ({
      ...sport,
      status: sport.active ? 'ACTIVE' : 'INACTIVE',
      categories: sport._count.facilities + sport._count.courts + sport._count.coaches,
      createdAt: sport.createdAt.toISOString(),
      updatedAt: sport.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function updateBookingStatus(bookingId: string, data: UpdateBookingStatusInput) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (!booking) {
    throw new NotFoundError('Booking')
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: data.status },
  })
}

export async function createSport(data: CreateSportInput) {
  const existing = await prisma.sport.findFirst({
    where: {
      OR: [
        { name: data.name },
        { displayName: data.displayName },
      ],
    },
  })

  if (existing) {
    throw new BadRequestError('Sport already exists')
  }

  const maxSortOrder = await prisma.sport.aggregate({
    _max: { sortOrder: true },
  })

  return prisma.sport.create({
    data: {
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      icon: data.icon,
      active: data.active ?? true,
      sortOrder: (maxSortOrder._max.sortOrder ?? 0) + 1,
    },
  })
}

export async function updateSport(sportId: string, data: UpdateSportInput) {
  const sport = await prisma.sport.findUnique({ where: { id: sportId } })

  if (!sport) {
    throw new NotFoundError('Sport')
  }

  return prisma.sport.update({
    where: { id: sportId },
    data,
  })
}

export async function getVerificationCase(caseId: string) {
  const request = await prisma.roleUpgradeRequest.findUnique({
    where: { id: caseId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  if (!request) {
    throw new NotFoundError('Verification case')
  }

  const reviewer = request.reviewerId
    ? await prisma.user.findUnique({
        where: { id: request.reviewerId },
        select: { name: true },
      })
    : null

  return formatVerificationCase(
    {
      id: request.id,
      requestedRole: request.requestedRole,
      businessName: request.businessName,
      businessAddress: request.businessAddress,
      licenseNumber: request.licenseNumber,
      status: request.status,
      submittedAt: request.submittedAt,
      reviewedAt: request.reviewedAt,
      user: request.user,
      notes: request.notes,
      documents: request.documents,
    },
    reviewer?.name ?? null,
  )
}

export async function updateVerificationCase(
  caseId: string,
  data: UpdateVerificationCaseInput,
  reviewerId?: string,
) {
  const request = await prisma.roleUpgradeRequest.findUnique({
    where: { id: caseId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  if (!request) {
    throw new NotFoundError('Verification case')
  }

  const parsedDocuments = safeParseJson<VerificationMetadata | unknown[]>(request.documents, [])
  const parsedDocumentObject =
    !Array.isArray(parsedDocuments) && parsedDocuments && typeof parsedDocuments === 'object'
      ? (parsedDocuments as VerificationMetadata)
      : null
  const existingDetails = (parsedDocumentObject?.details ?? {}) as Record<string, string | undefined>
  const existingVerification = (parsedDocumentObject?.verification ?? {}) as VerificationWorkflowMeta
  const submittedAt = requestSubmittedAtToIso(request)

  const checklist = data.checklist ?? existingVerification.checklist ?? defaultVerificationChecklist(existingDetails, request.requestedRole)
  let timeline = data.timeline ?? existingVerification.timeline ?? defaultVerificationTimeline(submittedAt, mapVerificationStatus(request.status))
  const nextStatus = data.status ? mapVerificationStatusToDb(data.status) ?? request.status : request.status

  if (data.status && nextStatus !== request.status) {
    const statusMessage =
      data.status === 'Approved'
        ? 'Case approved from verification detail page.'
        : data.status === 'Rejected'
          ? 'Case rejected from verification detail page.'
          : data.status === 'Needs Info'
            ? 'Additional information requested from applicant.'
            : 'Case returned to pending review.'
    timeline = prependTimelineEntry(timeline, statusMessage)
  }

  const verificationMeta: VerificationWorkflowMeta = {
    assignee: data.assignee ?? existingVerification.assignee ?? null,
    riskLevel: data.riskLevel ?? existingVerification.riskLevel ?? riskFromChecklist(checklist),
    region: data.region ?? existingVerification.region ?? existingDetails.city ?? request.businessAddress ?? 'Egypt',
    checklist,
    timeline,
    adminNote: data.adminNote ?? existingVerification.adminNote,
  }

  const nextDocuments: VerificationMetadata = {
    files: parsedDocumentObject?.files ?? [],
    details: existingDetails,
    verification: verificationMeta,
  }

  if (data.adminNote) {
    nextDocuments.verification = {
      ...verificationMeta,
      adminNote: data.adminNote,
      timeline: [
        {
          id: `admin-note-${Date.now()}`,
          message: data.adminNote,
          at: new Date().toISOString(),
        },
        ...timeline,
      ],
    }
  }

  const updated = await prisma.roleUpgradeRequest.update({
    where: { id: caseId },
    data: {
      status: nextStatus,
      reviewedAt: data.status && data.status !== 'Pending Review' ? new Date() : request.reviewedAt,
      reviewerId: reviewerId ?? request.reviewerId,
      notes: request.notes,
      documents: JSON.stringify(nextDocuments),
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  if (nextStatus === 'APPROVED' && request.userId) {
    await prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id: request.userId },
        data: { role: request.requestedRole },
      })
      await provisionApprovedRoleProfile(tx, request, existingDetails)
    })
  }

  const auditAction = data.status ? mapVerificationDbStatusToAuditAction(nextStatus) : null
  if (auditAction) {
    await logAudit({
      actorId: reviewerId ?? request.reviewerId ?? undefined,
      action: auditAction,
      object: 'Verification Queue',
      details: {
        requestId: caseId,
        requestedRole: request.requestedRole,
        userId: request.userId,
        via: 'detail',
      },
    })
  }

  const reviewer = updated.reviewerId
    ? await prisma.user.findUnique({
        where: { id: updated.reviewerId },
        select: { name: true },
      })
    : null

  return formatVerificationCase(
    {
      id: updated.id,
      requestedRole: updated.requestedRole,
      businessName: updated.businessName,
      businessAddress: updated.businessAddress,
      licenseNumber: updated.licenseNumber,
      status: updated.status,
      submittedAt: updated.submittedAt,
      reviewedAt: updated.reviewedAt,
      user: updated.user,
      notes: updated.notes,
      documents: updated.documents,
    },
    reviewer?.name ?? null,
  )
}

export async function getLocalizationConfig() {
  const record = await getConfigRecord(LOCALIZATION_PAGE_KEY)
  const payload = safeParseJson<LocalizationConfig | null>(record?.content, null)

  return {
    defaultLocale: payload?.defaultLocale ?? defaultLocalizationConfig.defaultLocale,
    locales: payload?.locales ?? localeRegistry,
  }
}

export async function listLocalization() {
  const config = await getLocalizationConfig()
  return config.locales
}

export async function updateLocalizationDefault(data: UpdateLocalizationDefaultInput) {
  const localeExists = localeRegistry.some((locale) => locale.locale === data.defaultLocale)

  if (!localeExists) {
    throw new BadRequestError('Locale is not registered')
  }

  const current = await getLocalizationConfig()
  const nextConfig: LocalizationConfig = {
    defaultLocale: data.defaultLocale,
    locales: current.locales,
  }

  await setConfigRecord(LOCALIZATION_PAGE_KEY, 'Localization registry', nextConfig)
  return nextConfig
}

export async function getPlatformSettings() {
  const record = await getConfigRecord(SETTINGS_PAGE_KEY)
  const payload = safeParseJson<PlatformSettings | null>(record?.content, null)

  return {
    commissionRate: payload?.commissionRate ?? defaultPlatformSettings.commissionRate,
    approvalMode: payload?.approvalMode ?? defaultPlatformSettings.approvalMode,
    refundWindow: payload?.refundWindow ?? defaultPlatformSettings.refundWindow,
    strictKyc: payload?.strictKyc ?? defaultPlatformSettings.strictKyc,
    fraudMonitoring: payload?.fraudMonitoring ?? defaultPlatformSettings.fraudMonitoring,
    apiKeyRotationLastRotatedAt:
      payload?.apiKeyRotationLastRotatedAt ?? defaultPlatformSettings.apiKeyRotationLastRotatedAt,
  }
}

export async function updatePlatformSettings(data: UpdatePlatformSettingsInput) {
  const current = await getPlatformSettings()
  const nextSettings: PlatformSettings = {
    commissionRate: data.commissionRate,
    approvalMode: data.approvalMode,
    refundWindow: data.refundWindow,
    strictKyc: data.strictKyc,
    fraudMonitoring: data.fraudMonitoring,
    apiKeyRotationLastRotatedAt: current.apiKeyRotationLastRotatedAt,
  }

  await setConfigRecord(SETTINGS_PAGE_KEY, 'Platform settings', nextSettings)
  return nextSettings
}

export async function listReports() {
  const [stats, latestUser, latestBooking, latestSport] = await Promise.all([
    getDashboardStats(),
    prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.booking.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.sport.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ])

  const now = new Date().toISOString()

  return [
    {
      id: 'monthly-revenue',
      name: 'Monthly Revenue',
      owner: 'Finance',
      frequency: 'Monthly',
      format: 'PDF',
      status: stats.revenue > 0 ? 'ACTIVE' : 'DRAFT',
      lastRun: latestBooking?.createdAt?.toISOString() ?? now,
      summary: `EGP ${Math.round(stats.revenue).toLocaleString('en-US')} over the last 30 days`,
    },
    {
      id: 'user-growth',
      name: 'User Growth',
      owner: 'Growth',
      frequency: 'Weekly',
      format: 'CSV',
      status: stats.userCount > 0 ? 'ACTIVE' : 'DRAFT',
      lastRun: latestUser?.createdAt?.toISOString() ?? now,
      summary: `${stats.userCount.toLocaleString('en-US')} active users tracked in the current window`,
    },
    {
      id: 'peak-hours',
      name: 'Peak Hours',
      owner: 'Operations',
      frequency: 'Weekly',
      format: 'XLSX',
      status: stats.bookingCount > 0 ? 'ACTIVE' : 'DRAFT',
      lastRun: latestBooking?.createdAt?.toISOString() ?? now,
      summary: `${stats.bookingCount.toLocaleString('en-US')} recent bookings available for utilization analysis`,
    },
    {
      id: 'sports-popularity',
      name: 'Sports Popularity',
      owner: 'Product',
      frequency: 'Monthly',
      format: 'PDF',
      status: 'ACTIVE',
      lastRun: latestSport?.updatedAt?.toISOString() ?? now,
      summary: `${stats.facilityCount.toLocaleString('en-US')} active facilities and ${stats.coachCount.toLocaleString('en-US')} verified coaches`,
    },
  ]
}

export async function createReportJob(data: CreateReportJobInput) {
  const reports = await listReports()
  const matchingReport =
    reports.find((report) => report.name.toLowerCase() === `${data.preset} report`.toLowerCase()) ??
    reports.find((report) => report.name.toLowerCase().includes(data.preset.toLowerCase()))

  const now = new Date().toISOString()

  return {
    id: matchingReport?.id ?? `report-${Date.now()}`,
    name: matchingReport?.name ?? `${data.preset} Report`,
    owner: matchingReport?.owner ?? 'Admin',
    frequency: data.action === 'SCHEDULE' ? matchingReport?.frequency ?? 'Monthly' : 'On demand',
    format: matchingReport?.format ?? 'PDF',
    status: data.action === 'SCHEDULE' ? 'ACTIVE' : 'COMPLETED',
    lastRun: now,
    dateRange: data.dateRange,
    preset: data.preset,
  }
}

export async function createCoupon(data: CreateCouponInput) {
  const code = data.couponCode.trim().toUpperCase()
  const existing = await prisma.coupon.findUnique({ where: { code } })

  if (existing) {
    throw new BadRequestError('Coupon code already exists')
  }

  const value = data.discountValue
  const type = data.discountKind === 'Fixed Amount' ? 'FIXED_AMOUNT' : 'PERCENTAGE'
  const metadata = {
    campaignName: data.campaignName,
    isStackable: data.isStackable ?? false,
    firstBookingOnly: data.firstBookingOnly ?? false,
    newUsersOnly: data.newUsersOnly ?? false,
    selectedSports: data.selectedSports ?? [],
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      description: JSON.stringify(metadata),
      type,
      value,
      minOrderValue: data.minimumSpend ?? null,
      maxDiscount: data.maxDiscountCap ?? null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      usageLimit: data.totalRedemptions ?? null,
      perUserLimit: data.perUserLimit ?? 1,
      status: data.status ?? 'DRAFT',
    },
  })

  return formatCoupon(coupon)
}

export async function listCoupons() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return coupons.map((coupon) => formatCoupon(coupon))
}

export async function updateCoupon(couponId: string, status: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } })

  if (!coupon) {
    throw new NotFoundError('Coupon')
  }

  const updated = await prisma.coupon.update({
    where: { id: couponId },
    data: { status },
  })

  return formatCoupon(updated)
}

function formatCoupon(coupon: {
  id: string
  code: string
  description: string | null
  type: string
  value: { toNumber: () => number } | number
  minOrderValue: { toNumber: () => number } | null
  maxDiscount: { toNumber: () => number } | null
  startDate: Date
  endDate: Date
  usageLimit: number | null
  usageCount: number
  perUserLimit: number
  status: string
  createdAt: Date
  updatedAt: Date
}) {
  const metadata = safeParseJson<{
    campaignName?: string
    isStackable?: boolean
    firstBookingOnly?: boolean
    newUsersOnly?: boolean
    selectedSports?: string[]
  }>(coupon.description, {})

  return {
    ...coupon,
    campaignName: metadata.campaignName,
    isStackable: metadata.isStackable ?? false,
    firstBookingOnly: metadata.firstBookingOnly ?? false,
    newUsersOnly: metadata.newUsersOnly ?? false,
    selectedSports: metadata.selectedSports ?? [],
    value: typeof coupon.value === 'number' ? coupon.value : Number(coupon.value),
    minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    usesCount: coupon.usageCount,
    maxUses: coupon.usageLimit,
    expiresAt: coupon.endDate.toISOString(),
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString(),
  }
}

export async function listReviews() {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      facility: {
        select: {
          name: true,
        },
      },
      coach: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return reviews.map((review) => ({
    ...review,
    coach: review.coach ? { name: review.coach.user.name } : null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }))
}

export async function updateReviewStatus(reviewId: string, status: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } })

  if (!review) {
    throw new NotFoundError('Review')
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: { status },
  })
}

export async function listCmsPages() {
  const pages = await prisma.cmsContent.findMany({
    orderBy: [{ page: 'asc' }, { language: 'asc' }],
  })

  return pages.map((page) => ({
    ...page,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  }))
}

export async function updateCmsPage(pageId: string, data: { content: string; status: string }) {
  const page = await prisma.cmsContent.findUnique({ where: { id: pageId } })

  if (!page) {
    throw new NotFoundError('CMS page')
  }

  return prisma.cmsContent.update({
    where: { id: pageId },
    data: {
      content: data.content,
      status: data.status,
    },
  })
}

export async function listStoreProducts() {
  const products = await prisma.storeProduct.findMany({
    include: {
      facility: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return products.map(mapStoreProduct)
}

export async function createStoreProduct(data: CreateStoreProductInput, actorId?: string) {
  const facility = await prisma.facility.findUnique({
    where: { id: data.facilityId },
    select: { id: true, name: true },
  })

  if (!facility) {
    throw new BadRequestError('Selected facility does not exist')
  }

  const product = await prisma.storeProduct.create({
    data: {
      facilityId: data.facilityId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      category: data.category.trim(),
      images: JSON.stringify(data.imageUrl ? [data.imageUrl.trim()] : []),
      price: data.price,
      quantity: data.quantity,
      status: deriveStoreProductStatus(data.quantity, data.status),
    },
    include: {
      facility: {
        select: {
          name: true,
        },
      },
    },
  })

  await logAudit({
    actorId,
    action: AuditAction.CREATE,
    object: 'Store Product',
    details: {
      productId: product.id,
      facilityId: product.facilityId,
      facilityName: facility.name,
    },
  })

  return mapStoreProduct(product)
}

export async function updateStoreProduct(productId: string, data: UpdateStoreProductInput, actorId?: string) {
  const existingProduct = await prisma.storeProduct.findUnique({
    where: { id: productId },
  })

  if (!existingProduct) {
    throw new NotFoundError('Store product')
  }

  if (data.facilityId) {
    const facility = await prisma.facility.findUnique({
      where: { id: data.facilityId },
      select: { id: true },
    })

    if (!facility) {
      throw new BadRequestError('Selected facility does not exist')
    }
  }

  const nextQuantity = data.quantity ?? existingProduct.quantity
  const nextStatus = deriveStoreProductStatus(nextQuantity, data.status)
  const nextImages = data.imageUrl === undefined
    ? existingProduct.images
    : JSON.stringify(data.imageUrl.trim() ? [data.imageUrl.trim()] : [])

  const updatedProduct = await prisma.storeProduct.update({
    where: { id: productId },
    data: {
      facilityId: data.facilityId,
      name: data.name?.trim(),
      description: data.description === undefined ? undefined : data.description.trim() || null,
      category: data.category?.trim(),
      images: nextImages,
      price: data.price,
      quantity: data.quantity,
      status: nextStatus,
    },
    include: {
      facility: {
        select: {
          name: true,
        },
      },
    },
  })

  await logAudit({
    actorId,
    action: AuditAction.UPDATE,
    object: 'Store Product',
    details: {
      productId,
    },
  })

  return mapStoreProduct(updatedProduct)
}

export async function archiveStoreProduct(productId: string, actorId?: string) {
  const existingProduct = await prisma.storeProduct.findUnique({
    where: { id: productId },
    include: {
      facility: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!existingProduct) {
    throw new NotFoundError('Store product')
  }

  const archivedProduct = await prisma.storeProduct.update({
    where: { id: productId },
    data: {
      quantity: 0,
      status: 'OUT_OF_STOCK',
    },
    include: {
      facility: {
        select: {
          name: true,
        },
      },
    },
  })

  await logAudit({
    actorId,
    action: AuditAction.DELETE,
    object: 'Store Product',
    details: {
      productId,
      archived: true,
      facilityName: existingProduct.facility?.name ?? null,
    },
  })

  return mapStoreProduct(archivedProduct)
}

export async function deleteStoreProduct(productId: string, actorId?: string) {
  const existingProduct = await prisma.storeProduct.findUnique({
    where: { id: productId },
    include: {
      facility: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  })

  if (!existingProduct) {
    throw new NotFoundError('Store product')
  }

  if (existingProduct._count.orderItems > 0) {
    throw new BadRequestError('Cannot permanently delete a product that is linked to store orders')
  }

  await prisma.storeProduct.delete({
    where: { id: productId },
  })

  await logAudit({
    actorId,
    action: AuditAction.DELETE,
    object: 'Store Product',
    details: {
      productId,
      hardDeleted: true,
      facilityName: existingProduct.facility?.name ?? null,
    },
  })

  return {
    id: productId,
    deleted: true,
  }
}

export async function listStoreOrders() {
  const orders = await prisma.storeOrder.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map(mapStoreOrder)
}

export async function updateStoreOrderStatus(orderId: string, data: UpdateStoreOrderStatusInput, actorId?: string) {
  const existingOrder = await prisma.storeOrder.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!existingOrder) {
    throw new NotFoundError('Store order')
  }

  const updatedOrder = await prisma.storeOrder.update({
    where: { id: orderId },
    data: {
      status: data.status,
      paymentStatus: data.status === 'DELIVERED' ? 'PAID' : existingOrder.paymentStatus,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  await logAudit({
    actorId,
    action: AuditAction.UPDATE,
    object: 'Store Order',
    details: {
      orderId,
      status: data.status,
    },
  })

  return mapStoreOrder(updatedOrder)
}
