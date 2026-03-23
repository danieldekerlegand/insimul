/**
 * Asset Marketplace Catalog
 *
 * Registry of external 3D asset marketplaces that can be used to populate
 * asset collections. Each entry documents API availability, pricing model,
 * integration status, and the types of assets available.
 */

export type PricingModel = 'free' | 'freemium' | 'paid';
export type IntegrationStatus = 'integrated' | 'planned' | 'manual';

export interface AssetMarketplace {
  /** Unique slug identifier */
  id: string;
  /** Display name */
  name: string;
  /** Homepage URL */
  url: string;
  /** Short description of the marketplace */
  description: string;
  /** Whether a public REST/GraphQL API exists for programmatic access */
  hasPublicAPI: boolean;
  /** URL to API documentation, if available */
  apiDocsUrl?: string;
  /** Current integration status within Insimul */
  integrationStatus: IntegrationStatus;
  /** Pricing model */
  pricing: PricingModel;
  /** Types of assets available */
  assetTypes: string[];
  /** Art style tendency (for user guidance) */
  styleNotes: string;
  /** Whether authentication / API key is required for downloads */
  requiresAuth: boolean;
  /** Supported download formats relevant to Babylon.js */
  downloadFormats: string[];
  /** License types commonly found */
  licenses: string[];
}

