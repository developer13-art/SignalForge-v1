/**
 * Document Controller
 *
 * @module signalforge/server/modules/kyc/documents/controller
 */

import { DocumentService } from './document.service.js';
import { validateUploadDocument, validateUploadSelfie } from './document.validator.js';
import { ValidationError } from '../../../lib/errors/validation-error.js';

export class DocumentController {
  constructor(service = null) {
    this.service = service || new DocumentService();
  }

  validateOrThrow(validator, ...args) {
    const result = validator(...args);
    if (!result.valid) {
      throw new ValidationError('Validation failed', {
        code: 'VALIDATION_FAILED',
        details: { errors: result.errors },
      });
    }
  }

  uploadDocument = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUploadDocument, req.body, req.file);
      const document = await this.service.uploadDocument(req.user.id, req.body, req.file);
      res.status(201).json({ document });
    } catch (error) {
      next(error);
    }
  };

  uploadSelfie = async (req, res, next) => {
    try {
      this.validateOrThrow(validateUploadSelfie, req.file);
      const selfie = await this.service.uploadSelfie(req.user.id, req.file);
      res.status(201).json({ selfie });
    } catch (error) {
      next(error);
    }
  };

  listDocuments = async (req, res, next) => {
    try {
      const documents = await this.service.listDocuments(req.user.id);
      res.status(200).json({ documents });
    } catch (error) {
      next(error);
    }
  };

  getDocument = async (req, res, next) => {
    try {
      const document = await this.service.getDocument(req.user.id, req.params.documentId);
      res.status(200).json({ document });
    } catch (error) {
      next(error);
    }
  };

  getDocumentUrl = async (req, res, next) => {
    try {
      const result = await this.service.getDocumentSignedUrl(
        req.user.id,
        req.params.documentId,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteDocument = async (req, res, next) => {
    try {
      const result = await this.service.deleteDocument(req.user.id, req.params.documentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listDocumentTypes = async (req, res, next) => {
    try {
      const filters = {
        enabled: req.query.enabled !== undefined ? req.query.enabled === 'true' : true,
        country: req.query.country,
      };
      const documentTypes = await this.service.listDocumentTypes(filters);
      res.status(200).json({ documentTypes });
    } catch (error) {
      next(error);
    }
  };
}

export default DocumentController;