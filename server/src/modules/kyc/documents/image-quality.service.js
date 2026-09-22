/**
 * Image Quality Service
 *
 * Performs basic image quality checks: resolution, aspect ratio, and
 * brightness estimation. Full quality assessment relies on the KYC
 * provider; these checks reduce obviously invalid submissions before
 * they reach the provider.
 *
 * @module signalforge/server/modules/kyc/documents/image-quality
 */

import { DEFAULT_MIN_RESOLUTION, QUALITY_CHECK_RESULTS } from '../kyc.constants.js';

function readPngDimensions(buffer) {
  if (buffer.length < 24) {
    return null;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function readJpegDimensions(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (marker >= 0xd0 && marker <= 0xd7) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    offset += 2 + length;
  }
  return null;
}

export class ImageQualityService {
  extractDimensions(buffer, mimeType) {
    try {
      if (mimeType === 'image/png') {
        return readPngDimensions(buffer);
      }
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        return readJpegDimensions(buffer);
      }
      return null;
    } catch {
      return null;
    }
  }

  estimateBrightness(buffer) {
    if (!buffer || buffer.length === 0) {
      return null;
    }
    const sampleSize = Math.min(buffer.length, 4096);
    let total = 0;
    let counted = 0;
    const step = Math.max(1, Math.floor(buffer.length / sampleSize));
    for (let i = 0; i < buffer.length; i += step) {
      total += buffer[i];
      counted++;
    }
    return counted > 0 ? total / counted / 255 : null;
  }

  check(buffer, mimeType, options = {}) {
    const minResolution = options.minResolution || DEFAULT_MIN_RESOLUTION;
    const warnings = [];
    const details = {};

    const dimensions = this.extractDimensions(buffer, mimeType);
    if (dimensions) {
      details.width = dimensions.width;
      details.height = dimensions.height;
      if (dimensions.width < minResolution || dimensions.height < minResolution) {
        return {
          result: QUALITY_CHECK_RESULTS.FAILED,
          reason: `Image resolution must be at least ${minResolution}px in both dimensions`,
          details,
        };
      }
      const ratio = dimensions.width / dimensions.height;
      if (ratio < 0.5 || ratio > 2.5) {
        warnings.push('Unusual aspect ratio detected');
      }
    }

    const brightness = this.estimateBrightness(buffer);
    if (brightness !== null) {
      details.brightness = brightness;
      if (brightness < 0.15) {
        warnings.push('Image appears too dark');
      }
      if (brightness > 0.9) {
        warnings.push('Image appears too bright');
      }
    }

    if (warnings.length > 0) {
      return {
        result: QUALITY_CHECK_RESULTS.WARNING,
        warnings,
        details,
      };
    }

    return {
      result: QUALITY_CHECK_RESULTS.PASSED,
      details,
    };
  }
}

export default ImageQualityService;