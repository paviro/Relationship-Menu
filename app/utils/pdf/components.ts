import jsPDF from 'jspdf';
import { MenuData, MenuCategory, MenuItem } from '../../types';
import { COLORS, PDF_CONFIG } from './constants';
import { drawIcon, formatPeople, createItemMarker } from './pdfUtils';

/**
 * Adds the header section to the PDF for the first page
 */
export function addHeader(pdf: jsPDF, menuData: MenuData, yPos: number, dryRun: boolean = false): number {    
    if (dryRun) {
      return PDF_CONFIG.headerHeight;
    }
    
    // Add darker teal background to the header area
    pdf.setFillColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
    pdf.rect(0, 0, 210, PDF_CONFIG.headerHeight, 'F');
    
    // Set white text for header
    pdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    
    // Add title - make it bigger
    pdf.setFontSize(PDF_CONFIG.titleFontSize + 3);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relationship Menu', PDF_CONFIG.margin, yPos + 22); // Adjusted position
    
    // Add people involved - closer to the title
    const peopleText = formatPeople(menuData.people);
    if (peopleText) {
      pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
      pdf.setFont('helvetica', 'normal');
      // Removed "For" before people's names
      pdf.text(peopleText, PDF_CONFIG.margin, yPos + 32); // Moved closer to title
    }
    
    return PDF_CONFIG.headerHeight;
  }

/**
 * Adds a compact header for subsequent pages
 */
export function addCompactHeader(pdf: jsPDF, menuData: MenuData, pageNum: number, dryRun: boolean = false): number {
    if (dryRun) {
      return PDF_CONFIG.compactHeaderHeight;
    }
    
    // Add darker teal background to the slim header
    pdf.setFillColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
    pdf.rect(0, 0, 210, PDF_CONFIG.compactHeaderHeight, 'F');
    
    // Set white text
    pdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    
    // Center text vertically in the header
    const textY = (PDF_CONFIG.compactHeaderHeight / 2);
    
    // Add title part - bold and larger
    pdf.setFontSize(PDF_CONFIG.subtitleFontSize + 3);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relationship Menu', PDF_CONFIG.margin, textY);
    
    const peopleText = formatPeople(menuData.people);
    if (peopleText) {
      // Add people part right-aligned
      pdf.setFontSize(PDF_CONFIG.subtitleFontSize - 4);
      pdf.setFont('helvetica', 'normal');
      // Right align at page margin
      pdf.text(peopleText, 210 - PDF_CONFIG.margin, textY, { align: 'right' });
    }
    
    // Return the position below the header
    return PDF_CONFIG.compactHeaderHeight;
  }

/**
 * Adds a legend explaining the icons (horizontal compact version)
 */
export function addLegend(pdf: jsPDF, yPos: number, isCompact: boolean = false, dryRun: boolean = false): number {

    const iconTypes = ['must', 'like', 'maybe', 'talk', 'prefer-not', 'off-limit'];
    
    // Increased padding for more room around the legend items
    const vertPadding = isCompact ? 5 : 6;
    
    if (dryRun) {
      return yPos + vertPadding;
    }
    
    // Add a light background for the legend - full width
    pdf.setFillColor(245, 245, 245);
    
    // Create the background box with equal padding top and bottom
    pdf.rect(0, yPos - vertPadding, 210, vertPadding * 2, 'F');
    
    // Set font for measurements
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(isCompact ? PDF_CONFIG.legendCompactFontSize : PDF_CONFIG.legendFontSize);
    
    // Calculate actual width needed for each legend item (icon + text)
    const itemWidths = iconTypes.map(iconType => {
      const iconColor = COLORS[iconType];
      // Width = icon (size) + spacing between icon and text (6) + text width
      const iconWidth = isCompact ? PDF_CONFIG.legendIconSize - 0.5 : PDF_CONFIG.legendIconSize;
      // Ensure iconColor is of type ColorConfig before accessing label
      const label = 'label' in iconColor ? iconColor.label : '';
      const textWidth = pdf.getTextWidth(label);
      return iconWidth + 6 + textWidth;
    });
    
    // Calculate total width of all items
    const totalItemsWidth = itemWidths.reduce((sum, width) => sum + width, 0);
    
    // Calculate the spacing between items
    const pageWidth = 210;
    const horizontalMargin = 10; // Margin on each side
    const availableWidth = pageWidth - (horizontalMargin * 2);
    const spacing = (availableWidth - totalItemsWidth) / (iconTypes.length - 1);
    
    // Position first item at left margin
    let currentX = horizontalMargin;
    
    // Use the new larger icon size
    const iconSize = isCompact ? PDF_CONFIG.legendIconSize - 0.5 : PDF_CONFIG.legendIconSize;
    
    // Add each icon and its label
    iconTypes.forEach((iconType, index) => {
      const iconColor = COLORS[iconType];
      
      // Draw the icon
      drawIcon(pdf, iconType, currentX, yPos, iconSize);
      
      // Add label text
      pdf.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
      // Ensure iconColor is of type ColorConfig before accessing label
      const label = 'label' in iconColor ? iconColor.label : '';
      pdf.text(label, currentX + 6, yPos, {baseline: 'middle'});
      
      // Move to next position: current position + this item's width + spacing
      if (index < iconTypes.length - 1) {
        currentX += itemWidths[index] + spacing;
      }
    });
    
    // Return position after the legend with equal padding applied
    return yPos + vertPadding;
  }

