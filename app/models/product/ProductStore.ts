import { defineStore } from 'pinia'
import { useProductAPI } from './ProductAPI'
import type { ProductFull, Product, ProductCardData } from './types/Product'

export const useProductStore = defineStore('product', () => {
  const api = useProductAPI()

  const currentProduct = ref<ProductFull | null>(null)
  const relatedProducts = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const finalPrice = computed(() => {
    if (!currentProduct.value) return 0

    const price = parseFloat(currentProduct.value.price) || 0
    const salePrice = parseFloat(currentProduct.value.sale_price) || 0

    if (currentProduct.value.discount > 0 && salePrice > 0 && salePrice < price) {
      return salePrice
    }

    return price
  })

  const oldPrice = computed(() => {
    if (!currentProduct.value) return null

    const price = parseFloat(currentProduct.value.price) || 0
    const salePrice = parseFloat(currentProduct.value.sale_price) || 0

    if (currentProduct.value.discount > 0 && salePrice > 0 && salePrice < price) {
      return price
    }

    return null
  })

  const discountPercent = computed(() => {
    return currentProduct.value?.discount || 0
  })

  const isAvailable = computed(() => {
    return currentProduct.value?.available === 'true'
  })

  const isBestseller = computed(() => {
    return currentProduct.value?.bestseller === 'true'
  })

  const isSale = computed(() => {
    return currentProduct.value?.sale === 'true'
  })

  const mainImage = computed(() => {
    return currentProduct.value?.pictures?.[0]?.pictures_name || '/images/no-image.png'
  })

  const images = computed(() => {
    return currentProduct.value?.pictures?.map(p => p.pictures_name) || []
  })

  const groupedParams = computed(() => {
    if (!currentProduct.value?.params || currentProduct.value.params.length === 0) {
      return []
    }

    const groups: Record<string, { name: string; values: string[] }> = {}

    currentProduct.value.params.forEach(param => {
      const key = param.slug
      const name = param.parameter_name
      const value = param.parameter_value

      if (!groups[key]) {
        groups[key] = { name, values: [] }
      }

      if (value && !groups[key].values.includes(value)) {
        groups[key].values.push(value)
      }
    })

    return Object.values(groups)
  })

  const breadcrumbs = computed(() => {
    const crumbs: { label: string; to?: string }[] = [
      { label: 'Головна', to: '/' }
    ]

    if (currentProduct.value?.subCategory) {
      const sub = currentProduct.value.subCategory

      if (sub.category) {
        crumbs.push({
          label: sub.category.category_name,
          to: `/catalog/${sub.category.id}`
        })
      }

      crumbs.push({
        label: sub.sub_category_name,
        to: `/catalog/${sub.category?.id}/${sub.sub_category_id}`
      })
    }

    if (currentProduct.value) {
      crumbs.push({ label: currentProduct.value.product_name })
    }

    return crumbs
  })

  const description = computed(() => {
    const desc = currentProduct.value?.product_description
    if (!desc || desc.trim() === '' || desc.trim() === '\n') {
      return null
    }
    return desc
  })

  const cartItemData = computed(() => {
    if (!currentProduct.value) return null

    return {
      id: currentProduct.value.product_id,
      slug: currentProduct.value.slug,
      name: currentProduct.value.product_name,
      price: finalPrice.value,
      oldPrice: oldPrice.value || undefined,
      image: mainImage.value,
      code: currentProduct.value.product_id
    }
  })

  // === Дані для картки (для збереження в переглянуті) ===
  const currentProductCardData = computed((): ProductCardData | null => {
    if (!currentProduct.value) return null

    return {
      id: currentProduct.value.product_id,
      code: currentProduct.value.product_id,
      name: currentProduct.value.product_name,
      price: finalPrice.value,
      oldPrice: oldPrice.value || undefined,
      image: mainImage.value,
      to: `/product/${currentProduct.value.slug}`,
      isPromo: isSale.value,
      isHit: isBestseller.value
    }
  })

  function transformToCard(product: Product): ProductCardData {
    const price = parseFloat(product.price) || 0
    const salePrice = parseFloat(product.sale_price) || 0
    const hasValidDiscount = product.discount > 0 && salePrice > 0 && salePrice < price

    return {
      id: product.product_id,
      code: product.product_id,
      name: product.product_name,
      price: hasValidDiscount ? salePrice : price,
      oldPrice: hasValidDiscount ? price : undefined,
      image: product.pictures[0]?.pictures_name || '/images/no-image.png',
      to: `/product/${product.slug}`,
      isPromo: product.sale === 'true',
      isHit: product.bestseller === 'true',
    }
  }

  function transformManyToCards(products: Product[]): ProductCardData[] {
    return products.map(transformToCard)
  }

  async function fetchProduct(slug: string) {
    loading.value = true
    error.value = null

    try {
      const data = await api.getProductBySlug(slug)
      currentProduct.value = data.product

      if (data.product.sub_category_id) {
        await fetchRelated(data.product.sub_category_id, data.product.product_id)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка завантаження товару'
      currentProduct.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchRelated(subCategoryId: string, excludeId: string) {
    try {
      const data = await api.getProducts({
        sub_category: subCategoryId,
        limit: 12
      })

      relatedProducts.value = data.products
        .filter(p => p.product_id !== excludeId)
        .slice(0, 10)
    } catch (e) {
      console.error('Failed to load related products:', e)
      relatedProducts.value = []
    }
  }

  function clearProduct() {
    currentProduct.value = null
    relatedProducts.value = []
    error.value = null
  }

  const relatedProductCards = computed(() =>
    transformManyToCards(relatedProducts.value)
  )

  return {
    currentProduct,
    relatedProducts,
    loading,
    error,
    finalPrice,
    oldPrice,
    discountPercent,
    isAvailable,
    isBestseller,
    isSale,
    mainImage,
    images,
    groupedParams,
    breadcrumbs,
    description,
    cartItemData,
    currentProductCardData,
    relatedProductCards,
    transformToCard,
    transformManyToCards,
    fetchProduct,
    clearProduct
  }
})
