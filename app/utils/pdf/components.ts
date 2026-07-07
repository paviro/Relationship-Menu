import jsPDF from 'jspdf';
import { MenuData, MenuCategory, MenuItem } from '../../types';
import { COLORS, PDF_CONFIG } from './constants';
import { drawIcon, createItemMarker, drawRoundedRect } from './pdfUtils';
import { drawTextWithEmojis, computeTextWidthWithEmojis } from './emojiText';
import { formatPeopleNames } from '../formatUtils';
import { richTextToPlainText } from '../richTextUtils';
import { drawFormattedLineWithEmojis, wrapRichTextToLines, computeLineWidthFromSegments } from './formattedText';

/**
 * Adds the header section to the PDF for the first page
 */
export function addHeader(pdf: jsPDF, menuData: MenuData, yPos: number, dryRun: boolean = false): number {    
    if (dryRun) {
      return PDF_CONFIG.headerHeight;
    }
    
    // Header background
    pdf.setFillColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
    pdf.rect(0, 0, 210, PDF_CONFIG.headerHeight, 'F');
    
    // Header text styling
    pdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    
    // Main title
    pdf.setFontSize(PDF_CONFIG.titleFontSize + 3);
    pdf.setFont('Nunito', 'bold');
    pdf.text('Relationship Menu', PDF_CONFIG.margin, yPos + 12, { baseline: 'middle' });
    
    // People names subtitle
    const peopleText = formatPeopleNames(menuData.people);
    if (peopleText) {
      pdf.setFontSize(PDF_CONFIG.subtitleFontSize);
      pdf.setFont('Nunito', 'normal');
      pdf.text(peopleText, PDF_CONFIG.margin, yPos + 22, { baseline: 'middle' });
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
    
    // Compact header background
    pdf.setFillColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
    pdf.rect(0, 0, 210, PDF_CONFIG.compactHeaderHeight, 'F');
    
    // Header text styling
    pdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    
    // Vertical center position for text
    const textY = (PDF_CONFIG.compactHeaderHeight / 2);
    
    // Main title on left
    pdf.setFontSize(PDF_CONFIG.subtitleFontSize + 3);
    pdf.setFont('Nunito', 'bold');
    pdf.text('Relationship Menu', PDF_CONFIG.margin, textY, { baseline: 'middle' });
    
    const peopleText = formatPeopleNames(menuData.people);
    if (peopleText) {
      // People names on right
      pdf.setFontSize(PDF_CONFIG.subtitleFontSize - 4);
      pdf.setFont('Nunito', 'normal');
      pdf.text(peopleText, 210 - PDF_CONFIG.margin, textY, { align: 'right', baseline: 'middle' });
    }
    
    // Return the position below the header
    return PDF_CONFIG.compactHeaderHeight;
  }

/**
 * Adds a legend explaining the icons (horizontal compact version)
 */
export function addLegend(pdf: jsPDF, yPos: number, isCompact: boolean = false, dryRun: boolean = false): number {
    const iconTypes = ['must', 'like', 'maybe', 'prefer-not', 'off-limit', 'talk'];
    // Responsive padding and sizing based on compact mode
    const vertPadding = isCompact ? 3 : 4;
    let iconSize = isCompact ? PDF_CONFIG.legendIconSize - 0.7 : PDF_CONFIG.legendIconSize;
    let fontSize = isCompact ? PDF_CONFIG.legendCompactFontSize : PDF_CONFIG.legendFontSize;
    const calcLegendHeight = () => vertPadding * 2 + iconSize;
    let legendHeight = calcLegendHeight();

    if (dryRun) {
      return yPos + legendHeight + PDF_CONFIG.legendBottomMargin;
    }

    // Legend background
    pdf.setFillColor((COLORS.legendBg as number[])[0], (COLORS.legendBg as number[])[1], (COLORS.legendBg as number[])[2]);
    pdf.rect(0, yPos, 210, legendHeight, 'F');

    // Subtle bottom border
    pdf.setDrawColor(240, 240, 240);
    pdf.setLineWidth(0.2);
    pdf.line(0, yPos + legendHeight, 210, yPos + legendHeight);

    // Legend typography
    pdf.setFont('Nunito', 'bold');
    pdf.setFontSize(fontSize);

    // Compute widths for tight icon-label pairs
    const iconTextGap = 3; // Tighter gap between icon and text
    const computeItemWidths = () => iconTypes.map(iconType => {
      const iconColor = COLORS[iconType];
      const label = 'label' in iconColor ? iconColor.label : '';
      return iconSize + iconTextGap + pdf.getTextWidth(label);
    });
    let itemWidths = computeItemWidths();
    let totalItemsWidth = itemWidths.reduce((s, w) => s + w, 0);
    const horizontalMargin = isCompact ? 10 : 15;
    let availableWidth = 210 - horizontalMargin * 2;
    let spacing = (availableWidth - totalItemsWidth) / (iconTypes.length - 1);

    // If spacing is too small/negative, reduce font size and recompute
    let attempts = 0;
    while (spacing < 8 && attempts < 3) {
      fontSize -= 1;
      iconSize -= 0.2;
      legendHeight = calcLegendHeight();
      pdf.setFontSize(fontSize);
      itemWidths = computeItemWidths();
      totalItemsWidth = itemWidths.reduce((s, w) => s + w, 0);
      availableWidth = 210 - horizontalMargin * 2;
      spacing = (availableWidth - totalItemsWidth) / (iconTypes.length - 1);
      attempts += 1;
    }
    spacing = Math.max(spacing, 8);

    // Vertical center line for icons/labels
    const centerY = yPos + legendHeight / 2;

    // Lay out items with tight icon-label pairing
    let currentX = horizontalMargin;
    iconTypes.forEach((iconType, index) => {
      drawIcon(pdf, iconType, currentX, centerY, iconSize);

      const iconColor = COLORS[iconType];
      const label = 'label' in iconColor ? iconColor.label : '';
      // Darker legend text positioned close to icon
      pdf.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
      pdf.text(label, currentX + iconSize + iconTextGap, centerY, { baseline: 'middle' });

      if (index < iconTypes.length - 1) {
        currentX += itemWidths[index] + spacing;
      }
    });

    return yPos + legendHeight + PDF_CONFIG.legendBottomMargin;
}

/**
 * Adds the footer to the PDF
 */
export function addFooter(pdf: jsPDF, menuData: MenuData): void {
  const pageCount = pdf.getNumberOfPages();
  
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
    
    const footerHeight = PDF_CONFIG.footerHeight;
    const footerTop = 297 - footerHeight;
    
    // Footer background
    pdf.setFillColor(COLORS.footerBg[0], COLORS.footerBg[1], COLORS.footerBg[2]);
    pdf.rect(0, footerTop, 210, footerHeight, 'F');
    
    // Subtle top border
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.2);
    pdf.line(0, footerTop, 210, footerTop);
    
    // Calculate positions for properly centered text
    const footerMidY = footerTop + (footerHeight / 2);
    const lineSpacing = 4; // Space between the two lines
    const firstLineY = footerMidY - (lineSpacing / 2);
    const secondLineY = footerMidY + (lineSpacing / 2);
    
    // Left section: site attribution and edit info
    pdf.setTextColor(230, 230, 230);
    pdf.setFontSize(11);
    pdf.setFont('Nunito', 'bold');
    const siteText = "relationshipmenu.org";
    pdf.text(siteText, PDF_CONFIG.margin, firstLineY, { baseline: 'middle' });

    // Instructions for editing the menu
    pdf.setFontSize(8.5);
    pdf.setFont('Nunito', 'normal');
    pdf.setTextColor(200, 200, 200);
    const editableText = "Edit this menu by importing the PDF into the app or website.";
    pdf.text(editableText, PDF_CONFIG.margin, secondLineY, { baseline: 'middle' });
    
    // Calculate maximum width for the clickable area
    const siteTextWidth = pdf.getTextWidth(siteText);
    const editableTextWidth = pdf.getTextWidth(editableText);
    const maxWidth = Math.max(siteTextWidth, editableTextWidth);
    
    // Add clickable link covering both lines of text
    pdf.link(
      PDF_CONFIG.margin, 
      firstLineY - 6, 
      maxWidth, 
      12, 
      { url: 'https://relationshipmenu.org' }
    );
    
    // Right side: page number and last updated
    const rightX = 210 - PDF_CONFIG.margin;
    
    // Always show page number
    pdf.setFontSize(9.5);
    pdf.setFont('Nunito', 'bold');
    pdf.setTextColor(230, 230, 230);
    const pageText = pageCount > 1 ? `Page ${i} of ${pageCount}` : `Page ${i}`;
    pdf.text(pageText, rightX, firstLineY, { align: 'right', baseline: 'middle' });
    
    // Last updated info (moved to right side, below page counter)
    pdf.setFontSize(8);
    pdf.setFont('Nunito', 'normal');
    pdf.setTextColor(200, 200, 200);
    pdf.text(`Last updated: ${updateDate}`, rightX, secondLineY, { align: 'right', baseline: 'middle' });
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
  // Section header dimensions and styling
  const sectionHeaderHeight = 12.5; // ~36pt
  const sideMargin = 9;
  const cornerRadius = 3.2;

  if (!dryRun) {
    pdf.setFillColor(COLORS.sectionHeader[0], COLORS.sectionHeader[1], COLORS.sectionHeader[2]);
    drawRoundedRect(pdf, sideMargin, yPos + 2, 210 - sideMargin * 2, sectionHeaderHeight, cornerRadius);
    pdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    pdf.setFont('Nunito', 'bold');
    pdf.setFontSize(PDF_CONFIG.sectionTitleFontSize);
    const textY = yPos + 2 + sectionHeaderHeight / 2;
    pdf.text(category.name, PDF_CONFIG.margin, textY, { baseline: 'middle' });
  }

  if (isLastElementOnPage) {
    return yPos + sectionHeaderHeight + 4;
  } else if (PDF_CONFIG.sectionHeaderMargin === 0) {
    return yPos + sectionHeaderHeight + 4;
  } else {
    return yPos + sectionHeaderHeight + PDF_CONFIG.sectionHeaderMargin + 4;
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
    pdf.setFont('Nunito', 'bold');
    pdf.setFontSize(PDF_CONFIG.itemFontSize);
    pdf.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
    const nameWidth = pdf.getTextWidth(item.name);

    // Draw background marker for items with status (excluding unset and talk items)
    const iconKey = (item.icon || '').toString();
    if (iconKey && iconKey !== 'notSet' && iconKey !== 'not-set' && iconKey !== 'talk') {
      createItemMarker(pdf, item.icon || null, textStartX, centerY, nameWidth, PDF_CONFIG.lineHeight);
    }

    // Draw item name
    pdf.text(item.name, textStartX, centerY, { baseline: 'middle' });
  }
  
  let bottomY = yPos;
  let itemHeight = 0;
  
  // Calculate height for this item
  const notePlain = richTextToPlainText(item.note || null);
  if (notePlain && notePlain.trim().length > 0) {
    const noteCenterY = centerY + PDF_CONFIG.lineHeight + PDF_CONFIG.noteItemSpacing;
    pdf.setFont('Nunito', 'normal');
    pdf.setFontSize(PDF_CONFIG.noteFontSize);
    pdf.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
    
    const pageInnerWidth = 210 - PDF_CONFIG.margin * 2;
    const textWidth = pageInnerWidth - (PDF_CONFIG.iconOffset);
    // Use rich run-aware wrapping for accurate layout and emoji handling
    const richLines = wrapRichTextToLines(pdf, item.note || null, textWidth);
    
    if (!dryRun) {
      // Handle notes that continue from previous page
      if (item.continuedNote) {
        if (richLines.length > 0) {
          // Continuation indicator
          pdf.setTextColor(180, 180, 180);
          pdf.setFont('Nunito', 'normal');
          drawTextWithEmojis(pdf, "...  ", textStartX, noteCenterY);
          
          // Calculate prefix width
          const prefixWidth = computeTextWidthWithEmojis(pdf, "...  ");
          
          // First line of continued note (formatted)
          const defaultGray: [number, number, number] = [COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]];
          pdf.setTextColor(defaultGray[0], defaultGray[1], defaultGray[2]);
          const firstSegments = richLines[0] || [];
          drawFormattedLineWithEmojis(pdf, firstSegments, textStartX + prefixWidth, noteCenterY, defaultGray);
          
          // Remaining lines (formatted)
          for (let idx = 1; idx < richLines.length; idx++) {
            const y = noteCenterY + idx * PDF_CONFIG.noteLineHeight;
            const segs = richLines[idx];
            if (segs.length > 0) {
              drawFormattedLineWithEmojis(pdf, segs, textStartX, y, defaultGray);
            }
          }
        }
      } else {
        // Handle notes that continue to next page
        if (item.continuesOnNextPage && richLines.length > 0) {
          // Draw all lines except the last
          for (let idx = 0; idx < richLines.length - 1; idx++) {
            const y = noteCenterY + idx * PDF_CONFIG.noteLineHeight;
            const segs = richLines[idx];
            if (segs.length > 0) {
              drawFormattedLineWithEmojis(pdf, segs, textStartX, y, [COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]]);
            }
          }
          
          // Last line with continuation indicator
          const lastLineIdx = richLines.length - 1;
          const lastLineY = noteCenterY + lastLineIdx * PDF_CONFIG.noteLineHeight;
          
          pdf.setFont('Nunito', 'normal');
          const lastSegs = richLines[lastLineIdx];
          if (lastSegs.length > 0) {
            const defaultGray: [number, number, number] = [COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]];
            drawFormattedLineWithEmojis(pdf, lastSegs, textStartX, lastLineY, defaultGray);
          }
          
          // Continuation indicator at end of line
          const lastLineWidth = computeLineWidthFromSegments(pdf, lastSegs || []);
          pdf.setTextColor(180, 180, 180);
          pdf.setFont('Nunito', 'normal');
          drawTextWithEmojis(pdf, "  ...", textStartX + lastLineWidth, lastLineY);
          
          // Reset text color
          pdf.setTextColor(COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]);
        } else {
          // Regular note with no continuation
          const defaultGray: [number, number, number] = [COLORS.gray[0], COLORS.gray[1], COLORS.gray[2]];
          richLines.forEach((segments, idx: number) => {
            const y = noteCenterY + idx * PDF_CONFIG.noteLineHeight;
            if (segments.length > 0) {
              pdf.setFont('Nunito', 'normal');
              pdf.setFontSize(PDF_CONFIG.noteFontSize);
              pdf.setTextColor(defaultGray[0], defaultGray[1], defaultGray[2]);
              drawFormattedLineWithEmojis(pdf, segments, textStartX, y, defaultGray);
            }
          });
        }
      }
    }
    
    // Calculate height including the note text
    const noteTextHeight = richLines.length * PDF_CONFIG.noteLineHeight;
    
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