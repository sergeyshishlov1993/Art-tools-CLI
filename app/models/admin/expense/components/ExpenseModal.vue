<script setup lang="ts">
import type { Expense, ExpenseType } from '../types/Expense'
import { EXPENSE_TYPE_LABELS } from '../types/Expense'

interface Props {
  isOpen: boolean
  expense: Expense | null
  saving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: { type: ExpenseType; amount: number; description: string; date: string }]
}>()

const type = ref<ExpenseType>('delivery')
const amount = ref(0)
const description = ref('')
const date = ref(new Date().toISOString().slice(0, 10))

watch(() => props.isOpen, (open) => {
  if (!open) return

  if (props.expense) {
    type.value = props.expense.type
    amount.value = props.expense.amount
    description.value = props.expense.description
    date.value = props.expense.date
  } else {
    type.value = 'delivery'
    amount.value = 0
    description.value = ''
    date.value = new Date().toISOString().slice(0, 10)
  }
})

function handleSave() {
  if (!amount.value || amount.value <= 0) return

  emit('save', {
    type: type.value,
    amount: amount.value,
    description: description.value,
    date: date.value,
  })
}

const typeOptions = Object.entries(EXPENSE_TYPE_LABELS) as [ExpenseType, string][]
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ expense ? '✏️ Редагувати витрату' : '➕ Нова витрата' }}</h2>
            <button class="btn-close" @click="emit('close')">✕</button>
          </div>

          <div class="modal-body">
            <div class="field">
              <label>Тип</label>
              <select v-model="type">
                <option v-for="[value, label] in typeOptions" :key="value" :value="value">
                  {{ label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Сума (₴)</label>
              <input v-model.number="amount" type="number" min="0" step="0.01" placeholder="0.00">
            </div>

            <div class="field">
              <label>Дата</label>
              <input v-model="date" type="date">
            </div>

            <div class="field">
              <label>Опис</label>
              <textarea v-model="description" rows="3" placeholder="Опис витрати..." />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="emit('close')">Скасувати</button>
            <button class="btn btn-primary" :disabled="saving || !amount" @click="handleSave">
              {{ saving ? '⏳ Збереження...' : 'Зберегти' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.field select,
.field input,
.field textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  background: #fff;
  transition: border-color 0.2s;
}

.field select:focus,
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
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

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>