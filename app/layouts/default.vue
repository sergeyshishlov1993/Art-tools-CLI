<script setup lang="ts">
import AppHeader from '~/models/common/components/AppHeader.vue'
import AppFooter from '~/models/common/components/AppFooter.vue'
import CategoryBar from '~/models/category/components/CategoryBar.vue'
import AppQuickContact from '~/models/common/components/AppQuickContact.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="sticky top-0 z-50">
      <AppHeader />
      <CategoryBar />
    </div>

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
    <AppQuickContact/>
  </div>
</template>
