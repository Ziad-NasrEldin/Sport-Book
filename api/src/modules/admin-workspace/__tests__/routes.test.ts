import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createApp } from '../../../app'

vi.mock('../service', () => ({
  listUsers: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  updateBookingStatus: vi.fn(),
  listRoleUpgrades: vi.fn(),
  respondToRoleUpgrade: vi.fn(),
  getDashboardStats: vi.fn(),
  listAuditLogs: vi.fn(),
  listFacilities: vi.fn(),
  createFacility: vi.fn(),
  updateFacility: vi.fn(),
  listCoaches: vi.fn(),
  listBookings: vi.fn(),
  listFinance: vi.fn(),
  listSports: vi.fn(),
  createSport: vi.fn(),
  updateSport: vi.fn(),
  getVerificationCase: vi.fn(),
  updateVerificationCase: vi.fn(),
  listCoupons: vi.fn(),
  createCoupon: vi.fn(),
  updateCoupon: vi.fn(),
  listReviews: vi.fn(),
  updateReviewStatus: vi.fn(),
  listCmsPages: vi.fn(),
  updateCmsPage: vi.fn(),
  listReports: vi.fn(),
  createReportJob: vi.fn(),
  getLocalizationConfig: vi.fn(),
  updateLocalizationDefault: vi.fn(),
  getPlatformSettings: vi.fn(),
  updatePlatformSettings: vi.fn(),
  listStoreProducts: vi.fn(),
  listStoreOrders: vi.fn(),
}))

import { respondToRoleUpgrade, updateFacility, updateVerificationCase } from '../service'

let app: FastifyInstance

beforeAll(async () => {
  app = await createApp()
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('admin verification routes', () => {
  it('passes the authenticated reviewer to queue approval', async () => {
    vi.mocked(respondToRoleUpgrade).mockResolvedValue({ id: 'req_1', status: 'APPROVED' } as any)
    const token = await app.jwt.sign({ userId: 'admin_1', email: 'admin@sportbook.com', role: 'ADMIN' })

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin-workspace/role-upgrades/req_1/respond',
      headers: { authorization: `Bearer ${token}` },
      payload: { status: 'APPROVED' },
    })

    expect(res.statusCode).toBe(200)
    expect(respondToRoleUpgrade).toHaveBeenCalledWith('req_1', { status: 'APPROVED' }, 'admin_1')
  })

  it('accepts full verification-case updates on the detail endpoint', async () => {
    vi.mocked(updateVerificationCase).mockResolvedValue({ id: 'req_1', status: 'Approved' } as any)
    const token = await app.jwt.sign({ userId: 'admin_1', email: 'admin@sportbook.com', role: 'ADMIN' })

    const payload = {
      status: 'Approved',
      assignee: 'Current Admin',
      adminNote: 'Looks good',
      checklist: [{ id: 'doc-id', label: 'ID check', verified: true }],
      timeline: [{ id: 't1', message: 'Reviewed', at: '2026-04-17T00:00:00.000Z' }],
    }

    const res = await app.inject({
      method: 'PUT',
      url: '/api/v1/admin-workspace/verification/req_1',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(res.statusCode).toBe(200)
    expect(updateVerificationCase).toHaveBeenCalledWith('req_1', payload, 'admin_1')
  })
})

describe('admin facility routes', () => {
  it('passes authenticated admin id to facility updates', async () => {
    vi.mocked(updateFacility).mockResolvedValue({ id: 'facility_1', status: 'ACTIVE' } as any)
    const token = await app.jwt.sign({ userId: 'admin_1', email: 'admin@sportbook.com', role: 'ADMIN' })

    const payload = {
      name: 'Arena One',
      city: 'Cairo',
      status: 'ACTIVE',
      operatorName: 'Arena Manager',
      operatorEmail: 'manager@arena-one.com',
      branchName: 'Main Branch',
      branchAddress: 'Nasr City',
      sportIds: ['sport_1'],
    }

    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/admin-workspace/facilities/facility_1',
      headers: { authorization: `Bearer ${token}` },
      payload,
    })

    expect(res.statusCode).toBe(200)
    expect(updateFacility).toHaveBeenCalledWith('facility_1', payload, 'admin_1')
  })
})
