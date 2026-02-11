<script setup lang="ts">
import { CONTACTS, SOCIAL_LINKS } from '~/models/common/constants/contacts'
import { QUICK_LINKS } from '~/models/common/constants/routes'

useHead({
  title: 'Контакти',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <!-- Заголовок -->
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Контакти
        </h1>
        <p class="text-gray-500">
          Зв'яжіться з нами зручним способом
        </p>
      </div>

      <!-- Телефон -->
      <a
        :href="CONTACTS.phoneLink"
        class="block bg-white rounded-2xl border-2 border-green-200 p-6 mb-6 text-center hover:border-green-400 hover:shadow-lg transition-all group"
      >
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <UIcon name="heroicons-phone" class="w-8 h-8 text-white" />
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
          {{ CONTACTS.phoneFormatted }}
        </div>
        <div class="text-gray-500 text-sm">
          Натисніть, щоб зателефонувати
        </div>
      </a>

      <!-- Месенджери -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-700 mb-4 px-1">
          Месенджери
        </h2>
        <div class="grid gap-3">
          <a
            v-for="contact in SOCIAL_LINKS"
            :key="contact.name"
            :href="contact.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 bg-white rounded-xl border-2 p-4 transition-all group"
            :class="contact.color"
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
              :class="contact.iconBg"
            >
              <img
                :src="contact.icon"
                :alt="contact.name"
                class="w-6 h-6 brightness-0 invert"
              >
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-800">
                {{ contact.name }}
              </div>
              <div class="text-sm text-gray-500 truncate">
                {{ contact.label }}
              </div>
            </div>
            <UIcon
              name="heroicons-arrow-top-right-on-square"
              class="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0"
            />
          </a>
        </div>
      </div>

      <!-- Швидкі посилання -->
      <div>
        <h2 class="text-lg font-semibold text-gray-700 mb-4 px-1">
          Швидкі посилання
        </h2>
        <div class="grid gap-3">
          <NuxtLink
            v-for="item in QUICK_LINKS"
            :key="item.name"
            :to="item.to"
            class="flex items-center gap-4 bg-white rounded-xl border-2 p-4 transition-all group"
            :class="item.color"
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
              :class="item.iconBg"
            >
              <UIcon :name="item.icon" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-800">
                {{ item.name }}
              </div>
            </div>
            <UIcon
              name="heroicons-chevron-right"
              class="w-5 h-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Графік роботи -->
      <div class="mt-8 bg-white rounded-xl border border-gray-200 p-6 text-center">
        <UIcon name="heroicons-clock" class="w-8 h-8 text-green-500 mx-auto mb-3" />
        <h3 class="font-semibold text-gray-800 mb-2">Графік роботи</h3>
        <p class="text-gray-600">{{ CONTACTS.schedule.weekdays }}</p>
        <p class="text-gray-600">{{ CONTACTS.schedule.saturday }}</p>
        <p class="text-gray-500 text-sm">{{ CONTACTS.schedule.sunday }}</p>
      </div>
    </div>
  </div>
</template>