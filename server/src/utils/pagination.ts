// server/src/utils/pagination.ts

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
  }
  
  export interface PaginatedResult<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  
  // Lấy page, limit từ query, fallback default = (1, 12)
  export const getPaginationParams = (query: any): PaginationParams => {
    const rawPage = parseInt(query.page as string, 12);
    const rawLimit = parseInt(query.limit as string, 12);
  
    const page = !Number.isNaN(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = !Number.isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 12;
  
    const skip = (page - 1) * limit;
  
    return { page, limit, skip };
  };
  
  export const buildPaginatedResult = <T>(
    items: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResult<T> => {
    const totalPages = Math.ceil(total / limit) || 1;
  
    return {
      items,
      page,
      limit,
      total,
      totalPages,
    };
  };
  