export const ASSET_MARKETPLACES: AssetMarketplace[] = [
  {
    id: 'polyhaven',
    name: 'Poly Haven',
    url: 'https://polyhaven.com',
    description:
      'Curated library of high-quality, realistic 3D models, HDRIs, and textures. All assets are CC0 (public domain) with no restrictions.',
    hasPublicAPI: true,
    apiDocsUrl: 'https://github.com/Poly-Haven/Public-API',
    integrationStatus: 'integrated',
    pricing: 'free',
    assetTypes: ['models', 'textures', 'hdris'],
    styleNotes:
      'Photorealistic / physically-based. Excellent for realistic and semi-realistic worlds.',
    requiresAuth: false,
    downloadFormats: ['gltf', 'glb'],
    licenses: ['CC0'],
  },
  {
    id: 'sketchfab',
    name: 'Sketchfab',
    url: 'https://sketchfab.com',
    description:
      'Massive marketplace with over 1 million free models under Creative Commons licenses, plus premium paid models. Inline 3D preview. Wide range of art styles from cartoon to photorealistic.',
    hasPublicAPI: true,
    apiDocsUrl: 'https://sketchfab.com/developers/data-api/v3',
    integrationStatus: 'integrated',
    pricing: 'freemium',
    assetTypes: ['models'],
    styleNotes:
      'Extremely varied — from low-poly stylized to photorealistic scans. Filter by "downloadable" for free CC-licensed models.',
    requiresAuth: true,
    downloadFormats: ['gltf', 'glb', 'usdz'],
    licenses: ['CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'CC-BY-NC-SA', 'CC0'],
  },
  {
    id: 'opengameart',
    name: 'OpenGameArt',
    url: 'https://opengameart.org',
    description:
      'Community-driven repository of free game assets. Strong selection of realistic and semi-realistic 3D models, textures, and sprites.',
    hasPublicAPI: false,
    integrationStatus: 'manual',
    pricing: 'free',
    assetTypes: ['models', 'textures', 'sprites', 'audio'],
    styleNotes:
      'Mixed quality and style. Many realistic models available. Good for specific niche assets.',
    requiresAuth: false,
    downloadFormats: ['obj', 'fbx', 'blend', 'gltf'],
    licenses: ['CC0', 'CC-BY', 'CC-BY-SA', 'GPL', 'OGA-BY'],
  },
  {
    id: 'kenney',
    name: 'Kenney',
    url: 'https://kenney.nl/assets',
    description:
      'Large collection of free CC0 game assets. Known for consistent, clean art style across packs. Great for rapid prototyping.',
    hasPublicAPI: false,
    integrationStatus: 'manual',
    pricing: 'free',
    assetTypes: ['models', 'textures', 'sprites', 'audio', 'ui'],
    styleNotes:
      'Cartoonish / low-poly / mobile-friendly. Consistent style across packs. Best for casual or stylized games.',
    requiresAuth: false,
    downloadFormats: ['gltf', 'glb', 'obj', 'fbx'],
    licenses: ['CC0'],
  },
  {
    id: 'quaternius',
    name: 'Quaternius',
    url: 'https://quaternius.com/packs.html',
    description:
      'Free low-poly 3D asset packs including medieval, nature, town, and character collections. More refined than Kenney with better shading.',
    hasPublicAPI: false,
    integrationStatus: 'manual',
    pricing: 'free',
    assetTypes: ['models'],
    styleNotes:
      'Low-poly but more sophisticated than Kenney. Good middle ground between cartoonish and realistic. Packs have consistent internal style.',
    requiresAuth: false,
    downloadFormats: ['fbx', 'obj', 'gltf'],
    licenses: ['CC0'],
  },
  {
    id: 'cgtrader',
    name: 'CGTrader',
    url: 'https://www.cgtrader.com',
    description:
      'Professional 3D model marketplace with both free and paid assets. Strong architectural and furniture categories.',
    hasPublicAPI: true,
    apiDocsUrl: 'https://www.cgtrader.com/developers',
    integrationStatus: 'manual',
    pricing: 'freemium',
    assetTypes: ['models', 'textures'],
    styleNotes:
      'Professional quality. Ranges from game-ready low-poly to high-poly visualization models. Filter by "free" for CC-licensed content.',
    requiresAuth: true,
    downloadFormats: ['gltf', 'glb', 'fbx', 'obj', 'blend'],
    licenses: ['Royalty Free', 'Editorial', 'CC-BY'],
  },
  {
    id: 'turbosquid',
    name: 'TurboSquid',
    url: 'https://www.turbosquid.com',
    description:
      'One of the oldest 3D model marketplaces. Large catalog of professional models with a free section. Now part of Shutterstock.',
    hasPublicAPI: false,
    integrationStatus: 'manual',
    pricing: 'freemium',
    assetTypes: ['models', 'textures'],
    styleNotes:
      'Professional / photorealistic. Many high-quality architectural and prop models. Free section has limited but usable content.',
    requiresAuth: true,
    downloadFormats: ['fbx', 'obj', 'max', 'blend'],
    licenses: ['Royalty Free', 'TurboSquid 3D Model License'],
  },
  {
    id: 'itchio',
    name: 'itch.io',
    url: 'https://itch.io/game-assets/tag-3d',
    description:
      'Indie game asset marketplace. Many affordable or free asset packs from independent creators. Great for finding unique themed sets.',
    hasPublicAPI: true,
    apiDocsUrl: 'https://itch.io/docs/api/overview',
    integrationStatus: 'manual',
    pricing: 'freemium',
    assetTypes: ['models', 'textures', 'sprites', 'audio', 'fonts'],
    styleNotes:
      'Mostly low-poly / stylized. Strong indie aesthetic. Good for finding complete themed packs with consistent art direction.',
    requiresAuth: true,
    downloadFormats: ['gltf', 'glb', 'fbx', 'obj'],
    licenses: ['Varies by creator', 'CC0', 'CC-BY'],
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

/** Return only marketplaces with automated import integration */
export function getIntegratedMarketplaces(): AssetMarketplace[] {
  return ASSET_MARKETPLACES.filter((m) => m.integrationStatus === 'integrated');
}

/** Return marketplaces that have a public API suitable for future integration */
export function getAPICapableMarketplaces(): AssetMarketplace[] {
  return ASSET_MARKETPLACES.filter((m) => m.hasPublicAPI);
}

/** Return only free marketplaces */
export function getFreeMarketplaces(): AssetMarketplace[] {
  return ASSET_MARKETPLACES.filter((m) => m.pricing === 'free');
}

/** Look up a marketplace by id */
export function getMarketplaceById(id: string): AssetMarketplace | undefined {
  return ASSET_MARKETPLACES.find((m) => m.id === id);
}
