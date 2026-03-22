/**
 * Interior Layout Templates
 *
 * Predefined templates for building interiors. Each template defines
 * room dimensions, floor count, room zones, color palette, and
 * furniture specs per room function. Used by BuildingInteriorGenerator
 * to produce consistent, data-driven layouts.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RoomColor {
  r: number;
  g: number;
  b: number;
}

export interface ColorPalette {
  floor: RoomColor;
  wall: RoomColor;
  ceiling: RoomColor;
}

export interface RoomZoneTemplate {
  name: string;
  function: string;
  /** Offset from interior origin as fraction of total width (-0.5 to 0.5) */
  offsetXFraction: number;
  /** Offset from interior origin as fraction of total depth (-0.5 to 0.5) */
  offsetZFraction: number;
  /** Width as fraction of total width (0 to 1) */
  widthFraction: number;
  /** Depth as fraction of total depth (0 to 1) */
  depthFraction: number;
  /** Floor index: 0 = ground, 1+ = upper floors */
  floor: number;
}

export interface FurnitureEntry {
  type: string;
  /** Offset from room center as fraction of room width */
  offsetXFraction: number;
  /** Offset from room center as fraction of room depth */
  offsetZFraction: number;
  width: number;
  height: number;
  depth: number;
  color: RoomColor;
  rotationY?: number;
}

export interface RoomFurnitureSet {
  /** Room function this furniture set applies to */
  roomFunction: string;
  furniture: FurnitureEntry[];
}

export interface InteriorLayoutTemplate {
  id: string;
  /** Building category this template belongs to (e.g. 'commercial_food', 'civic') */
  category: string;
  buildingType: string;
  /** Business types this template matches (empty = matches buildingType directly) */
  matchBusinessTypes: string[];
  width: number;
  depth: number;
  height: number;
  floorCount: number;
  colors: ColorPalette;
  rooms: RoomZoneTemplate[];
  furnitureSets: RoomFurnitureSet[];
}

// ─── Color Constants ─────────────────────────────────────────────────────────

const DARK_WOOD: RoomColor = { r: 0.35, g: 0.22, b: 0.12 };
const MEDIUM_WOOD: RoomColor = { r: 0.42, g: 0.35, b: 0.25 };
const LIGHT_WOOD: RoomColor = { r: 0.5, g: 0.35, b: 0.2 };
const STONE_GRAY: RoomColor = { r: 0.4, g: 0.38, b: 0.35 };
const STONE_LIGHT: RoomColor = { r: 0.55, g: 0.52, b: 0.48 };
const PLASTER: RoomColor = { r: 0.65, g: 0.6, b: 0.5 };
const WARM_WALL: RoomColor = { r: 0.6, g: 0.55, b: 0.48 };
const WHITE_WASH: RoomColor = { r: 0.7, g: 0.68, b: 0.62 };
const DARK_CEILING: RoomColor = { r: 0.3, g: 0.2, b: 0.12 };
const FORGE_DARK: RoomColor = { r: 0.25, g: 0.22, b: 0.2 };
const FORGE_WALL: RoomColor = { r: 0.35, g: 0.3, b: 0.25 };

// Furniture colors
const TABLE_BROWN: RoomColor = { r: 0.45, g: 0.3, b: 0.15 };
const CHAIR_BROWN: RoomColor = { r: 0.5, g: 0.35, b: 0.2 };
const BED_RED: RoomColor = { r: 0.6, g: 0.2, b: 0.15 };
const COUNTER_TAN: RoomColor = { r: 0.55, g: 0.4, b: 0.25 };
const SHELF_BROWN: RoomColor = { r: 0.4, g: 0.28, b: 0.15 };
const BARREL_BROWN: RoomColor = { r: 0.4, g: 0.25, b: 0.1 };
const CRATE_TAN: RoomColor = { r: 0.5, g: 0.4, b: 0.25 };
const ANVIL_GRAY: RoomColor = { r: 0.3, g: 0.3, b: 0.32 };
const METAL_GRAY: RoomColor = { r: 0.45, g: 0.45, b: 0.48 };
const ALTAR_STONE: RoomColor = { r: 0.6, g: 0.58, b: 0.55 };
const PEW_BROWN: RoomColor = { r: 0.38, g: 0.26, b: 0.14 };
const STOVE_BLACK: RoomColor = { r: 0.15, g: 0.15, b: 0.15 };
const BOOKSHELF_DARK: RoomColor = { r: 0.35, g: 0.2, b: 0.1 };
const HAY_YELLOW: RoomColor = { r: 0.7, g: 0.6, b: 0.3 };
const CLINIC_WHITE: RoomColor = { r: 0.75, g: 0.72, b: 0.68 };
const SCHOOL_DESK: RoomColor = { r: 0.48, g: 0.35, b: 0.2 };
const NAUTICAL_BLUE: RoomColor = { r: 0.25, g: 0.35, b: 0.45 };
const WEATHERED_WOOD: RoomColor = { r: 0.45, g: 0.38, b: 0.28 };
const ROPE_TAN: RoomColor = { r: 0.55, g: 0.48, b: 0.35 };
const SAIL_WHITE: RoomColor = { r: 0.72, g: 0.7, b: 0.65 };
const BANK_MARBLE: RoomColor = { r: 0.7, g: 0.68, b: 0.65 };
const LEATHER_BROWN: RoomColor = { r: 0.42, g: 0.28, b: 0.15 };
const TOWN_HALL_WOOD: RoomColor = { r: 0.48, g: 0.38, b: 0.25 };
const BUTCHER_RED: RoomColor = { r: 0.55, g: 0.2, b: 0.15 };

// ─── Furniture Sets ──────────────────────────────────────────────────────────

const LIVING_ROOM_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: -0.1, width: 2, height: 0.8, depth: 1.2, color: TABLE_BROWN },
  { type: 'chair', offsetXFraction: -0.2, offsetZFraction: -0.1, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN, rotationY: Math.PI / 2 },
  { type: 'chair', offsetXFraction: 0.2, offsetZFraction: -0.1, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN, rotationY: -Math.PI / 2 },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.35, width: 1.5, height: 1.8, depth: 0.5, color: SHELF_BROWN },
];

const KITCHEN_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.3, width: 3, height: 0.9, depth: 0.8, color: COUNTER_TAN },
  { type: 'stool', offsetXFraction: -0.15, offsetZFraction: 0.1, width: 0.4, height: 0.6, depth: 0.4, color: TABLE_BROWN },
  { type: 'barrel', offsetXFraction: 0.35, offsetZFraction: 0.3, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: -0.35, offsetZFraction: 0.35, width: 1.2, height: 1.6, depth: 0.4, color: SHELF_BROWN },
];

const BEDROOM_FURNITURE: FurnitureEntry[] = [
  { type: 'bed', offsetXFraction: -0.25, offsetZFraction: 0.2, width: 1.8, height: 0.6, depth: 2.2, color: BED_RED },
  { type: 'wardrobe', offsetXFraction: 0.35, offsetZFraction: 0.3, width: 1.2, height: 2.0, depth: 0.6, color: SHELF_BROWN },
  { type: 'table', offsetXFraction: 0.3, offsetZFraction: -0.25, width: 0.8, height: 0.7, depth: 0.6, color: TABLE_BROWN },
];

