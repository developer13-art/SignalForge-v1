/**
 * Payment Routes
 *
 * @module signalforge/server/modules/payments/routes
 */
const { Router } = require('express');
const { PaymentController } = require('./payment.controller.js');
const { authenticationMiddleware } = require('../../middleware/authentication.middleware.js');
const { requireAdminMiddleware } = require('../../middleware/require-admin.middleware.js');
function buildPaymentRouter(controller = null) {
  const router = Router();
  const paymentController = controller || new PaymentController();

  router.post('/webhooks/stripe', paymentController.handleStripeWebhook);
  router.post('/webhooks/paystack', paymentController.handlePaystackWebhook);
  router.post('/webhooks/flutterwave', paymentController.handleFlutterwaveWebhook);

  router.get('/providers', paymentController.listProviders);

  router.use(authenticationMiddleware());

  router.post('/payments', paymentController.createPayment);
  router.get('/payments', paymentController.listPayments);
  router.get('/payments/status/counts', paymentController.getPaymentStatusCounts);
  router.get('/payments/revenue/summary', paymentController.getRevenueSummary);
  router.get('/payments/:paymentId', paymentController.getPayment);
  router.post('/payments/:paymentId/refund', paymentController.refundPayment);
  router.get('/payments/:paymentId/refunds', paymentController.listRefundsForPayment);

  router.get('/refunds/:refundId', paymentController.getRefund);

  router.get('/invoices', paymentController.listInvoices);
  router.get('/invoices/:invoiceId', paymentController.getInvoice);
  router.post('/invoices/:invoiceId/void', paymentController.voidInvoice);

  router.get('/intents/:intentId', paymentController.getIntent);

  return router;
}
module.exports = buildPaymentRouter;
module.exports.buildPaymentRouter = buildPaymentRouter;
