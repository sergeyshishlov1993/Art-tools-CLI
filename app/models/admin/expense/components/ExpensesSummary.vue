<script setup lang="ts">
import type { ExpenseSummary } from '~/models/admin/expense/types/Expense'
import { EXPENSE_TYPE_LABELS, EXPENSE_TYPE_ICONS } from '~/models/admin/expense/types/Expense'

interface Props {
  summary: ExpenseSummary
}

defineProps<Props>()

function formatPrice(value: number): string {
  return value.toLocaleString('uk-UA')
}
</script>

<template>
  <div class="summary-card">
    <div class="summary-header">
      <span class="summary-title">📊 Фінансова зведка</span>
    </div>

    <div class="summary-grid">
      <div class="stat-card stat-revenue">
        <div class="stat-label">Виручка</div>
        <div class="stat-value">{{ formatPrice(summary.revenue) }} ₴</div>
        <div class="stat-extra">Виконані замовлення</div>
      </div>

      <div class="stat-card stat-expenses">
        <div class="stat-label">Витрати</div>
        <div class="stat-value">{{ formatPrice(summary.totalExpenses) }} ₴</div>
      </div>

      <div class="stat-card stat-profit">
        <div class="stat-label">Чистий прибуток</div>
        <div class="stat-value" :class="{ negative: summary.netProfit < 0 }">
          {{ formatPrice(summary.netProfit) }} ₴
        </div>
        <div class="stat-extra">Маржа: {{ summary.margin }}%</div>
      </div>
    </div>

    <div v-if="Object.keys(summary.byType).length" class="by-type">
      <div class="by-type-title">По типах:</div>
      <div class="by-type-list">
        <div v-for="(amount, type) in summary.byType" :key="type" class="by-type-item">
          <span class="by-type-icon">{{ EXPENSE_TYPE_ICONS[type as keyof typeof EXPENSE_TYPE_ICONS] }}</span>
          <span class="by-type-label">{{ EXPENSE_TYPE_LABELS[type as keyof typeof EXPENSE_TYPE_LABELS] }}</span>
          <span class="by-type-amount">{{ formatPrice(amount) }} ₴</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.summary-header {
  margin-bottom: 20px;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 16px;
  border-radius: 10px;
  border-left: 4px solid;
}

.stat-revenue { background: #f0fdf4; border-color: #22c55e; }
.stat-expenses { background: #fef2f2; border-color: #ef4444; }
.stat-profit { background: #faf5ff; border-color: #a855f7; }

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-value.negative {
  color: #ef4444;
}

.stat-extra {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.by-type {
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
}

.by-type-title {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
}

.by-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.by-type-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 13px;
}

.by-type-icon {
  font-size: 16px;
}

.by-type-label {
  color: #6b7280;
}

.by-type-amount {
  font-weight: 600;
  color: #1a1a1a;
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>