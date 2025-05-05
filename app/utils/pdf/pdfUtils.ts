import jsPDF from 'jspdf';
import { COLORS, PDF_CONFIG } from './constants';
import { ColorTypes } from './types';

/**
 * Draws an icon for a menu item
 */
export function drawIcon(pdf: jsPDF, iconType: string | null, x: number, y: number, size: number): void {
  // Default to "not set" if no icon is specified
  const iconKey = iconType || 'notSet';
  
  // Get the icon colors, with fallback to notSet if the icon type doesn't exist
  const iconColor = iconKey in COLORS 
    ? (COLORS as ColorTypes)[iconKey] 
    : COLORS.notSet;
  
  const bgColor = 'bg' in iconColor ? iconColor.bg : COLORS.notSet.bg;
  const borderColor = 'border' in iconColor ? iconColor.border : COLORS.notSet.border;
  
  // Set scale factor based on size (20 is the reference size in user example)
  const scale = size / 20;
  const centerX = x + size/2;
  
  // Get proper vertical centering for legends vs. menu items
  // In legends, we want perfect vertical centering with text
  const centerY = y;
  
  // Set line settings
  pdf.setLineWidth(1.5 * scale);
  pdf.setLineCap('round');
  pdf.setLineJoin('round');
  
  switch(iconType) {
    case 'like':
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.circle(centerX, centerY, 9 * scale, 'FD');
      pdf.lines([[3 * scale, 3 * scale], [5 * scale, -6 * scale]], centerX - 4 * scale, centerY);
      break;
      
    case 'maybe':
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.circle(centerX, centerY, 9 * scale, 'FD');
      
      // Question mark path (adjusted for vertical alignment)
      const pts = [
        [centerX - 3 * scale, centerY - 2.5 * scale],
        [centerX - 2.4 * scale, centerY - 3.5 * scale],
        [centerX - 1.3 * scale, centerY - 4.2 * scale],
        [centerX, centerY - 4.2 * scale],
        [centerX + 1.3 * scale, centerY - 4.2 * scale],
        [centerX + 2.4 * scale, centerY - 3.5 * scale],
        [centerX + 3 * scale, centerY - 2.5 * scale],
        [centerX + 2.4 * scale, centerY - 1.5 * scale],
        [centerX + 1.3 * scale, centerY - 0.8 * scale],
        [centerX, centerY],
        [centerX, centerY + 1.5 * scale]
      ];
      
      for (let i = 0; i < pts.length - 1; i++) {
        pdf.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      }
      
      // Dot under the curve
      pdf.line(centerX, centerY + 4.5 * scale, centerX, centerY + 4.51 * scale);
      break;
      
    case 'must':
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.circle(centerX, centerY, 9 * scale, 'FD');
      
      // Exclamation mark
      pdf.line(centerX, centerY - 5 * scale, centerX, centerY + 2 * scale);
      pdf.line(centerX, centerY + 5 * scale, centerX, centerY + 5.01 * scale);
      break;
      
    case 'prefer-not':
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.circle(centerX, centerY, 9 * scale, 'FD');
      
      // Dash
      pdf.line(centerX - 4 * scale, centerY, centerX + 4 * scale, centerY);
      break;
      
    case 'off-limit':
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.circle(centerX, centerY, 9 * scale, 'FD');
      
      // X mark
      pdf.line(centerX - 4 * scale, centerY - 4 * scale, centerX + 4 * scale, centerY + 4 * scale);
      pdf.line(centerX + 4 * scale, centerY - 4 * scale, centerX - 4 * scale, centerY + 4 * scale);
      break;
      
    case 'talk':
      pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      
      // Approximate bubble shape - rectangle with rounded corners
      pdf.rect(centerX - 6 * scale, centerY - 4.5 * scale, 12 * scale, 9 * scale, 'FD');
      
      // Triangle pointer at bottom
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.triangle(
        centerX + 1 * scale, centerY + 4.5 * scale, 
        centerX, centerY + 6 * scale, 
        centerX - 1 * scale, centerY + 4.5 * scale, 
        'FD'
      );
      break;
      
    case 'notSet':
      // Simple black dot
      pdf.setFillColor(0, 0, 0);
      pdf.circle(centerX, centerY, 3 * scale, 'F');
      break;
      
    default:
      // Simple black dot for any undefined icon
      pdf.setFillColor(0, 0, 0);
      pdf.circle(centerX, centerY, 3 * scale, 'F');
      break;
  }
}

/**
 * Creates a marker/highlight box around an item
 */
export function createItemMarker(pdf: jsPDF, iconType: string | null, x: number, y: number, width: number, height: number): void {
  // Default to "not set" if no icon is specified
  const iconKey = iconType || 'notSet';
  
  // Get the marker color, with fallback to transparent if the icon type doesn't exist
  const iconColor = iconKey in COLORS 
    ? (COLORS as ColorTypes)[iconKey] 
    : COLORS.notSet;
  
  // Only draw marker if the icon is not "notSet"
  if (iconKey !== 'notSet') {
    const markerColor = 'marker' in iconColor ? iconColor.marker : COLORS.notSet.marker;
    
    // Calculate proper marker width based on text width with less extreme padding
    const horizontalPadding = PDF_CONFIG.markerHorizontalPadding;
    const verticalPadding = PDF_CONFIG.markerVerticalPadding;
    const markerWidth = width + (horizontalPadding * 2);
    const markerHeight = height + verticalPadding;
    const borderRadius = PDF_CONFIG.markerBorderRadius;
    
    // Draw a pill-shaped rounded rectangle with subtle color
    pdf.setFillColor(markerColor[0], markerColor[1], markerColor[2]);
    
    // Position the marker centered on the text
    const markerY = y - markerHeight/2;
    
    // Draw rounded rectangle as a pill shape
    drawRoundedRect(
      pdf, 
      x - horizontalPadding, 
      markerY, 
      markerWidth, 
      markerHeight, 
      borderRadius
    );
  }
}

/**
 * Draw a rounded rectangle with consistent radius on all corners
 */
export function drawRoundedRect(pdf: jsPDF, x: number, y: number, width: number, height: number, radius: number) {
  // Make sure radius isn't too large for the rectangle
  const maxRadius = Math.min(width, height) / 2;
  radius = Math.min(radius, maxRadius);
  
  pdf.setLineWidth(0); // No border, just fill
  
  // Begin path
  pdf.roundedRect(x, y, width, height, radius, radius, 'F');
}

/**
 * Formats people's names into a readable string
 */
export function formatPeople(people: string[]): string {
  if (people.length === 0) return "";
  if (people.length === 1) return people[0];
  if (people.length === 2) return `${people[0]} & ${people[1]}`;
  return `${people.slice(0, -1).join(', ')}, & ${people[people.length - 1]}`;
} 