const STORAGE_FURNITURE: FurnitureEntry[] = [
  { type: 'crate', offsetXFraction: -0.3, offsetZFraction: 0.2, width: 0.8, height: 0.8, depth: 0.8, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: -0.1, offsetZFraction: 0.25, width: 0.8, height: 0.8, depth: 0.8, color: CRATE_TAN },
  { type: 'barrel', offsetXFraction: 0.25, offsetZFraction: 0.2, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: 0.35, offsetZFraction: -0.2, width: 1.5, height: 1.8, depth: 0.5, color: SHELF_BROWN },
  { type: 'chest', offsetXFraction: -0.3, offsetZFraction: -0.2, width: 1.0, height: 0.6, depth: 0.6, color: TABLE_BROWN },
];

const TAVERN_MAIN_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0.3, offsetZFraction: 0.2, width: 4, height: 1.1, depth: 0.8, color: COUNTER_TAN, rotationY: Math.PI / 2 },
  { type: 'table', offsetXFraction: -0.25, offsetZFraction: -0.2, width: 1.5, height: 0.8, depth: 1.5, color: TABLE_BROWN },
  { type: 'table', offsetXFraction: -0.25, offsetZFraction: 0.2, width: 1.5, height: 0.8, depth: 1.5, color: TABLE_BROWN },
  { type: 'stool', offsetXFraction: 0.15, offsetZFraction: 0.2, width: 0.4, height: 0.7, depth: 0.4, color: CHAIR_BROWN },
  { type: 'stool', offsetXFraction: 0.15, offsetZFraction: 0, width: 0.4, height: 0.7, depth: 0.4, color: CHAIR_BROWN },
  { type: 'stool', offsetXFraction: 0.15, offsetZFraction: -0.2, width: 0.4, height: 0.7, depth: 0.4, color: CHAIR_BROWN },
  { type: 'barrel', offsetXFraction: 0.4, offsetZFraction: -0.35, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'chair', offsetXFraction: -0.35, offsetZFraction: -0.2, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: -0.35, offsetZFraction: 0.2, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
];

const TAVERN_KITCHEN_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.25, width: 3, height: 0.9, depth: 0.8, color: COUNTER_TAN },
  { type: 'barrel', offsetXFraction: -0.3, offsetZFraction: 0.25, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'barrel', offsetXFraction: 0.3, offsetZFraction: 0.25, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: 0.35, offsetZFraction: -0.1, width: 1.2, height: 1.6, depth: 0.4, color: SHELF_BROWN },
];

const SHOP_FLOOR_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.25, width: 3.5, height: 1.0, depth: 0.8, color: COUNTER_TAN },
  { type: 'display_table', offsetXFraction: -0.25, offsetZFraction: -0.15, width: 1.5, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'display_table', offsetXFraction: 0.25, offsetZFraction: -0.15, width: 1.5, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'shelf', offsetXFraction: -0.4, offsetZFraction: 0.1, width: 1.2, height: 1.8, depth: 0.5, color: SHELF_BROWN },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.1, width: 1.2, height: 1.8, depth: 0.5, color: SHELF_BROWN },
];

const OFFICE_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0.15, width: 2, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'chair', offsetXFraction: 0, offsetZFraction: 0.3, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'bookshelf', offsetXFraction: -0.35, offsetZFraction: 0.35, width: 1.5, height: 2.0, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'chest', offsetXFraction: 0.3, offsetZFraction: -0.2, width: 1.0, height: 0.6, depth: 0.6, color: TABLE_BROWN },
];

const GUILD_MAIN_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0, width: 3, height: 0.8, depth: 1.5, color: TABLE_BROWN },
  { type: 'chair', offsetXFraction: -0.2, offsetZFraction: -0.15, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: 0.2, offsetZFraction: -0.15, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: -0.2, offsetZFraction: 0.15, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: 0.2, offsetZFraction: 0.15, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'bookshelf', offsetXFraction: 0.4, offsetZFraction: 0.35, width: 1.5, height: 2.0, depth: 0.5, color: BOOKSHELF_DARK },
];

const LIBRARY_FURNITURE: FurnitureEntry[] = [
  { type: 'bookshelf', offsetXFraction: -0.35, offsetZFraction: 0.3, width: 1.5, height: 2.2, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'bookshelf', offsetXFraction: 0.35, offsetZFraction: 0.3, width: 1.5, height: 2.2, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'bookshelf', offsetXFraction: 0, offsetZFraction: 0.35, width: 1.5, height: 2.2, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'table', offsetXFraction: 0, offsetZFraction: -0.15, width: 2, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'chair', offsetXFraction: -0.15, offsetZFraction: -0.15, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: 0.15, offsetZFraction: -0.15, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
];

const WORKSHOP_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.25, width: 3, height: 0.9, depth: 0.8, color: COUNTER_TAN },
  { type: 'anvil', offsetXFraction: -0.2, offsetZFraction: -0.1, width: 0.8, height: 0.7, depth: 0.5, color: ANVIL_GRAY },
  { type: 'barrel', offsetXFraction: 0.35, offsetZFraction: -0.25, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: -0.4, offsetZFraction: 0.3, width: 1.2, height: 1.6, depth: 0.4, color: METAL_GRAY },
  { type: 'crate', offsetXFraction: 0.3, offsetZFraction: 0.25, width: 0.8, height: 0.8, depth: 0.8, color: CRATE_TAN },
];

const TEMPLE_FURNITURE: FurnitureEntry[] = [
  { type: 'altar', offsetXFraction: 0, offsetZFraction: 0.35, width: 2, height: 1.2, depth: 1.0, color: ALTAR_STONE },
  { type: 'bench', offsetXFraction: -0.2, offsetZFraction: -0.1, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'bench', offsetXFraction: 0.2, offsetZFraction: -0.1, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'bench', offsetXFraction: -0.2, offsetZFraction: -0.3, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'bench', offsetXFraction: 0.2, offsetZFraction: -0.3, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'pillar', offsetXFraction: -0.4, offsetZFraction: 0, width: 0.5, height: 3.0, depth: 0.5, color: ALTAR_STONE },
  { type: 'pillar', offsetXFraction: 0.4, offsetZFraction: 0, width: 0.5, height: 3.0, depth: 0.5, color: ALTAR_STONE },
];

const WAREHOUSE_FURNITURE: FurnitureEntry[] = [
  { type: 'crate', offsetXFraction: -0.3, offsetZFraction: -0.3, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: -0.15, offsetZFraction: -0.3, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: -0.3, offsetZFraction: -0.1, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'barrel', offsetXFraction: 0.3, offsetZFraction: -0.3, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'barrel', offsetXFraction: 0.3, offsetZFraction: -0.1, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.2, width: 2.0, height: 2.0, depth: 0.6, color: SHELF_BROWN },
  { type: 'shelf', offsetXFraction: -0.4, offsetZFraction: 0.2, width: 2.0, height: 2.0, depth: 0.6, color: SHELF_BROWN },
  { type: 'chest', offsetXFraction: 0, offsetZFraction: 0.35, width: 1.2, height: 0.7, depth: 0.7, color: TABLE_BROWN },
];

