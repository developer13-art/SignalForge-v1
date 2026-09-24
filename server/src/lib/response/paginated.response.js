/**
 * Paginated Response
 *
 * @module server/lib/response/paginated.response
 */

export function paginatedResponse(res, { items, meta, statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    data: {
      items: items || [],
      meta: meta || {},
    },
  });
}

export default paginatedResponse;