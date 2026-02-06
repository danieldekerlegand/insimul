/**
 * Texture Generator Service
 * 
 * Specialized service for generating tileable textures for 3D environments.
 * Supports world-type specific styles and PBR texture variants.
 */

import { storage } from '../db/storage.js';
import { imageGenerator, type ImageGenerationParams } from './image-generation.js';
import { nanoid } from 'nanoid';
import type { GenerationProvider, AssetType } from '@shared/schema';

export type TextureCategory = 
  | 'ground'      // Floors, terrain
  | 'wall'        // Walls, facades
  | 'material'    // Generic materials (metal, wood, stone)
  | 'ceiling'     // Ceiling textures
  | 'road'        // Roads, paths
  | 'nature';     // Grass, leaves, bark

export type WorldTextureStyle = 
  | 'medieval-fantasy'
  | 'high-fantasy'
  | 'dark-fantasy'
  | 'low-fantasy'
  | 'sci-fi-space'
  | 'cyberpunk'
  | 'historical'
  | 'generic';

export interface TextureGenerationParams {
  worldId: string;
  category: TextureCategory;
  material: string;
  worldStyle?: WorldTextureStyle;
  provider?: GenerationProvider;
  quality?: 'standard' | 'high' | 'ultra';
  size?: 512 | 1024 | 2048;
  seamless?: boolean;
  weathered?: boolean;
  damaged?: boolean;
  customPrompt?: string;
  negativePrompt?: string;
}

export interface TexturePreset {
  name: string;
  category: TextureCategory;
  material: string;
  description: string;
  tags: string[];
}

