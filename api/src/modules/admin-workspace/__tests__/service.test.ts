import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/prisma', () => {
  const tx = {
    roleUpgradeRequest: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    facility: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    coach: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    sport: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  }

  return {
    prisma: {
      roleUpgradeRequest: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (callback: any) => callback(tx)),
      __tx: tx,
    },
  }
})

import { prisma } from '@lib/prisma'
import { respondToRoleUpgrade, updateVerificationCase } from '../service'

const tx = (prisma as any).__tx

const baseRequest = {
  id: 'req_1',
  userId: 'user_1',
  requestedRole: 'OPERATOR',
  sportId: null,
  experienceYears: null,
  bio: 'Operator request',
  businessName: 'Arena One',
  businessAddress: 'Nasr City',
  licenseNumber: 'REG-1',
  status: 'PENDING',
  submittedAt: new Date('2026-04-16T10:00:00.000Z'),
  reviewedAt: null,
  reviewerId: null,
  notes: null,
  documents: JSON.stringify({
    details: {
      fullName: 'Facility Owner',
      email: 'owner@example.com',
      phone: '+201000000000',
      city: 'Cairo',
      requestMessage: 'Please approve me.',
      facilityAddress: 'Nasr City',
    },
  }),
  user: {
    name: 'Facility Owner',
    email: 'owner@example.com',
    phone: '+201000000000',
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  tx.roleUpgradeRequest.findUnique.mockResolvedValue({ ...baseRequest, status: 'APPROVED', reviewerId: 'admin_1' })
  tx.roleUpgradeRequest.update.mockResolvedValue({})
  tx.user.update.mockResolvedValue({})
  tx.facility.findUnique.mockResolvedValue(null)
  tx.facility.create.mockResolvedValue({})
  tx.facility.update.mockResolvedValue({})
  tx.coach.findUnique.mockResolvedValue(null)
  tx.coach.create.mockResolvedValue({})
  tx.coach.update.mockResolvedValue({})
  tx.sport.findUnique.mockResolvedValue({ id: 'sport_1' })
  tx.sport.findFirst.mockResolvedValue({ id: 'sport_1' })

  vi.mocked(prisma.roleUpgradeRequest.findUnique).mockResolvedValue(baseRequest as any)
  vi.mocked(prisma.roleUpgradeRequest.update).mockResolvedValue({
    ...baseRequest,
    status: 'APPROVED',
    reviewerId: 'admin_1',
    documents: baseRequest.documents,
  } as any)
  vi.mocked(prisma.user.update).mockResolvedValue({} as any)
  vi.mocked(prisma.user.findUnique).mockResolvedValue({ name: 'Admin User' } as any)
})

describe('respondToRoleUpgrade', () => {
  it('approves the request, promotes the user, and provisions an operator facility', async () => {
    await respondToRoleUpgrade('req_1', { status: 'APPROVED' }, 'admin_1')

    expect(tx.roleUpgradeRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'req_1' },
        data: expect.objectContaining({
          status: 'APPROVED',
          reviewerId: 'admin_1',
        }),
      }),
    )
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { role: 'OPERATOR' },
    })
    expect(tx.facility.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          operatorId: 'user_1',
          name: 'Arena One',
          status: 'ACTIVE',
        }),
      }),
    )
    expect(prisma.auditLog.create).toHaveBeenCalled()
  })
})

describe('updateVerificationCase', () => {
  it('persists full-case edits and approval side effects from the detail page', async () => {
    await updateVerificationCase(
      'req_1',
      {
        status: 'Approved',
        assignee: 'Current Admin',
        adminNote: 'Looks good',
        checklist: [
          { id: 'doc-id', label: 'ID check', verified: true },
          { id: 'doc-bank', label: 'Bank proof', verified: true },
        ],
      },
      'admin_1',
    )

    expect(prisma.roleUpgradeRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'req_1' },
        data: expect.objectContaining({
          status: 'APPROVED',
          reviewerId: 'admin_1',
        }),
      }),
    )
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: { role: 'OPERATOR' },
    })
    expect(tx.facility.create).toHaveBeenCalled()
    expect(prisma.auditLog.create).toHaveBeenCalled()
  })
})
