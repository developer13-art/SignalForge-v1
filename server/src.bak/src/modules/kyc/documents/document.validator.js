/**
 * Document Validators
 *
 * @module signalforge/server/modules/kyc/documents/validator
 */
const { validateDocumentUploadPayload, validateSelfieUploadPayload } = require('../kyc.validator.js');
function validateUploadDocument(body, file) {
  return validateDocumentUploadPayload(body, file);
}
function validateUploadSelfie(file) {
  return validateSelfieUploadPayload(file);
}
module.exports.validateUploadDocument = validateUploadDocument;
module.exports.validateUploadSelfie = validateUploadSelfie;
