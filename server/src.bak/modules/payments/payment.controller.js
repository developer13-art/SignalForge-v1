/**
 * Payment Controller
 *
 * @module signalforge/server/modules/payments/controller
 */

import { PaymentService } from './payment.service.js';
import { StripeWebhookHandler } from './webhooks/stripe.webhook.js';
import { PaystackWebhookHandler } from './webhooks/paystack.webhook.js';
import { FlutterwaveWebhookHandler } from './webhooks/flutterwave.webhook.js';
import {
  validateCreatePaymentPayload,
  validateRefundPayload,
} from './payment.validator.js';
import { ValidationError } from '../../lib/errors/validation-error.js';

export class PaymentController {
  constructor(service = null) {
    this.service = service || new PaymentService();
    this.stripeWebhook = new StripeWebhookHandler();
    this.paystackWebhook = new PaystackWebhookHandler();
    this.flutterwaveWebhook = new FlutterwaveWebhookHandler();
  }

  validateOrThrow(validator, body) {
    const result = validator(body);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  createPayment = async (req, res, next) => {
    try {
      this.validateOrThrow(validateCreatePaymentPayload, req.body);
      const result = await this.service.createPayment(
        req.user.id,
        req.body,
        req.user.email,
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPayment = async (req, res, next) => {
    try {
      const payment = await this.service.getPayment(req.user.id, req.params.paymentId);
      res.status(200).json({ payment });
    } catch (error) {
      next(error);
    }
  };

  listPayments = async (req, res, next) => {
    try {
      const filters = {
        userId: req.user.id,
        provider: req.query.provider,
        status: req.query.status,
        purpose: req.query.purpose,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listPayments(filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPaymentStatusCounts = async (req, res, next) => {
    try {
      const filters = {
        userId: req.user.id,
        since: req.query.since,
      };
      const counts = await this.service.getPaymentStatusCounts(filters);
      res.status(200).json({ counts });
    } catch (error) {
      next(error);
    }
  };

  getRevenueSummary = async (req, res, next) => {
    try {
      const filters = {
        userId: req.user.id,
        since: req.query.since,
        until: req.query.until,
      };
      const summary = await this.service.getRevenueSummary(filters);
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  refundPayment = async (req, res, next) => {
    try {
      this.validateOrThrow(validateRefundPayload, req.body);
      const refund = await this.service.refundPayment(
        req.user.id,
        req.params.paymentId,
        req.body,
      );
      res.status(201).json({ refund });
    } catch (error) {
      next(error);
    }
  };

  getRefund = async (req, res, next) => {
    try {
      const refund = await this.service.getRefund(req.user.id, req.params.refundId);
      res.status(200).json({ refund });
    } catch (error) {
      next(error);
    }
  };

  listRefundsForPayment = async (req, res, next) => {
    try {
      const refunds = await this.service.listRefundsForPayment(
        req.user.id,
        req.params.paymentId,
      );
      res.status(200).json({ refunds });
    } catch (error) {
      next(error);
    }
  };

  getInvoice = async (req, res, next) => {
    try {
      const invoice = await this.service.getInvoice(req.user.id, req.params.invoiceId);
      res.status(200).json({ invoice });
    } catch (error) {
      next(error);
    }
  };

  listInvoices = async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        since: req.query.since,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listInvoices(req.user.id, filters, pagination);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  voidInvoice = async (req, res, next) => {
    try {
      const invoice = await this.service.voidInvoice(req.user.id, req.params.invoiceId);
      res.status(200).json({ invoice });
    } catch (error) {
      next(error);
    }
  };

  getIntent = async (req, res, next) => {
    try {
      const intent = await this.service.getIntent(req.user.id, req.params.intentId);
      res.status(200).json({ intent });
    } catch (error) {
      next(error);
    }
  };

  listProviders = async (req, res, next) => {
    try {
      const providers = this.service.getProviderAvailability();
      res.status(200).json({ providers });
    } catch (error) {
      next(error);
    }
  };

  handleStripeWebhook = async (req, res, next) => {
    try {
      const result = await this.stripeWebhook.handle(req);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  handlePaystackWebhook = async (req, res, next) => {
    try {
      const result = await this.paystackWebhook.handle(req);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  handleFlutterwaveWebhook = async (req, res, next) => {
    try {
      const result = await this.flutterwaveWebhook.handle(req);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentController;