<script setup lang="ts">
import type { Order, TrackingDetails } from '~/models/admin/types/Orders'
import { useOrderHelpers } from '../composables/useOrderHelpers'

interface Props {
  order: Order | null
  trackingDetails: TrackingDetails | null
  loading: boolean
  saving: boolean
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save': []
  'refresh': []
  'copy': [ttn: string]
}>()

const { formatDateTime, getNpStatusClass } = useOrderHelpers()

const ttn = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <section class="np-section">
    <h3 class="section-title">📦 Нова Пошта</h3>

    <div class="np-form">
      <div class="np-input-group">
        <input
          v-model="ttn"
          type="text"
          class="np-input"
          placeholder="Номер ТТН (14 цифр)"
          maxlength="14"
          inputmode="numeric"
        >
        <span class="np-input-counter">{{ ttn.length }}/14</span>
      </div>
      <div class="np-buttons">
        <button
          class="btn btn-primary btn-sm"
          :disabled="ttn.length < 14 || saving"
          @click="emit('save')"
        >
          {{ saving ? '⏳' : '💾' }} Зберегти
        </button>
        <button
          v-if="order?.ttn"
          class="btn btn-secondary btn-sm"
          :disabled="loading"
          @click="emit('refresh')"
        >
          {{ loading ? '⏳' : '🔄' }} Оновити
        </button>
      </div>
    </div>

    <div v-if="order?.ttn" class="np-current">
      <code class="np-ttn-code">{{ order.ttn }}</code>
      <button class="btn-icon-sm" title="Копіювати" @click="emit('copy', order.ttn)">📋</button>
      <a
        :href="`https://novaposhta.ua/tracking/?cargo_number=${order.ttn}`"
        target="_blank"
        class="btn-icon-sm"
        title="Відкрити на НП"
      >🔗</a>
    </div>

    <div v-if="loading" class="np-loading">
      <div class="spinner" />
      <span>Завантаження...</span>
    </div>

    <div v-else-if="trackingDetails" class="np-tracking">
      <div class="np-route">
        <div class="np-route-point">
          <span class="np-route-icon">📍</span>
          <div class="np-route-text">
            <strong>{{ trackingDetails.citySender || 'Відправник' }}</strong>
            <small>{{ trackingDetails.warehouseSender }}</small>
          </div>
        </div>
        <div class="np-route-arrow">→</div>
        <div class="np-route-point">
          <span class="np-route-icon">🎯</span>
          <div class="np-route-text">
            <strong>{{ trackingDetails.cityRecipient || 'Отримувач' }}</strong>
            <small>{{ trackingDetails.warehouseRecipient }}</small>
          </div>
        </div>
      </div>

      <div class="np-timeline">
        <div
          v-for="(stage, index) in trackingDetails.stages"
          :key="stage.id"
          class="np-timeline-item"
          :class="`is-${stage.status}`"
        >
          <div class="np-timeline-marker">
            <span>{{ stage.icon }}</span>
          </div>
          <div v-if="index < trackingDetails.stages.length - 1" class="np-timeline-line" />
          <div class="np-timeline-content">
            <div class="np-timeline-title">{{ stage.title }}</div>
            <div v-if="stage.description" class="np-timeline-desc">{{ stage.description }}</div>
          </div>
        </div>
      </div>

      <div v-if="trackingDetails.scheduledDeliveryDate || trackingDetails.documentWeight" class="np-extra">
        <span v-if="trackingDetails.scheduledDeliveryDate">
          📅 {{ trackingDetails.scheduledDeliveryDate }}
        </span>
        <span v-if="trackingDetails.documentWeight">
          ⚖️ {{ trackingDetails.documentWeight }} кг
        </span>
        <span v-if="trackingDetails.announcedPrice">
          💰 {{ trackingDetails.announcedPrice }} ₴
        </span>
      </div>
    </div>

    <div v-else-if="order?.np_status" class="np-simple">
      <div class="np-status-lg" :class="getNpStatusClass(order.np_status_code)">
        {{ order.np_status }}
      </div>
      <small v-if="order.np_last_sync">
        Оновлено: {{ formatDateTime(order.np_last_sync) }}
      </small>
    </div>

    <div v-else-if="!order?.ttn" class="np-empty">
      <span class="np-empty-icon">📭</span>
      <span>Введіть ТТН для відстеження</span>
    </div>
  </section>
