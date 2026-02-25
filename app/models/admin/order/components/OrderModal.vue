<script setup lang="ts">
import type { Order, OrderItem, OrderStatus, TrackingDetails } from '~/models/admin/types/Orders'
import { STATUS_LABELS, useOrderHelpers } from '../composables/useOrderHelpers'
import OrderNovaPoshta from './OrderNovaPoshta.vue'
import OrderItems from './OrderItems.vue'

interface Props {
  order: Order | null
  isOpen: boolean
  ttn: string
  savingTtn: boolean
  trackingDetails: TrackingDetails | null
  loadingTrackingDetails: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:ttn': [value: string]
  'close': []
  'change-status': [status: OrderStatus]
  'save-ttn': []
  'refresh-tracking': []
  'copy-ttn': [ttn: string]
  'delete-item': [item: OrderItem]
  'update-order': [orderId: string, updates: Partial<Order>]
}>()

const { formatPrice, getStatusLabel, getSourceLabel, getOrderTypeLabel } = useOrderHelpers()

const localTtn = computed({
  get: () => props.ttn,
  set: (val) => emit('update:ttn', val)
})

const isEditing = ref(false)

const editForm = ref({
  name: '',
  second_name: '',
  phone: '',
  city: '',
  postal_office: '',
  courier_delivery_address: '',
  payment_method: '',
  comment: ''
})

