import type { Tone } from '@/components/admin/AdminStatusPill'

export function statusTone(status: string): Tone {
  const normalized = status.toLowerCase()

  if (
    normalized.includes('active') ||
    normalized.includes('enabled') ||
    normalized.includes('approved') ||
    normalized.includes('settled') ||
    normalized.includes('healthy') ||
    normalized.includes('confirmed') ||
    normalized.includes('completed') ||
    normalized.includes('delivered') ||
    normalized.includes('in stock')
  ) {
    return 'green'
  }

  if (
    normalized.includes('pending') ||
    normalized.includes('processing') ||
    normalized.includes('review') ||
    normalized.includes('draft') ||
    normalized.includes('needs info') ||
    normalized.includes('low stock')
  ) {
    return 'amber'
  }

  if (
    normalized.includes('suspended') ||
    normalized.includes('failed') ||
    normalized.includes('rejected') ||
    normalized.includes('cancelled') ||
    normalized.includes('expired') ||
    normalized.includes('critical') ||
    normalized.includes('disabled') ||
    normalized.includes('out of stock')
  ) {
    return 'red'
  }

  if (normalized.includes('archived')) {
    return 'violet'
  }

  return 'blue'
}

export function riskTone(risk: 'Low' | 'Medium' | 'High'): Tone {
  if (risk === 'Low') return 'green'
  if (risk === 'Medium') return 'amber'
  return 'red'
}
