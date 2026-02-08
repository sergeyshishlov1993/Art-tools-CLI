import { useApiClient } from '~/models/common/composables/useApiClient'

export interface Feedback {
  id: number
  name: string
  phone: string
  message?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface FeedbackResponse {
  message: string
  feedback: Feedback[]
  totalItems: number
  totalPages: number
  currentPage: number
}

export function useFeedbackAdminAPI() {
  const api = useApiClient({ module: 'admin/feedback' })

  return {
    getAll: (page = 1, limit = 10) =>
      api.get<FeedbackResponse>(`/all?page=${page}&limit=${limit}`),

    changeStatus: (id: number) =>
      api.put<{ message: string }>(`/change-status/${id}`, {}),

    delete: (id: number) =>
      api.delete<{ message: string }>(`/delete/${id}`),

    countNew: () =>
      api.get<{ count: number }>('/count-new')
  }
}
