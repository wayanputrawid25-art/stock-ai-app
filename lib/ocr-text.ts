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
 * Extract 4D numbers with smart reconstruction
 * Handles cases where OCR splits 4D numbers into individual digits
 */
export function extractFourDigitNumbers(text: string): string[] {
  const results = new Set<string>();
  
  // First: extract clean 4-digit sequences (no splits)
  for (const match of text.match(/(?<!\d)\d{4}(?!\d)/g) ?? []) {
    results.add(match);
  }
  
  // Second: reconstruct from split digits per line
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Get all digit sequences (4-digit and single-digit)
    const parts = line.trim().split(/\s+/).filter(Boolean);
    let buffer = '';
    
    for (const part of parts) {
      const digits = part.replace(/\D/g, '');
      
      if (digits.length === 4) {
        // Direct 4D number
        if (buffer.length > 0) {
          // Complete partial from buffer
          const combined = buffer + digits.slice(0, 4 - buffer.length);
          if (combined.length === 4) {
            results.add(combined);
          }
          buffer = digits.slice(4 - buffer.length);
        } else {
          results.add(digits);
        }
      } else if (digits.length > 0 && digits.length < 4) {
        // Partial, add to buffer
        buffer += digits;
        if (buffer.length >= 4) {
          results.add(buffer.slice(0, 4));
          buffer = buffer.slice(4);
        }
      } else if (buffer.length > 0 && digits.length === 0) {
        // Empty part after buffer - save partial
        if (buffer.length === 4) {
          results.add(buffer);
        }
        buffer = '';
      }
    }
    
    // Handle leftover at end of line
    if (buffer.length === 4) {
      results.add(buffer);
    }
  }
  
  return Array.from(results);
}
