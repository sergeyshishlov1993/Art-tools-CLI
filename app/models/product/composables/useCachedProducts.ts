import { useProductAPI } from '~/models/product/ProductAPI'
import { useProductStore } from '~/models/product/ProductStore'
import type { Product } from '~/models/product/types/Product'

interface ProductsCache {
  products: Product[]
  total: number
  pages: number
  timestamp: number
}

const productsCache = new Map<string, ProductsCache>()
const CACHE_TTL = 2 * 60 * 1000

export function useCachedProducts() {
  const productAPI = useProductAPI()
  const productStore = useProductStore()

  const products = ref<Product[]>([])
  const transformedProducts = computed(() => productStore.transformManyToCards(products.value))
  const loading = ref(false)
  const initialLoading = ref(true)
  const error = ref<string | null>(null)
  const total = ref(0)
  const pages = ref(0)

  function getCacheKey(params: Record<string, any>): string {
    return JSON.stringify(params)
  }

  async function loadProducts(params: Record<string, any>, useCache = true) {
    const cacheKey = getCacheKey(params)

    if (useCache) {
      const cached = productsCache.get(cacheKey)
      const now = Date.now()

      if (cached && now - cached.timestamp < CACHE_TTL) {
        products.value = cached.products
        total.value = cached.total
        pages.value = cached.pages
        initialLoading.value = false
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const data = await productAPI.getProducts(params)
      products.value = data.products
      total.value = data.pagination.total
      pages.value = data.pagination.pages

      productsCache.set(cacheKey, {
        products: data.products,
        total: data.pagination.total,
        pages: data.pagination.pages,
        timestamp: Date.now(),
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load products'
      console.error('Failed to load products:', e)
    } finally {
      loading.value = false
      initialLoading.value = false
    }
  }

  function findProductById(productId: string): Product | undefined {
    return products.value.find((p) => p.product_id === productId)
  }

  function reset() {
    products.value = []
    total.value = 0
    pages.value = 0
    error.value = null
    loading.value = false
    initialLoading.value = true
  }

  return {
    products,
    transformedProducts,
    loading,
    initialLoading,
    error,
    total,
    pages,
    loadProducts,
    findProductById,
    reset,
  }
}

export function clearProductsCache() {
  productsCache.clear()
}
