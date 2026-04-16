'use client'

import { Component, ReactNode } from 'react'
import { APIError } from '@/lib/api/client'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-surface px-5">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-lg p-6 shadow-ambient">
            <h2 className="text-xl font-bold text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-primary/70 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-full bg-primary-container text-surface-container-lowest font-semibold hover:opacity-90 transition-opacity"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function APIErrorFallback({ error, onRetry }: { error: APIError; onRetry?: () => void }) {
  const getErrorMessage = (error: APIError): string => {
    if (error.status === 401) return 'Please log in to continue'
    if (error.status === 403) return 'You do not have permission to access this resource'
    if (error.status === 404) return 'The requested resource was not found'
    if (error.status >= 500) return 'Server error. Please try again later'
    return error.message || 'An error occurred'
  }

  // Redirect to sign-in page on 401 errors
  if (error.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/sign-in'
    }
    return null
  }

  return (
    <div className="bg-surface-container-low rounded-lg p-4 text-center">
      <p className="text-sm font-semibold text-primary mb-2">{getErrorMessage(error)}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-bold text-secondary-container hover:text-secondary transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
