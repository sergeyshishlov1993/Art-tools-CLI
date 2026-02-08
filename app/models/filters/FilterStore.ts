import { useFilterAPI } from './FilterAPI'
import type { Filters, FilterParams, AppliedFilters } from './types/Filter'

export const useFilterStore = defineStore('filter', () => {
  const api = useFilterAPI()

  const filters = ref<Filters | null>(null)
  const totalProducts = ref(0)
  const appliedFilters = ref<AppliedFilters | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selected = ref<FilterParams>({})

  function removeKey(key: string) {
    const { [key]: _, ...rest } = selected.value
    selected.value = rest
  }

  async function fetchFilters(params: FilterParams) {
    loading.value = true
    error.value = null

    try {
      const data = await api.getFilters(params)
      filters.value = data.filters
      totalProducts.value = data.total_products
      appliedFilters.value = data.applied_filters
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  function setFilter(key: string, value: string | string[] | number | undefined) {
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      removeKey(key)
    } else {
      selected.value = { ...selected.value, [key]: value }
    }
  }

  function toggleArrayFilter(key: string, value: string) {
    const current = selected.value[key]

    if (Array.isArray(current)) {
      const index = current.indexOf(value)
      if (index > -1) {
        const newArray = current.filter((_, i) => i !== index)
        if (newArray.length === 0) {
          removeKey(key)
        } else {
          selected.value = { ...selected.value, [key]: newArray }
        }
      } else {
        selected.value = { ...selected.value, [key]: [...current, value] }
      }
    } else if (current === value) {
      removeKey(key)
    } else if (current) {
      selected.value = { ...selected.value, [key]: [current as string, value] }
    } else {
      selected.value = { ...selected.value, [key]: [value] }
    }
  }

  function resetFilters() {
    selected.value = {}
  }

  function resetFilter(key: string) {
    removeKey(key)
  }

  const hasActiveFilters = computed(() => {
    return Object.keys(selected.value).some(key =>
      !['category', 'sub_category'].includes(key)
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    Object.entries(selected.value).forEach(([key, value]) => {
      if (['category', 'sub_category'].includes(key)) return
      if (Array.isArray(value)) {
        count += value.length
      } else if (value !== undefined) {
        count += 1
      }
    })
    return count
  })

  const availableBrands = computed(() => {
    return filters.value?.brands.filter(b => b.count > 0) || []
  })

  const availableAttributes = computed(() => {
    return filters.value?.attributes
      .map(attr => ({
        ...attr,
        values: attr.values.filter(v => v.count > 0)
      }))
      .filter(attr => attr.values.length > 0) || []
  })

  return {
    filters,
    totalProducts,
    appliedFilters,
    loading,
    error,
    selected,

    fetchFilters,
    setFilter,
    toggleArrayFilter,
    resetFilters,
    resetFilter,

    hasActiveFilters,
    activeFiltersCount,
    availableBrands,
    availableAttributes
  }
})
