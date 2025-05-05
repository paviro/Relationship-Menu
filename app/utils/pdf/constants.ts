// PDF styling constants
import { ColorTypes } from './types';

export const COLORS: ColorTypes = {
  // Core colors
  primary: [99, 159, 169], // RGB for var(--main-text-color) - teal blue
  sectionHeader: [158, 198, 204], // Section header background - semi-transparent light teal
  headerBg: [78, 138, 148], // Slightly darker teal for header background
  footerBg: [40, 40, 40],
  black: [0, 0, 0],
  gray: [100, 100, 100],
  lightGray: [220, 220, 220],
  white: [255, 255, 255],
  
  // Icon colors with bg and marker colors
  must: {
    bg: [222, 240, 255],
    border: [108, 188, 250],
    marker: [222, 240, 255],
    label: "Must have"
  },
  like: {
    bg: [234, 255, 237],
    border: [135, 231, 126],
    marker: [234, 255, 237],
    label: "Would like"
  },
  maybe: {
    bg: [253, 243, 222],
    border: [247, 206, 19],
    marker: [253, 243, 222],
    label: "Maybe"
  },
  'prefer-not': {
    bg: [226, 232, 240],
    border: [148, 163, 184],
    marker: [226, 232, 240],
    label: "Prefer not"
  },
  'off-limit': {
    bg: [255, 233, 233],
    border: [210, 102, 102],
    marker: [255, 233, 233],
    label: "Off limits"
  },
  talk: {
    bg: [240, 237, 255],
    border: [166, 155, 232],
    marker: [240, 237, 255],
    label: "Conversation"
  },
  notSet: {
    bg: [245, 245, 245],
    border: [200, 200, 200],
    marker: [255, 255, 255, 0], // Transparent
    label: "Not set"
  }
};

// PDF layout configuration
export const PDF_CONFIG = {
  margin: 20,
  headerHeight: 50, // Reduced from 70
  compactHeaderHeight: 25, // Height for subsequent pages
  titleFontSize: 26, // Increased from 22
  subtitleFontSize: 14,
  sectionTitleFontSize: 16,
  itemFontSize: 12,
  noteFontSize: 10,
  lineHeight: 6, // Increased from 5 (was originally 7)
  noteLineHeight: 5, // Increased from 4 (was originally 5)
  iconSize: 4, // Size of the icon circles in mm
  iconOffset: 8, // Increased from 7 - More space for the icon
  markerHorizontalPadding: 2, // Horizontal padding (smaller than before)
  markerVerticalPadding: 0, // Vertical padding for marker
  markerBorderRadius: 3, // Border radius for rounded corners
  sectionHeaderMargin: 4, // Distance between section header bottom and first item's marker/icon top
  sectionLastItemMargin: 4, // Distance between last item in a section and the next section header
  itemSpacing: 3, // Distance between menu items (0 means items touch without overlap)
  noteItemSpacing: 1, // Distance between an item's text and its note
  legendHeight: 16, // Height of the legend section
  legendIconSize: 4.5, // Increased from 3.5 - Larger icons for legend
  legendFontSize: 10, // New property for legend text size
  legendCompactFontSize: 8, // New property for compact legend text size
  pageHeight: 270, // Usable page height before footer area (A4 is 297mm minus footer area)
  footerHeight: 15, // Actual height of the footer area as used in rendering
  minFooterMargin: 1, // Minimum distance (in mm) between content and footer
}; 