const CLASSROOM_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0.3, width: 2.5, height: 0.8, depth: 0.8, color: SCHOOL_DESK },
  { type: 'chair', offsetXFraction: 0, offsetZFraction: 0.4, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'table', offsetXFraction: -0.2, offsetZFraction: -0.1, width: 1.2, height: 0.7, depth: 0.6, color: SCHOOL_DESK },
  { type: 'table', offsetXFraction: 0.2, offsetZFraction: -0.1, width: 1.2, height: 0.7, depth: 0.6, color: SCHOOL_DESK },
  { type: 'table', offsetXFraction: -0.2, offsetZFraction: -0.3, width: 1.2, height: 0.7, depth: 0.6, color: SCHOOL_DESK },
  { type: 'table', offsetXFraction: 0.2, offsetZFraction: -0.3, width: 1.2, height: 0.7, depth: 0.6, color: SCHOOL_DESK },
  { type: 'bookshelf', offsetXFraction: -0.4, offsetZFraction: 0.35, width: 1.5, height: 2.0, depth: 0.5, color: BOOKSHELF_DARK },
];

const HOTEL_ROOM_FURNITURE: FurnitureEntry[] = [
  { type: 'bed', offsetXFraction: -0.2, offsetZFraction: 0.15, width: 1.8, height: 0.6, depth: 2.2, color: BED_RED },
  { type: 'table', offsetXFraction: 0.3, offsetZFraction: -0.2, width: 0.8, height: 0.7, depth: 0.6, color: TABLE_BROWN },
  { type: 'chair', offsetXFraction: 0.3, offsetZFraction: -0.35, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'wardrobe', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 1.0, height: 2.0, depth: 0.5, color: SHELF_BROWN },
];

const CLINIC_MAIN_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0.2, width: 2.0, height: 0.8, depth: 0.8, color: CLINIC_WHITE },
  { type: 'bed', offsetXFraction: -0.3, offsetZFraction: -0.15, width: 1.5, height: 0.5, depth: 2.0, color: CLINIC_WHITE },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 1.2, height: 1.8, depth: 0.4, color: SHELF_BROWN },
  { type: 'chair', offsetXFraction: 0.15, offsetZFraction: 0.2, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chest', offsetXFraction: 0.3, offsetZFraction: -0.3, width: 0.8, height: 0.5, depth: 0.5, color: TABLE_BROWN },
];

const BAKERY_FRONT_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.2, width: 3.5, height: 1.0, depth: 0.8, color: COUNTER_TAN },
  { type: 'display_table', offsetXFraction: -0.25, offsetZFraction: -0.1, width: 1.2, height: 0.8, depth: 0.8, color: TABLE_BROWN },
  { type: 'display_table', offsetXFraction: 0.25, offsetZFraction: -0.1, width: 1.2, height: 0.8, depth: 0.8, color: TABLE_BROWN },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 1.0, height: 1.6, depth: 0.4, color: SHELF_BROWN },
];

const BAKERY_KITCHEN_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.2, width: 3, height: 0.9, depth: 0.8, color: COUNTER_TAN },
  { type: 'stove', offsetXFraction: -0.3, offsetZFraction: 0.3, width: 1.0, height: 1.0, depth: 0.8, color: STOVE_BLACK },
  { type: 'barrel', offsetXFraction: 0.3, offsetZFraction: 0.25, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: 0.35, offsetZFraction: -0.1, width: 1.2, height: 1.6, depth: 0.4, color: SHELF_BROWN },
];

const BARN_FURNITURE: FurnitureEntry[] = [
  { type: 'crate', offsetXFraction: -0.35, offsetZFraction: -0.3, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: -0.35, offsetZFraction: -0.1, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'barrel', offsetXFraction: 0.35, offsetZFraction: -0.3, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 1.8, height: 1.8, depth: 0.5, color: SHELF_BROWN },
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0.2, width: 1.5, height: 0.7, depth: 0.8, color: TABLE_BROWN },
  { type: 'hay_bale', offsetXFraction: -0.3, offsetZFraction: 0.3, width: 1.2, height: 0.8, depth: 0.8, color: HAY_YELLOW },
];

const RESTAURANT_MAIN_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: -0.25, offsetZFraction: -0.2, width: 1.2, height: 0.8, depth: 1.2, color: TABLE_BROWN },
  { type: 'table', offsetXFraction: 0.25, offsetZFraction: -0.2, width: 1.2, height: 0.8, depth: 1.2, color: TABLE_BROWN },
  { type: 'table', offsetXFraction: -0.25, offsetZFraction: 0.15, width: 1.2, height: 0.8, depth: 1.2, color: TABLE_BROWN },
  { type: 'table', offsetXFraction: 0.25, offsetZFraction: 0.15, width: 1.2, height: 0.8, depth: 1.2, color: TABLE_BROWN },
  { type: 'chair', offsetXFraction: -0.35, offsetZFraction: -0.2, width: 0.5, height: 1.0, depth: 0.5, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: 0.35, offsetZFraction: -0.2, width: 0.5, height: 1.0, depth: 0.5, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: -0.35, offsetZFraction: 0.15, width: 0.5, height: 1.0, depth: 0.5, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: 0.35, offsetZFraction: 0.15, width: 0.5, height: 1.0, depth: 0.5, color: CHAIR_BROWN },
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.38, width: 3, height: 1.0, depth: 0.7, color: COUNTER_TAN },
];

// ─── New Furniture Sets for Category Variants ────────────────────────────────

const BOOKSTORE_FURNITURE: FurnitureEntry[] = [
  { type: 'bookshelf', offsetXFraction: -0.35, offsetZFraction: 0.3, width: 1.5, height: 2.2, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'bookshelf', offsetXFraction: 0.35, offsetZFraction: 0.3, width: 1.5, height: 2.2, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'bookshelf', offsetXFraction: -0.35, offsetZFraction: -0.1, width: 1.5, height: 2.2, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'bookshelf', offsetXFraction: 0.35, offsetZFraction: -0.1, width: 1.5, height: 2.2, depth: 0.5, color: BOOKSHELF_DARK },
  { type: 'table', offsetXFraction: 0, offsetZFraction: -0.2, width: 1.5, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'chair', offsetXFraction: -0.1, offsetZFraction: -0.3, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: 0.1, offsetZFraction: -0.3, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
];

const GROCERY_FURNITURE: FurnitureEntry[] = [
  { type: 'display_table', offsetXFraction: -0.25, offsetZFraction: -0.2, width: 1.8, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'display_table', offsetXFraction: 0.25, offsetZFraction: -0.2, width: 1.8, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'display_table', offsetXFraction: -0.25, offsetZFraction: 0.1, width: 1.8, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'display_table', offsetXFraction: 0.25, offsetZFraction: 0.1, width: 1.8, height: 0.8, depth: 1.0, color: TABLE_BROWN },
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.38, width: 3.5, height: 1.0, depth: 0.8, color: COUNTER_TAN },
  { type: 'barrel', offsetXFraction: -0.4, offsetZFraction: 0.35, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'barrel', offsetXFraction: 0.4, offsetZFraction: 0.35, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
];

const BANK_LOBBY_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.15, width: 5, height: 1.2, depth: 0.8, color: BANK_MARBLE },
  { type: 'chair', offsetXFraction: -0.3, offsetZFraction: -0.25, width: 0.6, height: 1.0, depth: 0.6, color: LEATHER_BROWN },
  { type: 'chair', offsetXFraction: 0.3, offsetZFraction: -0.25, width: 0.6, height: 1.0, depth: 0.6, color: LEATHER_BROWN },
  { type: 'pillar', offsetXFraction: -0.4, offsetZFraction: 0, width: 0.5, height: 3.0, depth: 0.5, color: BANK_MARBLE },
  { type: 'pillar', offsetXFraction: 0.4, offsetZFraction: 0, width: 0.5, height: 3.0, depth: 0.5, color: BANK_MARBLE },
];

