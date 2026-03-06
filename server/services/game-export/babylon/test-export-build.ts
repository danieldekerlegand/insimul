#!/usr/bin/env tsx

/**
 * Test script to verify Babylon export build works
 * This simulates the file copying and modification process without running the full export
 */

import { GameFileCopier } from './game-file-copier';
import { get3DGamePath } from './path-utils';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import * as fs from 'node:fs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import * as path from 'node:path';

async function testExportBuild() {
  console.log('[Test] Starting Babylon export build test...');
  
  // Use the same temp directory pattern as the actual export
  const tempDir = await mkdtemp(join(tmpdir(), 'babylon-export-'));
  console.log(`[Test] Created temp directory: ${tempDir}`);
  
  try {
    // 1. Copy and modify files
    console.log('[Test] Copying and modifying files...');
    const copier = new GameFileCopier(get3DGamePath(), tempDir);
    const files = await copier.copyAllFiles();
    
    // Copy entire shared directory
    const sharedTypesPath = join(tempDir, 'src/shared');
    await mkdir(sharedTypesPath, { recursive: true });
    
    // Copy all files recursively from the shared directory
    const rootSharedPath = join(process.cwd(), 'shared');
    if (fs.existsSync(rootSharedPath)) {
      const copyAllFiles = async function(dir: string, basePath: string = ''): Promise<void> {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
          
          if (entry.isDirectory()) {
            await copyAllFiles(fullPath, relativePath);
          } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            const destPath = join(sharedTypesPath, relativePath);
            await mkdir(path.dirname(destPath), { recursive: true });
            await writeFile(destPath, content);
          }
        }
      };
      
      await copyAllFiles(rootSharedPath);
      console.log(`[Test] Copied entire shared directory`);
    }
    
    console.log(`[Test] Copied ${files.length} files`);
    
    // Write all files to temp directory
    for (const file of files) {
      const filePath = join(tempDir, file.path);
      // Ensure directory exists
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, file.content, 'utf8');
      
      // Debug: Check if this is TextureManager.ts and print the actual content
      if (file.path === 'src/TextureManager.ts') {
        console.log('[Test] TextureManager.ts content around line 31:');
        const contentLines = file.content.split('\n');
        for (let i = 28; i < 35; i++) {
          if (contentLines[i]) {
            console.log(`Line ${i + 1}: ${contentLines[i]}`);
          }
        }
      }
    }
    
    // 3. Create minimal main.ts if it doesn't exist
    const mainTsPath = join(tempDir, 'src/main.ts');
    if (!fs.existsSync(mainTsPath)) {
      const mainTs = `
import { BabylonGame } from './BabylonGame.js';

// Initialize the game
const game = new BabylonGame({
  canvas: document.getElementById('renderCanvas') as HTMLCanvasElement,
  worldId: 'test-world'
});

// Start the game
game.init().catch(console.error);
`;
      await writeFile(mainTsPath, mainTs);
      console.log('[Test] Created main.ts');
    }
    
    // 4. Create minimal index.html if it doesn't exist
    const indexPath = join(tempDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Babylon Export Test</title>
  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    #renderCanvas {
      width: 100%;
      height: 100%;
      touch-action: none;
    }
  </style>
</head>
<body>
  <canvas id="renderCanvas"></canvas>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;
      await writeFile(indexPath, indexHtml);
      console.log('[Test] Created index.html');
    }
    
    // 2. Create minimal package.json if it doesn't exist
    const packageJsonPath = join(tempDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      const packageJson = {
        name: 'babylon-export-test',
        version: '1.0.0',
        type: 'module',
        scripts: {
          build: 'vite build'
        },
        dependencies: {
          '@babylonjs/core': '^7.0.0',
          '@babylonjs/gui': '^7.0.0',
          '@babylonjs/loaders': '^7.0.0',
          '@babylonjs/materials': '^7.0.0'
        },
        devDependencies: {
          'vite': '^5.4.0',
          'typescript': '^5.4.0'
        }
      };
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('[Test] Created package.json');
    }
    
    // 3. Create minimal vite.config.ts if it doesn't exist
    const viteConfigPath = join(tempDir, 'vite.config.ts');
    if (!fs.existsSync(viteConfigPath)) {
      // Use the same configuration as the actual export
      const viteConfig = `
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
    },
  },
  esbuild: {
    loader: 'ts',
    target: 'esnext',
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  optimizeDeps: {
    include: [
      '@babylonjs/core',
      '@babylonjs/gui', 
      '@babylonjs/loaders',
      '@babylonjs/materials',
    ],
  },
});
`;
      await writeFile(viteConfigPath, viteConfig);
      console.log('[Test] Created vite.config.ts');
    }
    
    // 5. Create minimal tsconfig.json if it doesn't exist (Electron mode)
    const tsConfigPath = join(tempDir, 'tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
      // Use the same config as Electron export
      const tsConfig = {
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'preserve',
          baseUrl: '.',
          paths: { 
            '@/*': ['src/*'],
            '@shared/*': ['src/shared/*']
          }
        },
        include: ['src']
      };
      await writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      console.log('[Test] Created tsconfig.json');
    }
    console.log('[Test] Checking for remaining @shared imports...');
    // @shared imports are now allowed since we're copying the shared types
    console.log('[Test] @shared imports will be resolved with copied shared types');
    
    // 5. Try to install dependencies and build
    console.log('[Test] Installing dependencies...');
    execSync('npm install', { cwd: tempDir, stdio: 'pipe' });
    
    console.log('[Test] Running build...');
    execSync('npm run build', { cwd: tempDir, stdio: 'pipe' });
    
    console.log('[Test] ✅ SUCCESS: Build completed without errors');
    return true;
    
  } catch (error) {
    console.error('[Test] ❌ FAILED:', error);
    // execSync errors don't have stdout/stderr properties in TypeScript
    // The error message should contain the relevant information
    return false;
  } finally {
    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });
  }
}

// Run the test
testExportBuild().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('[Test] Unexpected error:', error);
  process.exit(1);
});
