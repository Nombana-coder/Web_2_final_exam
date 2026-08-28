/**
 * Shared pagination helpers
 * I put 10 items/page by default, go check API_CONTRACT.md. (0_0* )
 * Other domains (Courses/Exams/Questions) can reuse this on their own
 * list endpoints to keep the response shape consistent:
 *   { data, page, limit, total, total_pages }
 */

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;


export function parsePagination(
  rawPage: unknown,
  rawLimit: unknown
): PaginationParams {
  let page = Number(rawPage);
  let limit = Number(rawLimit);

  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;

  page = Math.floor(page);
  limit = Math.min(Math.floor(limit), MAX_LIMIT);

  return { page, limit, offset: (page - 1) * limit };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    data,
    page,
    limit,
    total,
    total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
