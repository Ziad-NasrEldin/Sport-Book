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
          experienceYears: 9,
          certifications: JSON.stringify(['ITF Level 2', 'PTR Certified']),
          specialties: JSON.stringify(['Match Strategy', 'Serve Technique', 'Mental Game']),
          sessionRate: 180,
          commissionRate: 20,
          sportId: tennis.id,
          isActive: true,
          isVerified: true,
          services: {
            create: [
              { name: 'Private Session (1 hour)', duration: 60, price: 180 },
              { name: 'Private Session (2 hours)', duration: 120, price: 320 },
              { name: 'Group Session (3-4 players)', duration: 90, price: 120 },
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
    include: { coachProfile: { include: { services: true } } }
  })

  const coach = coachUser.coachProfile!

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
          experienceYears: 6,
          sessionRate: 150,
          sportId: padel.id,
          isActive: true,
          isVerified: true,
          services: {
            create: [
              { name: 'Padel Private Session', duration: 60, price: 150 },
              { name: 'Padel Doubles Training', duration: 90, price: 200 },
            ]
          }
        }
      }
    }
  })

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
          experienceYears: 11,
          sessionRate: 200,
          sportId: squash.id,
          isActive: true,
          isVerified: true,
          services: {
            create: [
              { name: 'Squash Private Session', duration: 60, price: 200 },
              { name: 'Fitness for Squash', duration: 60, price: 180 },
            ]
          }
        }
      }
    }
  })

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
