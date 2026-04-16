'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, APIError } from './client'

const CSRF_TOKEN_KEY = 'sportbook-csrf-token'

function getCSRFToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(CSRF_TOKEN_KEY)
}

function setCSRFToken(token: string): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(CSRF_TOKEN_KEY, token)
}

export interface UseApiCallOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: APIError) => void
}

export interface UseApiCallResult<T> {
  data: T | null
  loading: boolean
  error: APIError | null
  refetch: () => Promise<void>
  execute: () => Promise<void>
}

export function useApiCall<T = any>(
  endpoint: string,
  options: UseApiCallOptions = {},
): UseApiCallResult<T> {
  const { immediate = true, onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(immediate)
  const [error, setError] = useState<APIError | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await api.get<T>(endpoint)
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const apiError = err as APIError
      setError(apiError)
      onError?.(apiError)
    } finally {
      setLoading(false)
    }
  }, [endpoint, onSuccess, onError])

  const refetch = useCallback(async () => {
    await execute()
  }, [execute])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { data, loading, error, refetch, execute }
}

export interface UseApiMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData) => void
  onError?: (error: APIError) => void
  onSettled?: () => void
}

export interface UseApiMutationResult<TData, TVariables> {
  data: TData | null
  loading: boolean
  error: APIError | null
  mutate: (variables?: TVariables) => Promise<TData | null>
  reset: () => void
}

export function useApiMutation<TData = any, TVariables = any>(
  endpoint: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST',
  options: UseApiMutationOptions<TData, TVariables> = {},
): UseApiMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options
  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<APIError | null>(null)

  const mutate = useCallback(
    async (variables?: TVariables): Promise<TData | null> => {
      setLoading(true)
      setError(null)

      try {
        let result: TData
        switch (method) {
          case 'POST':
            result = await api.post<TData>(endpoint, variables)
            break
          case 'PATCH':
            result = await api.patch<TData>(endpoint, variables)
            break
          case 'PUT':
            result = await api.put<TData>(endpoint, variables)
            break
          case 'DELETE':
            result = await api.delete<TData>(endpoint)
            break
          default:
            result = await api.post<TData>(endpoint, variables)
        }
        setData(result)
        onSuccess?.(result)
        return result
      } catch (err) {
        const apiError = err as APIError
        setError(apiError)
        onError?.(apiError)
        return null
      } finally {
        setLoading(false)
        onSettled?.()
      }
    },
    [endpoint, method, onSuccess, onError, onSettled],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, mutate, reset }
}
