<script setup lang="ts">
import type { Stats, OrderStatus } from '~/models/admin/types/Orders'
import { MONTHS, useOrderHelpers  } from '../composables/useOrderHelpers'

interface Props {
  stats: Stats
  selectedYear: string
  selectedMonth: string
}

defineProps<Props>()

const emit = defineEmits<{
  'filter-status': [status: OrderStatus]
}>()

const { formatPrice } = useOrderHelpers()
</script>

<template>
  <div class="analytics-card">
    <div class="analytics-header">
      <span class="analytics-title">📊 Аналітика</span>
      <span v-if="selectedYear !== 'all' && selectedMonth !== 'all'" class="period-badge">
        {{ MONTHS[Number(selectedMonth) - 1] }} {{ selectedYear }}
      </span>
      <span v-else class="period-badge neutral">За весь час</span>
    </div>

    <div class="analytics-grid">
      <div class="stat-card stat-total">
        <div class="stat-label">Всього</div>
        <div class="stat-value">{{ stats.period?.total?.count || 0 }}</div>
        <div class="stat-sum">{{ formatPrice(stats.period?.total?.sum) }} ₴</div>
      </div>

      <div class="stat-card stat-pending" @click="emit('filter-status', 'new')">
        <div class="stat-label">Непідтверджені</div>
        <div class="stat-value">{{ stats.period?.pending?.count || 0 }}</div>
        <div class="stat-sum">{{ formatPrice(stats.period?.pending?.sum) }} ₴</div>
      </div>

      <div class="stat-card stat-progress" @click="emit('filter-status', 'processing')">
        <div class="stat-label">В роботі</div>
        <div class="stat-value">{{ stats.period?.inProgress?.count || 0 }}</div>
        <div class="stat-sum">{{ formatPrice(stats.period?.inProgress?.sum) }} ₴</div>
      </div>

      <div class="stat-card stat-completed" @click="emit('filter-status', 'completed')">
        <div class="stat-label">Виконані</div>
        <div class="stat-value">{{ stats.period?.completed?.count || 0 }}</div>
        <div class="stat-sum">{{ formatPrice(stats.period?.completed?.sum) }} ₴</div>
        <div class="stat-extra">Конверсія: {{ stats.period?.conversionRate || 0 }}%</div>
      </div>

      <div class="stat-card stat-cancelled" @click="emit('filter-status', 'cancelled')">
        <div class="stat-label">Відмови</div>
        <div class="stat-value">{{ stats.period?.allRefunds?.count || 0 }}</div>
        <div class="stat-sum negative">-{{ formatPrice(stats.period?.allRefunds?.sum) }} ₴</div>
        <div class="stat-extra">{{ stats.period?.cancelRate || 0 }}% відмов</div>
      </div>

      <div class="stat-card stat-profit">
        <div class="stat-label">Чистий прибуток</div>
        <div class="stat-value big">{{ formatPrice(stats.period?.netProfit) }} ₴</div>
        <div class="stat-extra">Тільки виконані</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.analytics-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.analytics-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.period-badge {
  padding: 4px 12px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.period-badge.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 16px;
  border-radius: 10px;
  border-left: 4px solid;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-total { background: #f9fafb; border-color: #9ca3af; }
.stat-pending { background: #fff7ed; border-color: #f97316; }
.stat-progress { background: #eff6ff; border-color: #3b82f6; }
.stat-completed { background: #f0fdf4; border-color: #22c55e; }
.stat-cancelled { background: #fef2f2; border-color: #ef4444; }
.stat-profit { background: #faf5ff; border-color: #a855f7; }

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-value.big {
  font-size: 24px;
  color: #7c3aed;
}

.stat-sum {
  font-size: 14px;
  font-weight: 600;
  color: #22c55e;
}

.stat-sum.negative {
  color: #ef4444;
}

.stat-extra {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
