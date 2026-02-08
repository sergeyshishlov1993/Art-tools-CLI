import type { CategoryResponse, Category } from './types/Category'
import { useApiClient } from '~/models/common/composables/useApiClient'

export function useCategoryAPI() {
  const api = useApiClient({ module: '/category' })

  return {
    getActive: () => api.get<CategoryResponse>('/active'),
    getAll: () => api.get<CategoryResponse>(''),
    getBySlug: (slug: string) => api.get<{ category: Category }>(`/${slug}`)
  }
}
