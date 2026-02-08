<script setup lang="ts">
import { useOrders } from '~/models/admin/order/composables/useOrders'
import { useOrderHelpers } from '~/models/admin/order/composables/useOrderHelpers'
import { useAdminSocket } from '~/models/admin/composables/useAdminSocket'
import ConfirmModal from '~/models/common/components/ui/ConfirmModal.vue'
import OrdersFilters from '~/models/admin/order/components/OrdersFilters.vue'
import OrdersQuickStats from '~/models/admin/order/components/OrdersQuickStats.vue'
import OrdersAnalytics from '~/models/admin/order/components/OrdersAnalytics.vue'
import OrdersTable from '~/models/admin/order/components/OrdersTable.vue'
import OrderModal from '~/models/admin/order/components/OrderModal.vue'
import TtnModal from '~/models/admin/order/components/TtnModal.vue'
import type { Order } from '~/models/admin/types/Orders'
import {useAdminStore} from '~/models/admin/AdminStore'

definePageMeta({
  layout: 'admin',
})

const {
  error,
  success,
  loading,
  syncingAll,
  search,
  statusFilter,
  sourceFilter,
  selectedYear,
  selectedMonth,
  currentPage,
  orders,
  totalItems,
  totalPages,
  stats,
  years,
  monthGrowth,
  selectedOrder,
  isModalOpen,
  modalTtn,
  savingTtn,
  trackingDetails,
  loadingTrackingDetails,
  isTtnModalOpen,
  ttnOrder,
  newTtn,
  debouncedSearch,
  changeStatus,
  deleteOrderById,
  deleteOrderItem,
  fetchTrackingDetails,
  syncOrderTracking,
  syncAllTracking,
  saveNewTtn,
  saveTtn,
  filterByStatus,
  goToPage,
  resetFilters,
  openOrderDetails,
  closeOrderModal,
  openSetTtnModal,
  closeTtnModal,
  refreshOrders,
  refreshStats
} = useOrders()

const { copyToClipboard } = useOrderHelpers()
const { onNewOrder } = useAdminSocket()
const adminStore = useAdminStore()

// Delete modal state
const deleteModal = ref(false)
const deleting = ref(false)
const orderToDelete = ref<Order | null>(null)

if (import.meta.client) {
  onNewOrder(async (data) => {
    await refreshOrders()
    await refreshStats()
    success.value = `Нове замовлення #${data.orderNumber}`
  })
}

function handleCopyTtn(ttn: string) {
  copyToClipboard(ttn)
  success.value = 'ТТН скопійовано'
}

// Delete handlers
function confirmDeleteOrder(order: Order) {
  orderToDelete.value = order
  deleteModal.value = true
}

async function handleDeleteOrder() {
  if (!orderToDelete.value) return

  deleting.value = true
  try {
    const wasNew = orderToDelete.value.status === 'new'

    await deleteOrderById(orderToDelete.value.order_id)

    if (wasNew) {
      adminStore.decrementOrders()
    }

    deleteModal.value = false
    success.value = `Замовлення #${orderToDelete.value.order_number} видалено`
  } catch (e) {
    error.value = 'Помилка видалення'
  } finally {
    deleting.value = false
    orderToDelete.value = null
  }
}
</script>

<template>
  <div class="orders-page">
    <!-- Toasts -->
    <Transition name="toast">
      <div v-if="error" class="toast toast-error">{{ error }}</div>
    </Transition>

    <Transition name="toast">
      <div v-if="success" class="toast toast-success">{{ success }}</div>
    </Transition>

    <!-- Header -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">📦 Замовлення</h1>
        <span class="total-badge">{{ totalItems }} шт.</span>
      </div>
      <button class="btn btn-primary" :disabled="syncingAll" @click="syncAllTracking">
        {{ syncingAll ? '⏳ Синхронізація...' : '🔄 Оновити всі ТТН' }}
      </button>
    </header>

    <OrdersQuickStats :stats="stats" :month-growth="monthGrowth" />

    <OrdersFilters
      v-model:search="search"
      v-model:status-filter="statusFilter"
      v-model:source-filter="sourceFilter"
      v-model:selected-year="selectedYear"
      v-model:selected-month="selectedMonth"
      :years="years"
      @search="debouncedSearch"
      @reset="resetFilters"
    />

    <OrdersAnalytics
      :stats="stats"
      :selected-year="selectedYear"
      :selected-month="selectedMonth"
      @filter-status="filterByStatus"
    />

    <OrdersTable
      :orders="orders"
      :loading="loading"
      :current-page="currentPage"
      :total-pages="totalPages"
      @change-status="changeStatus"
      @delete="confirmDeleteOrder"
      @sync="syncOrderTracking"
      @open-details="openOrderDetails"
      @add-ttn="openSetTtnModal"
      @copy-ttn="handleCopyTtn"
      @go-to-page="goToPage"
    />

    <!-- Order Details Modal -->
    <OrderModal
      v-model:ttn="modalTtn"
      :order="selectedOrder"
      :is-open="isModalOpen"
      :saving-ttn="savingTtn"
      :tracking-details="trackingDetails"
      :loading-tracking-details="loadingTrackingDetails"
      @close="closeOrderModal"
      @change-status="changeStatus(selectedOrder!, $event)"
      @save-ttn="saveTtn"
      @refresh-tracking="fetchTrackingDetails"
      @copy-ttn="handleCopyTtn"
      @delete-item="deleteOrderItem(selectedOrder!, $event)"
    />

    <!-- TTN Modal -->
    <TtnModal
      v-model:ttn="newTtn"
      :is-open="isTtnModalOpen"
      :order="ttnOrder"
      :saving="savingTtn"
      @close="closeTtnModal"
      @save="saveNewTtn"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model="deleteModal"
      title="Видалити замовлення?"
      icon="🗑️"
      confirm-text="Видалити"
      confirm-color="danger"
      :loading="deleting"
      @confirm="handleDeleteOrder"
    >
      Замовлення <strong>#{{ orderToDelete?.order_number }}</strong> від
      <strong>{{ orderToDelete?.name }}</strong> буде видалено назавжди.
    </ConfirmModal>
  </div>
</template>

<style scoped>
.orders-page {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.total-badge {
  padding: 6px 14px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.btn {
  padding: 12px 20px;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .orders-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 22px;
  }
}
</style>