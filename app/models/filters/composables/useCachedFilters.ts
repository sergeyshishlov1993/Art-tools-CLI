import { useFilterAPI } from '~/models/filters/FilterAPI'
import type { Filters } from '~/models/filters/types/Filter'

const filtersCache = new Map<string, { data: Filters; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function useCachedFilters() {
  const filterAPI = useFilterAPI()

  const filters = ref<Filters | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getCacheKey(params: Record<string, any>): string {
    return JSON.stringify(params)
  }

  async function loadFilters(params: Record<string, any>) {
    const cacheKey = getCacheKey(params)
    const cached = filtersCache.get(cacheKey)
    const now = Date.now()

    if (cached && now - cached.timestamp < CACHE_TTL) {
      filters.value = cached.data
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await filterAPI.getFilters(params)
      filters.value = data.filters

      filtersCache.set(cacheKey, { data: data.filters, timestamp: now })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load filters'
      console.error('Failed to load filters:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    filters,
    loading,
    error,
    loadFilters,
  }
}

export function clearFiltersCache() {
  filtersCache.clear()
}