const VAULT_FURNITURE: FurnitureEntry[] = [
  { type: 'chest', offsetXFraction: -0.3, offsetZFraction: 0.2, width: 1.2, height: 0.7, depth: 0.7, color: METAL_GRAY },
  { type: 'chest', offsetXFraction: 0.3, offsetZFraction: 0.2, width: 1.2, height: 0.7, depth: 0.7, color: METAL_GRAY },
  { type: 'chest', offsetXFraction: 0, offsetZFraction: -0.1, width: 1.2, height: 0.7, depth: 0.7, color: METAL_GRAY },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.35, width: 1.5, height: 1.8, depth: 0.5, color: METAL_GRAY },
];

const BARBERSHOP_FURNITURE: FurnitureEntry[] = [
  { type: 'chair', offsetXFraction: -0.2, offsetZFraction: 0, width: 0.8, height: 1.2, depth: 0.8, color: LEATHER_BROWN },
  { type: 'chair', offsetXFraction: 0.2, offsetZFraction: 0, width: 0.8, height: 1.2, depth: 0.8, color: LEATHER_BROWN },
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.35, width: 3, height: 0.9, depth: 0.6, color: COUNTER_TAN },
  { type: 'shelf', offsetXFraction: -0.4, offsetZFraction: 0.35, width: 1.0, height: 1.6, depth: 0.4, color: SHELF_BROWN },
  { type: 'chair', offsetXFraction: -0.3, offsetZFraction: -0.3, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chair', offsetXFraction: 0.3, offsetZFraction: -0.3, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
];

const TOWN_HALL_MAIN_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0.25, width: 4, height: 0.8, depth: 1.5, color: TOWN_HALL_WOOD },
  { type: 'chair', offsetXFraction: -0.2, offsetZFraction: 0.35, width: 0.6, height: 1.0, depth: 0.6, color: LEATHER_BROWN },
  { type: 'chair', offsetXFraction: 0, offsetZFraction: 0.35, width: 0.6, height: 1.0, depth: 0.6, color: LEATHER_BROWN },
  { type: 'chair', offsetXFraction: 0.2, offsetZFraction: 0.35, width: 0.6, height: 1.0, depth: 0.6, color: LEATHER_BROWN },
  { type: 'bench', offsetXFraction: -0.2, offsetZFraction: -0.15, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'bench', offsetXFraction: 0.2, offsetZFraction: -0.15, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'bench', offsetXFraction: -0.2, offsetZFraction: -0.35, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'bench', offsetXFraction: 0.2, offsetZFraction: -0.35, width: 2.5, height: 0.5, depth: 0.6, color: PEW_BROWN },
  { type: 'pillar', offsetXFraction: -0.4, offsetZFraction: 0, width: 0.5, height: 3.5, depth: 0.5, color: STONE_LIGHT },
  { type: 'pillar', offsetXFraction: 0.4, offsetZFraction: 0, width: 0.5, height: 3.5, depth: 0.5, color: STONE_LIGHT },
];

const HARBOR_OFFICE_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0.15, width: 2.5, height: 0.8, depth: 1.0, color: WEATHERED_WOOD },
  { type: 'chair', offsetXFraction: 0, offsetZFraction: 0.3, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'shelf', offsetXFraction: -0.35, offsetZFraction: 0.35, width: 1.5, height: 1.8, depth: 0.5, color: WEATHERED_WOOD },
  { type: 'barrel', offsetXFraction: 0.35, offsetZFraction: -0.2, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
  { type: 'chest', offsetXFraction: -0.3, offsetZFraction: -0.2, width: 1.0, height: 0.6, depth: 0.6, color: WEATHERED_WOOD },
];

const DOCK_WAREHOUSE_FURNITURE: FurnitureEntry[] = [
  { type: 'crate', offsetXFraction: -0.3, offsetZFraction: -0.3, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: -0.15, offsetZFraction: -0.3, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: 0.15, offsetZFraction: -0.3, width: 1.0, height: 1.0, depth: 1.0, color: CRATE_TAN },
  { type: 'barrel', offsetXFraction: 0.3, offsetZFraction: -0.15, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'barrel', offsetXFraction: 0.3, offsetZFraction: 0.1, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'barrel', offsetXFraction: -0.3, offsetZFraction: 0.1, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 2.0, height: 2.0, depth: 0.6, color: WEATHERED_WOOD },
  { type: 'chest', offsetXFraction: -0.2, offsetZFraction: 0.3, width: 1.2, height: 0.7, depth: 0.7, color: WEATHERED_WOOD },
];

const NAVIGATION_FURNITURE: FurnitureEntry[] = [
  { type: 'table', offsetXFraction: 0, offsetZFraction: 0, width: 2.5, height: 0.8, depth: 1.5, color: WEATHERED_WOOD },
  { type: 'shelf', offsetXFraction: -0.4, offsetZFraction: 0.3, width: 1.5, height: 1.8, depth: 0.5, color: WEATHERED_WOOD },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 1.5, height: 1.8, depth: 0.5, color: WEATHERED_WOOD },
  { type: 'chair', offsetXFraction: 0.15, offsetZFraction: 0.15, width: 0.6, height: 1.0, depth: 0.6, color: CHAIR_BROWN },
  { type: 'chest', offsetXFraction: 0.3, offsetZFraction: -0.3, width: 1.0, height: 0.6, depth: 0.6, color: WEATHERED_WOOD },
];

const FISH_MARKET_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: -0.2, offsetZFraction: -0.1, width: 3, height: 0.9, depth: 0.8, color: WEATHERED_WOOD },
  { type: 'counter', offsetXFraction: 0.2, offsetZFraction: 0.15, width: 3, height: 0.9, depth: 0.8, color: WEATHERED_WOOD },
  { type: 'barrel', offsetXFraction: -0.35, offsetZFraction: 0.3, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'barrel', offsetXFraction: 0.35, offsetZFraction: 0.3, width: 0.8, height: 1.0, depth: 0.8, color: BARREL_BROWN },
  { type: 'crate', offsetXFraction: -0.35, offsetZFraction: -0.3, width: 0.8, height: 0.6, depth: 0.8, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: 0.35, offsetZFraction: -0.3, width: 0.8, height: 0.6, depth: 0.8, color: CRATE_TAN },
];

