// PDF-related type definitions

// Define type for color configuration
export interface ColorConfig {
  bg: number[];
  border: number[];
  marker: number[];
  label: string;
}

// Define type for COLORS object
export interface ColorTypes {
  primary: number[];
  sectionHeader: number[];
  headerBg: number[];
  footerBg: number[];
  black: number[];
  gray: number[];
  lightGray: number[];
  white: number[];
  must: ColorConfig;
  like: ColorConfig;
  maybe: ColorConfig;
  'prefer-not': ColorConfig;
  'off-limit': ColorConfig;
  talk: ColorConfig;
  notSet: ColorConfig;
  [key: string]: number[] | ColorConfig;
}

// Document context for tracking rendering state
export interface DocumentContext {
  currentPage: number;
  yPos: number;
  contentMaxY: number;
  renderedSectionsOnPage: Set<string>;
  pageHeight?: number;
  firstPageHeaderHeight?: number;
  compactHeaderHeight?: number;
  legendHeight?: number;
} 