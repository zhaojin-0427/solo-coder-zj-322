export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