// Predefined texture presets organized by world style
const TEXTURE_PRESETS: Record<WorldTextureStyle, TexturePreset[]> = {
  'medieval-fantasy': [
    { name: 'Castle Stone Floor', category: 'ground', material: 'castle stone blocks', description: 'Large stone blocks for castle floors', tags: ['stone', 'castle', 'floor'] },
    { name: 'Cobblestone Path', category: 'road', material: 'worn cobblestone', description: 'Weathered cobblestone street', tags: ['cobblestone', 'road', 'worn'] },
    { name: 'Wooden Planks', category: 'ground', material: 'aged wooden planks', description: 'Old wooden floor boards', tags: ['wood', 'planks', 'floor'] },
    { name: 'Stone Wall', category: 'wall', material: 'rough stone wall', description: 'Medieval stone wall texture', tags: ['stone', 'wall', 'medieval'] },
    { name: 'Thatched Roof', category: 'ceiling', material: 'straw thatch', description: 'Traditional thatched roofing', tags: ['thatch', 'roof', 'straw'] },
    { name: 'Brick Wall', category: 'wall', material: 'old red brick', description: 'Aged red brick wall', tags: ['brick', 'wall', 'red'] },
  ],
  'high-fantasy': [
    { name: 'Marble Floor', category: 'ground', material: 'polished white marble', description: 'Elegant marble flooring', tags: ['marble', 'floor', 'elegant'] },
    { name: 'Crystal Surface', category: 'material', material: 'magical crystal', description: 'Glowing crystal texture', tags: ['crystal', 'magic', 'glow'] },
    { name: 'Enchanted Stone', category: 'wall', material: 'rune-carved stone', description: 'Stone with magical runes', tags: ['stone', 'runes', 'magic'] },
    { name: 'Golden Tiles', category: 'ground', material: 'gold-inlaid tiles', description: 'Ornate golden floor tiles', tags: ['gold', 'tiles', 'ornate'] },
    { name: 'Ancient Mosaic', category: 'ground', material: 'colorful mosaic tiles', description: 'Decorative mosaic pattern', tags: ['mosaic', 'tiles', 'colorful'] },
  ],
  'dark-fantasy': [
    { name: 'Corrupted Stone', category: 'ground', material: 'cracked dark stone', description: 'Dark corrupted stone floor', tags: ['stone', 'dark', 'cracked'] },
    { name: 'Rotting Wood', category: 'ground', material: 'decaying wooden planks', description: 'Rotting wood floor', tags: ['wood', 'decay', 'rot'] },
    { name: 'Blood-Stained Stone', category: 'ground', material: 'bloodstained stone floor', description: 'Stone with old blood stains', tags: ['stone', 'blood', 'dark'] },
    { name: 'Bone Surface', category: 'material', material: 'bone and skull surface', description: 'Texture made of bones', tags: ['bone', 'skull', 'grim'] },
    { name: 'Ash Ground', category: 'ground', material: 'volcanic ash and cinders', description: 'Burnt ash-covered ground', tags: ['ash', 'burnt', 'volcanic'] },
  ],
  'low-fantasy': [
    { name: 'Dirt Path', category: 'road', material: 'packed dirt road', description: 'Simple dirt path', tags: ['dirt', 'road', 'path'] },
    { name: 'Clay Tiles', category: 'ground', material: 'terracotta clay tiles', description: 'Simple clay floor tiles', tags: ['clay', 'tiles', 'terracotta'] },
    { name: 'Rough Stone', category: 'wall', material: 'rough fieldstone', description: 'Uneven stone wall', tags: ['stone', 'rough', 'fieldstone'] },
    { name: 'Mud Wall', category: 'wall', material: 'dried mud and straw', description: 'Adobe-style mud wall', tags: ['mud', 'adobe', 'straw'] },
    { name: 'Hay Floor', category: 'ground', material: 'scattered hay and straw', description: 'Barn floor with hay', tags: ['hay', 'straw', 'barn'] },
  ],
  'sci-fi-space': [
    { name: 'Metal Grating', category: 'ground', material: 'industrial metal grating', description: 'Spaceship floor grating', tags: ['metal', 'grating', 'industrial'] },
    { name: 'Hull Plating', category: 'wall', material: 'spaceship hull panels', description: 'Sci-fi wall panels', tags: ['metal', 'panels', 'hull'] },
    { name: 'Holographic Surface', category: 'material', material: 'holographic display surface', description: 'Glowing tech surface', tags: ['holographic', 'tech', 'glow'] },
    { name: 'Carbon Fiber', category: 'material', material: 'carbon fiber weave', description: 'High-tech carbon fiber', tags: ['carbon', 'fiber', 'tech'] },
    { name: 'Neon Grid', category: 'ground', material: 'glowing grid floor', description: 'Illuminated floor grid', tags: ['neon', 'grid', 'glow'] },
  ],
  'cyberpunk': [
    { name: 'Wet Concrete', category: 'ground', material: 'rain-soaked concrete', description: 'Wet urban concrete', tags: ['concrete', 'wet', 'urban'] },
    { name: 'Neon Signs', category: 'wall', material: 'neon-lit wall', description: 'Wall with neon reflections', tags: ['neon', 'wall', 'urban'] },
    { name: 'Rusty Metal', category: 'wall', material: 'corroded rusty metal', description: 'Decayed metal surface', tags: ['rust', 'metal', 'decay'] },
    { name: 'Asphalt', category: 'road', material: 'cracked asphalt', description: 'Worn city street', tags: ['asphalt', 'road', 'cracked'] },
    { name: 'Tech Panels', category: 'wall', material: 'cyberpunk tech panels', description: 'High-tech wall panels', tags: ['tech', 'panels', 'cyber'] },
  ],
  'historical': [
    { name: 'Dusty Floor', category: 'ground', material: 'dusty wooden floorboards', description: 'Old dusty floor', tags: ['wood', 'dusty', 'old'] },
    { name: 'Sandstone', category: 'wall', material: 'desert sandstone blocks', description: 'Ancient sandstone', tags: ['sandstone', 'desert', 'ancient'] },
    { name: 'Weathered Paint', category: 'wall', material: 'peeling painted wood', description: 'Old painted surface', tags: ['paint', 'peeling', 'weathered'] },
    { name: 'Leather', category: 'material', material: 'worn brown leather', description: 'Aged leather texture', tags: ['leather', 'worn', 'brown'] },
    { name: 'Canvas', category: 'material', material: 'rough canvas fabric', description: 'Canvas tent material', tags: ['canvas', 'fabric', 'rough'] },
  ],
  'generic': [
    { name: 'Stone Floor', category: 'ground', material: 'natural stone tiles', description: 'Generic stone floor', tags: ['stone', 'floor', 'tiles'] },
    { name: 'Wood Floor', category: 'ground', material: 'wooden floor planks', description: 'Simple wood floor', tags: ['wood', 'floor', 'planks'] },
    { name: 'Brick Wall', category: 'wall', material: 'standard brick wall', description: 'Common brick wall', tags: ['brick', 'wall'] },
    { name: 'Grass', category: 'nature', material: 'green grass', description: 'Natural grass texture', tags: ['grass', 'nature', 'green'] },
    { name: 'Gravel', category: 'road', material: 'loose gravel', description: 'Gravel path', tags: ['gravel', 'road', 'path'] },
  ],
};

