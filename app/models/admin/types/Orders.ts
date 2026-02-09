export type OrderStatus =
    | 'new'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'refund'
    | 'returned'

export type OrderSource = 'direct' | 'google' | 'facebook' | 'tiktok' | 'instagram'

export type OrderType = 'cart' | 'quick-buy'

export interface OrderItem {
  item_id: string
  product_id: string
  order_name: string
  product_img?: string
  price: number
  old_price?: number
  count: number
  discount?: number
  discounted_product?: boolean
}
export interface Order {
  order_id: string
  order_number?: string
  name?: string
  second_name?: string
  phone: string
  city?: string
  postal_office?: string
  courier_delivery_address?: string
  payment_method?: string
  comment?: string
  status: OrderStatus
  source?: OrderSource
  order_type?: OrderType
  utm_source?: string
  total_price: number
  ttn?: string
  np_status?: string
  np_status_code?: string
  np_last_sync?: string
  items?: OrderItem[]
  createdAt: string
}

export interface StatGroup {
  count: number
  sum: number
}

export interface PeriodStats {
  total?: StatGroup
  pending?: StatGroup
  inProgress?: StatGroup
  completed?: StatGroup
  allRefunds?: StatGroup
  netProfit?: number
  conversionRate?: number
  cancelRate?: number
}

export interface Stats {
  period?: PeriodStats
  today?: { total: number; count: number }
  thisWeek?: { total: number; count: number }
  thisMonth?: { total: number; count: number }
  lastMonth?: { total: number; count: number }
  allTime?: { total: number; count: number }
}

export interface OrdersResponse {
  orders: Order[]
  totalItems: number
  totalPages: number
  currentPage: number
}

export interface TrackingStage {
  id: string
  title: string
  description?: string
  icon: string
  status: 'completed' | 'active' | 'pending' | 'error'
}

export interface TrackingDetails {
  status: string
  statusCode: string
  citySender?: string
  cityRecipient?: string
  warehouseSender?: string
  warehouseRecipient?: string
  scheduledDeliveryDate?: string
  documentWeight?: number
  announcedPrice?: number
  stages: TrackingStage[]
}

export interface TtnResponse {
  ttn: string
  status: OrderStatus
  npStatus: string
  npStatusCode: string
}

export interface SyncResponse {
  message: string
  npStatus?: string
  npStatusCode?: string
  newStatus?: OrderStatus
}
