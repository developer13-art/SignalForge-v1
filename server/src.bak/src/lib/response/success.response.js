/**
 * Success Response
 *
 * @module server/lib/response/success.response
 */
function successResponse(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}
module.exports = successResponse;
module.exports.successResponse = successResponse;
