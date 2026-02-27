#!/usr/bin/env tsx
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { storage } from '../db/storage.js';

async function run() {
  const all = await storage.getAllAssetCollections();
  const myth = all.find(c => c.worldType === 'mythological' && c.isBase === true);
  if (!myth) { console.log('No mythological base collection found'); return; }
  console.log(`Deleting mythological collection: ${myth.id}`);
  const assetIds = (myth.assetIds || []) as string[];
  for (const id of assetIds) { try { await storage.deleteVisualAsset(id); } catch {} }
  await storage.deleteAssetCollection(myth.id);
  console.log(`Done — deleted collection + ${assetIds.length} assets`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
