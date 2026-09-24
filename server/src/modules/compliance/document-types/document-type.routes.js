/**
 * Document Type Routes
 *
 * @module server/modules/compliance/document-types/document-type.routes
 */

import { Router } from 'express';
import { documentTypeService } from './document-type.service';
import { asyncHandler } from '../../../lib/async-handler';
import { successResponse } from '../../../lib/response/success.response';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { activeOnly } = req.query;
    const types = await documentTypeService.listDocumentTypes({
      activeOnly: activeOnly !== 'false',
    });
    return successResponse(res, { documentTypes: types });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      code,
      label,
      description,
      requiredFields,
      acceptedFormats,
      maxSizeBytes,
      active,
    } = req.body || {};

    const type = await documentTypeService.createDocumentType({
      code,
      label,
      description,
      requiredFields,
      acceptedFormats,
      maxSizeBytes,
      active,
    });

    return successResponse(res, { documentType: type }, 201);
  }),
);

router.get(
  '/:documentTypeId',
  asyncHandler(async (req, res) => {
    const type = await documentTypeService.getDocumentTypeById({
      documentTypeId: req.params.documentTypeId,
    });
    return successResponse(res, { documentType: type });
  }),
);

router.patch(
  '/:documentTypeId',
  asyncHandler(async (req, res) => {
    const {
      label,
      description,
      requiredFields,
      acceptedFormats,
      maxSizeBytes,
      active,
    } = req.body || {};

    const type = await documentTypeService.updateDocumentType({
      documentTypeId: req.params.documentTypeId,
      label,
      description,
      requiredFields,
      acceptedFormats,
      maxSizeBytes,
      active,
    });

    return successResponse(res, { documentType: type });
  }),
);

router.post(
  '/:documentTypeId/deactivate',
  asyncHandler(async (req, res) => {
    const result = await documentTypeService.deactivateDocumentType({
      documentTypeId: req.params.documentTypeId,
    });
    return successResponse(res, result);
  }),
);

router.delete(
  '/:documentTypeId',
  asyncHandler(async (req, res) => {
    const result = await documentTypeService.deleteDocumentType({
      documentTypeId: req.params.documentTypeId,
    });
    return successResponse(res, result);
  }),
);

export default router;