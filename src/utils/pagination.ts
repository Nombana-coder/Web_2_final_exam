<<<<<<< HEAD
/**
 * Shared pagination helpers
 * I put 10 items/page by default, go check API_CONTRACT.md. (0_0* )
 * Other domains (Courses/Exams/Questions) can reuse this on their own
 * list endpoints to keep the response shape consistent:
 *   { data, page, limit, total, total_pages }
 */

=======
>>>>>>> feature/courses-exams-api
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

<<<<<<< HEAD
export interface PaginatedResult<T> {
=======
export interface PaginatedResponse<T> {
>>>>>>> feature/courses-exams-api
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

const DEFAULT_PAGE = 1;
<<<<<<< HEAD
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
=======
const DEFAULT_LIMIT = 10; // confirmé équipe : 10 items par page
const MAX_LIMIT = 100;

/**
 * Lit ?page= et ?limit= sur req.query, avec valeurs par défaut/bornes sûres.
 */
export function parsePagination(query: any): PaginationParams {
  const rawPage = parseInt(query.page, 10);
  const rawLimit = parseInt(query.limit, 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildPaginatedResponse<T>(
>>>>>>> feature/courses-exams-api
  data: T[],
  total: number,
  page: number,
  limit: number
<<<<<<< HEAD
): PaginatedResult<T> {
=======
): PaginatedResponse<T> {
>>>>>>> feature/courses-exams-api
  return {
    data,
    page,
    limit,
    total,
<<<<<<< HEAD
    total_pages: limit > 0 ? Math.ceil(total / limit) : 0,
=======
    total_pages: Math.max(1, Math.ceil(total / limit)),
>>>>>>> feature/courses-exams-api
  };
}
