// app.config.ts
export default defineAppConfig({
  ui: {
    toast: {
      slots: {
        root: 'relative flex items-start gap-3 p-4 rounded-xl shadow-lg border min-w-80',
        icon: 'shrink-0 size-5',
        title: 'font-semibold text-sm',
        description: 'text-sm opacity-90 mt-0.5',
        close: 'absolute top-3 right-3'
      },
      variants: {
        color: {
          success: {
            root: 'bg-green-50 border-green-200 text-green-800',
            icon: 'text-green-500'
          },
          error: {
            root: 'bg-red-50 border-red-200 text-red-800',
            icon: 'text-red-500'
          },
          warning: {
            root: 'bg-amber-50 border-amber-200 text-amber-800',
            icon: 'text-amber-500'
          },
          info: {
            root: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: 'text-blue-500'
          }
        }
      },
      defaultVariants: {
        color: 'info'
      }
    }
  }
})