function startEditing() {
  if (!props.order) return
  editForm.value = {
    name: props.order.name || '',
    second_name: props.order.second_name || '',
    phone: props.order.phone || '',
    city: props.order.city || '',
    postal_office: props.order.postal_office || '',
    courier_delivery_address: props.order.courier_delivery_address || '',
    payment_method: props.order.payment_method || '',
    comment: props.order.comment || ''
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

function saveChanges() {
  if (!props.order) return

  const updates: Partial<Order> = {}
  const fields = Object.keys(editForm.value) as (keyof typeof editForm.value)[]

  for (const field of fields) {
    const newVal = editForm.value[field]
    const oldVal = (props.order as Record<string, unknown>)[field] || ''
    if (newVal !== oldVal) {
      ;(updates as Record<string, unknown>)[field] = newVal
    }
  }

  if (!Object.keys(updates).length) {
    isEditing.value = false
    return
  }

  emit('update-order', props.order.order_id, updates)
  isEditing.value = false
}

watch(() => props.isOpen, (val) => {
  if (!val) isEditing.value = false
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
        <Transition name="modal-slide">
          <div v-if="isOpen" class="modal-container">
            <header class="modal-header">
              <div class="modal-title-row">
                <h2 class="modal-title">
                  Замовлення #{{ order?.order_number || order?.order_id?.slice(0, 8) }}
                </h2>
                <span class="status-badge-lg" :class="`status-${order?.status}`">
                  {{ getStatusLabel(order?.status) }}
                </span>
              </div>
              <div class="modal-header-actions">
                <button
                  v-if="!isEditing"
                  class="btn btn-edit"
                  @click="startEditing"
                >
                  ✏️ Редагувати
                </button>
                <button class="modal-close" aria-label="Закрити" @click="emit('close')">×</button>
              </div>
            </header>

            <div class="modal-body">
              <section class="modal-section">
                <h3 class="section-title">👤 Клієнт</h3>

                <template v-if="!isEditing">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Ім'я</span>
                      <span class="info-value">{{ order?.name }} {{ order?.second_name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Телефон</span>
                      <a :href="`tel:${order?.phone}`" class="info-value info-link">{{ order?.phone }}</a>
                    </div>
                    <div v-if="order?.city" class="info-item">
                      <span class="info-label">Місто</span>
                      <span class="info-value">{{ order.city }}</span>
                    </div>
                    <div v-if="order?.payment_method" class="info-item">
                      <span class="info-label">Оплата</span>
                      <span class="info-value">{{ order.payment_method }}</span>
                    </div>
                    <div v-if="order?.postal_office" class="info-item info-item-full">
                      <span class="info-label">Відділення</span>
                      <span class="info-value">{{ order.postal_office }}</span>
                    </div>
                    <div v-if="order?.courier_delivery_address" class="info-item info-item-full">
                      <span class="info-label">Адреса</span>
                      <span class="info-value">{{ order.courier_delivery_address }}</span>
                    </div>
                  </div>

                </template>

                <template v-else>
                  <div class="edit-form">
                    <div class="edit-row">
                      <div class="edit-field">
                        <label class="edit-label">Ім'я</label>
                        <input v-model="editForm.name" class="edit-input" placeholder="Ім'я">
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Прізвище</label>
                        <input v-model="editForm.second_name" class="edit-input" placeholder="Прізвище">
                      </div>
                    </div>
                    <div class="edit-row">
                      <div class="edit-field">
                        <label class="edit-label">Телефон</label>
                        <input v-model="editForm.phone" class="edit-input" placeholder="+380...">
                      </div>
                      <div class="edit-field">
                        <label class="edit-label">Оплата</label>
                        <input v-model="editForm.payment_method" class="edit-input" placeholder="Спосіб оплати">
                      </div>
                    </div>
                    <div class="edit-field-full">
                      <label class="edit-label">Місто</label>
                      <input v-model="editForm.city" class="edit-input" placeholder="Місто доставки">
                    </div>
                    <div class="edit-field-full">
                      <label class="edit-label">Відділення Нової Пошти</label>
                      <input v-model="editForm.postal_office" class="edit-input" placeholder="Відділення №...">
                    </div>
                    <div class="edit-field-full">
                      <label class="edit-label">Адреса кур'єрської доставки</label>
                      <input v-model="editForm.courier_delivery_address" class="edit-input" placeholder="Вулиця, будинок, квартира">
                    </div>
                    <div class="edit-field-full">
                      <label class="edit-label">Коментар</label>
                      <textarea v-model="editForm.comment" class="edit-textarea" rows="2" placeholder="Коментар до замовлення" />
                    </div>
                    <div class="edit-actions">
                      <button class="btn btn-save" @click="saveChanges">💾 Зберегти</button>
                      <button class="btn btn-cancel" @click="cancelEditing">Скасувати</button>
                    </div>
                  </div>
                </template>
              </section>

              <OrderNovaPoshta
                v-model="localTtn"
                :order="order"
                :tracking-details="trackingDetails"
                :loading="loadingTrackingDetails"
                :saving="savingTtn"
                @save="emit('save-ttn')"
                @refresh="emit('refresh-tracking')"
                @copy="emit('copy-ttn', $event)"
              />

              <section class="modal-section">
                <h3 class="section-title">📊 Джерело</h3>
                <div class="badges-row">
                  <span class="source-badge" :class="`source-${order?.source || 'direct'}`">
                    {{ getSourceLabel(order?.source) }}
                  </span>
                  <span class="badge">{{ getOrderTypeLabel(order?.order_type) }}</span>
                  <span v-if="order?.utm_source" class="badge badge-utm">{{ order.utm_source }}</span>
                </div>
              </section>

              <OrderItems
                :items="order?.items || []"
                @delete="emit('delete-item', $event)"
              />
            </div>

            <footer class="modal-footer">
              <select
                v-if="order"
                :value="order.status"
                class="status-select status-select-lg"
                :class="`status-${order.status}`"
                @change="emit('change-status', ($event.target as HTMLSelectElement).value as OrderStatus)"
              >
                <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>

              <div class="modal-footer-right">
                <div class="order-total">
                  <span class="total-label">Сума:</span>
                  <span class="total-value">{{ formatPrice(order?.total_price) }} ₴</span>
                </div>
                <button class="btn btn-secondary" @click="emit('close')">Закрити</button>
              </div>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #fff;
  border-radius: 8px;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modal-close:hover {
  background: #fee2e2;
  color: #dc2626;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 16px;
}

.modal-footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-section {
  margin-bottom: 28px;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item-full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.info-link {
  color: #3b82f6;
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.comment-box {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fefce8;
  border-radius: 8px;
  border-left: 4px solid #facc15;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-field-full {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.edit-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  transition: border-color 0.2s;
  outline: none;
}

.edit-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  resize: vertical;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.edit-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
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

.btn-edit {
  padding: 6px 14px;
  background: #dbeafe;
  color: #1d4ed8;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-save {
  padding: 8px 20px;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #16a34a;
}

.btn-cancel {
  padding: 8px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.badge {
  padding: 4px 10px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-size: 12px;
}

.badge-utm {
  font-family: monospace;
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge-lg {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.status-select {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
}

.status-select-lg {
  padding: 10px 14px;
  font-size: 14px;
}

.status-new { background: #fef3c7; color: #d97706; }
.status-processing { background: #dbeafe; color: #2563eb; }
.status-shipped { background: #ede9fe; color: #7c3aed; }
.status-delivered { background: #dcfce7; color: #16a34a; }
.status-completed { background: #dcfce7; color: #16a34a; }
.status-cancelled { background: #fee2e2; color: #dc2626; }
.status-refund { background: #fee2e2; color: #dc2626; }
.status-returned { background: #fee2e2; color: #dc2626; }

.order-total {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-label {
  font-size: 14px;
  color: #6b7280;
}

.total-value {
  font-size: 20px;
  font-weight: 700;
  color: #22c55e;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .edit-row {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 12px;
  }

  .modal-footer-right {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-backdrop {
    padding: 0;
  }
}
</style>