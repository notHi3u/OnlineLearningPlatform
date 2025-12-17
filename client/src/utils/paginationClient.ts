import { api } from "../api/http";
import type { PaginatedResponse } from "../types/pagination";

export async function fetchPaginated<T>(
  url: string,
  page = 1,
  limit = 12,
  extraParams: Record<string, any> = {}
): Promise<PaginatedResponse<T>> {
  const res = await api.get(url, {
    params: {
      page,
      limit,
      ...extraParams,
    },
  });

  return res.data;
}
