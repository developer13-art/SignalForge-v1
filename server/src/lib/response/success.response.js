/**
 * Success Response
 *
 * @module server/lib/response/success.response
 */

export function successResponse(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export default successResponse;