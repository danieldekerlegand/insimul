/**
 * Babylon.js Project Generator
 *
 * Generates the project scaffolding for a standalone Babylon.js app:
 * - Web mode: Vite web app
 * - Electron mode: Electron desktop app with embedded web view
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEMPLATES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'templates');

function loadTemplate(name: string, vars: Record<string, string> = {}): string {
  const content = readFileSync(join(TEMPLATES_DIR, name), 'utf8');
  return content.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export interface GeneratedFile {
  path: string;
  content: string | Buffer;
  isBinary?: boolean;
}

export interface BabylonExportOptions {
  mode: 'web' | 'electron';
}

function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

// ─────────────────────────────────────────────
// package.json
// ─────────────────────────────────────────────

function generatePackageJson(ir: WorldIR, options: BabylonExportOptions): string {
  const worldSafe = sanitiseName(ir.meta.worldName).toLowerCase();
  const isElectron = options.mode === 'electron';
  
  const baseConfig = {
    name: `insimul-export-${worldSafe}`,
    version: '1.0.0',
    private: true,
    description: `${ir.meta.worldDescription || 'A game built with InSimul'}`,
    author: 'InSimul',
    main: isElectron ? 'electron/main.js' : undefined,
    scripts: {
      dev: isElectron ? 'vite build && electron .' : 'vite',
      build: 'vite build',
      'build:web': 'vite build',
      'package:web': 'npm run build && cd dist && zip -r ../web-build.zip .',
      'build:electron': 'vite build && electron-builder',
      preview: 'vite preview',
      electron: isElectron ? 'electron .' : undefined,
      'electron:dev': isElectron ? 'concurrently "npm run dev" "wait-on http://localhost:5173 && electron . --dev"' : undefined,
      postinstall: isElectron ? 'electron-rebuild' : undefined,
    },
    dependencies: {
      '@babylonjs/core': '^7.0.0',
      '@babylonjs/gui': '^7.0.0',
      '@babylonjs/loaders': '^7.0.0',
      '@babylonjs/materials': '^7.0.0',
      'tau-prolog': '^0.3.4',
      ...(isElectron && {
        'node-llama-cpp': '^3.18.1',
      }),
    },
    devDependencies: {
      typescript: '^5.4.0',
      vite: '^5.4.0',
      ...(isElectron && {
        electron: '^30.0.0',
        'electron-builder': '^24.0.0',
        '@electron/rebuild': '^3.7.1',
        'concurrently': '^8.0.0',
        'wait-on': '^7.0.0',
      }),
    },
    ...(isElectron && {
      build: {
        appId: `com.insimul.${worldSafe}`,
        productName: ir.meta.worldName,
        asar: false,
        directories: {
          output: 'release',
        },
        files: [
          'dist/**/*',
          'electron/main.js',
          'electron/preload.js',
          'electron/ai-service.js',
          'node_modules/node-llama-cpp/**/*',
          'package.json',
        ],
        extraMetadata: {
          main: 'electron/main.js',
        },
        mac: {
          category: 'public.app-category.games',
          target: [
            {
              target: 'dmg',
              arch: ['x64', 'arm64'],
            },
          ],
        },
        win: {
          target: 'nsis',
        },
        linux: {
          target: 'AppImage',
        },
      },
    }),
  };

  // Remove undefined values
  const cleanConfig = JSON.parse(JSON.stringify(baseConfig, (key, value) => 
    value === undefined ? null : value
  ));

  return JSON.stringify(cleanConfig, null, 2);
}

// ─────────────────────────────────────────────
// index.html
// ─────────────────────────────────────────────

