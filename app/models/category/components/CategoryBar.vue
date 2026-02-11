<script setup lang="ts">
import { useCategoryStore } from '~/models/category/CategoryStore'
import { ROUTES } from '~/models/common/constants/routes'
import SearchDropdown from '~/models/search/components/SearchDropdown.vue'
import MobileSearchModal from '~/models/search/components/MobileSearchModal.vue'
import BBtn from '~/models/common/components/ui/BBtn.vue'

const categoryStore = useCategoryStore()

const isOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isMobileSearchOpen = ref(false)
const activeCategory = ref<string | null>(null)
const searchQuery = ref('')
const isSearchOpen = ref(false)

const categories = computed(() =>
  categoryStore.categoriesWithIcons.map(cat => ({
    ...cat,
    to: ROUTES.category(cat.id),
    subcategories: categoryStore.getSubcategories(cat.id).map(sub => ({
      ...sub,
      to: ROUTES.subcategory(cat.id, sub.id)
    }))
  }))
)

function getIconPath(categoryId: string): string {
  return `/icons/catalog/icon-${categoryId}.svg`
}

function openDropdown() {
  isOpen.value = true
}

function closeDropdown() {
  isOpen.value = false
  activeCategory.value = null
}

function setActiveCategory(id: string) {
  activeCategory.value = id
}

function toggleMobileCategory(id: string) {
  activeCategory.value = activeCategory.value === id ? null : id
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
  activeCategory.value = null
}

const activeSubcategories = computed(() => {
  if (!activeCategory.value) return []
  return categories.value.find(c => c.id === activeCategory.value)?.subcategories || []
})

const route = useRoute()
watch(() => route.path, () => {
  closeDropdown()
  closeMobileMenu()
})
</script>

<template>
  <div class="bg-gray-100 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="flex items-center gap-4 h-14">
        <div
          class="relative hidden lg:block"
          @mouseenter="openDropdown"
          @mouseleave="closeDropdown"
        >
          <BBtn
            variant="primary"
            icon="i-heroicons-bars-3"
            :icon-right="isOpen ? 'i-heroicons-chevron-up' : 'heroicons:chevron-down-20-solid'"
          >
            Каталог товарів
          </BBtn>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <div
              v-if="isOpen"
              class="absolute top-full left-0 pt-2 flex z-50"
            >
              <div class="bg-white rounded-lg shadow-2xl w-80 py-2 border border-gray-200">
                <NuxtLink
                  v-for="category in categories"
                  :key="category.id"
                  :to="category.to"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                  @mouseenter="setActiveCategory(category.id)"
                >
                  <div
                    class="w-6 h-6 bg-green-600 group-hover:bg-green-700 transition-colors"
                    :style="{
                      mask: `url(${getIconPath(category.id)}) no-repeat center / contain`,
                      '-webkit-mask': `url(${getIconPath(category.id)}) no-repeat center / contain`
                    }"
                  />
                  <span class="flex-1 text-sm font-medium">{{ category.name }}</span>
                  <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-400" />
                </NuxtLink>
              </div>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 -translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 -translate-x-2"
              >
                <div
                  v-if="activeCategory && activeSubcategories.length"
                  class="bg-white rounded-lg shadow-2xl w-72 py-2 ml-1 border border-gray-200"
                >
                  <NuxtLink
                    v-for="sub in activeSubcategories"
                    :key="sub.id"
                    :to="sub.to"
                    class="flex items-start justify-between px-4 py-2.5 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    <span>{{ sub.name }}</span>
                    <span class="text-xs text-gray-400">({{ sub.products_count }})</span>
                  </NuxtLink>
                </div>
              </Transition>
            </div>
          </Transition>
        </div>

        <BBtn
          class="lg:hidden"
          variant="primary"
          icon="i-heroicons-bars-3"
          @click="isMobileMenuOpen = true"
        >
          Каталог
        </BBtn>

        <div class="hidden lg:block flex-1 max-w-2xl">
          <SearchDropdown
            v-model="searchQuery"
            v-model:is-open="isSearchOpen"
          />
        </div>

        <button
          class="lg:hidden flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-500 text-sm"
          @click="isMobileSearchOpen = true"
        >
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
          <span>Пошук товарів...</span>
        </button>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="closeMobileMenu"
      />
    </Transition>

    <Transition name="slide">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 lg:hidden overflow-y-auto mt-[120px]"
      >
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 class="font-bold text-gray-800">Каталог товарів</h3>
          <button
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            @click="closeMobileMenu"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="divide-y divide-gray-100">
          <div
            v-for="category in categories"
            :key="category.id"
          >
            <button
              class="w-full flex items-center gap-3 px-4 py-3 text-left"
              @click="toggleMobileCategory(category.id)"
            >
              <div
                class="w-6 h-6 bg-green-600"
                :style="{
                  mask: `url(${getIconPath(category.id)}) no-repeat center / contain`,
                  '-webkit-mask': `url(${getIconPath(category.id)}) no-repeat center / contain`
                }"
              />
              <span class="flex-1 text-sm font-medium text-gray-700">{{ category.name }}</span>
              <UIcon
                name="i-heroicons-chevron-down"
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': activeCategory === category.id }"
              />
            </button>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-screen opacity-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="max-h-screen opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-if="activeCategory === category.id"
                class="overflow-hidden bg-gray-50"
              >
                <NuxtLink
                  :to="category.to"
                  class="block px-4 py-2.5 pl-14 text-sm font-medium text-green-600 hover:bg-green-50"
                  @click="closeMobileMenu"
                >
                  Дивитись все
                </NuxtLink>
                <NuxtLink
                  v-for="sub in category.subcategories"
                  :key="sub.id"
                  :to="sub.to"
                  class="flex items-start justify-between px-4 py-2.5 pl-14 pr-4 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700"
                  @click="closeMobileMenu"
                >
                  <span>{{ sub.name }}</span>
                  <span class="text-xs text-gray-400">{{ sub.products_count }}</span>
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <MobileSearchModal v-model="isMobileSearchOpen" />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>