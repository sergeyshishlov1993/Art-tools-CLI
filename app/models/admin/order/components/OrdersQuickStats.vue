<script setup lang="ts">
import type { Stats } from '~/models/admin/types/Orders'
import { useOrderHelpers } from '../composables/useOrderHelpers'

interface Props {
  stats: Stats
  monthGrowth: number | null
}

defineProps<Props>()

const { formatPrice } = useOrderHelpers()
</script>

<template>
  <div class="quick-stats">
    <div class="quick-stat">
      <div class="qs-label">Сьогодні</div>
      <div class="qs-value">{{ formatPrice(stats.today?.total) }} ₴</div>
      <div class="qs-count">{{ stats.today?.count || 0 }} зам.</div>
    </div>

    <div class="quick-stat">
      <div class="qs-label">Тиждень</div>
      <div class="qs-value">{{ formatPrice(stats.thisWeek?.total) }} ₴</div>
      <div class="qs-count">{{ stats.thisWeek?.count || 0 }} зам.</div>
    </div>

    <div class="quick-stat">
      <div class="qs-label">Місяць</div>
      <div class="qs-value">{{ formatPrice(stats.thisMonth?.total) }} ₴</div>
      <div class="qs-count">{{ stats.thisMonth?.count || 0 }} зам.</div>
      <div v-if="monthGrowth !== null" class="qs-growth" :class="monthGrowth >= 0 ? 'positive' : 'negative'">
        {{ monthGrowth >= 0 ? '+' : '' }}{{ monthGrowth }}%
      </div>
    </div>

    <div class="quick-stat">
      <div class="qs-label">Всього</div>
      <div class="qs-value">{{ formatPrice(stats.allTime?.total) }} ₴</div>
      <div class="qs-count">{{ stats.allTime?.count || 0 }} зам.</div>
    </div>
  </div>
</template>

<style scoped>
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.quick-stat {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.qs-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qs-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 4px 0;
}

.qs-count {
  font-size: 12px;
  color: #6b7280;
}

.qs-growth {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.qs-growth.positive { color: #22c55e; }
.qs-growth.negative { color: #ef4444; }

@media (max-width: 768px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>
