/**
 * Utility to compress and optimize images before uploading or saving to Firestore.
 * Prevents Firestore document limit exceeded errors (1 MB hard limit).
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Compresses an image data URL or Blob to a compact WebP/JPEG/PNG base64 data URL.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  options: CompressOptions = {}
): Promise<string> {
  // If it's a web URL (http:// or https://) or small SVG, return as is
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }
  if (dataUrl.startsWith('data:image/svg+xml')) {
    // If SVG is under 60KB, return as is
    if (dataUrl.length < 60000) return dataUrl;
  }

  // If dataUrl is already tiny (less than 25KB), return as is
  if (dataUrl.length < 25000) {
    return dataUrl;
  }

  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate scale ratio preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      try {
        // Try WebP first, fallback to JPEG if browser doesn't support WebP export
        let compressed = canvas.toDataURL(mimeType, quality);
        if (!compressed || compressed.startsWith('data:,')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(compressed);
      } catch {
        // In case of security/taint error, fallback to original
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Reads a File and returns a compressed base64 data URL
 */
export async function readAndCompressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawData = e.target?.result as string;
      if (!rawData) {
        resolve('');
        return;
      }
      try {
        const compressed = await compressImageDataUrl(rawData, options);
        resolve(compressed);
      } catch (err) {
        resolve(rawData);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
