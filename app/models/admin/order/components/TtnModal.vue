Крок 10: pages/admin/orders/components/TtnModal.vue
<script setup lang="ts">
import type { Order } from '~/models/admin/types/Orders'

interface Props {
  isOpen: boolean
  order: Order | null
  ttn: string
  saving: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:ttn': [value: string]
  'close': []
  'save': []
}>()

function onTtnInput(e: Event) {
  const value = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  emit('update:ttn', value)
}

function onSave() {
  emit('save')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
        <Transition name="modal-slide">
          <div v-if="isOpen" class="modal-container">
            <header class="modal-header">
              <h2 class="modal-title">📦 Додати ТТН</h2>
              <button class="modal-close" aria-label="Закрити" @click="emit('close')">×</button>
            </header>

            <div class="modal-body">
              <div class="order-info">
                <span class="order-label">Замовлення:</span>
                <span class="order-number">#{{ order?.order_number || order?.order_id?.slice(0, 8) }}</span>
              </div>

              <div class="customer-info">
                <span>{{ order?.name }} {{ order?.second_name }}</span>
                <span class="customer-phone">{{ order?.phone }}</span>
              </div>

              <div class="ttn-field">
                <label class="ttn-label" for="ttn-input">Номер ТТН</label>
                <div class="ttn-input-wrapper">
                  <input
                    id="ttn-input"
                    type="text"
                    class="ttn-input"
                    :value="ttn"
                    placeholder="20450000000000"
                    maxlength="14"
                    inputmode="numeric"
                    autocomplete="off"
                    @input="onTtnInput"
                    @keyup.enter="ttn.length === 14 && onSave()"
                  >
                  <span class="ttn-counter" :class="{ 'ttn-counter-ready': ttn.length === 14 }">
                    {{ ttn.length }}/14
                  </span>
                </div>
                <p class="ttn-hint">Введіть 14-значний номер накладної Нової Пошти</p>
              </div>
            </div>

            <footer class="modal-footer">
              <button class="btn btn-secondary" @click="emit('close')">Скасувати</button>
              <button
                class="btn btn-primary"
                :disabled="ttn.length !== 14 || saving"
                @click="onSave"
              >
                {{ saving ? '⏳ Збереження...' : '💾 Зберегти' }}
              </button>
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
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
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
}

.modal-close:hover {
  background: #fee2e2;
  color: #dc2626;
}

.modal-body {
  padding: 24px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.order-label {
  font-size: 13px;
  color: #6b7280;
}

.order-number {
  font-weight: 600;
  color: #1d4ed8;
  background: #dbeafe;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, monospace;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.customer-info span:first-child {
  font-weight: 500;
  color: #1a1a1a;
}

.customer-phone {
  font-size: 13px;
  color: #6b7280;
}

.ttn-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ttn-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.ttn-input-wrapper {
  position: relative;
}

.ttn-input {
  width: 100%;
  padding: 14px 60px 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 18px;
  font-family: 'SF Mono', Monaco, monospace;
  letter-spacing: 1px;
  outline: none;
  transition: border-color 0.2s;
}

.ttn-input:focus {
  border-color: #3b82f6;
}

.ttn-input::placeholder {
  color: #d1d5db;
}

.ttn-counter {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.2s;
}

.ttn-counter-ready {
  color: #22c55e;
  font-weight: 600;
}

.ttn-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
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
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
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

@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
  }

  .modal-backdrop {
    padding: 10px;
  }

  .ttn-input {
    font-size: 16px;
    padding: 12px 50px 12px 14px;
  }
}
</style>