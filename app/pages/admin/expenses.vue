<script setup lang="ts">
import { useExpenses } from '~/models/admin/expense/composables/useExpenses'
import ExpensesSummary from '~/models/admin/expense/components/ExpensesSummary.vue'
import ExpensesTable from '~/models/admin/expense/components/ExpensesTable.vue'
import ExpenseModal from '~/models/admin/expense/components/ExpenseModal.vue'
import ConfirmModal from '~/models/common/components/ui/ConfirmModal.vue'
import { EXPENSE_TYPE_LABELS } from '~/models/admin/expense/types/Expense'
import { MONTHS } from '~/models/admin/order/composables/useOrderHelpers'
import type { Expense, ExpenseType } from '~/models/admin/expense/types/Expense'

definePageMeta({
  layout: 'admin',
})

const {
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
} = useExpenses()

const deleteModal = ref(false)
const deleting = ref(false)
const expenseToDelete = ref<Expense | null>(null)

function confirmDelete(expense: Expense) {
  expenseToDelete.value = expense
  deleteModal.value = true
}

async function handleDelete() {
  if (!expenseToDelete.value) return

  deleting.value = true
  try {
    await deleteExpense(expenseToDelete.value.id)
    deleteModal.value = false
  } finally {
    deleting.value = false
    expenseToDelete.value = null
  }
}

const typeOptions = Object.entries(EXPENSE_TYPE_LABELS) as [ExpenseType, string][]
</script>

<template>
  <div class="expenses-page">
    <Transition name="toast">
      <div v-if="error" class="toast toast-error">{{ error }}</div>
    </Transition>

    <Transition name="toast">
      <div v-if="success" class="toast toast-success">{{ success }}</div>
    </Transition>

    <header class="page-header">
      <h1 class="page-title">💸 Витрати</h1>
      <button class="btn btn-primary" @click="openCreateModal">➕ Додати витрату</button>
    </header>

    <ExpensesSummary :summary="summary" />

    <div class="filters-card">
      <div class="filters-row">
        <select v-model="selectedYear">
          <option value="all">Всі роки</option>
          <option v-for="year in years" :key="year" :value="String(year)">{{ year }}</option>
        </select>

        <select v-model="selectedMonth">
          <option value="all">Всі місяці</option>
          <option v-for="(month, index) in MONTHS" :key="index" :value="String(index + 1)">
            {{ month }}
          </option>
        </select>

        <select v-model="typeFilter">
          <option value="all">Всі типи</option>
          <option v-for="[value, label] in typeOptions" :key="value" :value="value">
            {{ label }}
          </option>
        </select>

        <button class="btn btn-secondary" @click="resetFilters">Скинути</button>
      </div>
    </div>

    <ExpensesTable
      :expenses="expenses"
      @edit="openEditModal"
      @delete="confirmDelete"
    />

    <ExpenseModal
      :is-open="isModalOpen"
      :expense="editingExpense"
      :saving="saving"
      @close="closeModal"
      @save="saveExpense"
    />

    <ConfirmModal
      v-model="deleteModal"
      title="Видалити витрату?"
      icon="🗑️"
      confirm-text="Видалити"
      confirm-color="danger"
      :loading="deleting"
      @confirm="handleDelete"
    >
      Витрату на суму <strong>{{ expenseToDelete?.amount }} ₴</strong> буде видалено назавжди.
    </ConfirmModal>
  </div>
</template>

<style scoped>
.expenses-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.filters-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
  margin-bottom: 20px;
}

.filters-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-row select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  background: #fff;
  min-width: 150px;
}

.filters-row select:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.toast-success {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 768px) {
  .expenses-page {
    padding: 16px;
  }

  .page-title {
    font-size: 22px;
  }

  .filters-row {
    flex-direction: column;
  }

  .filters-row select {
    min-width: unset;
  }
}
</style>