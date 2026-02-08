<script setup lang="ts">
import BBtn from '~/models/common/components/ui/BBtn.vue'

defineProps<{
  totalQuantity: number
  totalPrice: number
  loading: boolean
  disabled: boolean
}>()

const emit = defineEmits(['submit'])

function formatPrice(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<template>
  <div class="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
    <h3 class="text-lg font-bold text-gray-800 mb-4">Разом</h3>

    <div class="space-y-3 mb-6 border-b border-gray-100 pb-6">
      <div class="flex justify-between text-gray-600">
        <span>Кількість товарів:</span>
        <span>{{ totalQuantity }} шт.</span>
      </div>
      <div class="flex justify-between text-gray-600">
        <span>Доставка:</span>
        <span class="text-xs">За тарифами перевізника</span>
      </div>
    </div>

    <div class="flex justify-between items-center mb-6">
      <span class="text-lg font-bold text-gray-800">До сплати:</span>
      <span class="text-2xl font-bold text-green-600 whitespace-nowrap">{{ formatPrice(totalPrice) }} грн</span>
    </div>

    <BBtn
      variant="primary"
      class="w-full py-4 text-lg"
      :loading="loading"
      :disabled="disabled"
      @click="emit('submit')"
    >
      Оформити замовлення
    </BBtn>

    <div class="mt-4 text-xs text-gray-400 text-center">
      Натискаючи кнопку, ви погоджуєтесь з умовами публічної оферти
    </div>
  </div>
</template>