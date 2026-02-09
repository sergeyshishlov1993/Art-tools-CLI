<script setup lang="ts">
import AdminHeader from '~/models/admin/components/AdminHeader.vue'
import { useAdminStore } from '~/models/admin/AdminStore'
import { useAdminSocket } from '~/models/admin/composables/useAdminSocket'
import { useAuthStore } from '~/models/auth/AuthStore'

const route = useRoute()
const adminStore = useAdminStore()
const authStore = useAuthStore()
const { connect, disconnect, isConnected } = useAdminSocket()

if (import.meta.client) {
  authStore.init()

  if (authStore.isAuthenticated) {
    adminStore.requestNotificationPermission()
    adminStore.fetchCounts()
    connect()
  }
}

onUnmounted(() => {
  disconnect()
})

function handleLogout() {
  disconnect()
  authStore.logout()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AdminHeader @logout="handleLogout" />

    <main class="flex-1">
      <Transition name="page" mode="out-in">
        <div :key="route.fullPath">
          <slot />
        </div>
      </Transition>
    </main>

    <div
      class="fixed bottom-4 right-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border text-xs"
    >
      <span
        class="w-2 h-2 rounded-full"
        :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
      />
      <span class="text-gray-500">
        {{ isConnected ? 'Online' : 'Offline' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>