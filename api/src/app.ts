import fastify from 'fastify'
import { env } from '@config/env'
import { registerCors } from '@plugins/cors'
import { registerCookies } from '@plugins/cookies'
import { registerJwt } from '@plugins/jwt'
import { registerRateLimit } from '@plugins/rateLimit'
import { registerErrorHandler } from '@plugins/errorHandler'
import { registerAudit } from '@plugins/audit'
import { authRoutes } from '@modules/auth/routes'
import { userRoutes, playerRoutes } from '@modules/users/routes'
import { sportRoutes } from '@modules/sports/routes'
import { facilityRoutes } from '@modules/facilities/routes'
import { courtRoutes } from '@modules/courts/routes'
import { coachRoutes } from '@modules/coaches/routes'
import { bookingRoutes } from '@modules/bookings/routes'
import { paymentRoutes } from '@modules/payments/routes'
import { reviewRoutes } from '@modules/reviews/routes'
import { teamRoutes } from '@modules/teams/routes'
import { storeRoutes } from '@modules/store/routes'
import { coachWorkspaceRoutes } from '@modules/coach-workspace/routes'
import { coachConsoleRoutes } from '@modules/coach-console/routes'
import { operatorWorkspaceRoutes } from '@modules/operator-workspace/routes'
import { adminWorkspaceRoutes } from '@modules/admin-workspace/routes'

export async function createApp() {
  const app = fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    },
  })

  // Register plugins in order
  await registerErrorHandler(app)
  await registerCors(app)
  await registerCookies(app)
  await registerJwt(app)
  await registerRateLimit(app)
  await registerAudit(app)

  // Health check endpoint
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  app.get('/api/v1/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Public onboarding stats endpoint (no auth required)
  app.get('/api/v1/onboarding/stats', async () => {
    const { prisma } = await import('@lib/prisma')
    const [courts, coaches, cities, products] = await Promise.all([
      prisma.court.count({ where: { status: 'ACTIVE' } }),
      prisma.coach.count({ where: { isActive: true, isVerified: true } }),
      prisma.facility.findMany({ where: { status: 'ACTIVE' }, select: { city: true } }).then((facs) => new Set(facs.map((f) => f.city)).size),
      prisma.storeProduct.count({ where: { status: 'IN_STOCK' } }),
    ])
    return { courts, coaches, cities, products }
  })

  // Register module routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(userRoutes, { prefix: '/api/v1/users' })
  await app.register(sportRoutes, { prefix: '/api/v1/sports' })
  await app.register(facilityRoutes, { prefix: '/api/v1/facilities' })
  await app.register(courtRoutes, { prefix: '/api/v1/courts' })
  await app.register(coachRoutes, { prefix: '/api/v1/coaches' })
  await app.register(bookingRoutes, { prefix: '/api/v1/bookings' })
  await app.register(paymentRoutes, { prefix: '/api/v1/payments' })
  await app.register(reviewRoutes, { prefix: '/api/v1/reviews' })
  await app.register(teamRoutes, { prefix: '/api/v1/teams' })
  await app.register(storeRoutes, { prefix: '/api/v1/store' })
  await app.register(coachConsoleRoutes, { prefix: '/api/v1/coach' })
  await app.register(coachWorkspaceRoutes, { prefix: '/api/v1/coach-workspace' })
  await app.register(operatorWorkspaceRoutes, { prefix: '/api/v1/operator' })
  await app.register(operatorWorkspaceRoutes, { prefix: '/api/v1/operator-workspace' })
  await app.register(adminWorkspaceRoutes, { prefix: '/api/v1/admin-workspace' })
  await app.register(playerRoutes, { prefix: '/api/v1/player' })

  return app
}
