export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  oldPrice?: number
  image: string
  code: string
  quantity: number
}

export interface NovaPoshtaCity {
  Description: string
  Ref: string
  AreaDescription: string
  DescriptionRu?: string
  Delivery1?: string
  Delivery2?: string
}

export interface NovaPoshtaWarehouse {
  Description: string
  Ref: string
  Number: string
  CityRef?: string
}

export interface NovaPoshtaDataEnvelope<T> {
  success: boolean
  data: T[]
  errors?: string[]
  warnings?: string[]
  info?: unknown
}

export interface CityApiResponse {
  message: string
  city: NovaPoshtaDataEnvelope<NovaPoshtaCity>
}

export interface WarehouseApiResponse {
  message: string
  warehouses: NovaPoshtaDataEnvelope<NovaPoshtaWarehouse> | NovaPoshtaWarehouse[]
}


export interface OrderPayloadItem {
  orderName: string
  count: number
  product_id: string
  img: string
  price: number
  oldPrice?: number | null
  discount: number
  discountProduct: boolean
}

export interface OrderPayload {
  name: string
  secondName: string
  phone: string
  payment: string
  city: string
  warehouses: string
  courierDeliveryAddress: string
  comment?: string | null
  totalPrice: number
  orders: OrderPayloadItem[]
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export interface OrderResponse {
  message: string
  order_id: string
  order_number: string
}

export interface QuickBuyPayload {
  name: string
  phone: string
  slug: string
  quantity: number
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export interface QuickBuyResponse {
  message: string
  order_id: string
  order_number: string
  product?: {
    name: string
    price: number
    quantity: number
    total: number
  }
}

export interface CheckoutFormData {
  firstName: string
  lastName: string
  phone: string
  paymentMethod: string
  city: string
  cityRef?: string
  warehouse: string
  address?: string
  deliveryType?: 'nova_poshta' | 'courier'
  comment?: string
}

export interface SubmitOrderData {
  name?: string
  firstName?: string
  secondName?: string
  lastName?: string
  phone: string
  payment?: string
  paymentMethod?: string
  city: string
  cityRef?: string
  warehouses?: string
  warehouse?: string
  courierDeliveryAddress?: string
  address?: string
  deliveryType?: 'nova_poshta' | 'courier'
  comment?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}
