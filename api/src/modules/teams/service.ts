import { prisma } from '@lib/prisma'
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '@common/errors'
import type { CreateTeamPostInput, JoinTeamPostInput, RespondToJoinRequestInput } from './schema'

export async function createTeamPost(userId: string, data: CreateTeamPostInput) {
  const { courtId, date, startHour, endHour, neededPlayers, description } = data

  const court = await prisma.court.findUnique({
    where: { id: courtId },
  })

  if (!court) {
    throw new NotFoundError('Court')
  }

  const teamPostDate = new Date(date)

  // Check court availability for the slot
  const conflict = await prisma.booking.findFirst({
    where: {
      courtId,
      date: {
        gte: teamPostDate,
        lt: new Date(new Date(teamPostDate).setDate(teamPostDate.getDate() + 1)),
      },
      startHour: { lt: endHour },
      endHour: { gt: startHour },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  })

  if (conflict) {
    throw new ConflictError('Court is already booked for this slot')
  }

  // Create team post
  const teamPost = await prisma.teamPost.create({
    data: {
      createdByUserId: userId,
      courtId,
      date: teamPostDate,
      startHour,
      endHour,
      neededPlayers,
      status: 'OPEN',
      memberUserIds: JSON.stringify([userId]),
    },
    include: {
      court: {
        include: {
          sport: true,
          branch: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          avatar: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  })

  // Add creator as first member
  await prisma.teamPostMember.create({
    data: {
      teamPostId: teamPost.id,
      userId,
    },
  })

  return teamPost
}

export async function getTeamPost(teamPostId: string) {
  const teamPost = await prisma.teamPost.findUnique({
    where: { id: teamPostId },
    include: {
      court: {
        include: {
          sport: true,
          branch: {
            include: {
              facility: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          name: true,
          avatar: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      joinRequests: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  })

  if (!teamPost) {
    throw new NotFoundError('Team post')
  }

  return teamPost
}

export async function listTeamPosts(filters: {
  courtId?: string
  status?: string
  date?: string
  page?: number
  limit?: number
}) {
  const { courtId, status, date, page = 1, limit = 20 } = filters

  const where: any = {}

  if (courtId) where.courtId = courtId
  if (status) where.status = status
  if (date) {
    const dateObj = new Date(date)
    where.date = {
      gte: dateObj,
      lt: new Date(new Date(dateObj).setDate(dateObj.getDate() + 1)),
    }
  }

  const [teamPosts, total] = await Promise.all([
    prisma.teamPost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        court: {
          include: {
            sport: true,
            branch: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.teamPost.count({ where }),
  ])

  return {
    data: teamPosts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function joinTeamPost(userId: string, data: JoinTeamPostInput) {
  const { teamPostId } = data

  const teamPost = await prisma.teamPost.findUnique({
    where: { id: teamPostId },
    include: {
      members: true,
    },
  })

  if (!teamPost) {
    throw new NotFoundError('Team post')
  }

  if (teamPost.status !== 'OPEN') {
    throw new BadRequestError('Team post is not accepting new members')
  }

  if (teamPost.createdByUserId === userId) {
    throw new BadRequestError('You are already the creator of this team')
  }

  const isAlreadyMember = teamPost.members.some(m => m.userId === userId)
  if (isAlreadyMember) {
    throw new ConflictError('You are already a member of this team')
  }

  // Create join request
  const joinRequest = await prisma.teamPostJoinRequest.create({
    data: {
      teamPostId,
      userId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  })

  return joinRequest
}

export async function respondToJoinRequest(userId: string, requestId: string, data: RespondToJoinRequestInput) {
  const joinRequest = await prisma.teamPostJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      teamPost: true,
    },
  })

  if (!joinRequest) {
    throw new NotFoundError('Join request')
  }

  if (joinRequest.teamPost.createdByUserId !== userId) {
    throw new ForbiddenError('Only the team creator can respond to join requests')
  }

  if (joinRequest.status !== 'PENDING') {
    throw new BadRequestError('Join request has already been processed')
  }

  const updated = await prisma.teamPostJoinRequest.update({
    where: { id: requestId },
    data: {
      status: data.status,
      respondedAt: new Date(),
    },
  })

  // If approved, add user as member
  if (data.status === 'APPROVED') {
    await prisma.teamPostMember.create({
      data: {
        teamPostId: joinRequest.teamPostId,
        userId: joinRequest.userId,
      },
    })

    // Update memberUserIds
    const teamPost = await prisma.teamPost.findUnique({
      where: { id: joinRequest.teamPostId },
      select: { memberUserIds: true, neededPlayers: true },
    })

    if (teamPost) {
      const currentMembers = JSON.parse(teamPost.memberUserIds || '[]')
      currentMembers.push(joinRequest.userId)

      const memberCount = currentMembers.length
      const newStatus = memberCount >= teamPost.neededPlayers ? 'FULL' : 'OPEN'

      await prisma.teamPost.update({
        where: { id: joinRequest.teamPostId },
        data: {
          memberUserIds: JSON.stringify(currentMembers),
          status: newStatus,
        },
      })
    }
  }

  return updated
}

export async function leaveTeamPost(userId: string, teamPostId: string) {
  const teamPost = await prisma.teamPost.findUnique({
    where: { id: teamPostId },
    include: {
      members: true,
    },
  })

  if (!teamPost) {
    throw new NotFoundError('Team post')
  }

  if (teamPost.createdByUserId === userId) {
    throw new BadRequestError('Creator cannot leave their own team')
  }

  const membership = teamPost.members.find(m => m.userId === userId)
  if (!membership) {
    throw new BadRequestError('You are not a member of this team')
  }

  await prisma.teamPostMember.delete({
    where: { id: membership.id },
  })

  // Update memberUserIds and status
  const currentMembers = JSON.parse(teamPost.memberUserIds || '[]').filter((id: string) => id !== userId)
  const memberCount = currentMembers.length
  const newStatus = memberCount >= teamPost.neededPlayers ? 'FULL' : 'OPEN'

  await prisma.teamPost.update({
    where: { id: teamPostId },
    data: {
      memberUserIds: JSON.stringify(currentMembers),
      status: newStatus,
    },
  })

  return { message: 'Successfully left the team' }
}

export async function cancelTeamPost(userId: string, teamPostId: string) {
  const teamPost = await prisma.teamPost.findUnique({
    where: { id: teamPostId },
  })

  if (!teamPost) {
    throw new NotFoundError('Team post')
  }

  if (teamPost.createdByUserId !== userId) {
    throw new ForbiddenError('Only the creator can cancel the team post')
  }

  await prisma.teamPost.update({
    where: { id: teamPostId },
    data: {
      status: 'CANCELLED',
    },
  })

  return { message: 'Team post cancelled' }
}
