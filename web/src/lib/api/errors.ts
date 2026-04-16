export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class NetworkError extends APIError {
  constructor(message: string = 'Network error occurred') {
    super(0, message, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, code?: string) {
    super(400, message, code || 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ServerError extends APIError {
  constructor(message: string = 'Server error occurred') {
    super(500, message, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}
