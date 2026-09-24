/**
 * Clipboard Utility
 *
 * @module client/src/lib/utils/clipboard.util
 */

export async function copyToClipboard(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return { copied: false, reason: 'EMPTY_TEXT' };
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { copied: true };
    } catch (err) {
      return { copied: false, reason: 'CLIPBOARD_API_FAILED' };
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return { copied: success, reason: success ? null : 'EXEC_COMMAND_FAILED' };
  } catch (err) {
    return { copied: false, reason: 'FALLBACK_FAILED' };
  }
}

export const clipboard = {
  copyToClipboard,
};

export default clipboard;