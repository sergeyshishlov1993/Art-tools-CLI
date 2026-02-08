export interface ProductPicture {
  id: string
  product_id: string
  pictures_name: string
}

export interface ProductParameter {
  id: number
  product_id: string
  parameter_name: string
  parameter_value: string
  slug: string
  param_value_slug: string
}

export interface CategoryInfo {
  id: string
  category_name: string
  icon?: string
}

export interface SubCategoryInfo {
  sub_category_id: string
  sub_category_name: string
  parent_id: string
  pictures?: string | null
  category?: CategoryInfo
}

export interface ProductFull {
  product_id: string
  xml_id?: string
  supplier_prefix?: string
  slug: string
  product_name: string
  product_description?: string
  brand: string
  price: string
  sale_price: string
  discount: number
  available: string
  bestseller: string
  sale: string
  sub_category_id: string
  custom_product?: boolean
  is_manual_category?: boolean
  pictures: ProductPicture[]
  params: ProductParameter[]
  subCategory?: SubCategoryInfo
}

export interface Product {
  product_id: string
  slug: string
  product_name: string
  brand: string
  price: string
  sale_price: string
  discount: number
  available: string
  bestseller: string
  sale: string
  sub_category_id: string
  pictures: ProductPicture[]
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ProductResponse {
  product: ProductFull
}

export interface ProductCardData {
  id: string
  code: string
  name: string
  price: number
  oldPrice?: number
  image: string
  to: string
  isPromo?: boolean
  isHit?: boolean
  rating?: number
  reviewsCount?: number
}
