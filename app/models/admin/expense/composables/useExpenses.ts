import type { Expense, ExpenseType, ExpenseSummary, ExpensesResponse } from '../expense/types/Expense'

export function useExpenses() {
  const config = useRuntimeConfig()
  const API_URL = (config.public.apiBase || 'http://localhost:8000/api').replace(/\/$/, '')

  const error = ref<string | null>(null)
  const success = ref<string | null>(null)
  const selectedYear = ref(String(new Date().getFullYear()))
  const selectedMonth = ref(String(new Date().getMonth() + 1))
  const typeFilter = ref<ExpenseType | 'all'>('all')
  const isModalOpen = ref(false)
  const editingExpense = ref<Expense | null>(null)
  const saving = ref(false)

  const queryParams = computed(() => {
    const params = new URLSearchParams()
    if (selectedYear.value !== 'all') params.append('year', selectedYear.value)
    if (selectedMonth.value !== 'all') params.append('month', selectedMonth.value)
    if (typeFilter.value !== 'all') params.append('type', typeFilter.value)
    return params.toString()
  })

  const summaryParams = computed(() => {
    const params = new URLSearchParams()
    if (selectedYear.value !== 'all') params.append('year', selectedYear.value)
    if (selectedMonth.value !== 'all') params.append('month', selectedMonth.value)
    return params.toString()
  })

  const {
    data: expensesData,
    refresh: refreshExpenses,
  } = useAsyncData<ExpensesResponse>(
    'admin-expenses',
    () => $fetch(`${API_URL}/admin/expenses?${queryParams.value}`),
    { watch: [queryParams] }
  )

  const {
    data: summaryData,
    refresh: refreshSummary,
  } = useAsyncData<ExpenseSummary>(
    'admin-expenses-summary',
    () => $fetch(`${API_URL}/admin/expenses/summary?${summaryParams.value}`),
    { watch: [summaryParams] }
  )

  const expenses = computed(() => expensesData.value?.expenses ?? [])
  const summary = computed(() => summaryData.value ?? { revenue: 0, totalExpenses: 0, netProfit: 0, margin: 0, byType: {} })

  const years = computed(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
  })

  function showSuccess(msg: string) {
    success.value = msg
  }

  function showError(msg: string) {
    error.value = msg
  }

  function openCreateModal() {
    editingExpense.value = null
    isModalOpen.value = true
  }

  function openEditModal(expense: Expense) {
    editingExpense.value = structuredClone(expense)
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
    editingExpense.value = null
  }

  async function saveExpense(data: { type: ExpenseType; amount: number; description: string; date: string; order_id?: string | null }) {
    saving.value = true
    try {
      if (editingExpense.value) {
        await $fetch(`${API_URL}/admin/expenses/${editingExpense.value.id}`, {
          method: 'PUT',
          body: data,
        })
        showSuccess('Витрату оновлено')
      } else {
        await $fetch(`${API_URL}/admin/expenses`, {
          method: 'POST',
          body: data,
        })
        showSuccess('Витрату додано')
      }
      closeModal()
      await refreshExpenses()
      await refreshSummary()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Помилка збереження')
    } finally {
      saving.value = false
    }
  }

  async function deleteExpense(id: number) {
    try {
      await $fetch(`${API_URL}/admin/expenses/${id}`, { method: 'DELETE' })
      showSuccess('Витрату видалено')
      await refreshExpenses()
      await refreshSummary()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Помилка видалення')
    }
  }

  function resetFilters() {
    typeFilter.value = 'all'
    selectedYear.value = String(new Date().getFullYear())
    selectedMonth.value = String(new Date().getMonth() + 1)
  }

  watch([error, success], () => {
    setTimeout(() => {
      error.value = null
      success.value = null
    }, 5000)
  })

  return {
    error,
    success,
    selectedYear,
    selectedMonth,
    typeFilter,
    isModalOpen,
    editingExpense,
    saving,
    expenses,
    summary,
    years,
    openCreateModal,
    openEditModal,
    closeModal,
    saveExpense,
    deleteExpense,
    resetFilters,
    refreshExpenses,
    refreshSummary,
  }
}