</template>

<style scoped>
.np-section {
  background: #f8fafc;
  margin: 0 -24px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.np-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.np-input-group {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.np-input {
  width: 100%;
  padding: 10px 50px 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'SF Mono', Monaco, monospace;
  outline: none;
  transition: border-color 0.2s;
}

.np-input:focus {
  border-color: #3b82f6;
}

.np-input-counter {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #9ca3af;
}

.np-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.np-current {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.np-ttn-code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 15px;
  font-weight: 600;
  color: #1d4ed8;
  background: #dbeafe;
  padding: 4px 10px;
  border-radius: 6px;
}

.btn-icon-sm {
  padding: 2px 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
  text-decoration: none;
}

.btn-icon-sm:hover {
  background: #f3f4f6;
}

.np-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: #6b7280;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.np-tracking {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.np-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  gap: 16px;
}

.np-route-point {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}

.np-route-icon {
  font-size: 20px;
}

.np-route-text {
  display: flex;
  flex-direction: column;
}

.np-route-text strong {
  font-size: 14px;
  color: #1a1a1a;
}

.np-route-text small {
  font-size: 11px;
  color: #6b7280;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-route-arrow {
  font-size: 24px;
  color: #3b82f6;
  flex-shrink: 0;
}

.np-timeline {
  padding: 20px;
}

.np-timeline-item {
  display: flex;
  gap: 12px;
  position: relative;
  padding-bottom: 16px;
}

.np-timeline-item:last-child {
  padding-bottom: 0;
}

.np-timeline-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: #f3f4f6;
  border: 3px solid #e5e7eb;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.np-timeline-line {
  position: absolute;
  left: 18px;
  top: 36px;
  bottom: 0;
  width: 3px;
  background: #e5e7eb;
}

.np-timeline-content {
  padding-top: 6px;
  flex: 1;
}

.np-timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.np-timeline-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.np-timeline-item.is-completed .np-timeline-marker {
  background: #dcfce7;
  border-color: #22c55e;
}

.np-timeline-item.is-completed .np-timeline-line {
  background: #22c55e;
}

.np-timeline-item.is-completed .np-timeline-title {
  color: #16a34a;
}

.np-timeline-item.is-active .np-timeline-marker {
  background: #dbeafe;
  border-color: #3b82f6;
  animation: pulse 2s infinite;
}

.np-timeline-item.is-active .np-timeline-title {
  color: #2563eb;
  font-weight: 600;
}

.np-timeline-item.is-pending .np-timeline-marker {
  opacity: 0.5;
}

.np-timeline-item.is-pending .np-timeline-title {
  color: #9ca3af;
}

.np-timeline-item.is-error .np-timeline-marker {
  background: #fee2e2;
  border-color: #ef4444;
}

.np-timeline-item.is-error .np-timeline-title {
  color: #dc2626;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}

.np-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #6b7280;
}

.np-simple {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.np-status-lg {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
}

.np-delivered { background: #dcfce7; color: #16a34a; }
.np-completed { background: #d1fae5; color: #059669; }
.np-transit { background: #dbeafe; color: #2563eb; }
.np-warehouse { background: #fef3c7; color: #d97706; }
.np-returned { background: #fee2e2; color: #dc2626; }
.np-cancelled { background: #f3f4f6; color: #6b7280; }

.np-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: #9ca3af;
  text-align: center;
}

.np-empty-icon {
  font-size: 32px;
}

@media (max-width: 768px) {
  .np-form {
    flex-direction: column;
  }

  .np-route {
    flex-direction: column;
    text-align: center;
  }

  .np-route-point {
    justify-content: center;
  }

  .np-route-arrow {
    transform: rotate(90deg);
  }

  .np-route-text small {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .np-section {
    margin: 0 -24px;
    padding: 16px;
  }

  .np-timeline-item {
    gap: 8px;
  }

  .np-timeline-marker {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .np-timeline-line {
    left: 16px;
    top: 32px;
  }
}
</style>
