export type CourtSport = 'Tennis' | 'Padel' | 'Football'

export type Court = {
  id: string
  status: 'AVAILABLE' | 'BUSY'
  statusTone: 'primary' | 'danger'
  rating: number
  sportLabel: string
  title: string
  price: number
  distance: number
  location: string
  sport: CourtSport
  image: string
}

export const courtSports: CourtSport[] = ['Tennis', 'Padel', 'Football']

export const courts: Court[] = [
  {
    id: 'crt-001',
    status: 'AVAILABLE',
    statusTone: 'primary',
    rating: 4.8,
    sportLabel: 'TENNIS • HARD COURT',
    title: "The Regent's Park",
    price: 500,
    distance: 1.2,
    location: 'London, UK',
    sport: 'Tennis',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'crt-002',
    status: 'BUSY',
    statusTone: 'danger',
    rating: 4.9,
    sportLabel: 'PADEL • CLAY',
    title: "Queen's Club",
    price: 850,
    distance: 3.5,
    location: 'West Kensington',
    sport: 'Padel',
    image: 'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'crt-003',
    status: 'AVAILABLE',
    statusTone: 'primary',
    rating: 4.6,
    sportLabel: 'PADEL • INDOOR',
    title: 'The Padel Hub',
    price: 600,
    distance: 0.8,
    location: 'Shoreditch',
    sport: 'Padel',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'crt-004',
    status: 'AVAILABLE',
    statusTone: 'primary',
    rating: 4.7,
    sportLabel: 'FOOTBALL • TURF',
    title: 'Kings Arena',
    price: 950,
    distance: 4.2,
    location: 'Canary Wharf',
    sport: 'Football',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  },
]
