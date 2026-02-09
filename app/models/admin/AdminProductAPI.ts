import { useApiClient } from '~/models/common/composables/useApiClient'

export interface ProductParameter {
  id?: number
  parameter_name: string
  parameter_value: string
  slug?: string
}

export interface AdminProduct {
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
  custom_product: boolean
  product_description?: string
  createdAt: string
  updatedAt: string
  pictures: { id?: string; pictures_name: string }[]
  params?: ProductParameter[]
  subCategory?: {
    sub_category_id: string
    sub_category_name: string
    category?: { id: string; category_name: string }
  }
}

export interface AdminProductsResponse {
  products: AdminProduct[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface AdminProductFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  sub_category?: string
  brand?: string
  sale?: string
  bestseller?: string
  available?: string
  sort?: string
  price_min?: number
  price_max?: number
}

export interface CreateProductData {
  product_name: string
  brand?: string
  price: string
  sale_price?: string
  discount?: number
  available?: string
  bestseller?: string
  sale?: string
  sub_category_id: string
  product_description?: string
  pictures?: string[]
  parameters?: { name: string; value: string }[]
}

export interface UpdateProductData {
  product_name?: string
  brand?: string
  price?: string
  sale_price?: string
  discount?: number
  available?: string
  bestseller?: string
  sale?: string
  sub_category_id?: string
  product_description?: string
  parameters?: { name: string; value: string }[]
}

export function useAdminProductAPI() {
  const api = useApiClient({ module: 'admin/products' })

  return {
    getProducts: (filters: AdminProductFilters = {}) => {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        }
      })

      return api.get<AdminProductsResponse>(`?${params.toString()}`)
    },

    getProduct: (id: string) =>
      api.get<{ product: AdminProduct }>(`/${id}`),

    createProduct: (data: CreateProductData) =>
      api.post<{ product: AdminProduct; message: string }>('', data),

    updateProduct: (id: string, data: UpdateProductData) =>
      api.put<{ product: AdminProduct; message: string }>(`/${id}`, data),

    deleteProduct: (id: string) =>
      api.delete<{ message: string }>(`/${id}`),

    updateDiscount: (id: string, discount: number, sale_price: string) =>
      api.put<{ product: AdminProduct; message: string }>(`/${id}/discount`, { discount, sale_price }),

    addPictures: (id: string, pictures: string[]) =>
      api.post<{ message: string }>(`/${id}/pictures`, { pictures }),

    deletePicture: (id: string, pictureId: string) =>
      api.delete<{ message: string }>(`/${id}/pictures/${pictureId}`)
  }
}