function generateIndexHtml(ir: WorldIR, options: BabylonExportOptions = { mode: 'web' }): string {
  const scriptSrc = './src/main.ts';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ir.meta.worldName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #renderCanvas {
      width: 100%; height: 100%;
      touch-action: none; outline: none;
    }
    #loadingScreen {
      position: fixed; inset: 0; display: flex;
      flex-direction: column; align-items: center; justify-content: center;
      background: #111; color: #fff; font-family: system-ui, sans-serif; z-index: 1000;
      gap: 1rem;
    }
    #loadingScreen h1 { font-size: 2rem; margin-bottom: 0.25rem; }
    #loadingScreen.hidden { display: none; }
    #loadingStep { color: #aaa; font-size: 0.9rem; min-height: 1.2em; }
    #loadingBarWrap {
      width: 280px; height: 6px; background: #333; border-radius: 3px; overflow: hidden;
    }
    #loadingBar {
      height: 100%; width: 0%; background: #5b8fff;
      border-radius: 3px; transition: width 0.3s ease;
    }
    #loadingError {
      display: none; color: #ff6b6b; font-size: 0.85rem;
      max-width: 480px; text-align: center; white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="loadingScreen">
    <h1>${ir.meta.worldName}</h1>
    <div id="loadingBarWrap"><div id="loadingBar"></div></div>
    <div id="loadingStep">Initializing…</div>
    <div id="loadingError"></div>
  </div>
  <canvas id="renderCanvas"></canvas>
  <script type="module" src="${scriptSrc}"></script>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// vite.config.ts
// ─────────────────────────────────────────────

function generateViteConfig(_options: BabylonExportOptions): string {
  return loadTemplate('vite.config.ts');
}

// ─────────────────────────────────────────────
// tsconfig.json
// ─────────────────────────────────────────────

function generateTsConfig(isElectron = false): string {
  const config: any = {
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
      },
    },
    include: ['src'],
  };
  
  if (isElectron) {
    // For Electron, we still need to include src files for the game code
    // but also add the electron files
    config.include = ['src', 'electron'];
    config.compilerOptions.outDir = 'dist-electron';
    config.compilerOptions.noEmit = false;
    // Keep ESNext module for vite build
  }
  
  return JSON.stringify(config, null, 2);
}

// ─────────────────────────────────────────────
// .gitignore
// ─────────────────────────────────────────────

function generateGitignore(): string {
  return `node_modules/
dist/
.vite/
*.local
`;
}

// ─────────────────────────────────────────────
// README.md
// ─────────────────────────────────────────────

function generateReadme(ir: WorldIR, options: BabylonExportOptions): string {
  const charCount = ir.entities.characters.length;
  const npcCount = ir.entities.npcs.length;
  const questCount = ir.systems.quests.length;
  const settlementCount = ir.geography.settlements.length;
  const isElectron = options.mode === 'electron';
  const isWeb = options.mode === 'web';

  const quickStart = isElectron ? `\`\`\`bash
npm install
npm run electron:dev
\`\`\`

The app will open in a native window.` : `\`\`\`bash
npm install
npm run dev
\`\`\`

Open \`http://localhost:5173\` in your browser.`;

  const buildSection = isElectron ? `\`\`\`bash
npm run build
\`\`\`

This creates platform-specific installers in the \`release/\` folder:` : `\`\`\`bash
npm run build
npm run preview
\`\`\`
`;

  return `# ${ir.meta.worldName} — Babylon.js Export${isElectron ? ' (Electron)' : ''}

> Generated by Insimul v${ir.meta.insimulVersion} on ${ir.meta.exportTimestamp}

## Quick Start

${quickStart}

## Build for Production

${buildSection}

${isWeb ? `### Web Build

\`\`\`bash
# Build for production
npm run build:web

# Package for distribution
npm run package:web

### Docker Deployment

\`\`\`bash
# Build Docker image
npm run build:docker

# Run Docker container
npm run run:docker

# Or manually:
docker build -t ${ir.meta.worldName.toLowerCase().replace(/\s+/g, '-')}:latest .
docker run -p 8080:80 ${ir.meta.worldName.toLowerCase().replace(/\s+/g, '-')}:latest
\`\`\`

The app will be available at http://localhost:8080

` : ''}

${isElectron ? `### Electron Build

\`\`\`bash
# Build Electron app
npm run build

# Or build separately:
npm run build:web    # Build web app
npm run build:electron  # Package Electron app
\`\`\`

Built apps will be in the \`release/\` directory.

` : ''}
## Project Structure

