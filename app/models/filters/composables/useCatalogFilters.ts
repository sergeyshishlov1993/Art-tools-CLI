import type { Filters } from '~/models/filters/types/Filter'

interface FilterState {
  category: Ref<string>
  subcategories: Ref<string[]>
  brands: Ref<string[]>
  params: Ref<Record<string, string[]>>
  special: Ref<{ sale: boolean; bestseller: boolean; discount: boolean }>
  price: Ref<{ min: number | null; max: number | null }>
  page: Ref<number>
  sort: Ref<string>
}

interface UseCatalogFiltersOptions {
  syncUrl?: boolean
  preserveQueryKeys?: string[]
  categoryFromRoute?: boolean
}

export function useCatalogFilters(options: UseCatalogFiltersOptions = {}) {
  const { syncUrl = true, preserveQueryKeys = [], categoryFromRoute = false } = options

  const route = useRoute()
  const router = useRouter()

  const state: FilterState = {
    category: ref(''),
    subcategories: ref([]),
    brands: ref([]),
    params: ref({}),
    special: ref({ sale: false, bestseller: false, discount: false }),
    price: ref({ min: null, max: null }),
    page: ref(1),
    sort: ref('popular'),
  }

  const hasActiveFilters = computed(() => {
    return (
      state.category.value !== '' ||
            state.subcategories.value.length > 0 ||
            state.brands.value.length > 0 ||
            Object.keys(state.params.value).length > 0 ||
            state.special.value.sale ||
            state.special.value.bestseller ||
            state.special.value.discount ||
            state.price.value.min !== null ||
            state.price.value.max !== null
    )
  })

  function buildParams(): Record<string, any> {
    const params: Record<string, any> = {}

    if (state.category.value) params.category = state.category.value
    if (state.subcategories.value.length > 0) {
      params.sub_category = state.subcategories.value.join(',')
    }
    if (state.brands.value.length > 0) {
      params.brand = state.brands.value.join(',')
    }
    if (state.price.value.min !== null) params.price_min = state.price.value.min
    if (state.price.value.max !== null) params.price_max = state.price.value.max
    if (state.special.value.sale) params.sale = 'true'
    if (state.special.value.bestseller) params.bestseller = 'true'
    if (state.special.value.discount) params.with_discount = 'true'

    Object.entries(state.params.value).forEach(([key, values]) => {
      if (values.length > 0) params[key] = values.join(',')
    })

    return params
  }

  function syncToUrl() {
    if (!syncUrl) return

    const query: Record<string, string> = {}

    preserveQueryKeys.forEach((key) => {
      if (route.query[key]) query[key] = String(route.query[key])
    })

    if (state.category.value && !categoryFromRoute) {
      query.category = state.category.value
    }
    if (state.subcategories.value.length > 0) {
      query.sub_category = state.subcategories.value.join(',')
    }
    if (state.brands.value.length > 0) {
      query.brand = state.brands.value.join(',')
    }
    if (state.price.value.min !== null) {
      query.price_min = String(state.price.value.min)
    }
    if (state.price.value.max !== null) {
      query.price_max = String(state.price.value.max)
    }
    if (state.special.value.discount) query.discount = 'true'

    Object.entries(state.params.value).forEach(([key, values]) => {
      if (values.length > 0) query[key] = values.join(',')
    })

    if (state.page.value > 1) query.page = String(state.page.value)
    if (state.sort.value !== 'popular') query.sort = state.sort.value

    router.replace({ query })
  }

  function readFromUrl() {
    const query = route.query

    if (query.category && !categoryFromRoute) {
      state.category.value = String(query.category)
    }
    if (query.sub_category) {
      state.subcategories.value = String(query.sub_category).split(',')
    }
    if (query.brand) {
      state.brands.value = String(query.brand).split(',')
    }
    if (query.price_min) {
      state.price.value.min = Number(query.price_min)
    }
    if (query.price_max) {
      state.price.value.max = Number(query.price_max)
    }

    state.special.value.sale = query.sale === 'true' || query.sale === '1'
    state.special.value.bestseller = query.bestseller === 'true' || query.bestseller === '1'
    state.special.value.discount = query.discount === 'true' || query.discount === '1'

    if (query.page) state.page.value = Number(query.page)
    if (query.sort) state.sort.value = String(query.sort)

    const reservedKeys = [
      'category', 'sub_category', 'brand', 'price_min', 'price_max',
      'sale', 'bestseller', 'discount', 'page', 'sort'
    ]
    Object.entries(query).forEach(([key, value]) => {
      if (!reservedKeys.includes(key) && value) {
        state.params.value[key] = String(value).split(',')
      }
    })
  }

  function clearFilters(redirectPath?: string) {
    state.category.value = ''
    state.subcategories.value = []
    state.brands.value = []
    state.params.value = {}
    state.special.value = { sale: false, bestseller: false, discount: false }
    state.price.value = { min: null, max: null }
    state.page.value = 1

    if (redirectPath) {
      router.push({ path: redirectPath })
    }
  }

  function selectCategory(slug: string) {
    state.category.value = state.category.value === slug ? '' : slug
    state.subcategories.value = []
    state.page.value = 1
  }

  return {
    ...state,
    hasActiveFilters,
    buildParams,
    syncToUrl,
    readFromUrl,
    clearFilters,
    selectCategory,
  }
}