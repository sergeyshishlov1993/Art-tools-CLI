import { useProductAPI } from '~/models/product/ProductAPI'
import { useProductStore } from '~/models/product/ProductStore'
import type { Product, ProductCardData } from '~/models/product/types/Product'

interface ProductSection {
  products: Ref<ProductCardData[]>
  productsRaw: Ref<Product[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  load: () => Promise<void>
}

interface ProductSectionsReturn {
  sale: ProductSection
  popular: ProductSection
  new: ProductSection
  getAllRawProducts: () => Product[]
}

const sectionsCache = new Map<string, { data: Product[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function useProductSections(): ProductSectionsReturn {
  const productAPI = useProductAPI()
  const productStore = useProductStore()

  function createSection(
    key: string,
    params: Record<string, any>
  ): ProductSection {
    const products = ref<ProductCardData[]>([])
    const productsRaw = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function load() {
      const cached = sectionsCache.get(key)
      const now = Date.now()

      if (cached && now - cached.timestamp < CACHE_TTL) {
        productsRaw.value = cached.data
        products.value = productStore.transformManyToCards(cached.data)
        return
      }

      loading.value = true
      error.value = null

      try {
        const data = await productAPI.getProducts({ ...params, limit: 8 })
        productsRaw.value = data.products
        products.value = productStore.transformManyToCards(data.products)

        sectionsCache.set(key, { data: data.products, timestamp: now })
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to load products'
        console.error(`Failed to load ${key} products:`, e)
      } finally {
        loading.value = false
      }
    }

    return { products, productsRaw, loading, error, load }
  }

  const sale = createSection('sale', { sale: 'true' })
  const popular = createSection('popular', { bestseller: 'true' })
  const newProducts = createSection('new', { sort: 'new' })

  function getAllRawProducts(): Product[] {
    return [
      ...sale.productsRaw.value,
      ...popular.productsRaw.value,
      ...newProducts.productsRaw.value,
    ]
  }

  return {
    sale,
    popular,
    new: newProducts,
    getAllRawProducts,
  }
}

export function clearProductSectionsCache() {
  sectionsCache.clear()
}