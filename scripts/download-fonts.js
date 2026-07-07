#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pako = require('pako');

// Google Fonts API URLs for TTF files (these work for jsPDF)
// Only download variants that we actually use in PDF generation
// Key format maps to generated filenames
const FONT_VARIANTS = {
  'nunito-regular': { ital: 0, weight: '400' },
  'nunito-bold': { ital: 0, weight: '700' },
  'nunito-italic': { ital: 1, weight: '400' },
  'nunito-bolditalic': { ital: 1, weight: '700' },
};

// Function to get font URL from Google Fonts API
function getFontApiUrl(ital, weight) {
  // Use ital,wght axis to fetch just the target variant
  return `https://fonts.googleapis.com/css2?family=Nunito:ital,wght@${ital},${weight}&display=swap`;
}

async function extractTtfUrl(cssUrl) {
  try {
    const response = await fetch(cssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; fontdownloader/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const css = await response.text();
    
    // Extract the truetype URL from the CSS
    const ttfMatch = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/);
    
    if (!ttfMatch) {
      throw new Error('TTF URL not found in CSS');
    }
    
    return ttfMatch[1];
  } catch (error) {
    console.error('Error extracting TTF URL:', error.message);
    return null;
  }
}

const FONTS_DIR = path.join(__dirname, '..', 'generated', 'fonts');

async function downloadFont(fontName, ital, weight) {
  console.log(`Downloading ${fontName} (weight ${weight})...`);
  
  try {
    // First, get the CSS to extract the TTF URL
    const cssUrl = getFontApiUrl(ital, weight);
    const ttfUrl = await extractTtfUrl(cssUrl);
    
    if (!ttfUrl) {
      throw new Error('Could not extract TTF URL');
    }
    
    console.log(`  Found TTF URL: ${ttfUrl}`);
    
    // Download the TTF file
    const response = await fetch(ttfUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Compress the font data using pako (browser-compatible gzip)
    const compressed = pako.gzip(uint8Array);
    
    // Convert compressed data to base64
    const compressedBase64 = Buffer.from(compressed).toString('base64');
    
    // Calculate compression ratio
    const originalSize = uint8Array.length;
    const compressedSize = compressed.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log(`  Original: ${(originalSize / 1024).toFixed(1)}KB, Compressed: ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);
    
    // Create the font file content with compressed data
    const fontContent = `// Auto-generated compressed TTF font file for ${fontName}
// Original size: ${(originalSize / 1024).toFixed(1)}KB, Compressed: ${(compressedSize / 1024).toFixed(1)}KB
export const ${fontName.replace('-', '_')}_compressed = "${compressedBase64}";
`;
    
    const outputPath = path.join(FONTS_DIR, `${fontName}.ts`);
    fs.writeFileSync(outputPath, fontContent);
    
    console.log(`✓ Downloaded and converted ${fontName}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to download ${fontName}:`, error.message);
    return false;
  }
}

async function createFontIndex() {
  const indexContent = `// Auto-generated font index
import { nunito_regular_compressed } from './nunito-regular';
import { nunito_bold_compressed } from './nunito-bold';
import { nunito_italic_compressed } from './nunito-italic';
import { nunito_bolditalic_compressed } from './nunito-bolditalic';

// Font mappings for jsPDF (compressed data)
export const NUNITO_FONTS_COMPRESSED = {
  normal: nunito_regular_compressed,
  bold: nunito_bold_compressed,
  italic: nunito_italic_compressed,
  bolditalic: nunito_bolditalic_compressed,
};

// Re-export individual fonts if needed
export { nunito_regular_compressed, nunito_bold_compressed, nunito_italic_compressed, nunito_bolditalic_compressed };
`;
  
  const indexPath = path.join(FONTS_DIR, 'index.ts');
  fs.writeFileSync(indexPath, indexContent);
  console.log('✓ Created font index file');
}

async function main() {
  console.log('Setting up Nunito TTF fonts for PDF generation...\n');
  
  // Create fonts directory if it doesn't exist
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }
  
  // Download all fonts
  const results = [];
  for (const [name, cfg] of Object.entries(FONT_VARIANTS)) {
    const success = await downloadFont(name, cfg.ital, cfg.weight);
    results.push({ name, success });
  }
  
  // Create index file
  await createFontIndex();
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n✓ Font setup complete! Downloaded ${successCount}/${results.length} Nunito fonts for PDF generation.`);
  
  if (successCount === 0) {
    console.error('Warning: No fonts were downloaded successfully. PDF generation will fall back to default fonts.');
  }
}

// Only run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
