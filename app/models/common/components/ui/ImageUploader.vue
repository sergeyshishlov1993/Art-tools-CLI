<script setup lang="ts">
import { useImageUpload } from '~/models/common/composables/useImageUpload'

const props = defineProps<{
  modelValue: string[]
  max?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const { uploadImage, uploading, error, progress, getOptimizedUrl } = useImageUpload()
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

const images = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function openFilePicker() {
  fileInput.value?.click()
}

async function handleFiles(files: FileList | null) {
  if (!files) return

  const maxCount = props.max || 10
  const remaining = maxCount - images.value.length

  if (remaining <= 0) return

  for (const file of Array.from(files).slice(0, remaining)) {
    const url = await uploadImage(file)
    if (url) {
      images.value = [...images.value, url]
    }
  }
}

function handleInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  handleFiles(input.files)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  dragOver.value = false
  handleFiles(event.dataTransfer?.files || null)
}

function removeImage(index: number) {
  images.value = images.value.filter((_, i) => i !== index)
}

function getThumbnail(url: string) {
  return getOptimizedUrl(url, { width: 200, height: 200 })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Drop zone -->
    <div
      class="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
      :class="[
        dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
        uploading ? 'pointer-events-none opacity-60' : ''
      ]"
      @click="openFilePicker"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        hidden
        @change="handleInputChange"
      >

      <div v-if="uploading" class="space-y-3">
        <div class="w-10 h-10 mx-auto border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p class="text-sm text-gray-600">Завантаження... {{ progress }}%</p>
      </div>

      <div v-else>
        <UIcon name="i-heroicons-cloud-arrow-up" class="w-10 h-10 mx-auto text-gray-400 mb-2" />
        <p class="text-sm text-gray-600">
          <span class="text-green-600 font-medium">Натисніть</span> або перетягніть
        </p>
        <p class="text-xs text-gray-400 mt-1">PNG, JPG, WebP до 10MB</p>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

    <!-- Preview -->
    <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="(url, index) in images"
        :key="url"
        class="relative group aspect-square"
      >
        <img
          :src="getThumbnail(url)"
          class="w-full h-full object-cover rounded-lg border border-gray-200"
        >
        <button
          type="button"
          class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="removeImage(index)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
        <span
          v-if="index === 0"
          class="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded"
        >
          Головне
        </span>
      </div>
    </div>
  </div>
</template>
