import type { ProductsResponse, ProductResponse } from './types/Product'

export const useProductAPI = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase

  async function getProducts(params: Record<string, any>): Promise<ProductsResponse> {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value))
      }
    })

    const url = `${baseUrl}products?${query.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    return response.json()
  }

  async function getProductBySlug(slug: string): Promise<ProductResponse> {
    const url = `${baseUrl}/products/${slug}`
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Товар не знайдено')
      }
      throw new Error(`Failed to fetch product: ${response.status}`)
    }

    return response.json()
  }

  return { getProducts, getProductBySlug }
}
