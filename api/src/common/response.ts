export interface ApiResponse<T = unknown> {
  data?: T
  error?: {
    message: string
    code: string
  }
  meta?: Record<string, unknown>
}

export function success<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { data, meta }
}

export function error(message: string, code: string): ApiResponse {
  return { error: { message, code } }
}
