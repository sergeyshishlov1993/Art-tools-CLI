<script setup lang="ts">
import type { Expense } from '~/models/admin/expense/types/Expense'
import { EXPENSE_TYPE_LABELS, EXPENSE_TYPE_ICONS } from '~/models/admin/expense/types/Expense'

interface Props {
  expenses: Expense[]
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [expense: Expense]
  delete: [expense: Expense]
}>()

function formatPrice(value: number): string {
  return value.toLocaleString('uk-UA')
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('uk-UA')
}
</script>

<template>
  <div class="table-card">
    <table v-if="expenses.length" class="expenses-table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Тип</th>
          <th>Опис</th>
          <th>Сума</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="expense in expenses" :key="expense.id">
          <td class="date-cell">{{ formatDate(expense.date) }}</td>
          <td>
            <span class="type-badge" :class="`type-${expense.type}`">
              {{ EXPENSE_TYPE_ICONS[expense.type] }} {{ EXPENSE_TYPE_LABELS[expense.type] }}
            </span>
          </td>
          <td class="desc-cell">{{ expense.description || '—' }}</td>
          <td class="amount-cell">{{ formatPrice(expense.amount) }} ₴</td>
          <td class="actions-cell">
            <button class="btn-icon" title="Редагувати" @click="emit('edit', expense)">✏️</button>
            <button class="btn-icon" title="Видалити" @click="emit('delete', expense)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty-state">
      <span class="empty-icon">📭</span>
      <p>Витрат не знайдено</p>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;
}

.expenses-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.expenses-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #1a1a1a;
  border-bottom: 1px solid #f3f4f6;
}

.expenses-table tr:hover {
  background: #f9fafb;
}

.date-cell {
  white-space: nowrap;
  color: #6b7280;
}

.desc-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-cell {
  font-weight: 600;
  white-space: nowrap;
  color: #ef4444;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.type-delivery { background: #fff7ed; color: #ea580c; }
.type-advertising { background: #fdf2f8; color: #db2777; }
.type-other { background: #f3f4f6; color: #6b7280; }

.btn-icon {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .expenses-table th:nth-child(3),
  .expenses-table td:nth-child(3) {
    display: none;
  }
}
</style>