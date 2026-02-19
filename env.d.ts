declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    ttq: {
      track: (event: string, params?: Record<string, unknown>) => void
      page: () => void
      load: (pixelId: string) => void
    }
  }
}

export {}