/**
 * Improved OCR System with Tesseract.js
 * Features: Image preprocessing, error handling, progress tracking
 */

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  isSuccess: boolean;
  error?: string;
  processingTime: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

/**
 * Preprocess image for better OCR accuracy
 */
function preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Grayscale conversion
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Increase contrast
    const contrast = 1.5;
    const adjusted = Math.min(255, Math.max(0, (gray - 128) * contrast + 128));

    data[i] = adjusted;
    data[i + 1] = adjusted;
    data[i + 2] = adjusted;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Load and resize image from file
 */
async function loadImage(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1920;
        const maxHeight = 1080;

        let width = img.width;
        let height = img.height;

        // Resize if too large
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Cannot get canvas context'));

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Main OCR function with preprocessing and progress tracking
 */
export async function performOCR(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  const startTime = Date.now();

  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image size must be less than 10MB');
    }

    // Load and preprocess image
    onProgress?.({ status: 'Loading image...', progress: 20 });
    const canvas = await loadImage(file);

    onProgress?.({ status: 'Preprocessing image...', progress: 40 });
    const processedCanvas = preprocessImage(canvas);

    // Perform OCR
    onProgress?.({ status: 'Processing with OCR...', progress: 60 });

    const result = await Tesseract.recognize(processedCanvas, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing') {
          onProgress?.({
            status: 'Recognizing text...',
            progress: 60 + m.progress * 30,
          });
        }
      },
    });

    onProgress?.({ status: 'Finalizing...', progress: 95 });

    const processingTime = Date.now() - startTime;

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
      isSuccess: true,
      processingTime,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      text: '',
      confidence: 0,
      isSuccess: false,
      error: errorMessage,
      processingTime,
    };
  }
}

/**
 * Validate and clean OCR text
 */
export function cleanOCRText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Remove extra whitespace
    .replace(/[^\w\s\d]/g, '') // Remove special characters
    .trim();
}

/**
 * Extract numbers from OCR text (useful for 4D results)
 */
export function extractNumbers(text: string): string[] {
  const numberPattern = /\d+/g;
  const matches = text.match(numberPattern) || [];
  return matches.filter((num) => num.length <= 4); // Assume max 4 digits for 4D
}
