import { useCategoryAPI } from './CategoryAPI'
import type { Category, SubCategory } from './types/Category'
import { getCategoryIcon } from './constants/categoryIcons'
import { categoryOrder } from './constants/categoryOrder'

export const useCategoryStore = defineStore('category', () => {
  const api = useCategoryAPI()

  const categories = ref<Category[]>([])
  const subcategories = ref<SubCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function fetchActive() {
    if (loaded.value) return

    loading.value = true
    error.value = null
    try {
      const data = await api.getActive()
      categories.value = data.categories || []
      subcategories.value = data.subcategories || []
      loaded.value = true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  const categoriesWithIcons = computed(() => {
    const sorted = [...categories.value].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.id)
      const indexB = categoryOrder.indexOf(b.id)
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })

    return sorted.map(cat => ({
      ...cat,
      icon: getCategoryIcon(cat.id)
    }))
  })

  function getSubcategories(categoryId: string) {
    return subcategories.value.filter(sub => sub.category_id === categoryId)
  }

  function invalidate() {
    loaded.value = false
  }

  return {
    categories,
    subcategories,
    categoriesWithIcons,
    loading,
    error,
    loaded,
    fetchActive,
    getSubcategories,
    invalidate
  }
})
