import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError } from '@common/errors'
import type {
  ListUsersInput,
  UpdateUserInput,
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

export async function respondToRoleUpgrade(requestId: string, data: RespondToRoleUpgradeInput) {
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

  const updated = await prisma.$transaction(async (tx: any) => {
    await tx.roleUpgradeRequest.update({
      where: { id: requestId },
      data: {
        status: data.status,
        notes: data.reason,
        reviewedAt: new Date(),
      },
    })

    if (data.status === 'APPROVED') {
      await tx.user.update({
        where: { id: request.userId },
        data: { role: request.requestedRole },
      })
    }

    return tx.roleUpgradeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    })
  })

  return updated
}

export async function getDashboardStats() {
  const [userCount, facilityCount, coachCount, bookingCount, revenue] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.facility.count({ where: { status: 'ACTIVE' } }),
    prisma.coach.count({ where: { isActive: true, isVerified: true } }),
    prisma.booking.count({ where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } }),
    prisma.booking.aggregate({
      where: {
        paymentStatus: 'PAID',
        date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
      },
      _sum: { totalPrice: true },
    }),
  ])

  const revenueTotal = revenue._sum.totalPrice?.toNumber() || 0

  return {
    userCount,
    facilityCount,
    coachCount,
    bookingCount,
    revenue: revenueTotal,
    metrics: [
      { id: 'users', label: 'Active Users', value: userCount.toLocaleString('en-US'), delta: '+8.1%', trend: 'up' },
      { id: 'facilities', label: 'Active Facilities', value: facilityCount.toLocaleString('en-US'), delta: '+4.3%', trend: 'up' },
      { id: 'coaches', label: 'Verified Coaches', value: coachCount.toLocaleString('en-US'), delta: '+5.6%', trend: 'up' },
      { id: 'revenue', label: '30-Day Revenue', value: `EGP ${Math.round(revenueTotal).toLocaleString('en-US')}`, delta: '+11.2%', trend: 'up' },
    ],
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
      orderBy: { createdAt: 'desc' },
    }),
    prisma.facility.count({ where }),
  ])

  return {
    data: facilities.map((facility) => ({
      ...facility,
      monthlyRevenue: 0,
      utilization: 0,
      createdAt: facility.createdAt.toISOString(),
      updatedAt: facility.updatedAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
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
  const timeline = data.timeline ?? existingVerification.timeline ?? defaultVerificationTimeline(submittedAt, mapVerificationStatus(request.status))
  const nextStatus = data.status ? mapVerificationStatusToDb(data.status) ?? request.status : request.status

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

  return products.map((product) => ({
    ...product,
    title: product.name,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }))
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

  return orders.map((order) => {
    const firstItem = order.items[0]

    return {
      ...order,
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      productId: firstItem?.productId ?? null,
      product: firstItem ? { title: firstItem.product.name } : null,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }
  })
}
