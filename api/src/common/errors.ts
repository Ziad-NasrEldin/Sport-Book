export class ApiError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict') {
    super(message, 'CONFLICT', 409)
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(message, 'BAD_REQUEST', 400)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400)
  }
}
