/**
 * Document Type Service
 *
 * @module signalforge/server/modules/kyc/documents/document-type
 */

import { KycRepository } from '../kyc.repository.js';
import { KycInvalidDocumentTypeError } from '../kyc.errors.js';

export class DocumentTypeService {
  constructor(repository = null) {
    this.repository = repository || new KycRepository();
  }

  async list(filters = {}) {
    return this.repository.listDocumentTypes(filters);
  }

  async getByCode(code) {
    const type = await this.repository.findDocumentTypeByCode(code);
    if (!type) {
      throw new KycInvalidDocumentTypeError(undefined, { code });
    }
    return type;
  }

  async assertValid(code) {
    const type = await this.repository.findDocumentTypeByCode(code);
    if (!type || type.enabled !== true) {
      throw new KycInvalidDocumentTypeError(undefined, { code });
    }
    return type;
  }

  async listForCountry(countryCode) {
    const types = await this.repository.listDocumentTypes({
      enabled: true,
      country: countryCode,
    });
    return types;
  }
}

export default DocumentTypeService;