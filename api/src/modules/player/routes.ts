import type { FastifyInstance, FastifyRequest } from 'fastify'
import { success } from '@common/response'

export async function playerRoutes(app: FastifyInstance) {
  // All routes require authentication
  app.addHook('preHandler', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.status(401).send({
        error: 'Unauthorized - Please log in',
        code: 'UNAUTHORIZED'
      })
    }
  })

  // GET /player/profile - Get player profile
  app.get('/profile', async (request: FastifyRequest) => {
    // TODO: Implement profile fetching
    return success({
      user: {
        id: request.user!.userId,
        name: 'Player Name',
        email: 'player@example.com',
      },
      wallet: {
        balance: 1500,
      },
      nextBooking: null,
      favoritesCount: 5,
      preferences: {
        preferredSports: ['Tennis', 'Padel'],
        skillLevel: 'Intermediate',
      },
    })
  })

  // GET /player/categories - Get available sport categories
  app.get('/categories', async (request: FastifyRequest) => {
    // TODO: Implement categories fetching
    return success([
      { id: '1', name: 'Tennis', courtsCount: 124, color: 'bg-primary-container text-white' },
      { id: '2', name: 'Padel', courtsCount: 48, color: 'bg-secondary-container text-primary' },
      { id: '3', name: 'Squash', courtsCount: 32, color: 'bg-primary hover:bg-primary/90 text-white' },
    ])
  })

  // GET /player/courts/nearby - Get nearby courts
  app.get('/courts/nearby', async (request: FastifyRequest) => {
    // TODO: Implement nearby courts fetching
    return success([
      {
        id: '1',
        title: "The Regent's Park",
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        distance: 1.2,
        location: 'London NW1',
        price: 500,
        status: 'AVAILABLE',
        type: 'TENNIS • HARD COURT',
      },
      {
        id: '2',
        title: 'Elite Padel Club',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        distance: 2.5,
        location: 'Chelsea, London',
        price: 850,
        status: 'BUSY',
        type: 'PADEL • PANORAMIC',
      },
    ])
  })

  // GET /player/teams - Get team posts
  app.get('/teams', async (request: FastifyRequest) => {
    // TODO: Implement teams fetching
    return success([])
  })

  // GET /player/coaches - Get available coaches
  app.get('/coaches', async (request: FastifyRequest) => {
    // TODO: Implement coaches fetching
    return success([])
  })

  // GET /player/users - Get user list
  app.get('/users', async (request: FastifyRequest) => {
    // TODO: Implement users fetching
    return success([])
  })

  // GET /player/notifications/unread-count - Get unread notifications count
  app.get('/notifications/unread-count', async (request: FastifyRequest) => {
    // TODO: Implement notifications count fetching
    return success({
      count: 0,
    })
  })
}
