export function stringValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  if (Array.isArray(val)) return val.map(stringValue).join(', ')
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>
    return String(obj.displayName ?? obj.name ?? obj.title ?? obj.label ?? '')
  }
  return String(val)
}