\`\`\`
src/
  main.ts              Entry point — creates engine & scene
  game/
    scene-builder.ts   Builds the 3D scene from world data
    player.ts          Player controller (3rd person, GLB model)
    npc-controller.ts  NPC AI & behaviour
    npc-spawner.ts     Spawns NPCs from data (GLB models)
    world-generator.ts Terrain (heightmap + textures), buildings, roads, nature
    systems/
      action-system.ts   Game actions
      quest-system.ts    Quest tracking
      combat-system.ts   Combat mechanics
      dialogue-system.ts  Dialogue management
      inventory-system.ts Player inventory
      rule-enforcer.ts    World rules enforcement
  data/
    world_ir.json        Full intermediate representation
    asset-manifest.json  Bundled asset manifest
    characters.json      Character data
    npcs.json            NPC data
    quests.json          Quest data
    actions.json         Action definitions
    rules.json           World rules
    geography.json       Geography & settlements
    theme.json           Visual theme
public/
  assets/
    characters/        GLB character models (player + NPC roles)
    buildings/         KayKit medieval building GLTF models
    ground/            Terrain textures (diffuse, normal, heightmap)
    containers/        Container models (chests, crates)
    markers/           Quest marker models
    props/             Collectible item models
    audio/             Ambient, footstep, and interaction sounds
${isElectron ? `electron/
  main.ts             Electron main process
  preload.ts          Preload script for security
` : ''}${isWeb ? `
Dockerfile           Docker configuration for deployment
nginx.conf           Nginx configuration for serving static files
.dockerignore        Files to exclude from Docker build
` : ''}\`\`\`

## Game Controls

- **WASD** - Move player
- **Space** - Jump
- **E** - Interact
- **Left Mouse** - Attack/Action
- **Esc** - Pause menu

## License

Generated by InSimul
`;
}

// ─────────────────────────────────────────────
// Electron Main Process (only for Electron mode)
// ─────────────────────────────────────────────

function generateElectronMain(ir: WorldIR): string {
  return loadTemplate('electron-main.js', { WORLD_NAME: ir.meta.worldName });
}

// ─────────────────────────────────────────────
// Electron Preload Script (only for Electron mode)
// ─────────────────────────────────────────────

function generateElectronPreload(): string {
  return loadTemplate('electron-preload.js');
}

function generateElectronAIService(): string {
  return loadTemplate('electron-ai-service.js');
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export function generateProjectFiles(ir: WorldIR, options: BabylonExportOptions = { mode: 'web' }): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { path: 'package.json', content: generatePackageJson(ir, options) },
    { path: 'index.html', content: generateIndexHtml(ir, options) },
    { path: 'vite.config.ts', content: generateViteConfig(options) },
    { path: 'tsconfig.json', content: generateTsConfig(options.mode === 'electron') },
    { path: '.gitignore', content: generateGitignore() },
    { path: 'README.md', content: generateReadme(ir, options) },
  ];

  // Add Electron-specific files if in Electron mode
  if (options.mode === 'electron') {
    files.push(
      { path: 'electron/main.js', content: generateElectronMain(ir) },
      { path: 'electron/preload.js', content: generateElectronPreload() },
      { path: 'electron/ai-service.js', content: generateElectronAIService() },
    );
  }
  
  // Add Dockerfile for web deployment
  if (options.mode === 'web') {
    files.push(
      { path: 'Dockerfile', content: generateDockerfile() },
      { path: '.dockerignore', content: generateDockerignore() },
      { path: 'nginx.conf', content: generateNginxConf() },
    );
  }

  return files;
}

// ─────────────────────────────────────────────
// Dockerfile for web deployment
// ─────────────────────────────────────────────

function generateDockerfile(): string {
  return `# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the app
RUN npm run build:web

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
`;
}

// ─────────────────────────────────────────────
// .dockerignore
// ─────────────────────────────────────────────

function generateDockerignore(): string {
  return `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.cache
dist
dist-electron
release
*.ts
!*.d.ts
src
electron
tsconfig*.json
vite.config.ts
.DS_Store
`;
}

// ─────────────────────────────────────────────
// nginx.conf for proper static file serving
// ─────────────────────────────────────────────

function generateNginxConf(): string {
  return `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Handle all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
`;
}
