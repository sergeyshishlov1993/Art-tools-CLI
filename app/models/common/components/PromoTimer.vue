<script setup lang="ts">
import { usePromoTimer } from '~/models/common/composables/usePromoTimer'

interface Props {
  productId: string
}

const props = defineProps<Props>()

const { timeLeft, isActive, isExpired } = usePromoTimer(props.productId)

function padZero(num: number): string {
  return num.toString().padStart(2, '0')
}
</script>

<template>
  <div v-if="isActive && !isExpired" class="mt-4 pl-4">
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-heroicons-clock" class="w-5 h-5 text-orange-500" />
      <span class="text-sm font-medium text-orange-700">
        Акційна ціна закінчується через:
      </span>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
          <span class="text-lg sm:text-xl font-bold text-white tabular-nums">{{ padZero(timeLeft.days) }}</span>
        </div>
        <span class="text-[10px] text-orange-600 uppercase mt-1.5 font-medium">днів</span>
      </div>

      <span class="text-orange-300 font-bold text-2xl -mt-5">:</span>

      <div class="flex flex-col items-center">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
          <span class="text-lg sm:text-xl font-bold text-white tabular-nums">{{ padZero(timeLeft.hours) }}</span>
        </div>
        <span class="text-[10px] text-orange-600 uppercase mt-1.5 font-medium">год</span>
      </div>

      <span class="text-orange-300 font-bold text-2xl -mt-5">:</span>

      <div class="flex flex-col items-center">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
          <span class="text-lg sm:text-xl font-bold text-white tabular-nums">{{ padZero(timeLeft.minutes) }}</span>
        </div>
        <span class="text-[10px] text-orange-600 uppercase mt-1.5 font-medium">хв</span>
      </div>

      <span class="text-orange-300 font-bold text-2xl -mt-5">:</span>

      <div class="flex flex-col items-center">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-md timer-pulse">
          <span class="text-lg sm:text-xl font-bold text-white tabular-nums">{{ padZero(timeLeft.seconds) }}</span>
        </div>
        <span class="text-[10px] text-orange-600 uppercase mt-1.5 font-medium">сек</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-pulse {
  animation: timer-glow 1s ease-in-out infinite;
}

@keyframes timer-glow {
  0%, 100% {
    box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.6);
  }
}
</style>