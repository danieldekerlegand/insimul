#!/usr/bin/env tsx
/**
 * Migration 033: Seed a "French Louisiana" asset collection with procedural building config.
 *
 * Creates a base asset collection with Creole and shotgun house style presets
 * that drive the procedural building generator. No 3D model files required —
 * everything is defined through color palettes, material types, and feature flags.
 *
 * Usage:
 *   npx tsx server/migrations/033-seed-french-louisiana-collection.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';
import type { ProceduralBuildingConfig } from '@shared/game-engine/types';

export async function migrate() {
  console.log('[Migration 033] Seeding French Louisiana asset collection...');

  // Check if already exists
  const all = await storage.getAllAssetCollections();
  if (all.some(c => c.name === 'French Louisiana')) {
    console.log('[Migration 033] French Louisiana collection already exists, skipping.');
    return;
  }

  const proceduralBuildings: ProceduralBuildingConfig = {
    stylePresets: [
      {
        id: 'creole_townhouse',
        name: 'Creole Townhouse',
        baseColors: [
          { r: 0.85, g: 0.78, b: 0.65 }, // Warm cream
          { r: 0.82, g: 0.72, b: 0.58 }, // Tan/sandstone
          { r: 0.75, g: 0.6, b: 0.5 },   // Terracotta
          { r: 0.9, g: 0.85, b: 0.75 },  // Pale yellow
          { r: 0.88, g: 0.82, b: 0.78 }, // Light pink/blush
        ],
        roofColor: { r: 0.25, g: 0.22, b: 0.2 },   // Dark slate
        windowColor: { r: 0.75, g: 0.82, b: 0.88 }, // Pale blue glass
        doorColor: { r: 0.3, g: 0.2, b: 0.12 },     // Dark wood
        materialType: 'brick',
        architectureStyle: 'creole',
        roofStyle: 'hip',
        hasBalcony: true,
        hasIronworkBalcony: true,
        hasShutters: true,
        shutterColor: { r: 0.15, g: 0.35, b: 0.2 }, // Dark green shutters
      },
      {
        id: 'single_shotgun',
        name: 'Single Shotgun House',
        baseColors: [
          { r: 0.55, g: 0.7, b: 0.65 },  // Seafoam green
          { r: 0.7, g: 0.65, b: 0.85 },   // Lavender
          { r: 0.85, g: 0.75, b: 0.45 },  // Mustard yellow
          { r: 0.65, g: 0.78, b: 0.85 },  // Powder blue
          { r: 0.88, g: 0.55, b: 0.55 },  // Coral/salmon
          { r: 0.9, g: 0.88, b: 0.82 },   // Off-white
          { r: 0.75, g: 0.85, b: 0.6 },   // Sage green
          { r: 0.85, g: 0.7, b: 0.55 },   // Peach
        ],
        roofColor: { r: 0.3, g: 0.28, b: 0.25 },   // Dark gray
        windowColor: { r: 0.8, g: 0.85, b: 0.9 },   // Light blue glass
        doorColor: { r: 0.35, g: 0.25, b: 0.15 },   // Dark wood
        materialType: 'wood',
        architectureStyle: 'colonial',
        roofStyle: 'side_gable',
        hasPorch: true,
        porchDepth: 3,
        porchSteps: 3,
        hasShutters: true,
        shutterColor: { r: 0.2, g: 0.2, b: 0.22 }, // Dark charcoal shutters
      },
      {
        id: 'double_shotgun',
        name: 'Double Shotgun House',
        baseColors: [
          { r: 0.78, g: 0.72, b: 0.62 },  // Warm beige
          { r: 0.65, g: 0.75, b: 0.72 },   // Muted teal
          { r: 0.82, g: 0.78, b: 0.65 },   // Warm cream
          { r: 0.7, g: 0.62, b: 0.55 },    // Warm brown
          { r: 0.8, g: 0.82, b: 0.75 },    // Sage
        ],
        roofColor: { r: 0.28, g: 0.25, b: 0.22 },  // Dark brown
        windowColor: { r: 0.78, g: 0.83, b: 0.88 }, // Pale blue
        doorColor: { r: 0.32, g: 0.22, b: 0.14 },   // Dark wood
        materialType: 'wood',
        architectureStyle: 'colonial',
        roofStyle: 'side_gable',
        hasPorch: true,
        porchDepth: 3.5,
        porchSteps: 3,
        hasShutters: true,
        shutterColor: { r: 0.12, g: 0.3, b: 0.18 }, // Forest green shutters
      },
      {
        id: 'creole_cottage',
        name: 'Creole Cottage',
        baseColors: [
          { r: 0.9, g: 0.85, b: 0.72 },   // Butter yellow
          { r: 0.85, g: 0.82, b: 0.78 },   // Pinkish cream
          { r: 0.92, g: 0.88, b: 0.82 },   // Pale cream
        ],
        roofColor: { r: 0.35, g: 0.3, b: 0.25 },    // Warm dark brown
        windowColor: { r: 0.75, g: 0.82, b: 0.85 },  // Blue glass
        doorColor: { r: 0.28, g: 0.18, b: 0.1 },     // Dark wood
        materialType: 'stucco',
        architectureStyle: 'creole',
        roofStyle: 'hip',
        hasPorch: true,
        porchDepth: 2.5,
        porchSteps: 2,
        hasShutters: true,
        shutterColor: { r: 0.2, g: 0.35, b: 0.45 }, // Blue-gray shutters
      },
    ],
    buildingTypeOverrides: {
      // Single shotgun: narrow and deep, 1 story
      'residence_small': {
        floors: 1,
        width: 5,
        depth: 16,
        hasPorch: true,
        stylePresetId: 'single_shotgun',
      },
      // Double shotgun: wider, 1 story
      'residence_medium': {
        floors: 1,
        width: 10,
        depth: 16,
        hasPorch: true,
        stylePresetId: 'double_shotgun',
      },
      // Larger residences: 2-story Creole townhouse
      'residence_large': {
        floors: 2,
        width: 12,
        depth: 14,
        hasBalcony: true,
        stylePresetId: 'creole_townhouse',
      },
      // Mansions: grand Creole townhouse
      'residence_mansion': {
        floors: 3,
        width: 16,
        depth: 18,
        hasBalcony: true,
        hasChimney: true,
        stylePresetId: 'creole_townhouse',
      },
      // Creole cottages for small residences in some contexts
      'Restaurant': {
        floors: 2,
        width: 14,
        depth: 12,
        hasBalcony: true,
        stylePresetId: 'creole_townhouse',
      },
      'Shop': {
        floors: 2,
        width: 10,
        depth: 10,
        hasBalcony: true,
        stylePresetId: 'creole_townhouse',
      },
      'Tavern': {
        floors: 2,
        width: 14,
        depth: 14,
        hasBalcony: true,
        stylePresetId: 'creole_townhouse',
      },
    },
    // Residential buildings default to the shotgun styles (randomly picked)
    // Commercial buildings default to the Creole townhouse style
    defaultCommercialStyleId: 'creole_townhouse',
  };

  await storage.createAssetCollection({
    name: 'French Louisiana',
    description: 'New Orleans Creole architecture — wrought iron balconied townhouses, colorful shotgun houses with front porches, and Creole cottages with shuttered windows.',
    collectionType: 'complete_theme',
    worldType: 'historical-colonial',
    purpose: 'Recreate the French Quarter of New Orleans with procedurally generated Creole architecture and shotgun houses',
    tags: ['french-quarter', 'new-orleans', 'creole', 'shotgun-house', 'colonial', 'louisiana', 'procedural'],
    isPublic: true,
    isBase: true,
    isActive: true,
    proceduralBuildings,
  } as any);

  console.log('[Migration 033] French Louisiana asset collection created successfully.');
}

migrate()
  .then(() => { console.log('Done'); process.exit(0); })
  .catch((error) => { console.error('Failed:', error); process.exit(1); });