// Style-specific prompt modifiers
const STYLE_MODIFIERS: Record<WorldTextureStyle, { positive: string; negative: string }> = {
  'medieval-fantasy': {
    positive: 'medieval fantasy style, hand-crafted look, slightly worn, fantasy game aesthetic',
    negative: 'modern, futuristic, sci-fi, plastic, neon',
  },
  'high-fantasy': {
    positive: 'epic fantasy style, magical, ornate details, rich colors, ethereal glow',
    negative: 'dark, grim, dirty, mundane, realistic',
  },
  'dark-fantasy': {
    positive: 'dark fantasy style, grim, decayed, ominous, gothic, dark souls aesthetic',
    negative: 'bright, colorful, cheerful, clean, pristine',
  },
  'low-fantasy': {
    positive: 'realistic medieval, grounded, practical, weathered, historical accuracy',
    negative: 'magical, glowing, ornate, fantastical, sci-fi',
  },
  'sci-fi-space': {
    positive: 'sci-fi space station, clean futuristic, metallic, high-tech, sleek',
    negative: 'medieval, rustic, wooden, fantasy, organic',
  },
  'cyberpunk': {
    positive: 'cyberpunk aesthetic, neon-lit, urban decay, rain-soaked, blade runner style',
    negative: 'fantasy, medieval, natural, clean, pristine',
  },
  'historical': {
    positive: 'historical accurate, period-appropriate, aged, authentic, vintage',
    negative: 'modern, fantasy, futuristic, magical, synthetic',
  },
  'generic': {
    positive: 'versatile, neutral style, game-ready',
    negative: 'extreme styles, specific era',
  },
};

/**
 * Generate a detailed texture prompt
 */
function buildTexturePrompt(params: TextureGenerationParams): { prompt: string; negativePrompt: string } {
  const parts: string[] = [];
  const negativeParts: string[] = [];

  // Base texture description
  parts.push(`Seamless tileable ${params.material} texture`);
  parts.push(`${params.category} texture`);

  // Add seamless requirements
  if (params.seamless !== false) {
    parts.push('perfectly seamless edges');
    parts.push('tileable pattern that repeats without visible seams');
  }

  // Add weathering
  if (params.weathered) {
    parts.push('weathered, aged, showing signs of use');
  }

  // Add damage
  if (params.damaged) {
    parts.push('damaged, cracked, worn');
  }

  // Add world style modifiers
  if (params.worldStyle && STYLE_MODIFIERS[params.worldStyle]) {
    const styleModifier = STYLE_MODIFIERS[params.worldStyle];
    parts.push(styleModifier.positive);
    negativeParts.push(styleModifier.negative);
  }

  // Technical specifications for good textures
  parts.push('high resolution');
  parts.push('PBR ready');
  parts.push('detailed surface');
  parts.push('consistent lighting (flat, even illumination)');
  parts.push('viewed from directly above for floor textures');
  parts.push('professional game texture');

  // Standard negative prompts for textures
  negativeParts.push('blurry');
  negativeParts.push('low quality');
  negativeParts.push('visible seams');
  negativeParts.push('uneven lighting');
  negativeParts.push('shadows');
  negativeParts.push('perspective distortion');
  negativeParts.push('objects on surface');
  negativeParts.push('text');
  negativeParts.push('watermark');

  // Add custom prompt if provided
  if (params.customPrompt) {
    parts.push(params.customPrompt);
  }

  // Add custom negative prompt
  if (params.negativePrompt) {
    negativeParts.push(params.negativePrompt);
  }

  return {
    prompt: parts.join(', '),
    negativePrompt: negativeParts.join(', '),
  };
}

/**
 * Texture Generator Service
 */
export class TextureGeneratorService {
  /**
   * Get available texture presets for a world style
   */
  getTexturePresets(worldStyle: WorldTextureStyle = 'generic'): TexturePreset[] {
    return TEXTURE_PRESETS[worldStyle] || TEXTURE_PRESETS['generic'];
  }

