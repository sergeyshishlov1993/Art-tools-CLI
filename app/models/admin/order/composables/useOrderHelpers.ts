import type { OrderStatus, OrderSource } from '~/models/admin/types/Orders'
export const MONTHS = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
] as const

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новий',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  completed: 'Виконано',
  cancelled: 'Скасовано',
  refund: 'Повернення коштів',
  returned: 'Повернення товару'
}

export const SOURCE_LABELS: Record<OrderSource, string> = {
  direct: 'Прямий',
  google: 'Google',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  instagram: 'Instagram'
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  cart: 'Кошик',
  'quick-buy': 'Швидка покупка'
}

export const NP_STATUS_CLASSES: Record<string, string[]> = {
  'np-delivered': ['9', '10', '11'],
  'np-completed': ['101', '106'],
  'np-transit': ['4', '41', '5', '6', '12', '14'],
  'np-warehouse': ['7', '8'],
  'np-returned': ['102', '103', '104', '105', '108', '109', '110'],
  'np-cancelled': ['2']
}

export function useOrderHelpers() {

  function formatPrice(price: number | undefined | null): string {
    return Number(price ?? 0).toLocaleString('uk-UA')
  }

  function formatDate(date: string | undefined): string {
    if (!date) return '—'
    return new Date(date).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatDateTime(date: string | undefined): string {
    if (!date) return '—'
    return new Date(date).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatSyncTime(date: string | undefined): string {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60)

    if (diff < 1) return 'щойно'
    if (diff < 60) return `${diff} хв тому`
    if (diff < 1440) return `${Math.floor(diff / 60)} год тому`
    return formatDateTime(date)
  }

  function getStatusLabel(status: OrderStatus | undefined): string {
    return status ? STATUS_LABELS[status] : ''
  }

  function getSourceLabel(source: OrderSource | string | undefined): string {
    if (!source) return 'Прямий'
    return SOURCE_LABELS[source as OrderSource] ?? source
  }

  function getOrderTypeLabel(type: string | undefined): string {
    return ORDER_TYPE_LABELS[type ?? ''] ?? type ?? 'Кошик'
  }

  function getNpStatusClass(statusCode: string | undefined): string {
    if (!statusCode) return ''
    const code = String(statusCode)

    for (const [className, codes] of Object.entries(NP_STATUS_CLASSES)) {
      if (codes.includes(code)) return className
    }
    return ''
  }

  function getErrorMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      const e = err as { data?: { message?: string }; message?: string }
      return e.data?.message || e.message || 'Невідома помилка'
    }
    return 'Невідома помилка'
  }

  function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
  }

  return {
    formatPrice,
    formatDate,
    formatDateTime,
    formatSyncTime,
    getStatusLabel,
    getSourceLabel,
    getOrderTypeLabel,
    getNpStatusClass,
    getErrorMessage,
    copyToClipboard
  }
}
