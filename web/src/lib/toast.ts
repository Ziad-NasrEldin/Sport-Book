export function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  if (typeof window === 'undefined') return
  const event = new CustomEvent('sportbook:toast', { detail: { message, type } })
  window.dispatchEvent(event)
}