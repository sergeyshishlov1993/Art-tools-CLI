<script setup lang="ts">
import { useNotify } from '../../composables/useNotify'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastColors {
  border: string
  icon: string
  title: string
  desc: string
  bar: string
}

const { toasts, remove } = useNotify()

const icons: Record<ToastType, string> = {
  success: 'heroicons-check-circle-solid',
  error: 'heroicons-x-circle-solid',
  warning: 'heroicons-exclamation-triangle-solid',
  info: 'heroicons-information-circle-solid'
}

const colors: Record<ToastType, ToastColors> = {
  success: {
    border: 'border-green-300',
    icon: 'text-green-500',
    title: 'text-gray-900',
    desc: 'text-gray-600',
    bar: 'bg-green-500'
  },
  error: {
    border: 'border-red-300',
    icon: 'text-red-500',
    title: 'text-gray-900',
    desc: 'text-gray-600',
    bar: 'bg-red-500'
  },
  warning: {
    border: 'border-amber-300',
    icon: 'text-amber-500',
    title: 'text-gray-900',
    desc: 'text-gray-600',
    bar: 'bg-amber-500'
  },
  info: {
    border: 'border-blue-300',
    icon: 'text-blue-500',
    title: 'text-gray-900',
    desc: 'text-gray-600',
    bar: 'bg-blue-500'
  }
}

function getIcon(type: ToastType): string {
  return icons[type] || icons.info
}

function getColors(type: ToastType): ToastColors {
  return colors[type] || colors.info
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-80">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-8"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-8"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="bg-white rounded-xl border shadow-lg overflow-hidden"
          :class="getColors(toast.type).border"
        >
          <div class="p-4">
            <div class="flex items-start gap-3">
              <UIcon
                :name="getIcon(toast.type)"
                class="w-5 h-5 flex-shrink-0 mt-0.5"
                :class="getColors(toast.type).icon"
              />

              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-semibold"
                  :class="getColors(toast.type).title"
                >
                  {{ toast.title }}
                </p>
                <p
                  v-if="toast.description"
                  class="mt-1 text-sm"
                  :class="getColors(toast.type).desc"
                >
                  {{ toast.description }}
                </p>
              </div>

              <button
                class="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
                @click="remove(toast.id)"
              >
                <UIcon name="heroicons-x-mark" class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div class="h-1 bg-gray-100">
            <div
              class="h-full"
              :class="getColors(toast.type).bar"
              style="animation: shrink 4s linear forwards"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
