import { vi } from 'vitest'

// Point at a separate test DB so unit tests never touch dev.db
process.env.DATABASE_URL = 'file:./prisma/test.db'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only'
process.env.JWT_EXPIRES_IN = '1h'
process.env.REFRESH_TOKEN_DAYS = '14'
process.env.WEB_ORIGIN = 'http://localhost:3000'
process.env.NODE_ENV = 'test'
process.env.PORT = '3001'
process.env.HOST = '0.0.0.0'

// Silence console.log in tests (password reset token logs etc.)
vi.spyOn(console, 'log').mockImplementation(() => {})