/**
 * Adds the footer to the PDF
 */
export function addFooter(pdf: jsPDF, menuData: MenuData): void {
  const pageCount = pdf.internal.getNumberOfPages();
  
  // Format the date with month name
  const date = new Date(menuData.last_update);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const updateDate = date.toLocaleDateString('en-US', options);
  
  // Add footer to each page
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Gradient background (darker at bottom, slightly lighter at top)
    const footerHeight = PDF_CONFIG.footerHeight;
    const footerTop = 297 - footerHeight;
    
    // Draw background
    pdf.setFillColor(40, 40, 40); // Slightly darker than before
    pdf.rect(0, footerTop, 210, footerHeight, 'F');
    
    // Add a subtle divider line at the top of the footer
    pdf.setDrawColor(80, 80, 80);
    pdf.setLineWidth(0.2);
    pdf.line(0, footerTop + 0.5, 210, footerTop + 0.5);
    
    // Calculate positions
    const footerMidY = footerTop + (footerHeight / 2);
    
    // Left section: site attribution and edit info
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'bold');
    const siteText = "relationshipmenu.org";
    pdf.text(siteText, PDF_CONFIG.margin, footerMidY - 2, { baseline: 'middle' });

    // Add clearer editable note below website name
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(210, 210, 210); // Slightly lighter color for secondary text
    const editableText = "You can import and edit this PDF file on the website.";
    pdf.text(editableText, PDF_CONFIG.margin, footerMidY + 2, { baseline: 'middle' });
    
    // Calculate maximum width for the clickable area
    const siteTextWidth = pdf.getTextWidth(siteText);
    const editableTextWidth = pdf.getTextWidth(editableText);
    const maxWidth = Math.max(siteTextWidth, editableTextWidth);
    
    // Add clickable link covering both lines of text
    pdf.link(
      PDF_CONFIG.margin, 
      footerMidY - 8, 
      maxWidth, 
      16, 
      { url: 'https://relationshipmenu.org' }
    );
    
    // Right side: page number and last updated
    const rightX = 210 - PDF_CONFIG.margin;
    
    // Page number if multiple pages
    if (pageCount > 1) {
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(210, 210, 210);
      pdf.text(`Page ${i} of ${pageCount}`, rightX, footerMidY - 2, { align: 'right', baseline: 'middle' });
    }
    
    // Last updated info (moved to right side, below page counter)
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(180, 180, 180);
    pdf.text(`Last updated: ${updateDate}`, rightX, footerMidY + 2, { align: 'right', baseline: 'middle' });
  }
}

/**
 * Draws a section header
 * @param pdf The PDF document
 * @param category The category data to display
 * @param yPos The Y position to draw the section header (top edge)
 * @param isLastElementOnPage Whether this is the last element on the page
 * @returns The new Y position after drawing (bottom edge)
 */
export function drawSectionHeader(pdf: jsPDF, category: MenuCategory, yPos: number, isLastElementOnPage: boolean, dryRun: boolean = false): number {
  const sectionHeaderHeight = 12;

  if (!dryRun) {
    pdf.setFillColor(COLORS.sectionHeader[0], COLORS.sectionHeader[1], COLORS.sectionHeader[2]);
    pdf.rect(0, yPos, 210, sectionHeaderHeight, 'F');
    pdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.sectionTitleFontSize);
    pdf.text(category.name, PDF_CONFIG.margin, yPos + sectionHeaderHeight / 2, { baseline: 'middle' });
  }

  if (isLastElementOnPage) {
    return yPos + sectionHeaderHeight;
  } else if (PDF_CONFIG.sectionHeaderMargin === 0) {
    // For zero margin, position exactly at the bottom of the section header
    return yPos + sectionHeaderHeight;
  } else {
    // For non-zero margin, add the margin to create space
    return yPos + sectionHeaderHeight + PDF_CONFIG.sectionHeaderMargin;
  }
}

/**
 * Draws a menu item
 * @param pdf The PDF document
 * @param item The menu item data to display
 * @param yPos The Y position to draw the menu item (top edge)
 * @param isLastElementOnPage Whether this is the last element on the page
 * @param isLastInSection Whether this is the last element in the section
 * @returns The new Y position after drawing (bottom edge)
 */
