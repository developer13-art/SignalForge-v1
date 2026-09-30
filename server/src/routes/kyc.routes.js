/**
 * KYC Routes
 *
 * @module signalforge/server/routes/kyc
 */
const { Router } = require('express');

const router = Router();
let persistentKycRouter = null;

router.use((req, res, next) => {
  try {
    if (!persistentKycRouter) {
      persistentKycRouter = require('../modules/kyc/kyc.routes.js')();
    }
    return persistentKycRouter(req, res, next);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;