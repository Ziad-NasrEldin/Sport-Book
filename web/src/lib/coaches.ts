export type Coach = {
  slug: string
  name: string
  experienceYears: number
  sport: string
  bio: string
  image: string
  sessionRate: string
}

export const coaches: Coach[] = [
  {
    slug: 'omar-hassan',
    name: 'Omar Hassan',
    experienceYears: 9,
    sport: 'Tennis',
    bio: 'Match strategy and serve consistency specialist for intermediate and advanced players.',
    image:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80',
    sessionRate: '180 EGP / hr',
  },
  {
    slug: 'lina-farouk',
    name: 'Lina Farouk',
    experienceYears: 6,
    sport: 'Padel',
    bio: 'Footwork-first coaching with doubles positioning systems and fast transition drills.',
    image:
      'https://images.unsplash.com/photo-1600132806608-231446b2e7af?auto=format&fit=crop&w=1200&q=80',
    sessionRate: '150 EGP / hr',
  },
  {
    slug: 'youssef-adel',
    name: 'Youssef Adel',
    experienceYears: 11,
    sport: 'Squash',
    bio: 'Conditioning and rally-intensity coach focused on movement efficiency and endurance.',
    image:
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1200&q=80',
    sessionRate: '200 EGP / hr',
  },
]
