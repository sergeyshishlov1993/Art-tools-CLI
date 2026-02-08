<script setup lang="ts">
import type { Order, OrderStatus } from '~/models/admin/types/Orders'
import { STATUS_LABELS, useOrderHelpers  } from '../composables/useOrderHelpers'

interface Props {
  orders: Order[]
  loading: boolean
  currentPage: number
  totalPages: number
}

defineProps<Props>()

const emit = defineEmits<{
  'change-status': [order: Order, status: OrderStatus]
  'delete': [order: Order]
  'sync': [order: Order]
  'open-details': [order: Order]
  'add-ttn': [order: Order]
  'copy-ttn': [ttn: string]
  'go-to-page': [page: number]
}>()

const {
  formatPrice,
  formatDate,
  formatSyncTime,
  getSourceLabel,
  getNpStatusClass
} = useOrderHelpers()
</script>

<template>
  <div class="table-card">
    <div v-if="loading" class="loading">Завантаження...</div>

    <div v-else-if="orders.length === 0" class="empty-state">Замовлень не знайдено</div>

    <table v-else class="orders-table">
      <thead>
        <tr>
          <th>№ Замовлення</th>
          <th>Клієнт</th>
          <th>Телефон</th>
          <th>Сума</th>
          <th>ТТН / НП Статус</th>
          <th>Джерело</th>
          <th>Статус</th>
          <th>Дата</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="order in orders"
          :key="order.order_id"
          :class="{ 'row-new': order.status === 'new' }"
        >
          <td>
            <span class="order-number">{{ order.order_number || '—' }}</span>
            <div class="order-uuid">{{ order.order_id.slice(0, 8) }}</div>
          </td>

          <td>
            <div class="customer-name">{{ order.name || '—' }} {{ order.second_name || '' }}</div>
            <div v-if="order.city" class="customer-city">{{ order.city }}</div>
          </td>

          <td>
            <a :href="`tel:${order.phone}`" class="phone-link">{{ order.phone }}</a>
          </td>

          <td class="price-cell">{{ formatPrice(order.total_price) }} ₴</td>

          <td>
            <div v-if="order.ttn" class="ttn-cell">
              <div class="ttn-number">
                <span>{{ order.ttn }}</span>
                <button class="btn-icon-sm" title="Копіювати" @click="emit('copy-ttn', order.ttn)">📋</button>
              </div>
              <div v-if="order.np_status" class="np-status-badge" :class="getNpStatusClass(order.np_status_code)">
                {{ order.np_status }}
              </div>
              <div v-if="order.np_last_sync" class="np-sync-time">
                {{ formatSyncTime(order.np_last_sync) }}
              </div>
            </div>
            <div v-else class="no-ttn">
              <button class="btn-link" @click="emit('add-ttn', order)">+ Додати ТТН</button>
            </div>
          </td>

          <td>
            <span class="source-badge" :class="`source-${order.source || 'direct'}`">
              {{ getSourceLabel(order.source) }}
            </span>
          </td>

          <td>
            <select
              :value="order.status"
              class="status-select"
              :class="`status-${order.status}`"
              @change="emit('change-status', order, ($event.target as HTMLSelectElement).value as OrderStatus)"
            >
              <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </td>

          <td class="date-cell">{{ formatDate(order.createdAt) }}</td>

          <td>
            <div class="actions">
              <button v-if="order.ttn" class="btn-icon" title="Оновити статус НП" @click="emit('sync', order)">🔄</button>
              <button class="btn-icon" title="Деталі" @click="emit('open-details', order)">👁️</button>
              <button class="btn-icon btn-danger" title="Видалити" @click="emit('delete', order)">🗑️</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-sm" :disabled="currentPage === 1" @click="emit('go-to-page', currentPage - 1)">
        ← Назад
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button class="btn btn-sm" :disabled="currentPage === totalPages" @click="emit('go-to-page', currentPage + 1)">
        Вперед →
      </button>
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

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orders-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.orders-table tr:hover {
  background: #fafafa;
}

.row-new {
  background: #fffbeb !important;
}

.row-new:hover {
  background: #fef3c7 !important;
}

.order-number {
  display: inline-block;
  padding: 4px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
}

.order-uuid {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
  font-family: monospace;
}

.customer-name {
  font-weight: 500;
  color: #1a1a1a;
}

.customer-city {
  font-size: 12px;
  color: #6b7280;
}

.phone-link {
  color: #3b82f6;
  text-decoration: none;
}

.phone-link:hover {
  text-decoration: underline;
}

.price-cell {
  font-weight: 600;
  color: #22c55e;
}

.date-cell {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}

.ttn-cell {
  min-width: 160px;
}

.ttn-number {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: #374151;
}

.np-status-badge {
  font-size: 11px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.np-delivered { background: #dcfce7; color: #16a34a; }
.np-completed { background: #d1fae5; color: #059669; }
.np-transit { background: #dbeafe; color: #2563eb; }
.np-warehouse { background: #fef3c7; color: #d97706; }
.np-returned { background: #fee2e2; color: #dc2626; }
.np-cancelled { background: #f3f4f6; color: #6b7280; }

.np-sync-time {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 2px;
}

.no-ttn {
  font-size: 13px;
}

.source-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.source-direct { background: #f3f4f6; color: #6b7280; }
.source-google { background: #dcfce7; color: #16a34a; }
.source-facebook { background: #dbeafe; color: #2563eb; }
.source-tiktok { background: #fce7f3; color: #db2777; }
.source-instagram { background: #ffedd5; color: #ea580c; }

.status-select {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
}

.status-new { background: #fef3c7; color: #d97706; }
.status-processing { background: #dbeafe; color: #2563eb; }
.status-shipped { background: #ede9fe; color: #7c3aed; }
.status-delivered { background: #dcfce7; color: #16a34a; }
.status-completed { background: #dcfce7; color: #16a34a; }
.status-cancelled { background: #fee2e2; color: #dc2626; }
.status-refund { background: #fee2e2; color: #dc2626; }
.status-returned { background: #fee2e2; color: #dc2626; }

.actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  padding: 6px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.btn-danger:hover {
  background: #fef2f2;
}

.btn-icon-sm {
  padding: 2px 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
}

.btn-icon-sm:hover {
  background: #f3f4f6;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #f3f4f6;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .table-card {
    overflow-x: auto;
  }

  .orders-table {
    min-width: 900px;
  }
}
</style>