/**
 * Improved OCR System with Tesseract.js
 * Features: Image preprocessing, error handling, progress tracking
 */

import { createWorker, PSM } from 'tesseract.js';
import { cleanOCRText, extractFourDigitNumbers, normalizeOCRDigits } from '@/lib/ocr-text';

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

const DARK_PIXEL_THRESHOLD = 95;
const OCR_SCALE = 3;

/**
 * Preprocess image for screenshots that mix bold black 4D digits with light gray
 * helper digits/grid lines. The threshold keeps only very dark pixels so OCR
 * focuses on the bold black results, then upscales the image for cleaner digit
 * recognition.
 */
function preprocessImage(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width * OCR_SCALE;
  outputCanvas.height = sourceCanvas.height * OCR_SCALE;

  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Cannot get canvas context');

  outputCtx.imageSmoothingEnabled = false;
  outputCtx.fillStyle = '#ffffff';
  outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputCtx.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

  const imageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const isBoldDigitPixel = gray <= DARK_PIXEL_THRESHOLD;
    const value = isBoldDigitPixel ? 0 : 255;

    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }

  outputCtx.putImageData(imageData, 0, 0);
  return outputCanvas;
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

    const worker = await createWorker('eng', undefined, {
      logger: (m) => {
        if (m.status === 'recognizing') {
          onProgress?.({
            status: 'Recognizing text...',
            progress: 60 + m.progress * 30,
          });
        }
      },
    });

    try {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });

      const result = await worker.recognize(processedCanvas);

      onProgress?.({ status: 'Finalizing...', progress: 95 });

      const processingTime = Date.now() - startTime;

      return {
        text: normalizeOCRDigits(result.data.text),
        confidence: result.data.confidence,
        isSuccess: true,
        processingTime,
      };
    } finally {
      await worker.terminate();
    }
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
export { cleanOCRText, normalizeOCRDigits };

/**
 * Extract numbers from OCR text (useful for 4D results)
 */
export function extractNumbers(text: string): string[] {
  return extractFourDigitNumbers(text);
}
