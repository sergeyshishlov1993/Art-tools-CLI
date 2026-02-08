<script setup lang="ts">
import { useCategoryStore } from '~/models/category/CategoryStore'
import { ROUTES } from '~/models/common/constants/routes'
import BBtn from '~/models/common/components/ui/BBtn.vue'

const categoryStore = useCategoryStore()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)

const categories = computed(() =>
  categoryStore.categoriesWithIcons.map(cat => ({
    ...cat,
    to: ROUTES.category(cat.id)
  }))
)

function getIconPath(categoryId: string): string {
  return `/icons/catalog/icon-${categoryId}.svg`
}

function updateScrollState() {
  if (!scrollContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
}

function scroll(direction: 'left' | 'right') {
  if (!scrollContainer.value) return
  const scrollAmount = 300
  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })
}

onMounted(() => {
  updateScrollState()
})
</script>

<template>
  <div class="relative">
    <div
      v-show="canScrollLeft"
      class="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10"
    >
      <BBtn
        variant="outline"
        size="sm"
        icon="i-heroicons-chevron-left"
        class="!rounded-full !p-2 shadow-lg"
        @click="scroll('left')"
      />
    </div>

    <div
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      @scroll="updateScrollState"
    >
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="category.to"
        class="flex-shrink-0 w-40 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all group"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <div class="w-14 h-14 flex items-center justify-center bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
            <img
              :src="getIconPath(category.id)"
              :alt="category.name"
              class="w-7 h-7"
            >
          </div>
          <span class="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">
            {{ category.name }}
          </span>
        </div>
      </NuxtLink>
    </div>

    <div
      v-show="canScrollRight"
      class="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10"
    >
      <BBtn
        variant="outline"
        size="sm"
        icon="i-heroicons-chevron-right"
        class="!rounded-full !p-2 shadow-lg"
        @click="scroll('right')"
      />
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>