declare module 'nuxt/schema' {
  interface NuxtConfig {
    viewport?: {
      breakpoints?: Record<string, number>
      defaultBreakpoints?: Record<string, number>
      fallbackBreakpoint?: string
    }
  }
}

export {}
