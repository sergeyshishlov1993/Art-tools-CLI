<script setup lang="ts">
import { reactive, computed } from 'vue'
import BInput from '~/models/common/components/ui/BInput.vue'
import BBtn from '~/models/common/components/ui/BBtn.vue'
import { useFeedbackStore } from '~/models/feedback/FeedbackStore'
import { useNotify } from '~/models/common/composables/useNotify'

const feedbackStore = useFeedbackStore()
const notify = useNotify()

const form = reactive({
  name: '',
  phone: '',
})

const isPhoneValid = computed(() => form.phone.length === 19)
const isFormValid = computed(() => form.name.trim() && isPhoneValid.value)

async function handleSubmit() {
  if (!isFormValid.value) {
    notify.warning('Заповніть форму', 'Введіть ім\'я та телефон')
    return
  }

  const success = await feedbackStore.createFeedback({
    name: form.name.trim(),
    phone: form.phone
  })

  if (success) {
    notify.success('Заявку надіслано!', 'Ми зателефонуємо вам найближчим часом')
    form.name = ''
    form.phone = ''
  } else {
    notify.error('Помилка', 'Не вдалося надіслати заявку. Спробуйте ще раз.')
  }
}
</script>

<template>
  <section class="bg-gray-800 rounded-2xl p-8 lg:p-12">
    <div class="max-w-4xl mx-auto">
      <div class="lg:flex lg:items-center lg:justify-between lg:gap-12">
        <div class="text-white mb-8 lg:mb-0 lg:flex-1">
          <h2 class="text-2xl lg:text-3xl font-bold mb-3">
            Залишились питання?
          </h2>
          <p class="text-gray-300 text-lg mb-4">
            Наші менеджери з радістю проконсультують вас
          </p>
          <div class="flex items-center gap-3 text-gray-400">
            <UIcon name="i-heroicons-clock" class="w-5 h-5" />
            <span>Передзвонимо протягом 15 хвилин</span>
          </div>
        </div>

        <div class="lg:flex-1">
          <form
            class="bg-white rounded-xl p-6 shadow-xl"
            @submit.prevent="handleSubmit"
          >
            <div class="space-y-4">
              <BInput
                v-model="form.name"
                placeholder="Ваше ім'я"
                icon="i-heroicons-user"
                required
              />

              <BInput
                v-model="form.phone"
                mask="phone"
                icon="i-heroicons-phone"
                required
              />

              <BBtn
                type="submit"
                variant="primary"
                size="lg"
                block
                :loading="feedbackStore.submitting"
                :disabled="!isFormValid"
                icon="i-heroicons-phone"
              >
                Зателефонуйте мені
              </BBtn>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>