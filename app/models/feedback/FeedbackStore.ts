import { defineStore } from 'pinia'
import { useFeedbackAPI, type CreateFeedbackData } from './FeedbackApi'
import { useFeedbackAdminAPI, type Feedback } from './FeedbackAdminApi'

export const useFeedbackStore = defineStore('feedback', () => {
  const toast = useToast()
  const publicApi = useFeedbackAPI()
  const adminApi = useFeedbackAdminAPI()
  const feedbackList = ref<Feedback[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const newCount = ref(0)

  async function createFeedback(data: CreateFeedbackData): Promise<boolean> {
    submitting.value = true

    try {
      await publicApi.create(data)

      toast.add({
        title: 'Дякуємо за заявку!',
        description: 'Ми зателефонуємо вам найближчим часом',
        color: 'success',
        icon: 'heroicons-check-circle'
      })

      return true
    } catch (e) {
      console.error('Create feedback error:', e)

      toast.add({
        title: 'Помилка',
        description: 'Не вдалося надіслати заявку. Спробуйте ще раз.',
        color: 'error',
        icon: 'heroicons-x-circle'
      })

      return false
    } finally {
      submitting.value = false
    }
  }

  // Завантажити список (адмін)
  async function fetchFeedback(page = 1, limit = 10) {
    loading.value = true

    try {
      const res = await adminApi.getAll(page, limit)

      feedbackList.value = res.feedback
      totalPages.value = res.totalPages
      totalItems.value = res.totalItems
      currentPage.value = res.currentPage
    } catch (e) {
      console.error('Fetch feedback error:', e)

      toast.add({
        title: 'Помилка завантаження',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  async function fetchNewCount() {
    try {
      const res = await adminApi.countNew()
      newCount.value = res.count
    } catch (e) {
      console.error('Fetch count error:', e)
    }
  }

  async function markAsDone(id: number): Promise<boolean> {
    try {
      await adminApi.changeStatus(id)

      const item = feedbackList.value.find(f => f.id === id)
      if (item) {
        item.status = 'Виконано'
      }

      newCount.value = Math.max(0, newCount.value - 1)

      toast.add({
        title: 'Статус змінено',
        color: 'success'
      })

      return true
    } catch (e) {
      console.error('Change status error:', e)

      toast.add({
        title: 'Помилка',
        color: 'error'
      })

      return false
    }
  }

  async function deleteFeedback(id: number): Promise<boolean> {
    try {
      await adminApi.delete(id)

      feedbackList.value = feedbackList.value.filter(f => f.id !== id)
      totalItems.value--

      toast.add({
        title: 'Видалено',
        color: 'success'
      })

      return true
    } catch (e) {
      console.error('Delete feedback error:', e)

      toast.add({
        title: 'Помилка видалення',
        color: 'error'
      })

      return false
    }
  }

  async function goToPage(page: number) {
    await fetchFeedback(page)
  }

  function reset() {
    feedbackList.value = []
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
  }

  return {
    feedbackList,
    loading,
    submitting,
    currentPage,
    totalPages,
    totalItems,
    newCount,
    createFeedback,
    fetchFeedback,
    fetchNewCount,
    markAsDone,
    deleteFeedback,
    goToPage,
    reset
  }
})
