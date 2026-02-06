/**
 * Download CC0 Character Models Script
 * 
 * Downloads curated CC0-licensed character models from Quaternius and other sources
 * and organizes them into the appropriate asset directories.
 * 
 * Usage: npx tsx server/scripts/download-character-models.ts
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'client/public/assets');

// Model sources - Direct download links for CC0 models
// Note: These are example URLs - actual URLs may need updating based on availability
const MODEL_SOURCES = {
  characters: {
    // Quaternius Ultimate Modular Characters pack
    // https://quaternius.com/packs/ultimatemodularcharacters.html
    quaternius_modular: {
      zipUrl: 'https://quaternius.com/packs/ultimatemodularcharacters/UltimateModularCharacters.zip',
      description: 'Ultimate Modular Characters by Quaternius (CC0)',
      models: [
        { src: 'GLB/Character_Male.glb', dest: 'generic/player_male.glb' },
        { src: 'GLB/Character_Female.glb', dest: 'generic/player_female.glb' },
        { src: 'GLB/Character_Knight.glb', dest: 'medieval/player_knight.glb' },
        { src: 'GLB/Character_Mage.glb', dest: 'medieval/player_mage.glb' },
      ]
    },
    // Quaternius Animated Woman pack
    quaternius_woman: {
      zipUrl: 'https://quaternius.com/packs/animatedwoman/Animated_Woman.zip',
      description: 'Animated Woman by Quaternius (CC0)',
      models: [
        { src: 'GLB/Animated_Woman.glb', dest: 'generic/player_female.glb' }
      ]
    },
    // Kenney Character Assets (when available as direct download)
    kenney_characters: {
      zipUrl: 'https://kenney.nl/media/pages/assets/animated-characters/2e5a9e4c45-1677495936/kenney_animated-characters.zip',
      description: 'Animated Characters by Kenney (CC0)',
      models: []
    }
  },
  questObjects: {
    // Quaternius props that work well as quest objects
    quaternius_props: {
      zipUrl: 'https://quaternius.com/packs/lowpolyultimatepack/LowPolyUltimatePack.zip',
      description: 'Low Poly Ultimate Pack by Quaternius (CC0)',
      models: [
        { src: 'GLB/Chest.glb', dest: 'chest.glb' },
        { src: 'GLB/Key.glb', dest: 'key.glb' },
        { src: 'GLB/Scroll.glb', dest: 'scroll.glb' },
      ]
    }
  }
};

// Standalone model downloads (individual files)
const STANDALONE_MODELS = [
  {
    url: 'https://raw.githubusercontent.com/AlaricBaraworChan/webGLPlayground/main/public/models/Vincent-frontFacing.babylon',
    dest: 'characters/generic/player_default.babylon',
    description: 'Vincent character model (Babylon.js format)'
  }
];

/**
 * Download a file from URL to local path
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  await fs.mkdir(path.dirname(destPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath).catch(() => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

/**
 * Download and extract a ZIP file
 */
async function downloadAndExtractZip(url: string, extractDir: string): Promise<string> {
  const tempZipPath = path.join(extractDir, 'temp_download.zip');
  
  console.log(`  Downloading ZIP from ${url}...`);
  await downloadFile(url, tempZipPath);
  
  console.log(`  Extracting to ${extractDir}...`);
  
  // Use unzip command (available on most systems)
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    await execAsync(`unzip -o -q "${tempZipPath}" -d "${extractDir}"`);
  } catch (error: any) {
    // Try with tar as fallback (some systems)
    try {
      await execAsync(`tar -xf "${tempZipPath}" -C "${extractDir}"`);
    } catch {
      throw new Error(`Failed to extract ZIP: ${error.message}`);
    }
  }
  
  // Clean up temp zip
  await fs.unlink(tempZipPath).catch(() => {});
  
  return extractDir;
}

/**
 * Copy file with directory creation
 */
async function copyFile(src: string, dest: string): Promise<void> {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

/**
 * Find a file in directory recursively
 */
async function findFile(dir: string, filename: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const found = await findFile(fullPath, filename);
        if (found) return found;
      } else if (entry.name.toLowerCase() === filename.toLowerCase()) {
        return fullPath;
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }
  
  return null;
}

/**
 * Download standalone model files
 */
