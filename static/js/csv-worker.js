/**
 * CSV Parser Web Worker - Optimized for Core Web Vitals INP
 * Moves heavy parsing operations off the main thread
 */

/**
 * Sanitize text to prevent XSS attacks
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Parse a single CSV line handling quoted fields with XSS protection
 */
function parseCSVLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(sanitizeText(current));
        current = '';
      } else {
        current += ch;
      }
    }
  }
  cells.push(sanitizeText(current));
  return cells;
}

/**
 * Parse CSV data in worker thread
 */
function parseCSVData(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());

  if (lines.length === 0) return { announcement: '', beers: [] };

  // First row may contain announcement in columns C-F (index 2-5)
  const firstRow = parseCSVLine(lines[0]);
  const announcement = [firstRow[2], firstRow[3], firstRow[4], firstRow[5]]
    .filter(Boolean)
    .join(' ');

  // Find header row (contains "pivo", "pivovar", or "nazev")
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('pivo') || lower.includes('pivovar') || lower.includes('název')) {
      headerIdx = i;
      break;
    }
  }

  // Normalize header keys
  function normalizeKey(h) {
    const k = h.toLowerCase().trim();
    if (k.includes('pivovar')) return 'pivovar';
    if (k.includes('název') || k.includes('name')) return 'nazev';
    if (k.includes('styl') || k.includes('style')) return 'styl';
    if (k.includes('alk') || k === '%') return 'abv';
    if (k.includes('ibu')) return 'ibu';
    if (k.includes('cena') || k.includes('price')) return 'cena';
    return k;
  }

  const beers = [];
  if (headerIdx >= 0) {
    const rawHeaders = parseCSVLine(lines[headerIdx]);
    const headers = rawHeaders.map(normalizeKey);
    for (let i = headerIdx + 1; i < lines.length && beers.length < 12; i++) {
      const cells = parseCSVLine(lines[i]);
      const breweryIdx = headers.indexOf('pivovar');
      const nameIdx = headers.indexOf('nazev');
      const brewery = breweryIdx >= 0 ? (cells[breweryIdx] || '').trim() : '';
      const name = nameIdx >= 0 ? (cells[nameIdx] || '').trim() : '';
      if (!brewery && !name) continue;

      const beer = {};
      headers.forEach((h, idx) => {
        if (h) beer[h] = (cells[idx] || '').trim();
      });
      beers.push(beer);
    }
  }

  return { announcement, beers };
}

// Worker message handler
self.onmessage = function(e) {
  const { id, type, data } = e.data;

  try {
    if (type === 'parse-csv') {
      const result = parseCSVData(data);
      self.postMessage({ id, type: 'parse-csv-result', data: result });
    }
  } catch (error) {
    self.postMessage({
      id,
      type: 'parse-csv-error',
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};