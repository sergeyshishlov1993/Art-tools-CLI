// app/models/common/composables/useImageUpload.ts

export function useImageUpload() {
  // Правильні дані з твого скріна
  const cloudName = 'domccabqq'  // <-- ось це правильне!
  const uploadPreset = 'products'

  const uploading = ref(false)
  const error = ref<string | null>(null)
  const progress = ref(0)

  async function uploadImage(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) {
      error.value = 'Тільки зображення'
      return null
    }

    if (file.size > 10 * 1024 * 1024) {
      error.value = 'Максимум 10MB'
      return null
    }

    uploading.value = true
    error.value = null
    progress.value = 0

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )

      const data = await response.json()

      console.log('Cloudinary response:', data)

      if (data.error) {
        throw new Error(data.error.message)
      }

      progress.value = 100
      return data.secure_url

    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Помилка завантаження'
      return null
    } finally {
      uploading.value = false
    }
  }

  function getOptimizedUrl(url: string, options: { width?: number; height?: number } = {}) {
    if (!url || !url.includes('cloudinary.com')) return url

    const { width, height } = options
    const transforms = ['f_auto', 'q_auto']

    if (width) transforms.push(`w_${width}`)
    if (height) transforms.push(`h_${height}`)
    if (width || height) transforms.push('c_fill')

    return url.replace('/upload/', `/upload/${transforms.join(',')}/`)
  }

  return {
    uploadImage,
    uploading,
    error,
    progress,
    getOptimizedUrl
  }
}
