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

export interface CreateFeedbackData {
  name: string
  phone: string
}

export function useFeedbackAPI() {
  const api = useApiClient({ module: 'feedback' })

  return {
    create: (data: CreateFeedbackData) =>
      api.post<{ message: string }>('/', data),

    getAll: (page = 1, limit = 10) =>
      api.get<FeedbackResponse>(`/all?page=${page}&limit=${limit}`),

    changeStatus: (id: number) =>
      api.put<{ message: string }>(`/change-status/${id}`, {}),

    delete: (id: number) =>
      api.delete<{ message: string }>(`/delete/${id}`)
  }
}
