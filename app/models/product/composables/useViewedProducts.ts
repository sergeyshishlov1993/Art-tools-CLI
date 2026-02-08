import type { ProductCardData } from '../types/Product'

const STORAGE_KEY = 'viewed_products'
const MAX_VIEWED = 20

export function useViewedProducts() {
  const viewedProducts = useState<ProductCardData[]>('viewed-products', () => [])
  const isInitialized = ref(false)
  function loadFromStorage() {
    if (import.meta.server || isInitialized.value) return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        viewedProducts.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load viewed products:', e)
      viewedProducts.value = []
    }

    isInitialized.value = true
  }

  function saveToStorage() {
    if (import.meta.server) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedProducts.value))
    } catch (e) {
      console.error('Failed to save viewed products:', e)
    }
  }

  function addViewed(product: ProductCardData) {
    if (!product?.id) return

    const filtered = viewedProducts.value.filter(p => p.id !== product.id)
    viewedProducts.value = [product, ...filtered].slice(0, MAX_VIEWED)

    saveToStorage()
  }

  function removeViewed(productId: string) {
    viewedProducts.value = viewedProducts.value.filter(p => p.id !== productId)
    saveToStorage()
  }

  function clearViewed() {
    viewedProducts.value = []
    saveToStorage()
  }

  function getViewedExcept(currentId: string, limit = 10): ProductCardData[] {
    return viewedProducts.value
      .filter(p => p.id !== currentId)
      .slice(0, limit)
  }

  const viewedCount = computed(() => viewedProducts.value.length)
  const hasViewed = computed(() => viewedProducts.value.length > 0)

  onMounted(() => {
    loadFromStorage()
  })

  return {
    viewedProducts: computed(() => viewedProducts.value),
    viewedCount,
    hasViewed,
    addViewed,
    removeViewed,
    clearViewed,
    getViewedExcept,
    loadFromStorage
  }
}
