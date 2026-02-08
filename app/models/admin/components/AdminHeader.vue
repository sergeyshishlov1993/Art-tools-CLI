<script setup lang="ts">
import { useAdminStore } from '~/models/admin/AdminStore'

const route = useRoute()
const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchCounts()
})

const interval = ref<NodeJS.Timeout>()
onMounted(() => {
  interval.value = setInterval(() => {
    adminStore.fetchCounts()
  }, 60000)
})
onUnmounted(() => {
  if (interval.value) clearInterval(interval.value)
})

const navItems = computed(() => [
  {
    label: 'Замовлення',
    icon: 'i-heroicons-shopping-cart',
    to: '/admin/orders',
    badge: adminStore.newOrdersCount
  },
  {
    label: 'Товари',
    icon: 'i-heroicons-cube',
    to: '/admin/products'
  },
  {
    label: 'Категорії',
    icon: 'i-heroicons-folder',
    to: '/admin/categories'
  },
  {
    label: 'Фідбек',
    icon: 'i-heroicons-chat-bubble-left-right',
    to: '/admin/feedback',
    badge: adminStore.newFeedbackCount
  },
  {
    label: 'Імпорт',
    icon: 'i-heroicons-arrow-down-tray',
    to: '/admin/import'
  }
])

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function isActive(item: any) {
  if (item.to === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(item.to)
}

watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<template>
  <header class="bg-gray-900 h-[70px] sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 h-full">
      <div class="flex items-center justify-between h-full">

        <NuxtLink to="/" class="flex-shrink-0">
          <span
            class="text-white text-2xl lg:text-3xl tracking-[0.25em]"
            style="font-family: 'Bebas Neue', sans-serif; font-weight: 400;"
          >
            ART TOOLS
          </span>
        </NuxtLink>

        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item)
              ? 'bg-green-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
          >
            <UIcon :name="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>

            <span
              v-if="item.badge && item.badge > 0"
              class="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-4">
          <NuxtLink
            to="/"
            target="_blank"
            class="hidden md:flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
            <span class="text-sm">На сайт</span>
          </NuxtLink>

          <div class="hidden sm:flex items-center gap-2 pl-4 border-l border-gray-700">
            <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-white" />
            </div>
            <span class="text-sm font-medium text-gray-300">Admin</span>
          </div>

          <button
            class="lg:hidden text-gray-400 hover:text-white transition-colors relative"
            @click="toggleMobileMenu"
          >
            <UIcon
              :name="isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
              class="w-6 h-6"
            />
            <span
              v-if="(adminStore.newOrdersCount + adminStore.newFeedbackCount) > 0"
              class="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
            >
              {{ adminStore.newOrdersCount + adminStore.newFeedbackCount }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/50 z-[60] lg:hidden"
        @click="closeMobileMenu"
      />
    </Transition>

    <Transition name="slide">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-y-0 right-0 w-72 bg-gray-900 z-[70] lg:hidden flex flex-col"
      >
        <div class="flex items-center justify-between p-4 border-b border-gray-800">
          <span class="text-white font-medium">Меню</span>
          <button
            class="p-2 text-gray-400 hover:text-white transition-colors"
            @click="closeMobileMenu"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-4 font-medium text-sm tracking-wide transition-colors border-b border-gray-800"
            :class="isActive(item)
              ? 'bg-green-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
            @click="closeMobileMenu"
          >
            <UIcon :name="item.icon" class="w-5 h-5" />
            <span class="flex-1">{{ item.label }}</span>

            <span
              v-if="item.badge && item.badge > 0"
              class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </NuxtLink>
        </nav>

        <div class="p-4 border-t border-gray-800 space-y-3">
          <NuxtLink
            to="/"
            target="_blank"
            class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
            @click="closeMobileMenu"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-5 h-5" />
            <span>Перейти на сайт</span>
          </NuxtLink>

          <div class="flex items-center gap-3 pt-3 border-t border-gray-800">
            <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-white" />
            </div>
            <span class="text-sm font-medium text-gray-300">Admin</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
  transform: translateX(100%);
}
</style>