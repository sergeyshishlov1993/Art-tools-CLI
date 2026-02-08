<script setup lang="ts">
import { useCategoryStore } from '~/models/category/CategoryStore'
import BToasts from '~/models/common/components/ui/BToasts.vue'

const categoryStore = useCategoryStore()
const route = useRoute()

const { data: categories } = await useAsyncData(
  'categories',
  () => categoryStore.fetchActive(),
  {
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    },
    default: () => [],
  }
)

watch(() => route.fullPath, () => {
  if (import.meta.client) {
    window.dispatchEvent(new Event('route-change'))
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <BToasts />
</template>