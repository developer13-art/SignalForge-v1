/**
 * Paginated Response
 *
 * @module server/lib/response/paginated.response
 */
function paginatedResponse(res, { items, meta, statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    data: {
      items: items || [],
      meta: meta || {},
    },
  });
}
module.exports = paginatedResponse;
module.exports.paginatedResponse = paginatedResponse;
