/**
 * Emoji rendering helpers
 *
 * The approach of rasterizing emojis to a canvas and embedding them as images
 * into jsPDF is inspired by bettysteger’s gist "jsPDF-with-emojis.js".
 * Source: https://gist.github.com/bettysteger/499e5fc603df772858ba26825a4c5169
 */
import jsPDF from 'jspdf';
import emojiRegex from 'emoji-regex-xs';
import { PDF_CONFIG } from './constants';

/**
 * Splits a string into an array of tokens separating normal text and emoji sequences
 */
function tokenizeTextWithEmojis(text: string): Array<{ type: 'text' | 'emoji'; value: string }> {
  const tokens: Array<{ type: 'text' | 'emoji'; value: string }> = [];
  if (!text) return tokens;
  let lastIndex = 0;
  // Use emoji-regex-xs global regex to capture positions, supports complex ZWJ sequences
  const matcher = emojiRegex();
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(text)) !== null) {
    const start = match.index;
    const end = matcher.lastIndex;
    if (start > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, start) });
    }
    tokens.push({ type: 'emoji', value: match[0] });
    lastIndex = end;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return tokens;
}

/**
 * Renders an emoji to a canvas and returns the data URL.
 * Uses a large canvas for crisp results when downscaled in the PDF.
 */
function renderEmojiToDataUrl(emoji: string): string {
  const size = 256; // large for quality
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.clearRect(0, 0, size, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Prefer common color-emoji fonts, fall back to system UI
  ctx.font = `${size}px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, EmojiOne Color, sans-serif`;
  ctx.fillText(emoji, size / 2, size / 2);
  return canvas.toDataURL('image/png');
}

/**
 * Measures the text height in current font settings (in document units)
 */
function getCurrentTextHeight(pdf: jsPDF): number {
  // getTextDimensions returns width/height in the current unit (mm here)
  interface TextDimensions {
    h: number;
    w: number;
  }
  
  const dims = 'getTextDimensions' in pdf && typeof pdf.getTextDimensions === 'function' 
    ? (pdf.getTextDimensions as (text: string) => TextDimensions)('Hg') 
    : { h: PDF_CONFIG.lineHeight };
  return typeof dims === 'object' && 'h' in dims ? dims.h : PDF_CONFIG.lineHeight;
}

/**
 * Computes the width of a string that may contain emojis by summing text widths and an estimated emoji box width.
 * Returns width in document units (mm).
 */
export function computeTextWidthWithEmojis(pdf: jsPDF, text: string, emojiScale: number = 1.1): number {
  if (!text) return 0;
  const tokens = tokenizeTextWithEmojis(text);
  const textHeight = getCurrentTextHeight(pdf);
  const emojiWidth = textHeight * emojiScale; // square box roughly following text height
  let width = 0;
  tokens.forEach(t => {
    if (t.type === 'text') {
      width += pdf.getTextWidth(t.value);
    } else {
      width += emojiWidth + 0.4; // small padding to match visual spacing
    }
  });
  return width;
}

/**
 * Splits text into lines that fit within maxWidth, accounting for emoji widths.
 * Preserves explicit newlines in the input by starting new lines.
 * Ensures no line starts with leading spaces.
 */
export function splitTextToSizeWithEmojis(pdf: jsPDF, text: string, maxWidth: number): string[] {
  if (text === undefined || text === null) return [];
  const lines: string[] = [];
  const rawLines = String(text).split('\n');
  
  for (const rawLine of rawLines) {
    // Preserve explicit blank lines
    if (rawLine.trim().length === 0) {
      lines.push('');
      continue;
    }
    
    // Split into words, removing all whitespace
    const words = rawLine.trim().split(/\s+/).filter(word => word.length > 0);
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
      const testWidth = computeTextWidthWithEmojis(pdf, testLine);
      
      if (testWidth <= maxWidth || currentLine.length === 0) {
        // Word fits on current line, or it's the first word (must fit even if too long)
        currentLine = testLine;
      } else {
        // Word doesn't fit, start a new line
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    // Add the final line if it has content
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  }
  
  return lines;
}

/**
 * Draws left-aligned text that may contain emojis. Returns the rendered width in document units (mm).
 */
export function drawTextWithEmojis(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  opts?: { baseline?: 'alphabetic' | 'middle'; emojiScale?: number }
): number {
  const tokens = tokenizeTextWithEmojis(text);
  const textHeight = getCurrentTextHeight(pdf);
  const emojiScale = opts?.emojiScale ?? 1.1;
  const emojiBox = textHeight * emojiScale;
  const baseline = opts?.baseline ?? 'alphabetic';
  let cursorX = x;

  tokens.forEach(t => {
    if (t.type === 'text') {
      if (t.value) {
        const options = baseline === 'middle' ? { baseline: 'middle' as const } : undefined;
        pdf.text(t.value, cursorX, y, options);
        cursorX += pdf.getTextWidth(t.value);
      }
    } else {
      const dataUrl = renderEmojiToDataUrl(t.value);
      const imgY = baseline === 'middle' ? y - emojiBox / 2 : y - emojiBox * 0.8; // align visually to baseline
      try {
        pdf.addImage(dataUrl, 'PNG', cursorX, imgY, emojiBox, emojiBox);
      } catch {
        // Fallback: draw as plain text if image add fails
        const options = baseline === 'middle' ? { baseline: 'middle' as const } : undefined;
        pdf.text(t.value, cursorX, y, options);
      }
      cursorX += emojiBox + 0.4;
    }
  });

  return cursorX - x;
}