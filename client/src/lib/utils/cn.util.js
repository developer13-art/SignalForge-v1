/**
 * Class Name Utility
 *
 * Merges class name strings, arrays, and objects safely. Combines
 * `clsx` with `tailwind-merge` so conflicting Tailwind classes are
 * resolved correctly.
 *
 * @module client/src/lib/utils/cn.util
 */

import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;