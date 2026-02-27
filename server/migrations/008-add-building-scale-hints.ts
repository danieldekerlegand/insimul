#!/usr/bin/env tsx
/**
 * Migration: Add scaleHint to Sketchfab building VisualAsset metadata
 *
 * Sketchfab models use wildly different unit conventions (meters, centimeters,
 * unitless). This migration adds a `scaleHint` to each building asset's metadata
 * so the 3D engine can scale them correctly relative to the player (1.77 units ≈ 1.77m).
 *
 * scaleHint values were computed from each model's raw bounding-box height
 * (after stripping environment/ground meshes) to reach a target real-world height.
 *
 * Usage:
 *   cd server
 *   npx tsx migrations/008-add-building-scale-hints.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import { storage } from '../db/storage.js';

// ─── Scale hint data ──────────────────────────────────────────────────────────
// Computed from each model's raw bounding-box height (after env mesh removal)
// and a target real-world height for that building type.
//
// Formula: scaleHint = targetHeight / rawHeight
//   where rawHeight is the model's bounding-box Y extent in native units,
//   and targetHeight is the desired height in game units (1 unit ≈ 1 meter).

interface ScaleEntry {
  uid: string;
  name: string;
  rawHeight: number;     // Native bounding-box height after env mesh removal
  targetHeight: number;  // Desired height in game units (meters)
  scaleHint: number;     // = targetHeight / rawHeight
}

const SCALE_DATA: ScaleEntry[] = [
  // Medieval House 1 — default house, 1-2 floors (~8m)
  { uid: '0bbda345359349ea95280f597c8a4bd4', name: 'Medieval House 1',
    rawHeight: 909.9, targetHeight: 8, scaleHint: 0.0088 },

  // Medieval House 3 — small residence (~7m)
  { uid: 'cf179aa6dc0944f1974ce3f7812031a6', name: 'Medieval House 3',
    rawHeight: 1009.0, targetHeight: 7, scaleHint: 0.0069 },

  // Generic Textures House — large residence (~9m)
  { uid: '3eb9e3b600264e2f99100fc43619497e', name: 'Medieval House - Generic',
    rawHeight: 78.7, targetHeight: 9, scaleHint: 0.1143 },

  // Medieval Tavern — tavern (~5m, cozy single-story)
  { uid: 'a06dfdc919334bfc95de720ad98f4295', name: 'Medieval Tavern',
    rawHeight: 0.6, targetHeight: 5, scaleHint: 8.0 },

  // Medieval Food Stall — shop/market (~4m, open stall)
  { uid: '7d9b2922dd0941dab820c4763078c789', name: 'Medieval Food Stall',
    rawHeight: 10.2, targetHeight: 4, scaleHint: 0.392 },

  // The Blacksmith's — workshop (~7m)
  { uid: 'd93444656b204ddd8270b9a9be0d99ec', name: "The Blacksmith's",
    rawHeight: 10.2, targetHeight: 7, scaleHint: 0.686 },

  // Gothic Church — tall church (~18m)
  { uid: 'b5eaf6f238b1490a80c682ed238a7230', name: 'Medieval Gothic Church',
    rawHeight: 20.8, targetHeight: 18, scaleHint: 0.865 },

  // Town Hall — municipal building (~8m)
  { uid: 'e883e0175881444197b38d4c19d59a16', name: 'Town Hall',
    rawHeight: 426.2, targetHeight: 8, scaleHint: 0.0188 },

  // Medieval Mill — windmill (~12m with blades)
  { uid: '080f516a0b6b402092c1314913341db8', name: 'Medieval Mill',
    rawHeight: 1592.6, targetHeight: 12, scaleHint: 0.0075 },

  // Watermill — water-powered mill (~8m)
  { uid: '0e5944ed90664d408548b6d19601c7a8', name: 'Watermill',
    rawHeight: 22.8, targetHeight: 8, scaleHint: 0.351 },

  // Old Sawmill — lumber mill (~6m)
  { uid: '39e4cd568ce74dd3a58118d3a5b94471', name: 'Old Sawmill',
    rawHeight: 369.4, targetHeight: 6, scaleHint: 0.0162 },

  // Medieval Barrack — military barracks (~7m)
  { uid: '1086c3c8d5434cf89b1cab8792ba9151', name: 'Medieval Barrack',
    rawHeight: 100.8, targetHeight: 7, scaleHint: 0.0694 },

  // Mine Shaft Kit — mine entrance (~5m)
  { uid: '00b563b64111430e9ebdb71ae784979c', name: 'Mine Shaft Kit',
    rawHeight: 419.1, targetHeight: 5, scaleHint: 0.0119 },
];

// ─── Main migration ────────────────────────────────────────────────────────────

async function run() {
  console.log('📐 Adding scaleHint to Sketchfab building assets...\n');

  // Find all visual assets that are Sketchfab buildings
  const allAssets = await storage.getAllVisualAssets();
  let updated = 0;

  for (const entry of SCALE_DATA) {
    // Find the asset by matching Sketchfab UID in metadata
    const asset = allAssets.find((a: any) => {
      const meta = a.metadata as Record<string, any> | null;
      return meta?.sketchfabUid === entry.uid;
    });

    if (!asset) {
      console.log(`  ⚠️  Not found: ${entry.name} (uid: ${entry.uid})`);
      continue;
    }

    // Merge scaleHint into existing metadata
    const existingMeta = (asset.metadata as Record<string, any>) || {};
    const newMeta = { ...existingMeta, scaleHint: entry.scaleHint };

    try {
      await storage.updateVisualAsset(asset.id, { metadata: newMeta });
      updated++;
      console.log(`  ✅ ${entry.name}: scaleHint=${entry.scaleHint} (raw=${entry.rawHeight} → target=${entry.targetHeight}m)`);
    } catch (err: any) {
      console.error(`  ❌ Failed to update ${entry.name}: ${err.message}`);
    }
  }

  console.log(`\n✅ Updated ${updated}/${SCALE_DATA.length} assets with scaleHint.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
