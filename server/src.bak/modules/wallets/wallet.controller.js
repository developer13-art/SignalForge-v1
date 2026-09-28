/**
 * Wallet Controller
 *
 * @module signalforge/server/modules/wallets/controller
 */

import { WalletService } from './wallet.service.js';

export class WalletController {
  constructor(service = null) {
    this.service = service || new WalletService();
  }

  ensureWallet = async (req, res, next) => {
    try {
      const wallet = await this.service.ensureWallet(
        req.user.id,
        req.body.walletType || 'USER',
        req.body.currency || 'USD',
      );
      res.status(200).json({ wallet });
    } catch (error) {
      next(error);
    }
  };

  listWallets = async (req, res, next) => {
    try {
      const filters = {
        walletType: req.query.walletType,
        currency: req.query.currency,
        status: req.query.status,
      };
      const wallets = await this.service.listWallets(req.user.id, filters);
      res.status(200).json({ wallets });
    } catch (error) {
      next(error);
    }
  };

  getWallet = async (req, res, next) => {
    try {
      const wallet = await this.service.getWallet(req.user.id, req.params.walletId);
      res.status(200).json({ wallet });
    } catch (error) {
      next(error);
    }
  };

  getWalletByType = async (req, res, next) => {
    try {
      const wallet = await this.service.getWalletByType(
        req.user.id,
        req.params.walletType,
        req.query.currency || 'USD',
      );
      res.status(200).json({ wallet });
    } catch (error) {
      next(error);
    }
  };

  creditWallet = async (req, res, next) => {
    try {
      const result = await this.service.creditWallet(
        req.params.walletId,
        req.body.amount,
        {
          entryType: req.body.entryType,
          referenceType: req.body.referenceType,
          referenceId: req.body.referenceId,
          description: req.body.description,
          actorId: req.user.id,
          actorType: 'USER',
          metadata: req.body.metadata,
        },
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  debitWallet = async (req, res, next) => {
    try {
      const result = await this.service.debitWallet(
        req.params.walletId,
        req.body.amount,
        {
          entryType: req.body.entryType,
          referenceType: req.body.referenceType,
          referenceId: req.body.referenceId,
          description: req.body.description,
          actorId: req.user.id,
          actorType: 'USER',
          metadata: req.body.metadata,
        },
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listLedgerEntries = async (req, res, next) => {
    try {
      const filters = {
        entryType: req.query.entryType,
        direction: req.query.direction,
        status: req.query.status,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listLedgerEntries(
        req.user.id,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listWalletLedgerEntries = async (req, res, next) => {
    try {
      const filters = {
        entryType: req.query.entryType,
        direction: req.query.direction,
        status: req.query.status,
        since: req.query.since,
        until: req.query.until,
      };
      const pagination = { limit: req.query.limit, offset: req.query.offset };
      const result = await this.service.listWalletLedgerEntries(
        req.params.walletId,
        filters,
        pagination,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getLedgerEntry = async (req, res, next) => {
    try {
      const entry = await this.service.getLedgerEntry(req.params.entryId);
      res.status(200).json({ entry });
    } catch (error) {
      next(error);
    }
  };

  reverseLedgerEntry = async (req, res, next) => {
    try {
      const result = await this.service.reverseLedgerEntry(
        req.params.entryId,
        req.user.id,
        req.body.reason,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  freezeWallet = async (req, res, next) => {
    try {
      const wallet = await this.service.freezeWallet(req.params.walletId, req.body.reason);
      res.status(200).json({ wallet });
    } catch (error) {
      next(error);
    }
  };

  unfreezeWallet = async (req, res, next) => {
    try {
      const wallet = await this.service.unfreezeWallet(req.params.walletId);
      res.status(200).json({ wallet });
    } catch (error) {
      next(error);
    }
  };

  checkIntegrity = async (req, res, next) => {
    try {
      const summary = await this.service.checkIntegrity(
        req.params.walletId,
        Number(req.query.tolerance) || undefined,
      );
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  checkAllIntegrity = async (req, res, next) => {
    try {
      const summary = await this.service.checkAllIntegrity(
        Number(req.query.tolerance) || undefined,
      );
      res.status(200).json({ summary });
    } catch (error) {
      next(error);
    }
  };

  recomputeBalance = async (req, res, next) => {
    try {
      const result = await this.service.recomputeBalance(req.params.walletId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default WalletController;