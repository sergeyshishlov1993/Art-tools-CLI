export function getUtmData(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = sessionStorage.getItem('utm_data')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}