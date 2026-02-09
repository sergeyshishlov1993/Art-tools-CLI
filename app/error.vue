<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error.statusCode === 404)

const title = computed(() => {
  if (isNotFound.value) return 'Сторінку не знайдено'
  return 'Щось пішло не так'
})

const message = computed(() => {
  if (isNotFound.value) {
    return 'Схоже, ця сторінка не існує або була переміщена.'
  }
  return props.error.message || 'Сталася помилка. Спробуйте пізніше.'
})

const icon = computed(() => {
  if (isNotFound.value) return 'i-heroicons-magnifying-glass'
  return 'i-heroicons-exclamation-triangle'
})

function goHome() {
  clearError({ redirect: '/' })
}

function goBack() {
  if (import.meta.client) {
    window.history.back()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full text-center">
      <div class="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm">
        <div
          class="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
          :class="isNotFound ? 'bg-gray-100' : 'bg-red-50'"
        >
          <UIcon
            :name="icon"
            class="w-12 h-12 sm:w-16 sm:h-16"
            :class="isNotFound ? 'text-gray-400' : 'text-red-400'"
          />
        </div>

        <h1
          class="text-6xl sm:text-7xl font-bold mb-2"
          :class="isNotFound ? 'text-gray-200' : 'text-red-200'"
        >
          {{ error.statusCode }}
        </h1>

        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
          {{ title }}
        </h2>

        <p class="text-gray-500 mb-8">
          {{ message }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            class="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            @click="goHome"
          >
            <UIcon name="i-heroicons-home" class="w-5 h-5" />
            На головну
          </button>

          <button
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            @click="goBack"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
            Назад
          </button>
        </div>
      </div>

      <div class="mt-8 space-y-4">
        <p class="text-sm text-gray-500">Можливо, вас зацікавить:</p>
        <div class="flex flex-wrap justify-center gap-2">
          <NuxtLink
            to="/catalog"
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
          >
            Каталог
          </NuxtLink>
          <NuxtLink
            to="/sale"
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
          >
            Акції
          </NuxtLink>
          <NuxtLink
            to="/contacts"
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
          >
            Контакти
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
