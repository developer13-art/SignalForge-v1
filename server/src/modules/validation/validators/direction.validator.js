/**
 * Direction Check
 *
 * @module signalforge/server/modules/validation/validators/direction
 */

import { isValidDirection } from '@signalforge/shared/constants/order-directions';
import { VALIDATION_RESULTS, VALIDATION_CHECK_NAMES } from '../validation.constants.js';

export class DirectionCheck {
  constructor() {
    this.name = VALIDATION_CHECK_NAMES.DIRECTION;
  }

  async run(signal) {
    const direction = signal?.direction;
    if (!direction) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: 'Direction is missing',
      };
    }
    if (!isValidDirection(direction)) {
      return {
        name: this.name,
        result: VALIDATION_RESULTS.FAILED,
        reason: `Direction ${direction} is invalid`,
      };
    }
    return { name: this.name, result: VALIDATION_RESULTS.PASSED };
  }
}

export default DirectionCheck;