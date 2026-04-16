import { prisma } from '@lib/prisma'
import { NotFoundError } from '@common/errors'

export async function listSports() {
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
  return sports
}

export async function getSport(id: string) {
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
  if (!sport) {
    throw new NotFoundError('Sport')
  }
  return sport
}
