<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  message?: string
  icon?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'danger' | 'warning' | 'success' | 'primary'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Підтвердження',
  message: 'Ви впевнені?',
  icon: '⚠️',
  confirmText: 'Підтвердити',
  cancelText: 'Скасувати',
  confirmColor: 'danger',
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

function close() {
  if (!props.loading) {
    emit('update:modelValue', false)
    emit('cancel')
  }
}

function confirm() {
  emit('confirm')
}

// Закриття по Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.loading) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

const confirmBtnClass = computed(() => {
  const colors = {
    danger: 'btn-danger',
    warning: 'btn-warning',
    success: 'btn-success',
    primary: 'btn-primary'
  }
  return colors[props.confirmColor]
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="close"
      >
        <div class="modal-container">
          <button
            v-if="!loading"
            class="modal-close"
            @click="close"
          >
            ✕
          </button>

          <div class="modal-icon">{{ icon }}</div>

          <h3 class="modal-title">{{ title }}</h3>

          <p class="modal-message">
            <slot>{{ message }}</slot>
          </p>

          <div class="modal-actions">
            <button
              class="btn btn-cancel"
              :disabled="loading"
              @click="close"
            >
              {{ cancelText }}
            </button>
            <button
              class="btn"
              :class="confirmBtnClass"
              :disabled="loading"
              @click="confirm"
            >
              <span v-if="loading" class="spinner-small" />
              {{ confirmText }}
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
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-container {
  position: relative;
  padding: 32px;
  text-align: center;
  background: white;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #1a1a1a;
}

.modal-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.modal-message {
  color: #6b7280;
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Spinner */
.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .modal-container {
    padding: 24px 20px;
    margin: 16px;
  }

  .modal-icon {
    font-size: 48px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