  /**
   * Get all available world styles
   */
  getWorldStyles(): WorldTextureStyle[] {
    return Object.keys(TEXTURE_PRESETS) as WorldTextureStyle[];
  }

  /**
   * Generate a texture
   */
  async generateTexture(params: TextureGenerationParams): Promise<string> {
    const provider = params.provider || 'flux';
    const size = params.size || 1024;
    const quality = params.quality || 'high';

    // Build the prompt
    const { prompt, negativePrompt } = buildTexturePrompt(params);

    console.log(`[TextureGenerator] Generating ${params.category} texture: ${params.material}`);
    console.log(`[TextureGenerator] Prompt: ${prompt}`);

    // Create generation job
    const job = await storage.createGenerationJob({
      worldId: params.worldId,
      jobType: 'single_asset',
      assetType: `texture_${params.category}` as AssetType,
      prompt,
      generationProvider: provider,
      generationParams: {
        size,
        quality,
        worldStyle: params.worldStyle,
        seamless: params.seamless,
        weathered: params.weathered,
        damaged: params.damaged,
      },
      batchSize: 1,
      status: 'processing',
    });

    try {
      // Generate the texture image
      const result = await imageGenerator.generateImage(provider, {
        prompt,
        negativePrompt,
        width: size,
        height: size,
        quality,
      });

      if (!result.success || !result.images || result.images.length === 0) {
        await storage.updateGenerationJob(job.id, {
          status: 'failed',
          errorMessage: result.error || 'Texture generation failed',
          completedAt: new Date(),
        });
        throw new Error(result.error || 'Texture generation failed');
      }

      // Save the texture
      const image = result.images[0];
      const materialSlug = params.material.replace(/\s+/g, '_').toLowerCase().substring(0, 30);
      const fileName = `texture-${params.category}-${materialSlug}-${nanoid(8)}.png`;
      const relativePath = await imageGenerator.saveImage(image, fileName, 'client/public/assets/generated/textures');

      // Create visual asset record
      const asset = await storage.createVisualAsset({
        worldId: params.worldId,
        name: `${params.material} ${params.category} Texture`,
        description: `AI-generated ${params.category} texture: ${params.material}`,
        assetType: `texture_${params.category}` as AssetType,
        filePath: relativePath,
        fileName,
        fileSize: image.data.length,
        mimeType: image.mimeType,
        width: size,
        height: size,
        generationProvider: provider,
        generationPrompt: prompt,
        generationParams: {
          size,
          quality,
          worldStyle: params.worldStyle,
          seamless: params.seamless,
          weathered: params.weathered,
          damaged: params.damaged,
          negativePrompt,
        },
        purpose: 'procedural',
        usageContext: '3d_game',
        tags: [
          'texture',
          params.category,
          params.worldStyle || 'generic',
          'ai-generated',
          params.seamless !== false ? 'seamless' : '',
          params.weathered ? 'weathered' : '',
          params.damaged ? 'damaged' : '',
        ].filter(Boolean) as string[],
        status: 'completed',
        metadata: {
          textureCategory: params.category,
          material: params.material,
          worldStyle: params.worldStyle,
        },
      });

      // Update job as completed
      await storage.updateGenerationJob(job.id, {
        status: 'completed',
        progress: 1.0,
        completedCount: 1,
        generatedAssetIds: [asset.id],
        completedAt: new Date(),
      });

      console.log(`[TextureGenerator] Created texture asset: ${asset.id}`);
      return asset.id;
    } catch (error: any) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Generate a batch of textures from presets
   */
  async generateTextureSet(
    worldId: string,
    worldStyle: WorldTextureStyle,
    provider: GenerationProvider = 'flux',
    presetNames?: string[]
  ): Promise<string[]> {
    const presets = this.getTexturePresets(worldStyle);
    const selectedPresets = presetNames
      ? presets.filter(p => presetNames.includes(p.name))
      : presets;

    const assetIds: string[] = [];

    for (const preset of selectedPresets) {
      try {
        const assetId = await this.generateTexture({
          worldId,
          category: preset.category,
          material: preset.material,
          worldStyle,
          provider,
          quality: 'high',
          seamless: true,
        });
        assetIds.push(assetId);
      } catch (error) {
        console.error(`[TextureGenerator] Failed to generate preset "${preset.name}":`, error);
      }
    }

    return assetIds;
  }
}

// Export singleton
export const textureGenerator = new TextureGeneratorService();
