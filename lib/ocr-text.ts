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

export function extractFourDigitNumbers(text: string): string[] {
  const results = new Set<string>();
  const normalizedLines = normalizeOCRDigits(text).split('\n').filter(Boolean);

  for (const line of normalizedLines) {
    for (let index = 0; index + 4 <= line.length; index += 4) {
      results.add(line.slice(index, index + 4));
    }
  }

  for (const match of text.match(/\b\d{4}\b/g) ?? []) {
    results.add(match);
  }

  return Array.from(results);
}