const BUTCHER_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.2, width: 4, height: 1.0, depth: 0.8, color: COUNTER_TAN },
  { type: 'table', offsetXFraction: 0, offsetZFraction: -0.15, width: 2.5, height: 0.9, depth: 1.0, color: TABLE_BROWN },
  { type: 'shelf', offsetXFraction: -0.4, offsetZFraction: 0.3, width: 1.2, height: 1.8, depth: 0.4, color: SHELF_BROWN },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 1.2, height: 1.8, depth: 0.4, color: SHELF_BROWN },
  { type: 'barrel', offsetXFraction: 0.35, offsetZFraction: -0.3, width: 0.7, height: 0.9, depth: 0.7, color: BARREL_BROWN },
];

const CARPENTER_FURNITURE: FurnitureEntry[] = [
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.2, width: 3.5, height: 0.9, depth: 0.8, color: TABLE_BROWN },
  { type: 'shelf', offsetXFraction: -0.4, offsetZFraction: 0.3, width: 1.5, height: 1.8, depth: 0.5, color: SHELF_BROWN },
  { type: 'shelf', offsetXFraction: 0.4, offsetZFraction: 0.3, width: 1.5, height: 1.8, depth: 0.5, color: SHELF_BROWN },
  { type: 'crate', offsetXFraction: -0.3, offsetZFraction: -0.2, width: 0.8, height: 0.8, depth: 0.8, color: CRATE_TAN },
  { type: 'crate', offsetXFraction: 0.3, offsetZFraction: -0.2, width: 0.8, height: 0.8, depth: 0.8, color: CRATE_TAN },
  { type: 'table', offsetXFraction: 0, offsetZFraction: -0.25, width: 1.5, height: 0.7, depth: 0.8, color: TABLE_BROWN },
];

const WAITING_ROOM_FURNITURE: FurnitureEntry[] = [
  { type: 'bench', offsetXFraction: -0.3, offsetZFraction: -0.2, width: 2.0, height: 0.5, depth: 0.6, color: CHAIR_BROWN },
  { type: 'bench', offsetXFraction: 0.3, offsetZFraction: -0.2, width: 2.0, height: 0.5, depth: 0.6, color: CHAIR_BROWN },
  { type: 'counter', offsetXFraction: 0, offsetZFraction: 0.3, width: 3, height: 1.0, depth: 0.8, color: COUNTER_TAN },
  { type: 'table', offsetXFraction: 0, offsetZFraction: -0.1, width: 1.0, height: 0.5, depth: 0.6, color: TABLE_BROWN },
];

// ─── Templates ───────────────────────────────────────────────────────────────

