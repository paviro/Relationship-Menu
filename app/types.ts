// Rich text representation part (single run)
export type RichTextJSONPart = {
  text: string;
  bold?: boolean | null;
  italic?: boolean | null;
  underline?: boolean | null;
  strikethrough?: boolean | null;
  color?: string | null; // Hex color, e.g. "#RRGGBB"
};

// Define menu item type
export type MenuItem = {
  name: string;
  note?: RichTextJSONPart[] | null;
  icon?: string | null;
};

// Define menu category type
export type MenuCategory = {
  name: string;
  items: MenuItem[];
};

// Define main menu data type
export type MenuData = {
  schema_version: string;
  last_update: string;
  people: string[];
  menu: MenuCategory[];
  uuid: string; // Required UUID field (version 1.1+)
  language: string; // Required language for v1.2+
  template_uuid?: string | null; // Optional: UUID of template used to create the menu (v1.2+)
};

// Define available menu modes
export type MenuMode = 'view' | 'fill' | 'edit'; 

// Legacy schema types for migrations
export type LegacyMenuItem_1_2 = {
  name: string;
  note?: string | null;
  icon?: string | null;
};

export type LegacyMenuCategory_1_2 = {
  name: string;
  items: LegacyMenuItem_1_2[];
};

export type MenuData_1_2 = {
  schema_version: '1.2';
  last_update: string;
  people: string[];
  menu: LegacyMenuCategory_1_2[];
  uuid?: string; // may be missing or lowercase in 1.2
  language?: string; // optional in 1.2
  template_uuid?: string | null;
};

// Accessibility theme preferences
export type ColorMode = 'system' | 'light' | 'dark';
export type VisionTheme = 'default' | 'pd' | 'tritan'; // pd = protanopia/deuteranopia
export type ContrastLevel = 'normal' | 'high';

export type ThemePreferences = {
  colorMode: ColorMode;
  vision: VisionTheme;
  contrast: ContrastLevel;
  // When false/absent, contrast follows the system prefers-contrast setting.
  contrastExplicit?: boolean;
};