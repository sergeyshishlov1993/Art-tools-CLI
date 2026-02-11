export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  CART: '/cart',
  SEARCH: '/search',
  CONTACTS: '/contacts',


  CATALOG_SALE: '/catalog?sale=true',
  CATALOG_BESTSELLER: '/catalog?bestseller=true',

  // Динамічні
  category: (categoryId: string) => `/catalog/${categoryId}`,
  subcategory: (categoryId: string, subcategoryId: string) => `/catalog/${categoryId}/${subcategoryId}`,
  product: (slug: string) => `/product/${slug}`,
} as const

// Адмін роути
export const ADMIN_ROUTES = {
  ORDERS: '/admin/orders',
  PRODUCTS: '/admin/products',
  IMPORT: '/admin/import',
  FEEDBACK: '/admin/feedback',

  productEdit: (id: string) => `/admin/products/${id}`,
} as const

// Навігація для хедера (desktop)
export const NAV_ITEMS = [
  {
    label: 'АКЦІЇ',
    to: '/catalog?sale=true',
    icon: 'heroicons-fire',
    highlight: true
  },
  {
    label: 'ХІТ ПРОДАЖУ',
    to: '/catalog?bestseller=true',
    icon: 'heroicons-star',
    highlight: false
  },
  {
    label: 'КАТАЛОГ',
    to: '/catalog',
    icon: 'heroicons-squares-2x2',
    highlight: false
  },
] as const

// Мобільна навігація
export const MOBILE_NAV_ITEMS = [
  { label: 'Головна', to: '/', icon: 'heroicons-home', highlight: false },
  { label: 'АКЦІЇ', to: '/catalog?sale=true', icon: 'heroicons-fire', highlight: true },
  { label: 'ХІТ ПРОДАЖУ', to: '/catalog?bestseller=true', icon: 'heroicons-star', highlight: false },
  { label: 'КАТАЛОГ', to: '/catalog', icon: 'heroicons-squares-2x2', highlight: false },
  { label: 'КОШИК', to: '/cart', icon: 'heroicons-shopping-cart', highlight: false },
] as const

// Швидкі посилання для сторінки контактів
export const QUICK_LINKS = [
  {
    name: 'Каталог',
    icon: 'heroicons-squares-2x2',
    to: '/catalog',
    color: 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300',
    iconBg: 'bg-green-500',
  },
  {
    name: 'Акції',
    icon: 'heroicons-fire',
    to: '/catalog?sale=true',
    color: 'bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300',
    iconBg: 'bg-red-500',
  },
  {
    name: 'Хіти продажів',
    icon: 'heroicons-star',
    to: '/catalog?bestseller=true',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-300',
    iconBg: 'bg-orange-500',
  },
] as const