export const INTERIOR_LAYOUT_TEMPLATES: InteriorLayoutTemplate[] = [
  // 1. Tavern / Inn
  {
    id: 'tavern',
    category: 'commercial_food',
    buildingType: 'tavern',
    matchBusinessTypes: ['tavern', 'inn', 'bar'],
    width: 18, depth: 16, height: 5,
    floorCount: 2,
    colors: { floor: DARK_WOOD, wall: LIGHT_WOOD, ceiling: DARK_CEILING },
    rooms: [
      { name: 'common_room', function: 'tavern_main', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'kitchen', function: 'tavern_kitchen', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
      { name: 'guest_room1', function: 'bedroom', offsetXFraction: -0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
      { name: 'guest_room2', function: 'bedroom', offsetXFraction: 0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'tavern_main', furniture: TAVERN_MAIN_FURNITURE },
      { roomFunction: 'tavern_kitchen', furniture: TAVERN_KITCHEN_FURNITURE },
      { roomFunction: 'bedroom', furniture: BEDROOM_FURNITURE },
    ],
  },

  // 2. Restaurant
  {
    id: 'restaurant',
    category: 'commercial_food',
    buildingType: 'restaurant',
    matchBusinessTypes: ['restaurant', 'cafe', 'diner'],
    width: 16, depth: 14, height: 4.5,
    floorCount: 1,
    colors: { floor: MEDIUM_WOOD, wall: WARM_WALL, ceiling: { r: 0.55, g: 0.5, b: 0.45 } },
    rooms: [
      { name: 'dining_room', function: 'restaurant_main', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'kitchen', function: 'tavern_kitchen', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'restaurant_main', furniture: RESTAURANT_MAIN_FURNITURE },
      { roomFunction: 'tavern_kitchen', furniture: TAVERN_KITCHEN_FURNITURE },
    ],
  },

  // 3. Shop / General Store
  {
    id: 'shop',
    category: 'commercial_retail',
    buildingType: 'shop',
    matchBusinessTypes: ['shop', 'store', 'market'],
    width: 14, depth: 14, height: 4.5,
    floorCount: 2,
    colors: { floor: { r: 0.45, g: 0.4, b: 0.35 }, wall: PLASTER, ceiling: { r: 0.55, g: 0.5, b: 0.45 } },
    rooms: [
      { name: 'shop_floor', function: 'shop', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'storage', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
      { name: 'living_quarters', function: 'living', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'shop', furniture: SHOP_FLOOR_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
      { roomFunction: 'living', furniture: LIVING_ROOM_FURNITURE },
    ],
  },

  // 4. Bar
  {
    id: 'bar',
    category: 'commercial_food',
    buildingType: 'bar',
    matchBusinessTypes: ['bar', 'pub', 'saloon'],
    width: 14, depth: 12, height: 4.5,
    floorCount: 1,
    colors: { floor: DARK_WOOD, wall: { r: 0.45, g: 0.32, b: 0.18 }, ceiling: DARK_CEILING },
    rooms: [
      { name: 'bar_room', function: 'tavern_main', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'tavern_main', furniture: TAVERN_MAIN_FURNITURE },
    ],
  },

  // 5. Bakery
  {
    id: 'bakery',
    category: 'commercial_food',
    buildingType: 'bakery',
    matchBusinessTypes: ['bakery', 'patisserie'],
    width: 12, depth: 12, height: 4,
    floorCount: 1,
    colors: { floor: MEDIUM_WOOD, wall: { r: 0.7, g: 0.65, b: 0.55 }, ceiling: { r: 0.6, g: 0.55, b: 0.48 } },
    rooms: [
      { name: 'shop_front', function: 'bakery_front', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'bakery_kitchen', function: 'bakery_kitchen', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'bakery_front', furniture: BAKERY_FRONT_FURNITURE },
      { roomFunction: 'bakery_kitchen', furniture: BAKERY_KITCHEN_FURNITURE },
    ],
  },

  // 6. Small Residence
  {
    id: 'residence_small',
    category: 'residential',
    buildingType: 'residence',
    matchBusinessTypes: ['residence', 'house', 'home'],
    width: 9, depth: 9, height: 3.5,
    floorCount: 1,
    colors: { floor: MEDIUM_WOOD, wall: WARM_WALL, ceiling: { r: 0.55, g: 0.5, b: 0.45 } },
    rooms: [
      { name: 'living_room', function: 'living', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'kitchen', function: 'kitchen', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'living', furniture: LIVING_ROOM_FURNITURE },
      { roomFunction: 'kitchen', furniture: KITCHEN_FURNITURE },
    ],
  },

  // 7. Medium Residence
  {
    id: 'residence_medium',
    category: 'residential',
    buildingType: 'residence_medium',
    matchBusinessTypes: ['residence_medium'],
    width: 12, depth: 12, height: 4,
    floorCount: 2,
    colors: { floor: MEDIUM_WOOD, wall: WARM_WALL, ceiling: { r: 0.55, g: 0.5, b: 0.45 } },
    rooms: [
      { name: 'living_room', function: 'living', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'kitchen', function: 'kitchen', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
      { name: 'bedroom', function: 'bedroom', offsetXFraction: -0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
      { name: 'bedroom2', function: 'bedroom', offsetXFraction: 0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'living', furniture: LIVING_ROOM_FURNITURE },
      { roomFunction: 'kitchen', furniture: KITCHEN_FURNITURE },
      { roomFunction: 'bedroom', furniture: BEDROOM_FURNITURE },
    ],
  },

  // 8. Large Residence / Mansion
  {
    id: 'residence_large',
    category: 'residential',
    buildingType: 'residence_large',
    matchBusinessTypes: ['residence_large', 'mansion'],
    width: 16, depth: 16, height: 4.5,
    floorCount: 2,
    colors: { floor: MEDIUM_WOOD, wall: WARM_WALL, ceiling: { r: 0.55, g: 0.5, b: 0.45 } },
    rooms: [
      { name: 'living_room', function: 'living', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'kitchen', function: 'kitchen', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
      { name: 'bedroom', function: 'bedroom', offsetXFraction: -0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
      { name: 'bedroom2', function: 'bedroom', offsetXFraction: 0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'living', furniture: LIVING_ROOM_FURNITURE },
      { roomFunction: 'kitchen', furniture: KITCHEN_FURNITURE },
      { roomFunction: 'bedroom', furniture: BEDROOM_FURNITURE },
    ],
  },

  // 9. Church / Temple
  {
    id: 'church',
    category: 'civic',
    buildingType: 'church',
    matchBusinessTypes: ['church', 'temple', 'shrine', 'chapel'],
    width: 20, depth: 24, height: 8,
    floorCount: 1,
    colors: { floor: STONE_LIGHT, wall: WHITE_WASH, ceiling: { r: 0.6, g: 0.58, b: 0.55 } },
    rooms: [
      { name: 'nave', function: 'temple', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'temple', furniture: TEMPLE_FURNITURE },
    ],
  },

  // 10. School
  {
    id: 'school',
    category: 'civic',
    buildingType: 'school',
    matchBusinessTypes: ['school', 'academy', 'classroom'],
    width: 16, depth: 14, height: 4.5,
    floorCount: 1,
    colors: { floor: MEDIUM_WOOD, wall: { r: 0.65, g: 0.62, b: 0.55 }, ceiling: { r: 0.58, g: 0.55, b: 0.5 } },
    rooms: [
      { name: 'classroom', function: 'classroom', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'office', function: 'office', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'classroom', furniture: CLASSROOM_FURNITURE },
      { roomFunction: 'office', furniture: OFFICE_FURNITURE },
    ],
  },

  // 11. Hotel
  {
    id: 'hotel',
    category: 'commercial_service',
    buildingType: 'hotel',
    matchBusinessTypes: ['hotel', 'lodge', 'hostel'],
    width: 18, depth: 16, height: 5,
    floorCount: 2,
    colors: { floor: MEDIUM_WOOD, wall: WARM_WALL, ceiling: { r: 0.55, g: 0.5, b: 0.45 } },
    rooms: [
      { name: 'lobby', function: 'living', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'office', function: 'office', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
      { name: 'room1', function: 'hotel_room', offsetXFraction: -0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
      { name: 'room2', function: 'hotel_room', offsetXFraction: 0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'living', furniture: LIVING_ROOM_FURNITURE },
      { roomFunction: 'office', furniture: OFFICE_FURNITURE },
      { roomFunction: 'hotel_room', furniture: HOTEL_ROOM_FURNITURE },
    ],
  },

  // 12. Blacksmith / Forge
  {
    id: 'blacksmith',
    category: 'industrial',
    buildingType: 'blacksmith',
    matchBusinessTypes: ['blacksmith', 'forge', 'workshop'],
    width: 16, depth: 14, height: 5,
    floorCount: 1,
    colors: { floor: FORGE_DARK, wall: FORGE_WALL, ceiling: { r: 0.2, g: 0.18, b: 0.15 } },
    rooms: [
      { name: 'workshop', function: 'workshop', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'storage', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'workshop', furniture: WORKSHOP_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
    ],
  },

  // 13. Warehouse
  {
    id: 'warehouse',
    category: 'industrial',
    buildingType: 'warehouse',
    matchBusinessTypes: ['warehouse', 'storage', 'depot'],
    width: 20, depth: 16, height: 6,
    floorCount: 1,
    colors: { floor: STONE_GRAY, wall: { r: 0.4, g: 0.38, b: 0.35 }, ceiling: { r: 0.35, g: 0.33, b: 0.3 } },
    rooms: [
      { name: 'main_storage', function: 'warehouse', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'warehouse', furniture: WAREHOUSE_FURNITURE },
    ],
  },

  // 14. Clinic / Healer
  {
    id: 'clinic',
    category: 'commercial_service',
    buildingType: 'clinic',
    matchBusinessTypes: ['clinic', 'healer', 'apothecary', 'hospital'],
    width: 14, depth: 12, height: 4,
    floorCount: 1,
    colors: { floor: { r: 0.5, g: 0.48, b: 0.45 }, wall: CLINIC_WHITE, ceiling: { r: 0.65, g: 0.62, b: 0.58 } },
    rooms: [
      { name: 'treatment', function: 'clinic_main', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'storage', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'clinic_main', furniture: CLINIC_MAIN_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
    ],
  },

  // 15. Farm Barn
  {
    id: 'farm_barn',
    category: 'industrial',
    buildingType: 'farm_barn',
    matchBusinessTypes: ['farm_barn', 'barn', 'farm'],
    width: 18, depth: 14, height: 5.5,
    floorCount: 1,
    colors: { floor: { r: 0.35, g: 0.3, b: 0.22 }, wall: { r: 0.5, g: 0.35, b: 0.2 }, ceiling: { r: 0.4, g: 0.3, b: 0.18 } },
    rooms: [
      { name: 'main_area', function: 'barn', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'barn', furniture: BARN_FURNITURE },
    ],
  },

  // 16. Guild Hall
  {
    id: 'guild_hall',
    category: 'civic',
    buildingType: 'guild',
    matchBusinessTypes: ['guild', 'hall', 'headquarters'],
    width: 18, depth: 18, height: 5,
    floorCount: 2,
    colors: { floor: { r: 0.4, g: 0.32, b: 0.22 }, wall: { r: 0.55, g: 0.45, b: 0.35 }, ceiling: { r: 0.45, g: 0.38, b: 0.3 } },
    rooms: [
      { name: 'main_hall', function: 'guild_main', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'office', function: 'office', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
      { name: 'library', function: 'library', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'guild_main', furniture: GUILD_MAIN_FURNITURE },
      { roomFunction: 'office', furniture: OFFICE_FURNITURE },
      { roomFunction: 'library', furniture: LIBRARY_FURNITURE },
    ],
  },

  // ─── Commercial Retail Variants ──────────────────────────────────────────

  // 17. Bookstore
  {
    id: 'bookstore',
    category: 'commercial_retail',
    buildingType: 'bookstore',
    matchBusinessTypes: ['bookstore', 'book_store', 'BookStore'],
    width: 12, depth: 14, height: 4.5,
    floorCount: 2,
    colors: { floor: DARK_WOOD, wall: WARM_WALL, ceiling: { r: 0.5, g: 0.45, b: 0.38 } },
    rooms: [
      { name: 'shop_floor', function: 'bookstore', offsetXFraction: 0, offsetZFraction: -0.15, widthFraction: 1, depthFraction: 0.7, floor: 0 },
      { name: 'reading_nook', function: 'library', offsetXFraction: 0, offsetZFraction: 0.35, widthFraction: 1, depthFraction: 0.3, floor: 0 },
      { name: 'storage', function: 'storage', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'bookstore', furniture: BOOKSTORE_FURNITURE },
      { roomFunction: 'library', furniture: LIBRARY_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
    ],
  },

  // 18. Grocery Store
  {
    id: 'grocery_store',
    category: 'commercial_retail',
    buildingType: 'grocery_store',
    matchBusinessTypes: ['grocery', 'grocery_store', 'GroceryStore', 'greengrocer'],
    width: 16, depth: 14, height: 4.5,
    floorCount: 1,
    colors: { floor: MEDIUM_WOOD, wall: { r: 0.65, g: 0.62, b: 0.55 }, ceiling: { r: 0.58, g: 0.55, b: 0.5 } },
    rooms: [
      { name: 'market_floor', function: 'grocery', offsetXFraction: 0, offsetZFraction: -0.15, widthFraction: 1, depthFraction: 0.7, floor: 0 },
      { name: 'cold_storage', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.35, widthFraction: 1, depthFraction: 0.3, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'grocery', furniture: GROCERY_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
    ],
  },

  // ─── Commercial Service Variants ─────────────────────────────────────────

  // 19. Bank
  {
    id: 'bank',
    category: 'commercial_service',
    buildingType: 'bank',
    matchBusinessTypes: ['bank', 'Bank'],
    width: 16, depth: 16, height: 5.5,
    floorCount: 1,
    colors: { floor: STONE_LIGHT, wall: { r: 0.68, g: 0.65, b: 0.6 }, ceiling: { r: 0.6, g: 0.58, b: 0.55 } },
    rooms: [
      { name: 'lobby', function: 'bank_lobby', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'vault', function: 'vault', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'bank_lobby', furniture: BANK_LOBBY_FURNITURE },
      { roomFunction: 'vault', furniture: VAULT_FURNITURE },
    ],
  },

  // 20. Barbershop
  {
    id: 'barbershop',
    category: 'commercial_service',
    buildingType: 'barbershop',
    matchBusinessTypes: ['barbershop', 'barber', 'Barbershop'],
    width: 10, depth: 10, height: 4,
    floorCount: 1,
    colors: { floor: { r: 0.5, g: 0.48, b: 0.45 }, wall: WHITE_WASH, ceiling: { r: 0.62, g: 0.6, b: 0.55 } },
    rooms: [
      { name: 'main_room', function: 'barbershop', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'barbershop', furniture: BARBERSHOP_FURNITURE },
    ],
  },

  // ─── Civic Variants ──────────────────────────────────────────────────────

  // 21. Town Hall
  {
    id: 'town_hall',
    category: 'civic',
    buildingType: 'town_hall',
    matchBusinessTypes: ['town_hall', 'townhall', 'TownHall', 'city_hall'],
    width: 20, depth: 20, height: 6,
    floorCount: 2,
    colors: { floor: STONE_LIGHT, wall: { r: 0.62, g: 0.58, b: 0.52 }, ceiling: { r: 0.55, g: 0.52, b: 0.48 } },
    rooms: [
      { name: 'council_chamber', function: 'town_hall_main', offsetXFraction: 0, offsetZFraction: -0.15, widthFraction: 1, depthFraction: 0.7, floor: 0 },
      { name: 'reception', function: 'waiting_room', offsetXFraction: 0, offsetZFraction: 0.35, widthFraction: 1, depthFraction: 0.3, floor: 0 },
      { name: 'office1', function: 'office', offsetXFraction: -0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
      { name: 'office2', function: 'office', offsetXFraction: 0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'town_hall_main', furniture: TOWN_HALL_MAIN_FURNITURE },
      { roomFunction: 'waiting_room', furniture: WAITING_ROOM_FURNITURE },
      { roomFunction: 'office', furniture: OFFICE_FURNITURE },
    ],
  },

  // 22. Hospital (larger than clinic)
  {
    id: 'hospital',
    category: 'civic',
    buildingType: 'hospital',
    matchBusinessTypes: ['Hospital'],
    width: 20, depth: 18, height: 5,
    floorCount: 2,
    colors: { floor: { r: 0.55, g: 0.53, b: 0.5 }, wall: CLINIC_WHITE, ceiling: { r: 0.68, g: 0.65, b: 0.6 } },
    rooms: [
      { name: 'waiting_room', function: 'waiting_room', offsetXFraction: 0, offsetZFraction: -0.25, widthFraction: 1, depthFraction: 0.5, floor: 0 },
      { name: 'treatment1', function: 'clinic_main', offsetXFraction: -0.25, offsetZFraction: 0.25, widthFraction: 0.5, depthFraction: 0.5, floor: 0 },
      { name: 'treatment2', function: 'clinic_main', offsetXFraction: 0.25, offsetZFraction: 0.25, widthFraction: 0.5, depthFraction: 0.5, floor: 0 },
      { name: 'ward1', function: 'bedroom', offsetXFraction: -0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
      { name: 'ward2', function: 'bedroom', offsetXFraction: 0.25, offsetZFraction: 0, widthFraction: 0.5, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'waiting_room', furniture: WAITING_ROOM_FURNITURE },
      { roomFunction: 'clinic_main', furniture: CLINIC_MAIN_FURNITURE },
      { roomFunction: 'bedroom', furniture: BEDROOM_FURNITURE },
    ],
  },

  // ─── Industrial Variants ─────────────────────────────────────────────────

  // 23. Carpenter Workshop
  {
    id: 'carpenter',
    category: 'industrial',
    buildingType: 'carpenter',
    matchBusinessTypes: ['carpenter', 'Carpenter', 'woodworker'],
    width: 14, depth: 12, height: 4.5,
    floorCount: 1,
    colors: { floor: MEDIUM_WOOD, wall: { r: 0.52, g: 0.42, b: 0.3 }, ceiling: { r: 0.45, g: 0.38, b: 0.28 } },
    rooms: [
      { name: 'workshop', function: 'carpenter_workshop', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'storage', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'carpenter_workshop', furniture: CARPENTER_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
    ],
  },

  // 24. Butcher
  {
    id: 'butcher',
    category: 'industrial',
    buildingType: 'butcher',
    matchBusinessTypes: ['butcher', 'Butcher', 'meatshop'],
    width: 12, depth: 12, height: 4,
    floorCount: 1,
    colors: { floor: STONE_GRAY, wall: { r: 0.65, g: 0.6, b: 0.55 }, ceiling: { r: 0.55, g: 0.52, b: 0.48 } },
    rooms: [
      { name: 'shop_front', function: 'butcher_front', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'prep_room', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'butcher_front', furniture: BUTCHER_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
    ],
  },

  // ─── Maritime Variants ───────────────────────────────────────────────────

  // 25. Harbor Office
  {
    id: 'harbor_office',
    category: 'maritime',
    buildingType: 'harbor',
    matchBusinessTypes: ['harbor', 'Harbor', 'port', 'dock'],
    width: 14, depth: 14, height: 4.5,
    floorCount: 2,
    colors: { floor: WEATHERED_WOOD, wall: { r: 0.5, g: 0.48, b: 0.42 }, ceiling: { r: 0.42, g: 0.4, b: 0.35 } },
    rooms: [
      { name: 'dock_office', function: 'harbor_office', offsetXFraction: 0, offsetZFraction: -0.2, widthFraction: 1, depthFraction: 0.6, floor: 0 },
      { name: 'warehouse', function: 'dock_warehouse', offsetXFraction: 0, offsetZFraction: 0.3, widthFraction: 1, depthFraction: 0.4, floor: 0 },
      { name: 'navigation', function: 'navigation', offsetXFraction: 0, offsetZFraction: 0, widthFraction: 1, depthFraction: 1, floor: 1 },
    ],
    furnitureSets: [
      { roomFunction: 'harbor_office', furniture: HARBOR_OFFICE_FURNITURE },
      { roomFunction: 'dock_warehouse', furniture: DOCK_WAREHOUSE_FURNITURE },
      { roomFunction: 'navigation', furniture: NAVIGATION_FURNITURE },
    ],
  },

  // 26. Fish Market
  {
    id: 'fish_market',
    category: 'maritime',
    buildingType: 'fish_market',
    matchBusinessTypes: ['fish_market', 'FishMarket', 'fishmonger'],
    width: 16, depth: 12, height: 4.5,
    floorCount: 1,
    colors: { floor: STONE_GRAY, wall: { r: 0.55, g: 0.52, b: 0.48 }, ceiling: { r: 0.48, g: 0.45, b: 0.4 } },
    rooms: [
      { name: 'market_floor', function: 'fish_market', offsetXFraction: 0, offsetZFraction: -0.15, widthFraction: 1, depthFraction: 0.7, floor: 0 },
      { name: 'cold_storage', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.35, widthFraction: 1, depthFraction: 0.3, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'fish_market', furniture: FISH_MARKET_FURNITURE },
      { roomFunction: 'storage', furniture: STORAGE_FURNITURE },
    ],
  },

  // 27. Boatyard
  {
    id: 'boatyard',
    category: 'maritime',
    buildingType: 'boatyard',
    matchBusinessTypes: ['boatyard', 'Boatyard', 'shipyard'],
    width: 20, depth: 16, height: 6,
    floorCount: 1,
    colors: { floor: WEATHERED_WOOD, wall: { r: 0.45, g: 0.4, b: 0.32 }, ceiling: { r: 0.4, g: 0.35, b: 0.28 } },
    rooms: [
      { name: 'workshop', function: 'workshop', offsetXFraction: 0, offsetZFraction: -0.15, widthFraction: 1, depthFraction: 0.7, floor: 0 },
      { name: 'supply_room', function: 'storage', offsetXFraction: 0, offsetZFraction: 0.35, widthFraction: 1, depthFraction: 0.3, floor: 0 },
    ],
    furnitureSets: [
      { roomFunction: 'workshop', furniture: WORKSHOP_FURNITURE },
      { roomFunction: 'storage', furniture: DOCK_WAREHOUSE_FURNITURE },
    ],
  },
];

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

/** Look up a template by its exact id. */
export function getTemplateById(id: string): InteriorLayoutTemplate | undefined {
  return INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === id);
}

/**
 * Find the best-matching template for a building/business type string.
 * Falls back to the first template in the given category if no direct match is found.
 */
export function getTemplateForBuildingType(
  buildingType: string,
  businessType?: string,
  category?: string,
): InteriorLayoutTemplate | undefined {
  const bt = (businessType || buildingType || '').toLowerCase();

  // Try exact match on business type first (longest match wins to avoid substring collisions)
  let bestMatch: InteriorLayoutTemplate | undefined;
  let bestLen = 0;
  for (const template of INTERIOR_LAYOUT_TEMPLATES) {
    for (const m of template.matchBusinessTypes) {
      if (bt.includes(m.toLowerCase()) && m.length > bestLen) {
        bestMatch = template;
        bestLen = m.length;
      }
    }
  }
  if (bestMatch) return bestMatch;

  // Try building type match (longest match wins)
  bestLen = 0;
  for (const template of INTERIOR_LAYOUT_TEMPLATES) {
    if (bt.includes(template.buildingType) && template.buildingType.length > bestLen) {
      bestMatch = template;
      bestLen = template.buildingType.length;
    }
  }
  if (bestMatch) return bestMatch;

  // Fall back to first template in the category
  if (category) {
    const categoryTemplates = getTemplatesForCategory(category);
    if (categoryTemplates.length > 0) return categoryTemplates[0];
  }

  return undefined;
}

/** Get all template IDs. */
export function getTemplateIds(): string[] {
  return INTERIOR_LAYOUT_TEMPLATES.map(t => t.id);
}

/** Get all templates belonging to a building category. */
export function getTemplatesForCategory(category: string): InteriorLayoutTemplate[] {
  return INTERIOR_LAYOUT_TEMPLATES.filter(t => t.category === category);
}

/** Get all unique categories present in templates. */
export function getTemplateCategories(): string[] {
  return Array.from(new Set(INTERIOR_LAYOUT_TEMPLATES.map(t => t.category)));
}

/** Resolve a room zone template to absolute dimensions given the parent template. */
export function resolveRoomZone(
  template: InteriorLayoutTemplate,
  room: RoomZoneTemplate,
): { name: string; function: string; offsetX: number; offsetZ: number; offsetY: number; width: number; depth: number; floor: number } {
  return {
    name: room.name,
    function: room.function,
    offsetX: room.offsetXFraction * template.width,
    offsetZ: room.offsetZFraction * template.depth,
    offsetY: room.floor * template.height,
    width: room.widthFraction * template.width,
    depth: room.depthFraction * template.depth,
    floor: room.floor,
  };
}

/** Get the furniture set for a given room function within a template. */
export function getFurnitureSetForRoom(
  template: InteriorLayoutTemplate,
  roomFunction: string,
): FurnitureEntry[] {
  const set = template.furnitureSets.find(s => s.roomFunction === roomFunction);
  return set?.furniture ?? [];
}
