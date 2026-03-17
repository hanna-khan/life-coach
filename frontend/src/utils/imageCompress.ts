/**
 * Compress/resize image so upload stays under size limit and avoids 403.
 * Returns base64 data URL for use in form.
 */

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;
const TARGET_MAX_BYTES = 800 * 1024; // 800KB target
const DEFAULT_QUALITY = 0.82;

export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      let quality = DEFAULT_QUALITY;
      const tryEncode = (): string => {
        const dataUrl = canvas.toDataURL(mime, quality);
        // base64 is ~4/3 of binary size; approximate
        const bytes = (dataUrl.length * 3) / 4;
        if (bytes > TARGET_MAX_BYTES && quality > 0.4) {
          quality -= 0.1;
          return tryEncode();
        }
        return dataUrl;
      };
      try {
        const dataUrl = tryEncode();
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/** Max size we allow without compression (1MB); above this we compress. */
export const MAX_SIZE_BEFORE_COMPRESS = 1 * 1024 * 1024;
/** Hard limit - show validation error (5MB). */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
