import { defineStore } from 'pinia'
import {
  useAdminProductAPI,
  type AdminProduct,
  type AdminProductFilters,
  type CreateProductData,
  type UpdateProductData
} from './AdminProductAPI'

export const useAdminProductStore = defineStore('adminProduct', () => {
  const api = useAdminProductAPI()
  const products = ref<AdminProduct[]>([])
  const currentProduct = ref<AdminProduct | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const filters = ref<AdminProductFilters>({
    page: 1,
    limit: 20,
    search: '',
    category: '',
    sub_category: '',
    available: '',
    sale: '',
    bestseller: '',
    sort: 'newest'
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const res = await api.getProducts({ ...filters.value, page: pagination.value.page })
      products.value = res.products
      pagination.value = res.pagination
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка завантаження'
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(id: string) {
    loading.value = true
    error.value = null

    try {
      const res = await api.getProduct(id)
      currentProduct.value = res.product
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Товар не знайдено'
      currentProduct.value = null
    } finally {
      loading.value = false
    }
  }

  async function createProduct(data: CreateProductData): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      await api.createProduct(data)
      await fetchProducts()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка створення'
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateProduct(id: string, data: UpdateProductData): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      const res = await api.updateProduct(id, data)
      currentProduct.value = res.product

      const index = products.value.findIndex(p => p.product_id === id)
      if (index !== -1) {
        products.value[index] = res.product
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка оновлення'
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteProduct(id: string): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      await api.deleteProduct(id)
      products.value = products.value.filter(p => p.product_id !== id)
      pagination.value.total--
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка видалення'
      return false
    } finally {
      saving.value = false
    }
  }

  async function toggleBestseller(id: string): Promise<boolean> {
    const product = products.value.find(p => p.product_id === id)
    if (!product) return false

    const newValue = product.bestseller === 'true' ? 'false' : 'true'
    return updateProduct(id, { bestseller: newValue })
  }

  async function toggleSale(id: string): Promise<boolean> {
    const product = products.value.find(p => p.product_id === id)
    if (!product) return false

    const newValue = product.sale === 'true' ? 'false' : 'true'
    return updateProduct(id, { sale: newValue })
  }

  async function toggleAvailable(id: string): Promise<boolean> {
    const product = products.value.find(p => p.product_id === id)
    if (!product) return false

    const newValue = product.available === 'true' ? 'false' : 'true'
    return updateProduct(id, { available: newValue })
  }

  async function updateDiscount(id: string, discount: number, salePrice: string): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      const res = await api.updateDiscount(id, discount, salePrice)

      const index = products.value.findIndex(p => p.product_id === id)
      if (index !== -1) {
        products.value[index] = res.product
      }
      if (currentProduct.value?.product_id === id) {
        currentProduct.value = res.product
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка оновлення знижки'
      return false
    } finally {
      saving.value = false
    }
  }

  async function addPictures(id: string, urls: string[]): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      await api.addPictures(id, urls)
      await fetchProduct(id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка додавання фото'
      return false
    } finally {
      saving.value = false
    }
  }

  async function deletePicture(productId: string, pictureId: string): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      await api.deletePicture(productId, pictureId)

      if (currentProduct.value) {
        currentProduct.value.pictures = currentProduct.value.pictures.filter(p => p.id !== pictureId)
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка видалення фото'
      return false
    } finally {
      saving.value = false
    }
  }

  function setPage(page: number) {
    pagination.value.page = page
    fetchProducts()
  }

  function setFilters(newFilters: Partial<AdminProductFilters>) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
    fetchProducts()
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      search: '',
      category: '',
      sub_category: '',
      available: '',
      sale: '',
      bestseller: '',
      sort: 'newest'
    }
    pagination.value.page = 1
    fetchProducts()
  }

  function clearCurrent() {
    currentProduct.value = null
  }

  function updateProductInList(id: string, updates: Partial<AdminProduct>) {
    const index = products.value.findIndex(p => p.product_id === id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...updates } as AdminProduct
    }
  }

  async function setSale(id: string, discount: number, salePrice: string): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      await api.updateDiscount(id, discount, salePrice)
      await api.updateProduct(id, { sale: 'true' })

      updateProductInList(id, {
        sale: 'true',
        discount,
        sale_price: salePrice
      })

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка встановлення акції'
      return false
    } finally {
      saving.value = false
    }
  }

  async function removeSale(id: string): Promise<boolean> {
    saving.value = true
    error.value = null

    try {
      await api.updateProduct(id, {
        sale: 'false',
        discount: 0,
        sale_price: '0'
      })

      updateProductInList(id, {
        sale: 'false',
        discount: 0,
        sale_price: '0'
      })

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка зняття акції'
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    products,
    currentProduct,
    loading,
    saving,
    error,
    pagination,
    filters,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleBestseller,
    toggleSale,
    toggleAvailable,
    updateDiscount,
    addPictures,
    deletePicture,
    setPage,
    setFilters,
    resetFilters,
    clearCurrent,
    setSale,
    removeSale,
  }
})

