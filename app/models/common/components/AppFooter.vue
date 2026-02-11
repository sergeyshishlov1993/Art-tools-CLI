<script setup lang="ts">
import { useCategoryStore } from '~/models/category/CategoryStore'
import { CONTACTS, SOCIAL_LINKS } from '~/models/common/constants/contacts'
import { ROUTES } from '~/models/common/constants/routes'

const categoryStore = useCategoryStore()
const currentYear = new Date().getFullYear()

const categoryLinks = computed(() => {
  const cats = categoryStore.categories || []
  return cats.slice(0, 6).map(cat => ({
    label: cat.name,
    to: ROUTES.category(cat.id)
  }))
})
</script>

<template>
  <footer class="bg-gray-900 text-white pt-12 pb-6 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">

        <div class="space-y-5">
          <NuxtLink :to="ROUTES.HOME" class="inline-block">
            <span
              class="text-white text-2xl tracking-[0.25em]"
              style="font-family: 'Bebas Neue', sans-serif;"
            >
              ART TOOLS
            </span>
          </NuxtLink>

          <div class="space-y-3">
            <a
              :href="CONTACTS.phoneLink"
              class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
            >
              <UIcon name="heroicons-phone" class="w-4 h-4 text-green-500" />
              <span class="font-medium">{{ CONTACTS.phone }}</span>
            </a>

            <div class="flex items-center gap-3 text-gray-500">
              <UIcon name="heroicons-clock" class="w-4 h-4" />
              <span class="text-sm">{{ CONTACTS.schedule.weekdays }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <a
              v-for="social in SOCIAL_LINKS"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              :title="social.name"
              class="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors group"
            >
              <img
                :src="social.icon"
                :alt="social.name"
                class="w-4 h-4 brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity"
              >
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-white font-semibold mb-4">Каталог</h3>
          <ul class="space-y-2">
            <li v-for="link in categoryLinks" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
            <li class="pt-1">
              <NuxtLink
                :to="ROUTES.CATALOG"
                class="text-green-500 hover:text-green-400 text-sm font-medium inline-flex items-center gap-1"
              >
                Весь каталог
                <UIcon name="heroicons-arrow-right" class="w-3 h-3" />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-white font-semibold mb-4">Оплата</h3>
          <div class="flex gap-2 mb-4">
            <div class="bg-white rounded px-2 py-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                class="h-4 w-auto"
              >
            </div>
            <div class="bg-white rounded px-2 py-1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                class="h-5 w-auto"
              >
            </div>
          </div>
          <p class="text-gray-500 text-xs leading-relaxed mb-4">
            Інтернет-магазин професійного інструменту. Швидка доставка по Україні.
          </p>

          <NuxtLink
            :to="ROUTES.CONTACTS"
            class="text-green-500 hover:text-green-400 text-sm font-medium inline-flex items-center gap-1"
          >
            Всі контакти
            <UIcon name="heroicons-arrow-right" class="w-3 h-3" />
          </NuxtLink>
        </div>
      </div>

      <div class="border-t border-gray-800 pt-6 text-center">
        <p class="text-gray-500 text-sm">
          © 2013 — {{ currentYear }} Art Tools. Всі права захищені.
        </p>
      </div>
    </div>
  </footer>
</template>
