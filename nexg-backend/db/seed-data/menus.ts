// Merged menu banks — single import for catalog generator.
import type { CategoryMenu } from "./items.js";
import { MENU_A } from "./menu-a.js";
import { MENU_B } from "./menu-b.js";
import { MENU_C } from "./menu-c.js";

export const MENUS: Record<string, CategoryMenu> = {
  ...MENU_A,
  ...MENU_B,
  ...MENU_C,
};
