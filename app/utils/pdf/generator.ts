import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { MenuData } from '../../types';
import { COLORS, PDF_CONFIG } from './constants';
import { addHeader, addCompactHeader, addLegend, addFooter, drawSectionHeader, drawMenuItem } from './components';
import { splitTextToSizeWithEmojis } from './emojiText';
import { richTextToPlainText } from '../richTextUtils';
import { DocumentContext } from './types';
import { loadNunitoFonts } from './fontLoader';

/**
 * Generates a PDF for the given relationship menu data
 * @param menuData The relationship menu data to convert to PDF
 * @returns The generated PDF as a Blob
 */
export async function generateMenuPDF(menuData: MenuData): Promise<Blob> {
  // Create PDF instance
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Load Nunito fonts into jsPDF
  loadNunitoFonts(pdf);
  
  // Set default font to Nunito
  pdf.setFont('Nunito', 'normal');
  
  // Subtle page background like iOS
  pdf.setFillColor((COLORS.pageBackground as number[])[0], (COLORS.pageBackground as number[])[1], (COLORS.pageBackground as number[])[2]);
  pdf.rect(0, 0, 210, 297, 'F');
  
  // Create a deep copy of menu data to avoid modifying the original
  const workingMenuData = JSON.parse(JSON.stringify(menuData));
  
  // Initialize rendering context
  const context: DocumentContext = {
    currentPage: 1,
    yPos: 0,
    contentMaxY: 297 - PDF_CONFIG.footerHeight - PDF_CONFIG.minFooterMargin,
    renderedSectionsOnPage: new Set<string>()
  };
  
  // Calculate header and legend heights (but don't use them now, just for documentation)
  addHeader(pdf, menuData, 0, true);
  addCompactHeader(pdf, menuData, 1, true);
  
  // Add header to first page
  context.yPos = addHeader(pdf, menuData, 0);
  
  // Add legend to first page
  context.yPos = addLegend(pdf, context.yPos, false);
  
  // Process each category
  let categoryIndex = 0;
  
  while (categoryIndex < workingMenuData.menu.length) {
    const category = workingMenuData.menu[categoryIndex];
    
    // Check if we need to render section header
    if (!context.renderedSectionsOnPage.has(category.name)) {
      // Calculate section header height (includes margins)
      const sectionHeaderHeight = drawSectionHeader(pdf, category, 0, false, true);

      // If header itself doesn't fit, start a new page first
      if (context.yPos + sectionHeaderHeight > context.contentMaxY) {
        startNewPage(pdf, menuData, context);
      }

      // Before drawing header, ensure at least one item can fit below it
      let canFitAnyItem = false;
      const prospectiveY = context.yPos + sectionHeaderHeight;
      for (let k = 0; k < category.items.length; k++) {
        const testItem = category.items[k];
        const isLastItemInMenu = k === category.items.length - 1 && categoryIndex === workingMenuData.menu.length - 1;
        const isLastInSection = k === category.items.length - 1;
        const testHeight = drawMenuItem(pdf, testItem, 0, isLastItemInMenu, true, isLastInSection);
        if (prospectiveY + testHeight <= context.contentMaxY) {
          canFitAnyItem = true;
          break;
        }
      }

      if (canFitAnyItem) {
        context.yPos = drawSectionHeader(pdf, category, context.yPos, false);
        context.renderedSectionsOnPage.add(category.name);
      }
    }
    
    // Process items within the category
    let allItemsProcessed = false;
    
    while (!allItemsProcessed) {
      const initialItemCount = category.items.length;
      let itemProcessed = false;
      
      // Try to fit any item from this category
      for (let i = 0; i < category.items.length; i++) {
        const item = category.items[i];
        const isLastItem = i === category.items.length - 1 && categoryIndex === workingMenuData.menu.length - 1;
        const isLastInSection = i === category.items.length - 1;
        
        // Calculate full item height
        const itemHeight = drawMenuItem(pdf, item, 0, isLastItem, true, isLastInSection);
        
        // Check if item fits entirely on current page
        if (context.yPos + itemHeight <= context.contentMaxY) {
          // Item fits, render it
          context.yPos = drawMenuItem(pdf, item, context.yPos, isLastItem, false, isLastInSection);
          
          // Remove the item from the category
          category.items.splice(i, 1);
          
          itemProcessed = true;
          break;
        } 
        // Check if we should split the note across pages
        else if (item.note && richTextToPlainText(item.note).trim().length > 0) {
          const remainingSpace = context.contentMaxY - context.yPos;
          
          // If we have significant empty space (>10mm) and it's due to the note that it doesn't fit
          if (remainingSpace > 10) {
            // Calculate item height without note
            const headerOnlyHeight = PDF_CONFIG.lineHeight;
            
            // If the header part fits
            if (context.yPos + headerOnlyHeight <= context.contentMaxY) {
              // Calculate how much of the note can fit on this page
              const availableSpaceForNote = remainingSpace - headerOnlyHeight - PDF_CONFIG.noteItemSpacing;
              const approximateLinesFitting = Math.floor(availableSpaceForNote / PDF_CONFIG.noteLineHeight);
              
              if (approximateLinesFitting > 0) {
                // Split the note text
                pdf.setFont('Nunito', 'normal');
                pdf.setFontSize(PDF_CONFIG.noteFontSize);
                const pageInnerWidth = 210 - PDF_CONFIG.margin * 2;
                const textWidth = pageInnerWidth - PDF_CONFIG.iconOffset;
                const notePlain = richTextToPlainText(item.note);
                const allNoteLines = splitTextToSizeWithEmojis(pdf, notePlain, textWidth);
                
                // Check if all lines fit on the first page
                if (approximateLinesFitting >= allNoteLines.length) {
                  // All lines fit, render the whole item on this page
                  context.yPos = drawMenuItem(pdf, item, context.yPos, isLastItem, false, isLastInSection);
                  
                  // Remove the original item from the category
                  category.items.splice(i, 1);
                  
                  itemProcessed = true;
                  break;
                }
                
                // Create a copy of the item for first page with partial note
                const firstPageItem = { ...item };
                const firstPageText = allNoteLines.slice(0, approximateLinesFitting).join('\n');
                firstPageItem.note = firstPageText ? [{ text: firstPageText }] : null;
                // Add continuation indicator to the first page note
                firstPageItem.continuesOnNextPage = true;
                
                // Create a copy of the item for second page with remaining note
                const secondPageItem = { ...item };
                const secondPageText = allNoteLines.slice(approximateLinesFitting).join('\n');
                secondPageItem.note = secondPageText ? [{ text: secondPageText }] : null;
                secondPageItem.continuedNote = true;
                
                // Render first part of the item
                context.yPos = drawMenuItem(pdf, firstPageItem, context.yPos, true, false, false);
                
                // Start a new page
                startNewPage(pdf, menuData, context);
                
                // Check if we need to render section header on the new page
                if (!context.renderedSectionsOnPage.has(category.name)) {
                  context.yPos = drawSectionHeader(pdf, category, context.yPos, false);
                  context.renderedSectionsOnPage.add(category.name);
                }
                
                // Render second part of the item
                context.yPos = drawMenuItem(pdf, secondPageItem, context.yPos, isLastItem, false, isLastInSection);
                
                // Remove the original item from the category
                category.items.splice(i, 1);
                
                itemProcessed = true;
                break;
              }
            }
          }
        }
      }
      
      // If no item could fit on this page, move to a new page
      if (!itemProcessed) {
        // If we couldn't process any item, start a new page
        startNewPage(pdf, menuData, context);
        
        // Reset rendered sections for the new page
        context.renderedSectionsOnPage = new Set<string>();
        
        // Don't advance category index yet
        break;
      }
      
      // If all items in this category have been processed, move to next category
      if (category.items.length === 0) {
        categoryIndex++;
        allItemsProcessed = true;
      }
      
      // Safety check: if we didn't process any items but didn't start a new page,
      // this would lead to an infinite loop. Break out in this case.
      if (!itemProcessed && initialItemCount === category.items.length) {
        console.error("Warning: Could not process any items but didn't start a new page.");
        allItemsProcessed = true;
        categoryIndex++;
      }
    }
  }
  
  // Add footer to each page
  addFooter(pdf, menuData);
  
  // Get the PDF as ArrayBuffer from jsPDF
  const pdfBuffer = pdf.output('arraybuffer');
  
  // Now use pdf-lib to add the attachment
  try {
    // Load the PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Convert menu data to JSON string
    const menuJsonData = JSON.stringify(menuData);
    
    // Add file attachment to the PDF
    const menuJsonBytes = new TextEncoder().encode(menuJsonData);
    
    // Add file attachment
    pdfDoc.attach(menuJsonBytes, 'relationshipmenu.json', {
      mimeType: 'application/json',
      description: 'Relationship Menu Data'
    });
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    
    // Return as Blob
    return new Blob([new Uint8Array(modifiedPdfBytes)], { type: 'application/pdf' });
  } catch (error) {
    console.error("Failed to attach menu data to PDF:", error);
    // Fall back to returning the original PDF if attachment fails
    return new Blob([pdfBuffer], { type: 'application/pdf' });
  }
}

/**
 * Starts a new page in the PDF document
 */
function startNewPage(pdf: jsPDF, menuData: MenuData, context: DocumentContext): void {
  pdf.addPage();
  context.currentPage++;
  // Page background
  pdf.setFillColor((COLORS.pageBackground as number[])[0], (COLORS.pageBackground as number[])[1], (COLORS.pageBackground as number[])[2]);
  pdf.rect(0, 0, 210, 297, 'F');
  
  // Add compact header to new page
  context.yPos = addCompactHeader(pdf, menuData, context.currentPage);
  
  // Add legend to new page
  context.yPos = addLegend(pdf, context.yPos, true);
  
  // Clear the rendered sections set for the new page
  context.renderedSectionsOnPage = new Set<string>();
}