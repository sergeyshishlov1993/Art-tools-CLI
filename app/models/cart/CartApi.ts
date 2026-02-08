import { useApiClient } from '~/models/common/composables/useApiClient'
import type {
  OrderPayload,
  OrderResponse,
  QuickBuyPayload,
  QuickBuyResponse,
  CityApiResponse,
  WarehouseApiResponse
} from './types'

export function useCartAPI() {
  const orderApi = useApiClient({ module: 'order' })
  const npApi = useApiClient({ module: 'nova-poshta' })

  return {
    createOrder: (payload: OrderPayload) =>
      orderApi.post<OrderResponse>('/add-order', payload),

    quickBuy: (payload: QuickBuyPayload) =>
      orderApi.post<QuickBuyResponse>('/quick-buy', payload),

    searchCities: (query: string) =>
      npApi.post<CityApiResponse>('/citi', { city: query }),

    getWarehouses: (cityRef: string, query: string = '') =>
      npApi.post<WarehouseApiResponse>('/citi/warehouses', {
        city: cityRef,
        numberWarehouses: query
      })
  }
}
