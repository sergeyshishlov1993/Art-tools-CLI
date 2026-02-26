export type ExpenseType = 'delivery' | 'advertising' | 'other'

export interface Expense {
  id: number
  type: ExpenseType
  amount: number
  description: string
  date: string
  order_id: string | null
  createdAt: string
  updatedAt: string
}

export interface ExpenseSummary {
  revenue: number
  totalExpenses: number
  netProfit: number
  margin: number
  byType: Record<string, number>
}

export interface ExpensesResponse {
  expenses: Expense[]
}

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  delivery: 'Доставка',
  advertising: 'Реклама',
  other: 'Інше',
}

export const EXPENSE_TYPE_ICONS: Record<ExpenseType, string> = {
  delivery: '🚚',
  advertising: '📣',
  other: '📎',
}