async function downloadStandaloneModels(): Promise<void> {
  console.log('\n📦 Downloading standalone models...\n');
  
  for (const model of STANDALONE_MODELS) {
    const destPath = path.join(ASSETS_DIR, model.dest);
    
    // Check if already exists
    try {
      await fs.access(destPath);
      console.log(`  ✅ ${model.dest} already exists, skipping`);
      continue;
    } catch {
      // Doesn't exist, download it
    }
    
    console.log(`  ⬇️  Downloading ${model.description}...`);
    
    try {
      await downloadFile(model.url, destPath);
      console.log(`  ✅ Downloaded to ${model.dest}`);
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }
}

/**
 * Create placeholder models for missing assets
 */
async function createPlaceholders(): Promise<void> {
  console.log('\n📝 Creating placeholder files for missing models...\n');
  
  const placeholders = [
    'characters/generic/player_default.glb',
    'characters/generic/player_male.glb',
    'characters/generic/player_female.glb',
    'characters/generic/npc_civilian_male.glb',
    'characters/generic/npc_civilian_female.glb',
    'characters/generic/npc_guard.glb',
    'characters/generic/npc_merchant.glb',
    'characters/medieval/player_knight.glb',
    'characters/medieval/player_mage.glb',
    'characters/scifi/player_soldier.glb',
    'quest-objects/collectible_gem.glb',
    'quest-objects/chest.glb',
    'quest-objects/quest_marker.glb',
    'quest-objects/key.glb',
    'quest-objects/scroll.glb',
  ];
  
  const placeholderContent = JSON.stringify({
    placeholder: true,
    message: 'Replace this file with an actual GLB model',
    suggestedSources: [
      'https://quaternius.com/',
      'https://kenney.nl/assets',
      'https://sketchfab.com/search?features=downloadable&licenses=7c23a1ba438d4306920229c12afcb5f9&type=models'
    ]
  }, null, 2);
  
  for (const placeholder of placeholders) {
    const destPath = path.join(ASSETS_DIR, placeholder);
    const infoPath = destPath.replace('.glb', '.info.json');
    
    try {
      await fs.access(destPath);
      // File exists, skip
    } catch {
      // Create directory and placeholder info file
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.writeFile(infoPath, placeholderContent);
      console.log(`  📝 Created placeholder info: ${placeholder.replace('.glb', '.info.json')}`);
    }
  }
}

/**
 * Print download instructions for manual download
 */
function printManualDownloadInstructions(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    MANUAL DOWNLOAD INSTRUCTIONS                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Some model packs may need to be downloaded manually due to       ║
║  website restrictions. Here are the recommended sources:          ║
║                                                                   ║
║  CHARACTER MODELS:                                                ║
║  ─────────────────                                                ║
║  1. Quaternius Ultimate Modular Characters                        ║
║     https://quaternius.com/packs/ultimatemodularcharacters.html   ║
║     → Extract GLB files to: client/public/assets/characters/      ║
║                                                                   ║
║  2. Quaternius Animated Woman                                     ║
║     https://quaternius.com/packs/animatedwoman.html               ║
║     → Use for female player character                             ║
║                                                                   ║
║  3. Kenney Animated Characters                                    ║
║     https://kenney.nl/assets/animated-characters                  ║
║     → Low-poly animated characters with multiple skins            ║
║                                                                   ║
║  QUEST OBJECT MODELS:                                             ║
║  ────────────────────                                             ║
║  1. Quaternius Low Poly Ultimate Pack                             ║
║     https://quaternius.com/packs/lowpolyultimatepack.html         ║
║     → Contains chests, keys, scrolls, and other props             ║
║                                                                   ║
║  2. Kenney Game Assets                                            ║
║     https://kenney.nl/assets                                      ║
║     → Search for specific items you need                          ║
║                                                                   ║
║  DIRECTORY STRUCTURE:                                             ║
║  ────────────────────                                             ║
║  client/public/assets/                                            ║
║  ├── characters/                                                  ║
║  │   ├── generic/                                                 ║
║  │   │   ├── player_default.glb                                   ║
║  │   │   ├── player_male.glb                                      ║
║  │   │   ├── player_female.glb                                    ║
║  │   │   └── npc_*.glb                                            ║
║  │   ├── medieval/                                                ║
║  │   └── scifi/                                                   ║
║  └── quest-objects/                                               ║
║      ├── collectible_gem.glb                                      ║
║      ├── chest.glb                                                ║
║      ├── quest_marker.glb                                         ║
║      ├── key.glb                                                  ║
║      └── scroll.glb                                               ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
`);
}

/**
 * Main download function
 */
async function main(): Promise<void> {
  console.log('🎮 CC0 Character Model Downloader\n');
  console.log('This script will download CC0-licensed character and quest object models.');
  console.log(`Assets will be saved to: ${ASSETS_DIR}\n`);
  
  // Ensure base directories exist
  await fs.mkdir(path.join(ASSETS_DIR, 'characters/generic'), { recursive: true });
  await fs.mkdir(path.join(ASSETS_DIR, 'characters/medieval'), { recursive: true });
  await fs.mkdir(path.join(ASSETS_DIR, 'characters/scifi'), { recursive: true });
  await fs.mkdir(path.join(ASSETS_DIR, 'quest-objects'), { recursive: true });
  
  // Download standalone models
  await downloadStandaloneModels();
  
  // Create placeholders for missing models
  await createPlaceholders();
  
  // Print manual download instructions
  printManualDownloadInstructions();
  
  console.log('\n✅ Script completed!\n');
  console.log('Next steps:');
  console.log('1. Download character packs from the links above');
  console.log('2. Extract GLB files to the appropriate directories');
  console.log('3. Replace the .info.json placeholder files with actual .glb models');
  console.log('4. Register models in asset collections via the Admin Panel\n');
}

// Run the script
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
