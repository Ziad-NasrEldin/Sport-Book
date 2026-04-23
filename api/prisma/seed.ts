import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clean up existing data
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.roleUpgradeRequest.deleteMany(),
    prisma.review.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.walletTransaction.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.storeOrderItem.deleteMany(),
    prisma.storeOrder.deleteMany(),
    prisma.storeProduct.deleteMany(),
    prisma.teamPostJoinRequest.deleteMany(),
    prisma.teamPostMember.deleteMany(),
    prisma.teamPost.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.coachService.deleteMany(),
    prisma.coachAvailability.deleteMany(),
    prisma.coachAvailabilityException.deleteMany(),
    prisma.coach.deleteMany(),
    prisma.courtPricingRule.deleteMany(),
    prisma.courtClosure.deleteMany(),
    prisma.court.deleteMany(),
    prisma.branch.deleteMany(),
    prisma.facilitySport.deleteMany(),
    prisma.facility.deleteMany(),
    prisma.sport.deleteMany(),
    prisma.userPreference.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.cmsContent.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // Create sports
  const sports = await Promise.all([
    prisma.sport.create({ data: { name: "TENNIS", displayName: 'Tennis', icon: 'tennis', sortOrder: 1 } }),
    prisma.sport.create({ data: { name: "PADEL", displayName: 'Padel', icon: 'padel', sortOrder: 2 } }),
    prisma.sport.create({ data: { name: "FOOTBALL", displayName: 'Football', icon: 'football', sortOrder: 3 } }),
    prisma.sport.create({ data: { name: "SQUASH", displayName: 'Squash', icon: 'squash', sortOrder: 4 } }),
  ])

  const [tennis, padel, football, squash] = sports
  console.log('Created sports')

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sportbook.com',
      password: passwordHash,
      name: 'Admin User',
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      wallet: {
        create: { balance: 0, currency: 'EGP' }
      },
      preferences: {
        create: { language: 'en', currency: 'EGP', timezone: 'Africa/Cairo' }
      }
    }
  })

  // Create operator user with facility
  const operator = await prisma.user.create({
    data: {
      email: 'operator@sportbook.com',
      password: passwordHash,
      name: 'Operator User',
      role: "OPERATOR",
      status: "ACTIVE",
      emailVerified: true,
      wallet: {
        create: { balance: 5000, currency: 'EGP' }
      },
      preferences: {
        create: { language: 'en', currency: 'EGP', timezone: 'Africa/Cairo' }
      },
      operatorFacility: {
        create: {
          name: 'Premier Sports Club',
          description: 'Premium sports facility with multiple courts',
          address: '123 Sports Avenue',
          city: 'Cairo',
          country: 'Egypt',
          phone: '+20 123 456 7890',
          email: 'info@premiersports.com',
          status: "ACTIVE",
          branches: {
            create: [
              {
                name: 'Main Branch',
                address: '123 Sports Avenue, Cairo',
                city: 'Cairo',
                phone: '+20 123 456 7890',
              },
              {
                name: 'New Cairo Branch',
                address: '456 Golf Road, New Cairo',
                city: 'New Cairo',
                phone: '+20 123 456 7891',
              }
            ]
          }
        }
      }
    },
    include: { operatorFacility: { include: { branches: true } } }
  })

  const facility = operator.operatorFacility!
  const [mainBranch, newCairoBranch] = facility.branches

  // Link facility to sports
  await prisma.facilitySport.createMany({
    data: [
      { facilityId: facility.id, sportId: tennis.id },
      { facilityId: facility.id, sportId: padel.id },
      { facilityId: facility.id, sportId: football.id },
    ]
  })

  console.log('Created operator and facility')

  // Create courts
  const courts = await Promise.all([
    // Tennis courts at main branch
    prisma.court.create({
      data: {
        branchId: mainBranch.id,
        sportId: tennis.id,
        name: 'Tennis Court 1 - Hard Court',
        description: 'Professional hard court with floodlights',
        images: JSON.stringify(['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80']),
        indoor: false,
        hasLighting: true,
        hasParking: true,
        basePrice: 500,
        status: "ACTIVE",
        pricingRules: {
          create: [
            { dayOfWeek: 5, startHour: 18, endHour: 23, price: 700, isPeak: true }, // Friday evening
            { dayOfWeek: 6, startHour: 18, endHour: 23, price: 700, isPeak: true }, // Saturday evening
          ]
        }
      }
    }),
    prisma.court.create({
      data: {
        branchId: mainBranch.id,
        sportId: tennis.id,
        name: 'Tennis Court 2 - Clay',
        description: 'Clay court, outdoor',
        images: JSON.stringify(['https://images.unsplash.com/photo-1599590984817-0c15f45b64a8?auto=format&fit=crop&w=1200&q=80']),
        indoor: false,
        hasLighting: false,
        basePrice: 450,
        status: "ACTIVE",
      }
    }),
    // Padel courts
    prisma.court.create({
      data: {
        branchId: mainBranch.id,
        sportId: padel.id,
        name: 'Padel Court 1',
        description: 'Indoor padel court with premium surface',
        images: JSON.stringify(['https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=1200&q=80']),
        indoor: true,
        hasLighting: true,
        hasParking: true,
        basePrice: 850,
        status: "ACTIVE",
        pricingRules: {
          create: [
            { startHour: 17, endHour: 23, price: 1000, isPeak: true }, // Daily evening peak
          ]
        }
      }
    }),
    prisma.court.create({
      data: {
        branchId: newCairoBranch.id,
        sportId: padel.id,
        name: 'Padel Court - Outdoor',
        description: 'Outdoor padel court with panoramic views',
        images: JSON.stringify(['https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80']),
        indoor: false,
        hasLighting: true,
        basePrice: 600,
        status: "ACTIVE",
      }
    }),
    // Football field
    prisma.court.create({
      data: {
        branchId: newCairoBranch.id,
        sportId: football.id,
        name: 'Football Field - Artificial Turf',
        description: 'Full-size artificial turf football field',
        images: JSON.stringify(['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80']),
        indoor: false,
        hasLighting: true,
        hasParking: true,
        basePrice: 950,
        status: "ACTIVE",
      }
    }),
    // Squash courts
    prisma.court.create({
      data: {
        branchId: mainBranch.id,
        sportId: squash.id,
        name: 'Squash Court 1 - Glass Back',
        description: 'Professional glass-back squash court with viewing gallery',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1592650892303-7e6e8c6e8e5c?auto=format&fit=crop&w=1200&q=80'
        ]),
        indoor: true,
        hasLighting: true,
        hasParking: true,
        basePrice: 350,
        status: "ACTIVE",
        pricingRules: {
          create: [
            { dayOfWeek: 5, startHour: 17, endHour: 22, price: 450, isPeak: true },
            { dayOfWeek: 6, startHour: 10, endHour: 22, price: 450, isPeak: true },
          ]
        }
      }
    }),
    prisma.court.create({
      data: {
        branchId: newCairoBranch.id,
        sportId: squash.id,
        name: 'Squash Court 2 - Standard',
        description: 'Standard all-glass squash court',
        images: JSON.stringify(['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80']),
        indoor: true,
        hasLighting: true,
        basePrice: 300,
        status: "ACTIVE",
      }
    }),
    // More Tennis courts
    prisma.court.create({
      data: {
        branchId: newCairoBranch.id,
        sportId: tennis.id,
        name: 'Tennis Court 3 - Championship',
        description: 'Championship-level hard court with ITF certification, floodlights, and player amenities',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1617083934551-ac1f1b6a50ea?auto=format&fit=crop&w=1200&q=80'
        ]),
        indoor: false,
        hasLighting: true,
        hasParking: true,
        basePrice: 650,
        status: "ACTIVE",
        pricingRules: {
          create: [
            { dayOfWeek: 4, startHour: 18, endHour: 22, price: 800, isPeak: true },
            { dayOfWeek: 5, startHour: 16, endHour: 23, price: 900, isPeak: true },
            { dayOfWeek: 6, startHour: 8, endHour: 23, price: 900, isPeak: true },
            { dayOfWeek: 0, startHour: 8, endHour: 21, price: 750, isPeak: true },
          ]
        }
      }
    }),
    // More Padel courts
    prisma.court.create({
      data: {
        branchId: mainBranch.id,
        sportId: padel.id,
        name: 'Padel Court 2 - Championship',
        description: 'World Padel Tour certified court with premium lighting and spectator seating',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=1200&q=80'
        ]),
        indoor: true,
        hasLighting: true,
        hasParking: true,
        basePrice: 950,
        status: "ACTIVE",
        pricingRules: {
          create: [
            { startHour: 17, endHour: 23, price: 1200, isPeak: true },
            { dayOfWeek: 0, startHour: 10, endHour: 20, price: 1000, isPeak: true },
          ]
        }
      }
    }),
    // Another Football court (5-a-side)
    prisma.court.create({
      data: {
        branchId: mainBranch.id,
        sportId: football.id,
        name: '5-A-Side Football Pitch',
        description: 'Compact 5-a-side football pitch with artificial turf and barrier walls',
        images: JSON.stringify(['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80']),
        indoor: false,
        hasLighting: true,
        hasParking: true,
        basePrice: 600,
        status: "ACTIVE",
        pricingRules: {
          create: [
            { dayOfWeek: 5, startHour: 18, endHour: 23, price: 800, isPeak: true },
            { dayOfWeek: 6, startHour: 14, endHour: 23, price: 850, isPeak: true },
            { dayOfWeek: 0, startHour: 12, endHour: 20, price: 700, isPeak: true },
          ]
        }
      }
    }),
  ])

  console.log('Created courts')

  // Create coach user
  const coachUser = await prisma.user.create({
    data: {
      email: 'coach@sportbook.com',
      password: passwordHash,
      name: 'Omar Hassan',
      role: "COACH",
      status: "ACTIVE",
      emailVerified: true,
      wallet: {
        create: { balance: 2000, currency: 'EGP' }
      },
      preferences: {
        create: { language: 'en', currency: 'EGP', timezone: 'Africa/Cairo' }
      },
      coachProfile: {
        create: {
          slug: 'omar-hassan',
          bio: 'Match strategy and serve consistency specialist for intermediate and advanced players. With 9 years of experience coaching both juniors and adults.',
          headline: 'Match strategy and serve consistency specialist',
          city: 'Cairo',
          experienceYears: 9,
          certifications: JSON.stringify(['ITF Level 2', 'PTR Certified']),
          specialties: JSON.stringify(['Match Strategy', 'Serve Technique', 'Mental Game']),
          languages: JSON.stringify(['English', 'Arabic']),
          settings: JSON.stringify({
            payoutCycle: 'weekly',
            notifications: {
              bookingRequests: true,
              bookingChanges: true,
              payoutUpdates: true,
              athleteMessages: false,
            },
            policies: {
              autoConfirmFollowUps: false,
              allowLateCancellation: true,
              allowRescheduleRequests: true,
            },
          }),
          sessionRate: 180,
          commissionRate: 20,
          sportId: tennis.id,
          isActive: true,
          isVerified: true,
          sessionTypes: {
            create: [
              {
                name: 'Private Session',
                description: '1 athlete focused coaching.',
                minParticipants: 1,
                maxParticipants: 1,
                durationOptions: JSON.stringify([60, 90, 120]),
                baseRate: 180,
                multiplier: 1,
                visibility: 'Public',
                status: 'ACTIVE',
                sortOrder: 1,
              },
              {
                name: 'Duo Session',
                description: '2 athletes with shared drills.',
                minParticipants: 2,
                maxParticipants: 2,
                durationOptions: JSON.stringify([60, 90]),
                baseRate: 150,
                multiplier: 1.65,
                visibility: 'Public',
                status: 'ACTIVE',
                sortOrder: 2,
              },
              {
                name: 'Group Clinic',
                description: 'Small-group tactical session.',
                minParticipants: 3,
                maxParticipants: 6,
                durationOptions: JSON.stringify([90]),
                baseRate: 120,
                multiplier: 1.25,
                visibility: 'Members',
                status: 'DRAFT',
                sortOrder: 3,
              },
            ]
          },
          services: {
            create: [
              { name: 'Private Session (1 hour)', description: 'One-on-one focus on serve and rally patterns.', duration: 60, price: 180 },
              { name: 'Private Session (2 hours)', description: 'Extended tactical and technical block.', duration: 120, price: 320 },
              { name: 'Group Session (3-4 players)', description: 'Shared intensity block for advanced juniors.', duration: 90, price: 120 },
            ]
          },
          availability: {
            create: [
              { dayOfWeek: 0, startHour: 9, endHour: 18 }, // Sunday
              { dayOfWeek: 2, startHour: 9, endHour: 18 }, // Tuesday
              { dayOfWeek: 4, startHour: 9, endHour: 18 }, // Thursday
              { dayOfWeek: 6, startHour: 10, endHour: 16 }, // Saturday
            ]
          }
        }
      }
    },
    include: { coachProfile: { include: { services: true, sessionTypes: true } } }
  })

  const coach = coachUser.coachProfile!

  await prisma.coachService.update({
    where: { id: coach.services[0].id },
    data: { sessionTypeId: coach.sessionTypes[0].id },
  })
  await prisma.coachService.update({
    where: { id: coach.services[1].id },
    data: { sessionTypeId: coach.sessionTypes[0].id },
  })
  await prisma.coachService.update({
    where: { id: coach.services[2].id },
    data: { sessionTypeId: coach.sessionTypes[2].id },
  })

  console.log('Created coach')

  // Create additional coaches
  const coach2 = await prisma.user.create({
    data: {
      email: 'coach2@sportbook.com',
      password: passwordHash,
      name: 'Lina Farouk',
      role: "COACH",
      status: "ACTIVE",
      emailVerified: true,
      wallet: { create: { balance: 1500, currency: 'EGP' } },
      preferences: { create: { language: 'en', currency: 'EGP' } },
      coachProfile: {
        create: {
          slug: 'lina-farouk',
          bio: 'Footwork-first coaching with doubles positioning systems and fast transition drills. Padel specialist with tournament experience.',
          headline: 'Padel footwork and doubles positioning coach',
          city: 'New Cairo',
          experienceYears: 6,
          languages: JSON.stringify(['English', 'Arabic']),
          settings: JSON.stringify({
            payoutCycle: 'biweekly',
            notifications: { bookingRequests: true, bookingChanges: true, payoutUpdates: true, athleteMessages: true },
            policies: { autoConfirmFollowUps: true, allowLateCancellation: false, allowRescheduleRequests: true },
          }),
          sessionRate: 150,
          sportId: padel.id,
          isActive: true,
          isVerified: true,
          sessionTypes: {
            create: [
              {
                name: 'Private Session',
                description: '1 athlete technique and movement work.',
                minParticipants: 1,
                maxParticipants: 1,
                durationOptions: JSON.stringify([60, 90]),
                baseRate: 150,
                multiplier: 1,
                visibility: 'Public',
                status: 'ACTIVE',
                sortOrder: 1,
              },
              {
                name: 'Doubles Training',
                description: '2-4 players doubles rotation and positioning.',
                minParticipants: 2,
                maxParticipants: 4,
                durationOptions: JSON.stringify([90]),
                baseRate: 200,
                multiplier: 1.2,
                visibility: 'Public',
                status: 'ACTIVE',
                sortOrder: 2,
              },
            ]
          },
          services: {
            create: [
              { name: 'Padel Private Session', description: '1:1 padel coaching for technique and transitions.', duration: 60, price: 150 },
              { name: 'Padel Doubles Training', description: 'Shared doubles drills and movement.', duration: 90, price: 200 },
            ]
          }
        }
      }
    },
    include: { coachProfile: { include: { services: true, sessionTypes: true } } }
  })

  if (coach2.coachProfile) {
    await prisma.coachService.update({
      where: { id: coach2.coachProfile.services[0].id },
      data: { sessionTypeId: coach2.coachProfile.sessionTypes[0].id },
    })
    await prisma.coachService.update({
      where: { id: coach2.coachProfile.services[1].id },
      data: { sessionTypeId: coach2.coachProfile.sessionTypes[1].id },
    })
  }

  const coach3 = await prisma.user.create({
    data: {
      email: 'coach3@sportbook.com',
      password: passwordHash,
      name: 'Youssef Adel',
      role: "COACH",
      status: "ACTIVE",
      emailVerified: true,
      wallet: { create: { balance: 1800, currency: 'EGP' } },
      preferences: { create: { language: 'en', currency: 'EGP' } },
      coachProfile: {
        create: {
          slug: 'youssef-adel',
          bio: 'Conditioning and rally-intensity coach focused on movement efficiency and endurance. Former professional player.',
          headline: 'Conditioning and rally-intensity specialist',
          city: 'Giza',
          experienceYears: 11,
          languages: JSON.stringify(['English']),
          settings: JSON.stringify({
            payoutCycle: 'monthly',
            notifications: { bookingRequests: true, bookingChanges: false, payoutUpdates: true, athleteMessages: false },
            policies: { autoConfirmFollowUps: false, allowLateCancellation: true, allowRescheduleRequests: false },
          }),
          sessionRate: 200,
          sportId: squash.id,
          isActive: true,
          isVerified: true,
          sessionTypes: {
            create: [
              {
                name: 'Private Session',
                description: 'Solo squash performance block.',
                minParticipants: 1,
                maxParticipants: 1,
                durationOptions: JSON.stringify([60]),
                baseRate: 200,
                multiplier: 1,
                visibility: 'Public',
                status: 'ACTIVE',
                sortOrder: 1,
              },
            ]
          },
          services: {
            create: [
              { name: 'Squash Private Session', description: 'Court session focused on rally construction.', duration: 60, price: 200 },
              { name: 'Fitness for Squash', description: 'Conditioning session for endurance and movement efficiency.', duration: 60, price: 180 },
            ]
          }
        }
      }
    },
    include: { coachProfile: { include: { services: true, sessionTypes: true } } }
  })

  if (coach3.coachProfile) {
    await prisma.coachService.updateMany({
      where: { coachId: coach3.coachProfile.id },
      data: { sessionTypeId: coach3.coachProfile.sessionTypes[0].id },
    })
  }

  console.log('Created additional coaches')

  // Create regular player users
  const players = await Promise.all([
    prisma.user.create({
      data: {
        email: 'player1@example.com',
        password: passwordHash,
        name: 'Ahmed Mohamed',
        role: "PLAYER",
        status: "ACTIVE",
        emailVerified: true,
        wallet: { create: { balance: 3000, currency: 'EGP' } },
        preferences: { create: { language: 'en', currency: 'EGP' } }
      }
    }),
    prisma.user.create({
      data: {
        email: 'player2@example.com',
        password: passwordHash,
        name: 'Sarah Ali',
        role: "PLAYER",
        status: "ACTIVE",
        emailVerified: true,
        wallet: { create: { balance: 1500, currency: 'EGP' } },
        preferences: { create: { language: 'en', currency: 'EGP' } }
      }
    }),
    prisma.user.create({
      data: {
        email: 'player3@example.com',
        password: passwordHash,
        name: 'Mohamed Hassan',
        role: "PLAYER",
        status: "ACTIVE",
        emailVerified: true,
        wallet: { create: { balance: 2000, currency: 'EGP' } },
        preferences: { create: { language: 'ar', currency: 'EGP', rtl: true } }
      }
    }),
  ])

  console.log('Created player users')

  // Create sample bookings
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  await prisma.booking.create({
    data: {
      userId: players[0].id,
      type: 'COURT',
      courtId: courts[0].id,
      status: 'CONFIRMED',
      date: tomorrow,
      startHour: 18,
      endHour: 19,
      duration: 1,
      playerCount: 2,
      basePrice: 500,
      totalPrice: 500,
      paymentStatus: 'PAID',
    }
  })

  await prisma.booking.create({
    data: {
      userId: players[1].id,
      type: 'COACH',
      coachId: coach.id,
      coachServiceId: coach.services[0].id,
      status: 'CONFIRMED',
      date: tomorrow,
      startHour: 10,
      endHour: 11,
      duration: 1,
      playerCount: 1,
      basePrice: 180,
      totalPrice: 180,
      paymentStatus: 'PAID',
    }
  })

  console.log('Created sample bookings')

  // Create store products
  await prisma.storeProduct.createMany({
    data: [
      {
        facilityId: facility.id,
        name: 'Pro Spin 98 Tennis Racket',
        category: 'Tennis Rackets',
        description: 'Professional grade tennis racket with excellent spin control',
        images: JSON.stringify(['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80']),
        price: 4200,
        quantity: 34,
        status: 'IN_STOCK',
      },
      {
        facilityId: facility.id,
        name: 'Control X Padel Racket',
        category: 'Padel Rackets',
        description: 'Premium padel racket for control players',
        images: JSON.stringify(['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80']),
        price: 3100,
        quantity: 27,
        status: 'IN_STOCK',
      },
      {
        facilityId: facility.id,
        name: 'Tournament Tennis Balls (3-Pack)',
        category: 'Balls',
        description: 'Professional tournament grade tennis balls',
        images: JSON.stringify(['https://images.unsplash.com/photo-1551731409-43eb3e517a1a?auto=format&fit=crop&w=800&q=80']),
        price: 260,
        quantity: 6,
        status: 'LOW_STOCK',
      },
      {
        facilityId: facility.id,
        name: 'Dry Feel Overgrip Set',
        category: 'Accessories',
        description: 'Pack of 3 premium overgrips',
        images: JSON.stringify(['https://images.unsplash.com/photo-1622163642998-1ea38b1a9bb3?auto=format&fit=crop&w=800&q=80']),
        price: 140,
        quantity: 48,
        status: 'IN_STOCK',
      },
    ]
  })

  console.log('Created store products')

  // Create coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'RAMADAN25',
        description: 'Ramadan special discount',
        type: 'PERCENTAGE',
        value: 25,
        endDate: new Date('2025-05-01'),
        usageLimit: 2000,
        status: 'ACTIVE',
      },
      {
        code: 'WELCOME100',
        description: 'Welcome discount for new users',
        type: 'FIXED_AMOUNT',
        value: 100,
        endDate: new Date('2025-06-15'),
        usageLimit: 10000,
        status: 'ACTIVE',
      },
    ]
  })

  console.log('Created coupons')

  // Create CMS content
  await prisma.cmsContent.createMany({
    data: [
      {
        page: 'terms',
        language: 'en',
        title: 'Terms of Service',
        content: 'Terms of service content...',
        status: 'PUBLISHED',
        version: '1.0',
      },
      {
        page: 'privacy',
        language: 'en',
        title: 'Privacy Policy',
        content: 'Privacy policy content...',
        status: 'PUBLISHED',
        version: '1.0',
      },
      {
        page: 'faq',
        language: 'en',
        title: 'Frequently Asked Questions',
        content: 'FAQ content...',
        status: 'PUBLISHED',
        version: '1.0',
      },
    ]
  })

  console.log('Created CMS content')

  // Create notifications for users
  await prisma.notification.createMany({
    data: [
      {
        userId: players[0].id,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: 'Your court booking for tomorrow at 6 PM has been confirmed.',
        referenceType: 'BOOKING',
      },
      {
        userId: players[1].id,
        type: 'SYSTEM',
        title: 'Welcome to SportBook!',
        message: 'Complete your profile to get personalized recommendations.',
      },
    ]
  })

  console.log('Created notifications')

  console.log('\n✅ Seed completed successfully!')
  console.log('\nTest accounts:')
  console.log('  Admin:    admin@sportbook.com / password123')
  console.log('  Operator: operator@sportbook.com / password123')
  console.log('  Coach:    coach@sportbook.com / password123')
  console.log('  Player 1: player1@example.com / password123')
  console.log('  Player 2: player2@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
