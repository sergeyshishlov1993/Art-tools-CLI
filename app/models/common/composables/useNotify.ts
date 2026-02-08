interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
}

const toasts = ref<Toast[]>([])

export function useNotify() {
  function add(type: Toast['type'], title: string, description?: string) {
    const id = Date.now().toString()
    toasts.value.push({ id, type, title, description })

    setTimeout(() => remove(id), 4000)
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts: readonly(toasts),
    remove,
    success: (title: string, desc?: string) => add('success', title, desc),
    error: (title: string, desc?: string) => add('error', title, desc),
    warning: (title: string, desc?: string) => add('warning', title, desc),
    info: (title: string, desc?: string) => add('info', title, desc),
    orderSuccess: (num: string) => add('success', 'Замовлення оформлено!', `Номер: ${num}`),
    cartAdded: (name: string) => add('success', 'Додано до кошика', name)
  }
}
