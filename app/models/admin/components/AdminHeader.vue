<script setup lang="ts">
import { useAdminStore } from '~/models/admin/AdminStore'
import { useAuthStore } from '~/models/auth/AuthStore'

const route = useRoute()
const adminStore = useAdminStore()
const authStore = useAuthStore()

const interval = ref<ReturnType<typeof setInterval>>()

onMounted(() => {
  authStore.init()
  adminStore.fetchCounts()
  interval.value = setInterval(() => {
    adminStore.fetchCounts()
  }, 60000)
})

onUnmounted(() => {
  if (interval.value) clearInterval(interval.value)
})

interface NavItem {
  label: string
  icon: string
  to: string
  badge?: number
}

const navItems = computed<NavItem[]>(() => [
  {
    label: 'Замовлення',
    icon: 'heroicons-shopping-cart',
    to: '/admin/orders',
    badge: adminStore.newOrdersCount
  },
  {
    label: 'Товари',
    icon: 'heroicons-cube',
    to: '/admin/products'
  },
  {
    label: 'Категорії',
    icon: 'heroicons-folder',
    to: '/admin/categories'
  },
  {
    label: 'Фідбек',
    icon: 'heroicons-chat-bubble-left-right',
    to: '/admin/feedback',
    badge: adminStore.newFeedbackCount
  },
  {
    label: 'Імпорт',
    icon: 'heroicons-arrow-down-tray',
    to: '/admin/import'
  }
])

const isMobileMenuOpen = ref(false)
const showUserMenu = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function isActive(item: NavItem) {
  if (item.to === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(item.to)
}

async function handleLogout() {
  closeMobileMenu()
  showUserMenu.value = false
  await authStore.logout()
}

watch(() => route.path, () => {
  closeMobileMenu()
  showUserMenu.value = false
})
</script>

<template>
  <header class="bg-gray-900 h-[70px] sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 h-full">
      <div class="flex items-center justify-between h-full">
        <NuxtLink to="/admin/orders" class="flex-shrink-0">
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
            <UIcon name="heroicons-arrow-top-right-on-square" class="w-4 h-4" />
            <span class="text-sm">На сайт</span>
          </NuxtLink>

          <div class="hidden sm:block relative pl-4 border-l border-gray-700">
            <button
              class="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors"
              @click="showUserMenu = !showUserMenu"
            >
              <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <UIcon name="heroicons-user" class="w-4 h-4 text-white" />
              </div>
              <span class="text-sm font-medium text-gray-300">
                {{ authStore.admin?.name || 'Admin' }}
              </span>
              <UIcon
                name="heroicons-chevron-down"
                class="w-4 h-4 text-gray-400 transition-transform"
                :class="{ 'rotate-180': showUserMenu }"
              />
            </button>

            <Transition name="dropdown">
              <div
                v-if="showUserMenu"
                class="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-50"
              >
                <div class="px-4 py-3 border-b border-gray-700">
                  <p class="text-sm font-medium text-white">{{ authStore.admin?.name }}</p>
                  <p class="text-xs text-gray-400">{{ authStore.admin?.role }}</p>
                </div>
                <button
                  class="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  @click="handleLogout"
                >
                  <UIcon name="heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
                  Вийти
                </button>
              </div>
            </Transition>
          </div>

          <button
            class="lg:hidden text-gray-400 hover:text-white transition-colors relative"
            @click="toggleMobileMenu"
          >
            <UIcon
              :name="isMobileMenuOpen ? 'heroicons-x-mark' : 'heroicons-bars-3'"
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

    <div
      v-if="showUserMenu"
      class="fixed inset-0 z-40"
      @click="showUserMenu = false"
    />
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
            <UIcon name="heroicons-x-mark" class="w-6 h-6" />
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
            <UIcon name="heroicons-arrow-top-right-on-square" class="w-5 h-5" />
            <span>Перейти на сайт</span>
          </NuxtLink>

          <div class="flex items-center gap-3 pt-3 border-t border-gray-800">
            <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <UIcon name="heroicons-user" class="w-4 h-4 text-white" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-300">{{ authStore.admin?.name || 'Admin' }}</p>
              <p class="text-xs text-gray-500">{{ authStore.admin?.role || 'admin' }}</p>
            </div>
          </div>

          <button
            class="w-full flex items-center justify-center gap-2 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            @click="handleLogout"
          >
            <UIcon name="heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
            <span>Вийти</span>
          </button>
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

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>