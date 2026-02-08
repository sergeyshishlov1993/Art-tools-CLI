import type { FiltersResponse, FilterParams } from './types/Filter'

export const useFilterAPI = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase

  async function getFilters(params: FilterParams): Promise<FiltersResponse> {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return

      if (Array.isArray(value)) {
        query.set(key, value.join(','))
      } else {
        query.set(key, String(value))
      }
    })

    const url = `${baseUrl}/filters?${query.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch filters: ${response.status}`)
    }

    return response.json()
  }

  return { getFilters }
}
