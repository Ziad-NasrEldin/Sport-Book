import {
  APIError,
  AuthenticationError,
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
} from './errors'

export { APIError, AuthenticationError, NetworkError, NotFoundError, ServerError, ValidationError }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

const TOKEN_STORAGE_KEY = {
  ACCESS: 'sportbook-access-token',
  REFRESH: 'sportbook-refresh-token',
}

const CSRF_TOKEN_KEY = 'sportbook-csrf-token'

function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(CSRF_TOKEN_KEY)
}

function setCSRFToken(token: string): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(CSRF_TOKEN_KEY, token)
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY.ACCESS)
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY.REFRESH)
}

function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_STORAGE_KEY.ACCESS, accessToken)
  localStorage.setItem(TOKEN_STORAGE_KEY.REFRESH, refreshToken)
}

function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY.ACCESS)
  localStorage.removeItem(TOKEN_STORAGE_KEY.REFRESH)
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new AuthenticationError('No refresh token available')
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    clearTokens()
    throw new AuthenticationError('Failed to refresh token')
  }

  const data = await response.json()
  const { accessToken, refreshToken: newRefreshToken } = data.data || data

  setTokens(accessToken, newRefreshToken || refreshToken)
  return accessToken
}

async function handleResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!response.ok) {
    if (response.status === 401) {
      try {
        await refreshAccessToken()
        // Retry the original request with new token
        return null // Signal to retry
      } catch {
        clearTokens()
        // Redirect to sign-in page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/sign-in'
        }
        throw new AuthenticationError('Session expired. Please log in again.')
      }
    }

    if (response.status === 400) {
      const errorData = isJson ? await response.json() : {}
      throw new ValidationError(errorData.error || 'Validation error', errorData.code)
    }

    if (response.status === 404) {
      throw new NotFoundError()
    }

    if (response.status >= 500) {
      throw new ServerError()
    }

    const errorData = isJson ? await response.json() : {}
    throw new APIError(response.status, errorData.error || 'Request failed', errorData.code)
  }

  if (isJson) {
    return response.json()
  }

  return response.text()
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  delay: number = 1000,
): Promise<Response> {
  try {
    const response = await fetch(url, options)
    return response
  } catch {
    if (retries <= 0) {
      throw new NetworkError('Failed to connect to server')
    }

    await new Promise((resolve) => setTimeout(resolve, delay))
    return fetchWithRetry(url, options, retries - 1, delay * 2)
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const accessToken = getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const csrfToken = getCSRFToken()
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  let response = await fetchWithRetry(url, { ...options, headers })
  let data = await handleResponse(response)

  // If data is null, it means we need to retry with new token
  if (data === null) {
    const newAccessToken = getAccessToken()
    if (newAccessToken) {
      headers['Authorization'] = `Bearer ${newAccessToken}`
    }
    response = await fetchWithRetry(url, { ...options, headers })
    data = await handleResponse(response)
  }

  return data.data || data
}

export const api = {
  get: <T = any>(endpoint: string): Promise<T> => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body?: any): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string): Promise<T> => apiRequest<T>(endpoint, { method: 'DELETE' }),
  put: <T = any>(endpoint: string, body?: any): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
}

export { getAccessToken, getRefreshToken, setTokens, clearTokens, getCSRFToken, setCSRFToken }
