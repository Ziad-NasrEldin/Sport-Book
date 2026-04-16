export type StoreProduct = {
  id: string
  title: string
  category: string
  price: number
  facility: string
  location: string
  status: 'In Stock' | 'Low Stock'
  image: string
  description: string
}

export const storeProducts: StoreProduct[] = [
  {
    id: 'prd-tns-01',
    title: 'Pro Spin 98 Tennis Racket',
    category: 'Tennis Rackets',
    price: 4200,
    facility: 'The Regent Park Store',
    location: 'London NW1',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=1200&q=80',
    description:
      'Competition-ready tennis racket with excellent control and spin generation for advanced rally play.',
  },
  {
    id: 'prd-pdl-02',
    title: 'Control X Padel Racket',
    category: 'Padel Rackets',
    price: 3100,
    facility: 'Elite Padel Club Shop',
    location: 'Chelsea, London',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
    description:
      'Balanced padel racket tuned for control shots, easy handling, and comfort across long match sessions.',
  },
  {
    id: 'prd-bal-03',
    title: 'Tournament Tennis Balls (3-Pack)',
    category: 'Balls',
    price: 260,
    facility: 'Downtown Tennis Club',
    location: 'Shoreditch',
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1617083934551-59e3ab0967e5?auto=format&fit=crop&w=1200&q=80',
    description:
      'Pressurized all-court balls offering reliable bounce and durable felt for training or match use.',
  },
  {
    id: 'prd-grp-04',
    title: 'Dry Feel Overgrip Set',
    category: 'Grips',
    price: 140,
    facility: 'Center Court Supply',
    location: 'Canary Wharf',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80',
    description:
      'Sweat-resistant overgrips with tacky finish to keep racket handling secure in intense summer play.',
  },
  {
    id: 'prd-bag-05',
    title: 'Tour Duffle Racket Bag',
    category: 'Bags',
    price: 960,
    facility: 'Queen Club Pro Shop',
    location: 'West Kensington',
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1579493933702-5ed6e6f95b16?auto=format&fit=crop&w=1200&q=80',
    description:
      'Multi-compartment duffle with reinforced straps designed for rackets, shoes, and match-day essentials.',
  },
  {
    id: 'prd-pdl-06',
    title: 'Padel Match Balls (Tube)',
    category: 'Balls',
    price: 220,
    facility: 'The Padel Hub Store',
    location: 'Hackney',
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
    description:
      'Fast-response padel balls with tournament-grade consistency for club sessions and competitive rounds.',
  },
]