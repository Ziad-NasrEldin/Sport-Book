import type { FastifyInstance, FastifyRequest } from 'fastify'
import { prisma } from '@lib/prisma'
import { success } from '@common/response'

export async function sportRoutes(app: FastifyInstance) {
  // GET /sports - List all active sports
  app.get('/', async () => {
    const sports = await prisma.sport.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        icon: true,
        description: true,
      },
    })
    return success(sports)
  })

  // GET /sports/:id - Get sport details
  app.get('/:id', async (request: FastifyRequest) => {
    const { id } = request.params as { id: string }
    const sport = await prisma.sport.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courts: true,
            coaches: true,
          },
        },
      },
    })
    return success(sport)
  })
}
