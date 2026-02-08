interface ApiClientOptions {
  module: string
}

type RequestBody = Record<string, unknown> | object
type RequestQuery = Record<string, string | number | boolean | undefined>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: RequestBody
  query?: RequestQuery
}

export function useApiClient(options: ApiClientOptions) {
  const config = useRuntimeConfig()
  const baseUrl = `${config.public.apiBase}${options.module}`

  async function request<T>(endpoint: string, requestOptions: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, query } = requestOptions

    return await $fetch<T>(`${baseUrl}${endpoint}`, {
      method,
      body,
      query
    })
  }

  return {
    get: <T>(endpoint: string, query?: RequestQuery) =>
      request<T>(endpoint, { method: 'GET', query }),

    post: <T, B extends RequestBody = RequestBody>(endpoint: string, body: B) =>
      request<T>(endpoint, { method: 'POST', body }),

    put: <T, B extends RequestBody = RequestBody>(endpoint: string, body: B) =>
      request<T>(endpoint, { method: 'PUT', body }),

    patch: <T, B extends RequestBody = RequestBody>(endpoint: string, body: B) =>
      request<T>(endpoint, { method: 'PATCH', body }),

    delete: <T>(endpoint: string) =>
      request<T>(endpoint, { method: 'DELETE' })
  }
}
