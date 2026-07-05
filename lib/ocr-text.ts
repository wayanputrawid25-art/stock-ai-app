const OCR_CORRECTIONS: Record<string, string> = {
  '|': '1',
  I: '1',
  l: '1',
  O: '0',
  o: '0',
};

export function cleanOCRText(text: string): string {
  return text
    .replace(/[|IlOo]/g, (value) => OCR_CORRECTIONS[value] ?? value)
    .replace(/[^\n\d\s]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function normalizeOCRDigits(text: string): string {
  return cleanOCRText(text)
    .split(/\n+/)
    .map((line) => line.replace(/\D/g, ''))
    .filter(Boolean)
    .join('\n');
}

/**
 * Extract 4D numbers from OCR text
 * Uses ONLY clean 4-digit sequences to avoid reconstruction errors
 * 
 * Note: OCR sometimes splits numbers at line endings.
 * Reconstruction can create wrong numbers, so we only use clean extractions.
 */
export function extractFourDigitNumbers(text: string): string[] {
  const results = new Set<string>();
  
  // Extract only clean 4-digit sequences
  // This avoids errors from reconstructing split digits
  const matches = text.match(/(?<!\d)\d{4}(?!\d)/g) ?? [];
  
  for (const match of matches) {
    results.add(match);
  }
  
  return Array.from(results);
}
