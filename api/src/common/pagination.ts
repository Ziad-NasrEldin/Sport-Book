export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface OffsetPaginationResult<T> {
  items: T[]
  pageInfo: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface CursorPaginationResult<T> {
  items: T[]
  pageInfo: {
    cursor: string | null
    hasNextPage: boolean
  }
}

export function offsetPagination<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): OffsetPaginationResult<T> {
  const totalPages = Math.ceil(total / limit)
  return {
    items,
    pageInfo: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

export function cursorPagination<T>(
  items: T[],
  nextCursor: string | null,
  getCursor: (item: T) => string
): CursorPaginationResult<T> {
  return {
    items,
    pageInfo: {
      cursor: nextCursor,
      hasNextPage: !!nextCursor,
    },
  }
}
