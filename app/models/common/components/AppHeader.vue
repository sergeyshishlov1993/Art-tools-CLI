<script setup lang="ts">
import { useCartStore } from '~/models/cart/CartStore'
import { CONTACTS } from '~/models/common/constants/contacts'
import { ROUTES, NAV_ITEMS, MOBILE_NAV_ITEMS } from '~/models/common/constants/routes'

const route = useRoute()
const cartStore = useCartStore()

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function isActive(item: typeof NAV_ITEMS[number] | typeof MOBILE_NAV_ITEMS[number]): boolean {
  if (item.to === ROUTES.HOME) {
    return route.path === ROUTES.HOME
  }

  if (item.to === ROUTES.CART) {
    return route.path === ROUTES.CART
  }

  if (item.to.includes('?')) {
    const parts = item.to.split('?')
    const path = parts[0] ?? ''
    const queryString = parts[1] ?? ''
    const queryParts = queryString.split('=')
    const key = queryParts[0] ?? ''
    const value = queryParts[1] ?? ''

    return route.path.startsWith(path) && route.query[key] === value
  }

  if (item.to === ROUTES.CATALOG) {
    return route.path.startsWith(ROUTES.CATALOG) &&
        !route.query.sale &&
        !route.query.bestseller
  }

  return route.path.startsWith(item.to)
}

watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<template>
  <header class="bg-gray-900 h-[70px]">
    <div class="max-w-7xl mx-auto px-4 lg:px-8 h-full">
      <div class="flex items-center justify-between h-full">

        <!-- Logo -->
        <NuxtLink :to="ROUTES.HOME" class="flex-shrink-0">
          <span
            class="text-white text-2xl lg:text-3xl tracking-[0.25em]"
            style="font-family: 'Bebas Neue', sans-serif; font-weight: 400;"
          >
            ART TOOLS
          </span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-1">
          <NuxtLink
            v-for="item in NAV_ITEMS"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="[
              isActive(item)
                ? 'bg-green-600 text-white'
                : item.highlight
                  ? 'text-red-500 hover:bg-gray-800 hover:text-red-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <UIcon :name="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-4">
          <a
            :href="CONTACTS.phoneLink"
            class="hidden md:flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <UIcon name="i-heroicons-phone" class="w-4 h-4 text-green-500" />
            <span class="text-sm font-medium">{{ CONTACTS.phone }}</span>
          </a>

          <NuxtLink
            :to="ROUTES.CART"
            class="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors relative"
          >
            <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5" />
            <span
              v-if="cartStore.totalQuantity > 0"
              class="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-green-500 text-white text-xs font-bold rounded-full px-1"
            >
              {{ cartStore.totalQuantity > 99 ? '99+' : cartStore.totalQuantity }}
            </span>
          </NuxtLink>

          <button
            class="lg:hidden text-gray-400 hover:text-white transition-colors"
            @click="toggleMobileMenu"
          >
            <UIcon
              :name="isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
              class="w-6 h-6"
            />
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Menu -->
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
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-800">
          <span class="text-white font-medium">Меню</span>
          <button
            class="p-2 text-gray-400 hover:text-white transition-colors"
            @click="closeMobileMenu"
          >
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto">
          <NuxtLink
            v-for="item in MOBILE_NAV_ITEMS"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-4 py-4 font-medium text-sm tracking-wide transition-colors border-b border-gray-800"
            :class="[
              isActive(item)
                ? 'bg-green-600 text-white'
                : item.highlight
                  ? 'text-red-500 hover:bg-gray-800 hover:text-red-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            ]"
            @click="closeMobileMenu"
          >
            <UIcon :name="item.icon" class="w-5 h-5" />
            <span class="flex-1">{{ item.label }}</span>

            <!-- Cart badge -->
            <span
              v-if="item.to === ROUTES.CART && cartStore.totalQuantity > 0"
              class="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
            >
              {{ cartStore.totalQuantity > 99 ? '99+' : cartStore.totalQuantity }}
            </span>
          </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="p-4 mb-10 border-t border-gray-800">
          <a
            :href="CONTACTS.phoneLink"
            class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
          >
            <UIcon name="i-heroicons-phone" class="w-5 h-5 text-green-500" />
            <span class="font-medium">{{ CONTACTS.phone }}</span>
          </a>
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