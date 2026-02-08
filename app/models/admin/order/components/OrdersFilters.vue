<script setup lang="ts">
import type { OrderStatus, OrderSource } from '~/models/admin/types/Orders'
import { MONTHS, STATUS_LABELS, SOURCE_LABELS } from '../composables/useOrderHelpers'

interface Props {
  search: string
  statusFilter: OrderStatus | 'all'
  sourceFilter: OrderSource | 'all'
  selectedYear: string
  selectedMonth: string
  years: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:statusFilter': [value: OrderStatus | 'all']
  'update:sourceFilter': [value: OrderSource | 'all']
  'update:selectedYear': [value: string]
  'update:selectedMonth': [value: string]
  'search': []
  'reset': []
}>()

function onSearchInput(e: Event) {
  emit('update:search', (e.target as HTMLInputElement).value)
  emit('search')
}
</script>

<template>
  <div class="filters-card">
    <input
      :value="search"
      type="text"
      placeholder="Пошук по телефону, імені, номеру, ТТН..."
      class="search-input"
      @input="onSearchInput"
    >

    <select
      :value="statusFilter"
      class="filter-select"
      @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value as OrderStatus | 'all')"
    >
      <option value="all">Всі статуси</option>
      <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">
        {{ label }}
      </option>
    </select>

    <select
      :value="sourceFilter"
      class="filter-select"
      @change="emit('update:sourceFilter', ($event.target as HTMLSelectElement).value as OrderSource | 'all')"
    >
      <option value="all">Всі джерела</option>
      <option v-for="(label, key) in SOURCE_LABELS" :key="key" :value="key">
        {{ label }}
      </option>
    </select>

    <select
      :value="selectedYear"
      class="filter-select"
      @change="emit('update:selectedYear', ($event.target as HTMLSelectElement).value)"
    >
      <option value="all">Рік</option>
      <option v-for="y in years" :key="y" :value="String(y)">{{ y }}</option>
    </select>

    <select
      :value="selectedMonth"
      class="filter-select"
      @change="emit('update:selectedMonth', ($event.target as HTMLSelectElement).value)"
    >
      <option value="all">Місяць</option>
      <option v-for="(m, i) in MONTHS" :key="i" :value="String(i + 1)">{{ m }}</option>
    </select>

    <button class="btn btn-secondary" @click="emit('reset')">Скинути</button>
  </div>
</template>

<style scoped>
.filters-card {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.search-input {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  min-width: 280px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

.filter-select {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: #3b82f6;
}

.btn {
  padding: 10px 18px;
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

@media (max-width: 768px) {
  .filters-card {
    flex-direction: column;
  }

  .search-input {
    min-width: 100%;
  }
}
</style>