export function drawMenuItem(pdf: jsPDF, item: MenuItem & { continuedNote?: boolean; continuesOnNextPage?: boolean }, yPos: number, isLastElementOnPage: boolean, dryRun: boolean = false, isLastInSection: boolean = false): number {
  const iconX = PDF_CONFIG.margin;
  const textStartX = PDF_CONFIG.margin + PDF_CONFIG.iconOffset;
  
  // Calculate the center point for drawing (yPos is now the top edge)
  const centerY = yPos + (PDF_CONFIG.lineHeight / 2);
  
  if (!dryRun) {
    // Draw icon
    drawIcon(pdf, item.icon || null, iconX, centerY, PDF_CONFIG.iconSize);
  
    // Draw item text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(PDF_CONFIG.itemFontSize);
    pdf.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
    const nameWidth = pdf.getTextWidth(item.name);
  
    // Draw marker if needed
    if (item.icon && item.icon !== 'notSet') {
      createItemMarker(pdf, item.icon || null, textStartX, centerY, nameWidth, PDF_CONFIG.lineHeight);
    }
  
    // Draw item name
    pdf.text(item.name, textStartX, centerY, { baseline: 'middle' });
  }
  
  let bottomY = yPos;
  let itemHeight = 0;
  
  // Calculate height for this item
  if (item.note && item.note.trim().length > 0) {
    const noteCenterY = centerY + PDF_CONFIG.lineHeight + PDF_CONFIG.noteItemSpacing;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(PDF_CONFIG.noteFontSize);
    pdf.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
    
    const textWidth = 190 - textStartX;
    const split = pdf.splitTextToSize(item.note, textWidth);
    
    // Filter out empty lines for spacing and rendering
    const nonEmptyLines = split.filter((line: string) => line.trim().length > 0);
    
    if (!dryRun) {
      // Add continuation indicator if this is a continued note
      if (item.continuedNote) {
        if (nonEmptyLines.length > 0) {
          // Add lighter gray color for continuation indicators
          pdf.setTextColor(180, 180, 180); // Lighter gray
          pdf.setFont('helvetica', 'normal');
          // Add the prefix with more prominent spacing
          pdf.text("...  ", textStartX, noteCenterY);
          
          // Calculate width of the prefix with wider spacing
          const prefixWidth = pdf.getTextWidth("...  ");
          
          // Add the first line after the prefix
          pdf.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]); // Reset to normal gray
          pdf.setFont('helvetica', 'normal');
          pdf.text(nonEmptyLines[0], textStartX + prefixWidth, noteCenterY);
          
          // Add the rest of the lines normally
          for (let idx = 1; idx < nonEmptyLines.length; idx++) {
            pdf.text(nonEmptyLines[idx], textStartX, noteCenterY + idx * PDF_CONFIG.noteLineHeight);
          }
        }
      } else {
        // For notes that continue onto next page
        if (item.continuesOnNextPage && nonEmptyLines.length > 0) {
          // Draw all lines except the last one
          for (let idx = 0; idx < nonEmptyLines.length - 1; idx++) {
            pdf.text(nonEmptyLines[idx], textStartX, noteCenterY + idx * PDF_CONFIG.noteLineHeight);
          }
          
          // For the last line, append "..."
          const lastLineIdx = nonEmptyLines.length - 1;
          const lastLineY = noteCenterY + lastLineIdx * PDF_CONFIG.noteLineHeight;
          
          pdf.setFont('helvetica', 'normal');
          const lastLine = nonEmptyLines[lastLineIdx];
          pdf.text(lastLine, textStartX, lastLineY);
          
          // Calculate position for the suffix
          const lastLineWidth = pdf.getTextWidth(lastLine);
          
          // Add the suffix with lighter gray and a space before it
          pdf.setTextColor(180, 180, 180); // Lighter gray
          pdf.setFont('helvetica', 'normal');
          pdf.text("  ...", textStartX + lastLineWidth, lastLineY);
          
          // Reset text color
          pdf.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        } else {
          // Regular note with no continuation
          nonEmptyLines.forEach((line: string, idx: number) => {
            pdf.text(line, textStartX, noteCenterY + idx * PDF_CONFIG.noteLineHeight);
          });
        }
      }
    }
    
    // Calculate height including the note text
    const noteTextHeight = nonEmptyLines.length * PDF_CONFIG.noteLineHeight;
    
    // No need for extra space for continuation indicators since they're inline
    // Calculate total item height (just base height + note height)
    itemHeight = PDF_CONFIG.lineHeight + PDF_CONFIG.noteItemSpacing + noteTextHeight;
    bottomY = yPos + itemHeight;
  } else {
    itemHeight = PDF_CONFIG.lineHeight;
    bottomY = yPos + itemHeight;
  }
  
  // Add spacing to next item, but only if not the last element on the page or last in section
  if (!isLastElementOnPage && !isLastInSection) {
    if (PDF_CONFIG.itemSpacing !== 0) {
        bottomY += PDF_CONFIG.itemSpacing;
    } 
  } else if (!isLastElementOnPage && isLastInSection) {
    // If it's the last item in a section but not the last on the page,
    // add the section last item margin
    if (PDF_CONFIG.sectionLastItemMargin !== 0) {
      bottomY += PDF_CONFIG.sectionLastItemMargin;
    }
  }
  
  return bottomY;
} 