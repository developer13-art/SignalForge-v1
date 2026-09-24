/**
 * Download Utility
 *
 * @module client/src/lib/utils/download.util
 */

export function downloadBlob({ blob, filename }) {
  if (!blob || !filename) {
    return false;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}

export function downloadText({ content, filename, mimeType = 'text/plain' }) {
  if (typeof content !== 'string') {
    return false;
  }
  const blob = new Blob([content], { type: mimeType });
  return downloadBlob({ blob, filename });
}

export function downloadJson({ data, filename = 'data.json' }) {
  const content = JSON.stringify(data, null, 2);
  return downloadText({ content, filename, mimeType: 'application/json' });
}

export function downloadCsv({ content, filename = 'data.csv' }) {
  return downloadText({ content, filename, mimeType: 'text/csv' });
}

export const download = {
  downloadBlob,
  downloadText,
  downloadJson,
  downloadCsv,
};

export default download;