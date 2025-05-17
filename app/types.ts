// Define menu item type
export type MenuItem = {
  name: string;
  note?: string | null;
  icon?: string | null;
  help?: string | null;
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
  uuid?: string; // Optional UUID field (version 1.1+)
};

// Define available menu modes
export type MenuMode = 'view' | 'fill' | 'edit'; 