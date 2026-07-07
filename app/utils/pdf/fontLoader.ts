import jsPDF from 'jspdf';
import { NUNITO_FONTS_COMPRESSED } from '../../../generated/fonts';
import { ungzip } from 'pako';

// Efficiently convert a Uint8Array to base64 without exceeding the call stack
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000; // 32KB chunks to avoid large argument lists
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

/**
 * Helper function to decompress font data
 */
function decompressFont(compressedBase64: string): string {
  try {
    // Convert base64 back to Uint8Array
    const compressedData = Uint8Array.from(atob(compressedBase64), c => c.charCodeAt(0));
    
    // Decompress using pako
    const decompressedData = ungzip(compressedData);
    
    // Convert back to base64 for jsPDF (chunked to avoid stack overflows in Chrome)
    return uint8ToBase64(decompressedData);
  } catch (error) {
    console.error('Failed to decompress font:', error);
    throw error;
  }
}

/**
 * Loads Nunito fonts into jsPDF
 * This should be called for each jsPDF instance before generating any PDF
 */
export function loadNunitoFonts(pdf: jsPDF): void {
  // Check if Nunito fonts are already loaded in this instance
  const fontList = pdf.getFontList();
  if (
    fontList.Nunito &&
    fontList.Nunito.includes('normal') &&
    fontList.Nunito.includes('bold') &&
    fontList.Nunito.includes('italic') &&
    fontList.Nunito.includes('bolditalic')
  ) {
    return; // Fonts already loaded
  }
  
  try {
    // Decompress and add the Nunito font variants we use
    const nunitoRegular = decompressFont(NUNITO_FONTS_COMPRESSED.normal);
    pdf.addFileToVFS('Nunito-Regular.ttf', nunitoRegular);
    pdf.addFont('Nunito-Regular.ttf', 'Nunito', 'normal');
    
    const nunitoBold = decompressFont(NUNITO_FONTS_COMPRESSED.bold);
    pdf.addFileToVFS('Nunito-Bold.ttf', nunitoBold);
    pdf.addFont('Nunito-Bold.ttf', 'Nunito', 'bold');
    
    const nunitoItalic = decompressFont(NUNITO_FONTS_COMPRESSED.italic);
    pdf.addFileToVFS('Nunito-Italic.ttf', nunitoItalic);
    pdf.addFont('Nunito-Italic.ttf', 'Nunito', 'italic');
    
    const nunitoBoldItalic = decompressFont(NUNITO_FONTS_COMPRESSED.bolditalic);
    pdf.addFileToVFS('Nunito-BoldItalic.ttf', nunitoBoldItalic);
    pdf.addFont('Nunito-BoldItalic.ttf', 'Nunito', 'bolditalic');
    
  } catch (error) {
    console.error('Failed to load Nunito fonts:', error);
    throw error;
  }
}