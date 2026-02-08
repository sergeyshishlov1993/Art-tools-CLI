export interface Category {
  id: string
  name: string
  icon?: string
  children?: SubCategory[]
}

export interface SubCategory {
  id: string
  name: string
  category_id: string
  products_count: number
  pictures?: string
}

export interface CategoryResponse {
  success: boolean
  categories: Category[]
  subcategories: SubCategory[]
}

export interface CategoryWithSubs extends Category {
  subcategories: SubCategory[]
}
