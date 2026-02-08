export interface FilterCategory {
  slug: string
  name: string
  count: number
}

export interface FilterBrand {
  name: string
  count: number
  min_price: number
  max_price: number
}

export interface FilterAttributeValue {
  slug: string
  name: string
  count: number
}

export interface SubCategoryFilter {
  slug: string
  name: string
  count: number
  parent_slug?: string
}

export interface FilterAttribute {
  slug: string
  name: string
  values: FilterAttributeValue[]
}

export interface FilterPrice {
  min: number
  max: number
}

export interface FilterSpecial {
  sale: number
  bestseller: number
  with_discount: number
}

export interface Filters {
  categories?: FilterCategory[]
  subcategories?: SubCategoryFilter[]
  brands: FilterBrand[]
  price: FilterPrice
  attributes: FilterAttribute[]
  special: FilterSpecial
}

export interface AppliedFilters {
  brand: string[] | null
  category: string | null
  sub_category: string[] | null
  price_min: number | null
  price_max: number | null
  attributes: Record<string, string> | null
}

export interface FiltersResponse {
  success: boolean
  total_products: number
  applied_filters: AppliedFilters
  filters: Filters
}

export interface FilterParams {
  category?: string
  sub_category?: string | string[]
  brand?: string | string[]
  price_min?: number
  price_max?: number
  [key: string]: string | string[] | number | undefined
}
