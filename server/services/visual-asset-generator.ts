/**
 * Visual Asset Generator Service
 *
 * High-level service for generating visual assets for game entities
 * (characters, buildings, maps, textures, etc.)
 */

import { storage } from '../db/storage.js';
import { imageGenerator, type ImageGenerationParams } from './image-generation.js';
import { nanoid } from 'nanoid';
import { applyStylePreset, getStylePreset } from '@shared/style-presets';
import type {
  GenerationProvider,
  AssetType,
  Character,
  Business,
  Settlement,
  Country,
  InsertVisualAsset,
  InsertGenerationJob,
} from '@shared/schema';

/**
 * Generate a detailed prompt for a character portrait
 */
export function generateCharacterPrompt(character: Character, worldContext?: string): string {
  const parts: string[] = [];

  // Basic description
  parts.push(`A ${character.gender} person`);

  // Add personality-based appearance hints
  const personality = character.personality as any;
  if (personality) {
    if (personality.extroversion > 0.5) {
      parts.push('with a warm, inviting expression');
    } else if (personality.extroversion < -0.5) {
      parts.push('with a reserved, contemplative demeanor');
    }

    if (personality.conscientiousness > 0.5) {
      parts.push('well-groomed, professional appearance');
    }

    if (personality.openness > 0.5) {
      parts.push('with creative, artistic styling');
    }
  }

  // Add occupation-based details
  if (character.occupation) {
    parts.push(`working as a ${character.occupation}`);
  }

  // Add physical traits if available
  const physicalTraits = character.physicalTraits as any;
  if (physicalTraits) {
    if (physicalTraits.hairColor) parts.push(`${physicalTraits.hairColor} hair`);
    if (physicalTraits.eyeColor) parts.push(`${physicalTraits.eyeColor} eyes`);
    if (physicalTraits.height) {
      const heightDesc = physicalTraits.height > 180 ? 'tall' : physicalTraits.height < 160 ? 'short' : 'average height';
      parts.push(heightDesc);
    }
  }

  // Add world context for styling
  if (worldContext) {
    parts.push(`in a ${worldContext} setting`);
  }

  // Technical specs for good portrait
  parts.push('portrait photography, professional lighting, detailed face, high quality');

  return parts.join(', ');
}

/**
 * Generate a detailed prompt for a building
 */
export function generateBuildingPrompt(business: Business, settlement?: Settlement): string {
  const parts: string[] = [];

  // Building type
  const businessType = business.businessType.toLowerCase().replace(/([A-Z])/g, ' $1').trim();
  parts.push(`A ${businessType} building`);

  // Architecture style based on settlement or era
  if (settlement) {
    const foundedYear = settlement.foundedYear || 1900;
    if (foundedYear < 1800) {
      parts.push('medieval architecture');
    } else if (foundedYear < 1900) {
      parts.push('Victorian-era architecture');
    } else if (foundedYear < 1950) {
      parts.push('early 20th century architecture');
    } else {
      parts.push('modern architecture');
    }

    // Terrain influences
    if (settlement.terrain) {
      parts.push(`built in ${settlement.terrain} terrain`);
    }
  }

  // Add business name if it's evocative
  if (business.name) {
    parts.push(`named "${business.name}"`);
  }

  // Technical specs
  parts.push('exterior view, architectural photography, detailed, high quality');

  return parts.join(', ');
}

/**
 * Generate a detailed prompt for a settlement map
 */
export function generateMapPrompt(
  settlement: Settlement,
  mapType: 'terrain' | 'political' | 'region' = 'terrain'
): string {
  const parts: string[] = [];

  if (mapType === 'terrain') {
    parts.push('Fantasy map illustration');
    if (settlement.terrain) {
      parts.push(`showing ${settlement.terrain} terrain`);
    }
    parts.push('with geographical features, rivers, forests, mountains');
  } else if (mapType === 'political') {
    parts.push('Political map');
    parts.push('showing districts, boundaries, major landmarks');
  } else {
    parts.push('Regional overview map');
  }

  parts.push(`of ${settlement.name}`);
  parts.push('cartography style, aged parchment, detailed, hand-drawn aesthetic');

  return parts.join(', ');
}

/**
 * Generate a detailed prompt for a world overview map
 */
export function generateWorldMapPrompt(
  worldName: string,
  worldDescription: string | null,
  worldType: string | null,
  countries: Country[],
  settlements: Settlement[],
  mapStyle: 'fantasy' | 'realistic' | 'stylized' = 'fantasy'
): string {
  const parts: string[] = [];

  // Map style
  if (mapStyle === 'fantasy') {
    parts.push('Fantasy world map illustration');
    parts.push('medieval cartography style');
    parts.push('aged parchment background');
  } else if (mapStyle === 'realistic') {
    parts.push('Detailed geographic world map');
    parts.push('satellite view style');
  } else {
    parts.push('Stylized world map illustration');
    parts.push('artistic cartography');
  }

  // World name and description
  parts.push(`of the world of ${worldName}`);
  if (worldDescription) {
    const shortDesc = worldDescription.substring(0, 100);
    parts.push(shortDesc);
  }

  // World type influence
  if (worldType) {
    if (worldType.includes('fantasy')) {
      parts.push('with mythical creatures, castles, ancient forests');
    } else if (worldType.includes('sci-fi') || worldType.includes('cyberpunk')) {
      parts.push('with futuristic cities, tech hubs, neon lights');
    } else if (worldType.includes('historical')) {
      parts.push('historically accurate style, period-appropriate details');
    }
  }

  // Countries and major locations
  if (countries.length > 0) {
    const countryNames = countries.slice(0, 5).map(c => c.name).join(', ');
    parts.push(`showing nations: ${countryNames}`);
  }

  // Settlement distribution hints
  const cityCount = settlements.filter(s => s.settlementType === 'city').length;
  const townCount = settlements.filter(s => s.settlementType === 'town').length;
  if (cityCount > 0 || townCount > 0) {
    parts.push(`with ${cityCount} major cities and ${townCount} towns marked`);
  }

  // Technical quality
  parts.push('high detail');
  parts.push('compass rose');
  parts.push('decorative border');
  parts.push('legend symbols');
  parts.push('hand-drawn aesthetic');

  return parts.join(', ');
}

/**
 * Generate a prompt for procedural textures
 */
export function generateTexturePrompt(
  textureType: 'ground' | 'wall' | 'material',
  material: string,
  style?: string
): string {
  const parts: string[] = [];

  parts.push(`Seamless tileable ${material} ${textureType} texture`);

  if (style) {
    parts.push(`${style} style`);
  }

  parts.push('high resolution, PBR ready, detailed, repeating pattern');
  parts.push('viewed from directly above, flat lighting for texture mapping');

  return parts.join(', ');
}

/**
 * Generate a detailed prompt for a character texture/skin for 3D models
 */
export function generateCharacterTexturePrompt(
  character: Character,
  textureType: 'face' | 'body' | 'clothing' | 'full',
  artStyle: 'realistic' | 'stylized' | 'anime' | 'painterly' = 'stylized',
  worldContext?: string
): string {
  const parts: string[] = [];

  // Texture type specifics
  switch (textureType) {
    case 'face':
      parts.push('Character face texture map');
      parts.push('front-facing portrait for UV mapping');
      parts.push('neutral expression');
      parts.push('even lighting, no shadows');
      break;
    case 'body':
      parts.push('Character body skin texture');
      parts.push('full body texture unwrap');
      parts.push('seamless skin texture');
      break;
    case 'clothing':
      parts.push('Character clothing texture');
      parts.push('fabric detail, seamless pattern');
      break;
    case 'full':
      parts.push('Complete character texture atlas');
      parts.push('face and body combined');
      parts.push('UV-ready texture map');
      break;
  }

  // Character traits
  const physicalTraits = character.physicalTraits as any;
  if (physicalTraits) {
    if (physicalTraits.skinTone) parts.push(`${physicalTraits.skinTone} skin tone`);
    if (physicalTraits.hairColor && textureType === 'face') parts.push(`${physicalTraits.hairColor} hair visible`);
    if (physicalTraits.eyeColor && textureType === 'face') parts.push(`${physicalTraits.eyeColor} eyes`);
    if (physicalTraits.age) {
      const ageDesc = physicalTraits.age < 25 ? 'youthful' : physicalTraits.age > 55 ? 'mature, weathered' : 'adult';
      parts.push(`${ageDesc} appearance`);
    }
  }

  // Gender
  parts.push(`${character.gender} character`);

  // Occupation-based clothing hints
  if (character.occupation && (textureType === 'clothing' || textureType === 'full')) {
    parts.push(`${character.occupation} attire details`);
  }

  // Art style
  switch (artStyle) {
    case 'realistic':
      parts.push('photorealistic skin texture');
      parts.push('high detail pores and subtle imperfections');
      break;
    case 'stylized':
      parts.push('stylized game character texture');
      parts.push('clean, readable at distance');
      break;
    case 'anime':
      parts.push('anime/cel-shaded style');
      parts.push('smooth gradients, bold colors');
      break;
    case 'painterly':
      parts.push('hand-painted texture style');
      parts.push('artistic brush strokes, soft details');
      break;
  }

  // World context for theme
  if (worldContext) {
    parts.push(`${worldContext} aesthetic`);
  }

  // Technical requirements for texture mapping
  parts.push('flat lighting for texture use');
  parts.push('no perspective distortion');
  parts.push('high resolution, game-ready');
  parts.push('PBR-compatible base color');

  return parts.join(', ');
}

/**
 * Generate a detailed prompt for a character sprite sheet
 */
export function generateSpritePrompt(
  character: Character,
  animationType: 'idle' | 'walk' | 'run' | 'jump' | 'attack',
  viewAngle: 'side' | 'front' | 'back' | 'top-down' | 'isometric',
  frameCount: number,
  worldContext?: string
): string {
  const parts: string[] = [];

  // Animation description
  const animationDescriptions: Record<string, string> = {
    idle: 'standing idle, subtle breathing motion',
    walk: 'walking animation, natural gait cycle',
    run: 'running animation, dynamic movement',
    jump: 'jumping sequence, from ground to apex to landing',
    attack: 'attack animation, combat motion',
  };

  // View angle description
  const viewDescriptions: Record<string, string> = {
    side: 'side view, profile perspective',
    front: 'front-facing view',
    back: 'back view',
    'top-down': 'top-down view, overhead perspective',
    isometric: 'isometric 3/4 view',
  };

  // Character description
  parts.push(`${character.gender} character sprite`);

  // Add personality-based appearance
  const personality = character.personality as any;
  if (personality) {
    if (personality.extroversion > 0.5) {
      parts.push('confident posture');
    } else if (personality.extroversion < -0.5) {
      parts.push('reserved stance');
    }
  }

  // Add occupation-based details
  if (character.occupation) {
    parts.push(`${character.occupation} attire`);
  }

  // Physical traits
  const physicalTraits = character.physicalTraits as any;
  if (physicalTraits) {
    if (physicalTraits.hairColor) parts.push(`${physicalTraits.hairColor} hair`);
  }

  // Animation and view
  parts.push(animationDescriptions[animationType]);
  parts.push(viewDescriptions[viewAngle]);

  // Sprite sheet specifics
  parts.push(`sprite sheet with ${frameCount} frames`);
  parts.push('evenly spaced frames in a horizontal row');
  parts.push('consistent character size across all frames');
  parts.push('transparent background');
  parts.push('pixel art style OR clean 2D game art style');

  // World context
  if (worldContext) {
    parts.push(`${worldContext} setting`);
  }

  // Technical specs
  parts.push('game sprite, character animation, sprite sheet format');
  parts.push('clear silhouette, readable at small size');
  parts.push('professional game asset quality');

  return parts.join(', ');
}

/**
 * Generate a detailed prompt for an artifact image
 */
export function generateArtifactPrompt(
  artifactType: string,
  artifactName: string,
  artifactDescription: string,
  worldContext?: string
): string {
  const parts: string[] = [];

  // Type-specific prompt elements
  switch (artifactType) {
    case 'photograph':
      parts.push('Vintage photograph');
      parts.push('sepia toned or black and white');
      parts.push('showing people and places from the past');
      parts.push('aged paper, slightly faded');
      break;

    case 'gravestone':
      parts.push('Weathered stone gravestone');
      parts.push('with carved inscription');
      parts.push('cemetery setting, moss and age visible');
      parts.push('solemn, memorial aesthetic');
      break;

    case 'wedding_ring':
      parts.push('Elegant wedding ring');
      parts.push('precious metal with fine detail');
      parts.push('symbolic of eternal love');
      parts.push('jewelry photography, detailed macro shot');
      break;

    case 'letter':
      parts.push('Handwritten letter on aged paper');
      parts.push('elegant cursive script');
      parts.push('personal correspondence');
      parts.push('vintage stationery, folded parchment');
      break;

    case 'heirloom':
      parts.push('Precious family heirloom');
      parts.push('antique object with sentimental value');
      parts.push('ornate details, signs of age and care');
      parts.push('treasured keepsake');
      break;

    case 'diary':
      parts.push('Leather-bound diary or journal');
      parts.push('worn pages filled with handwritten entries');
      parts.push('personal memoir, intimate writings');
      parts.push('vintage book aesthetic');
      break;

    case 'document':
      parts.push('Official document or certificate');
      parts.push('formal paper with stamps and seals');
      parts.push('legal or historical record');
      parts.push('aged parchment, official aesthetic');
      break;

    case 'painting':
      parts.push('Classical painting');
      parts.push('oil on canvas, ornate frame');
      parts.push('artistic portrait or landscape');
      parts.push('museum quality, fine art aesthetic');
      break;

    case 'book':
      parts.push('Antique bound book');
      parts.push('leather cover with gold lettering');
      parts.push('weathered pages, treasured tome');
      parts.push('library aesthetic, classic literature');
      break;

    default:
      parts.push('Artifact or historical object');
      break;
  }

  // Add artifact-specific details from description
  if (artifactDescription && artifactDescription.length > 0) {
    // Extract key descriptive elements (first 100 chars)
    const descSnippet = artifactDescription.substring(0, 100);
    parts.push(descSnippet);
  }

  // Add world context for styling
  if (worldContext) {
    parts.push(`in a ${worldContext} setting`);
  }

  // Technical specs for good images
  parts.push('detailed, high quality, photorealistic rendering');

  return parts.join(', ');
}

/**
 * Asset Generation Service
 */
export class VisualAssetGeneratorService {
  /**
   * Generate a character portrait
   */
  async generateCharacterPortrait(
    characterId: string,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    const variants = await this.generateCharacterPortraitVariants(characterId, provider, 1, params);
    return variants[0];
  }

  /**
   * Generate multiple variants of a character portrait
   */
  async generateCharacterPortraitVariants(
    characterId: string,
    provider: GenerationProvider,
    variantCount: number = 1,
    params?: Partial<ImageGenerationParams>
  ): Promise<string[]> {
    // Get character data
    const character = await storage.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    // Get world context
    let worldContext = 'fantasy';
    if (character.worldId) {
      const world = await storage.getWorld(character.worldId);
      if (world?.description) {
        worldContext = world.description;
      }
    }

    // Generate base prompt
    let basePrompt = generateCharacterPrompt(character, worldContext);
    let finalPrompt = basePrompt;
    let negativePrompt = params?.negativePrompt || '';

    // Apply style preset if provided
    if (params?.stylePresetId) {
      const stylePreset = getStylePreset(params.stylePresetId as string);
      if (stylePreset) {
        const { enhancedPrompt, negativePrompt: styleNegative } = applyStylePreset(basePrompt, params.stylePresetId as string);
        finalPrompt = enhancedPrompt;
        // Merge negative prompts if style preset provides them
        if (styleNegative) {
          negativePrompt = negativePrompt ? `${negativePrompt}, ${styleNegative}` : styleNegative;
        }
      }
    }

    // Create generation job
    const job = await storage.createGenerationJob({
      worldId: character.worldId,
      jobType: variantCount > 1 ? 'variant_generation' : 'single_asset',
      assetType: 'character_portrait',
      targetEntityId: characterId,
      targetEntityType: 'character',
      prompt: finalPrompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: variantCount,
      status: 'processing',
    });

    const assetIds: string[] = [];

    // Generate variants
    for (let i = 0; i < variantCount; i++) {
      try {
        // Generate image
        const result = await imageGenerator.generateImage(provider, {
          prompt: finalPrompt,
          negativePrompt: negativePrompt || undefined,
          width: 512,
          height: 512,
          quality: 'high',
          ...params,
        });

        if (!result.success || !result.images || result.images.length === 0) {
          console.error(`Failed to generate variant ${i + 1}:`, result.error);
          continue;
        }

        // Save image to disk
        const image = result.images[0];
        const fileName = `character-${characterId}-variant${i + 1}-${nanoid(10)}.png`;
        const relativePath = await imageGenerator.saveImage(image, fileName);

        // Create visual asset record
        const asset = await storage.createVisualAsset({
          worldId: character.worldId,
          name: `${character.firstName} ${character.lastName} Portrait${variantCount > 1 ? ` (Variant ${i + 1})` : ''}`,
          description: `Portrait of ${character.firstName} ${character.lastName}`,
          assetType: 'character_portrait',
          characterId: character.id,
          filePath: relativePath,
          fileName,
          fileSize: image.data.length,
          mimeType: image.mimeType,
          width: image.width,
          height: image.height,
          generationProvider: provider,
          generationPrompt: finalPrompt,
          generationParams: params || {},
          purpose: 'authorial',
          usageContext: '2d_ui',
          tags: ['character', 'portrait', character.occupation || 'civilian', variantCount > 1 ? 'variant' : ''].filter(Boolean) as string[],
          status: 'completed',
          metadata: {
            variantIndex: i + 1,
            variantCount,
            jobId: job.id,
            ...(params?.stylePresetId ? { stylePresetId: params.stylePresetId } : {}),
          },
        });

        assetIds.push(asset.id);

        // Update progress
        await storage.updateGenerationJob(job.id, {
          progress: (i + 1) / variantCount,
          completedCount: i + 1,
        });
      } catch (error) {
        console.error(`Failed to generate variant ${i + 1}:`, error);
      }
    }

    if (assetIds.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: 'All variant generations failed',
        completedAt: new Date(),
      });
      throw new Error('Failed to generate any variants');
    }

    // Update job as completed
    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: assetIds.length,
      generatedAssetIds: assetIds,
      completedAt: new Date(),
    });

    return assetIds;
  }

  /**
   * Generate a building exterior image
   */
  async generateBuildingExterior(
    businessId: string,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    const business = await storage.getBusiness(businessId);
    if (!business) {
      throw new Error(`Business ${businessId} not found`);
    }

    // Get settlement context
    let settlement;
    if (business.settlementId) {
      settlement = await storage.getSettlement(business.settlementId);
    }

    // Generate base prompt
    let basePrompt = generateBuildingPrompt(business, settlement);
    let finalPrompt = basePrompt;
    let negativePrompt = params?.negativePrompt || '';

    // Apply style preset if provided
    if (params?.stylePresetId) {
      const stylePreset = getStylePreset(params.stylePresetId as string);
      if (stylePreset) {
        const { enhancedPrompt, negativePrompt: styleNegative } = applyStylePreset(basePrompt, params.stylePresetId as string);
        finalPrompt = enhancedPrompt;
        if (styleNegative) {
          negativePrompt = negativePrompt ? `${negativePrompt}, ${styleNegative}` : styleNegative;
        }
      }
    }

    // Create generation job
    const job = await storage.createGenerationJob({
      worldId: business.worldId,
      jobType: 'single_asset',
      assetType: 'building_exterior',
      targetEntityId: businessId,
      targetEntityType: 'business',
      prompt: finalPrompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: 1,
      status: 'processing',
    });

    const result = await imageGenerator.generateImage(provider, {
      prompt: finalPrompt,
      negativePrompt: negativePrompt || undefined,
      width: 768,
      height: 512,
      quality: 'high',
      ...params,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: result.error || 'Unknown error',
        completedAt: new Date(),
      });
      throw new Error(result.error || 'Image generation failed');
    }

    const image = result.images[0];
    const fileName = `building-${businessId}-${nanoid(10)}.png`;
    const relativePath = await imageGenerator.saveImage(image, fileName);

    const asset = await storage.createVisualAsset({
      worldId: business.worldId,
      name: `${business.name} Exterior`,
      description: `Exterior view of ${business.name}`,
      assetType: 'building_exterior',
      businessId: business.id,
      filePath: relativePath,
      fileName,
      fileSize: image.data.length,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      generationProvider: provider,
      generationPrompt: finalPrompt,
      generationParams: params || {},
      purpose: 'authorial',
      usageContext: '2d_ui',
      tags: ['building', business.businessType, 'exterior'],
      status: 'completed',
      metadata: params?.stylePresetId ? { stylePresetId: params.stylePresetId } : undefined,
    });

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: 1,
      generatedAssetIds: [asset.id],
      completedAt: new Date(),
    });

    return asset.id;
  }

  /**
   * Generate a settlement map
   */
  async generateSettlementMap(
    settlementId: string,
    mapType: 'terrain' | 'political' | 'region',
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    const settlement = await storage.getSettlement(settlementId);
    if (!settlement) {
      throw new Error(`Settlement ${settlementId} not found`);
    }

    const prompt = generateMapPrompt(settlement, mapType);

    const job = await storage.createGenerationJob({
      worldId: settlement.worldId,
      jobType: 'single_asset',
      assetType: `map_${mapType}` as AssetType,
      targetEntityId: settlementId,
      targetEntityType: 'settlement',
      prompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: 1,
      status: 'processing',
    });

    const result = await imageGenerator.generateImage(provider, {
      prompt,
      width: 1024,
      height: 768,
      quality: 'high',
      ...params,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: result.error || 'Unknown error',
        completedAt: new Date(),
      });
      throw new Error(result.error || 'Image generation failed');
    }

    const image = result.images[0];
    const fileName = `map-${settlementId}-${mapType}-${nanoid(10)}.png`;
    const relativePath = await imageGenerator.saveImage(image, fileName);

    const asset = await storage.createVisualAsset({
      worldId: settlement.worldId,
      name: `${settlement.name} ${mapType} Map`,
      description: `${mapType} map of ${settlement.name}`,
      assetType: `map_${mapType}` as AssetType,
      settlementId: settlement.id,
      filePath: relativePath,
      fileName,
      fileSize: image.data.length,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      generationProvider: provider,
      generationPrompt: prompt,
      generationParams: params || {},
      purpose: 'authorial',
      usageContext: 'map_display',
      tags: ['map', mapType, settlement.settlementType],
      status: 'completed',
    });

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: 1,
      generatedAssetIds: [asset.id],
      completedAt: new Date(),
    });

    return asset.id;
  }

  /**
   * Generate a world overview map
   */
  async generateWorldMap(
    worldId: string,
    mapStyle: 'fantasy' | 'realistic' | 'stylized' = 'fantasy',
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    const world = await storage.getWorld(worldId);
    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    // Gather world data for the prompt
    const countries = await storage.getCountriesByWorld(worldId);
    const settlements = await storage.getSettlementsByWorld(worldId);

    const prompt = generateWorldMapPrompt(
      world.name,
      world.description,
      (world as any).worldType || null,
      countries,
      settlements,
      mapStyle
    );

    const job = await storage.createGenerationJob({
      worldId,
      jobType: 'single_asset',
      assetType: 'map_world' as AssetType,
      targetEntityId: worldId,
      targetEntityType: 'world',
      prompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: 1,
      status: 'processing',
    });

    const result = await imageGenerator.generateImage(provider, {
      prompt,
      width: 1536,
      height: 1024,
      quality: 'high',
      ...params,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: result.error || 'Unknown error',
        completedAt: new Date(),
      });
      throw new Error(result.error || 'World map generation failed');
    }

    const image = result.images[0];
    const fileName = `world-map-${worldId}-${mapStyle}-${nanoid(10)}.png`;
    const relativePath = await imageGenerator.saveImage(image, fileName);

    const asset = await storage.createVisualAsset({
      worldId,
      name: `${world.name} World Map`,
      description: `${mapStyle} style overview map of ${world.name}`,
      assetType: 'map_world' as AssetType,
      filePath: relativePath,
      fileName,
      fileSize: image.data.length,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      generationProvider: provider,
      generationPrompt: prompt,
      generationParams: params || {},
      purpose: 'authorial',
      usageContext: 'map_display',
      tags: ['map', 'world', mapStyle, (world as any).worldType || 'generic'],
      status: 'completed',
    });

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: 1,
      generatedAssetIds: [asset.id],
      completedAt: new Date(),
    });

    console.log(`[VisualAssetGenerator] Generated world map for ${world.name}: ${asset.id}`);
    return asset.id;
  }

  /**
   * Generate procedural textures for 3D environments
   */
  async generateTexture(
    worldId: string,
    textureType: 'ground' | 'wall' | 'material',
    material: string,
    provider: GenerationProvider,
    style?: string,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    const prompt = generateTexturePrompt(textureType, material, style);

    const job = await storage.createGenerationJob({
      worldId,
      jobType: 'single_asset',
      assetType: `texture_${textureType}` as AssetType,
      prompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: 1,
      status: 'processing',
    });

    const result = await imageGenerator.generateImage(provider, {
      prompt,
      width: 1024,
      height: 1024,
      quality: 'high',
      ...params,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: result.error || 'Unknown error',
        completedAt: new Date(),
      });
      throw new Error(result.error || 'Image generation failed');
    }

    const image = result.images[0];
    const fileName = `texture-${textureType}-${material.replace(/\s+/g, '-')}-${nanoid(10)}.png`;
    const relativePath = await imageGenerator.saveImage(image, fileName);

    const asset = await storage.createVisualAsset({
      worldId,
      name: `${material} ${textureType} Texture`,
      description: `Seamless ${material} texture for ${textureType}`,
      assetType: `texture_${textureType}` as AssetType,
      filePath: relativePath,
      fileName,
      fileSize: image.data.length,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      generationProvider: provider,
      generationPrompt: prompt,
      generationParams: params || {},
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['texture', textureType, material, style || 'realistic'].filter(Boolean) as string[],
      status: 'completed',
    });

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: 1,
      generatedAssetIds: [asset.id],
      completedAt: new Date(),
    });

    return asset.id;
  }

  /**
   * Generate an artifact image
   */
  async generateArtifactImage(
    worldId: string,
    artifactId: string,
    artifactType: string,
    artifactName: string,
    artifactDescription: string,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    // Get world context
    let worldContext = 'historical';
    const world = await storage.getWorld(worldId);
    if (world?.description) {
      worldContext = world.description;
    }

    // Generate prompt
    const prompt = generateArtifactPrompt(artifactType, artifactName, artifactDescription, worldContext);

    // Create generation job
    const job = await storage.createGenerationJob({
      worldId,
      jobType: 'single_asset',
      assetType: 'artifact_image',
      targetEntityId: artifactId,
      targetEntityType: 'artifact',
      prompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: 1,
      status: 'processing',
    });

    // Generate image
    const result = await imageGenerator.generateImage(provider, {
      prompt,
      width: 768,
      height: 768,
      quality: 'high',
      ...params,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: result.error || 'Unknown error',
        completedAt: new Date(),
      });
      throw new Error(result.error || 'Image generation failed');
    }

    // Save image to disk
    const image = result.images[0];
    const fileName = `artifact-${artifactId}-${nanoid(10)}.png`;
    const relativePath = await imageGenerator.saveImage(image, fileName);

    // Create visual asset record
    const asset = await storage.createVisualAsset({
      worldId,
      name: `${artifactName} Image`,
      description: artifactDescription,
      assetType: 'artifact_image',
      filePath: relativePath,
      fileName,
      fileSize: image.data.length,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      generationProvider: provider,
      generationPrompt: prompt,
      generationParams: params || {},
      purpose: 'authorial',
      usageContext: '2d_ui',
      tags: ['artifact', artifactType, 'historical'].filter(Boolean) as string[],
      status: 'completed',
      metadata: {
        artifactId,
        artifactType,
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

    return asset.id;
  }

  /**
   * Generate a character sprite sheet
   */
  async generateCharacterSprite(
    characterId: string,
    animationType: 'idle' | 'walk' | 'run' | 'jump' | 'attack',
    viewAngle: 'side' | 'front' | 'back' | 'top-down' | 'isometric',
    frameCount: number,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    // Get character data
    const character = await storage.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    // Get world context
    let worldContext = 'fantasy';
    if (character.worldId) {
      const world = await storage.getWorld(character.worldId);
      if (world?.description) {
        worldContext = world.description;
      }
    }

    // Generate prompt
    const prompt = generateSpritePrompt(character, animationType, viewAngle, frameCount, worldContext);

    // Create generation job
    const job = await storage.createGenerationJob({
      worldId: character.worldId,
      jobType: 'single_asset',
      assetType: 'character_sprite',
      targetEntityId: characterId,
      targetEntityType: 'character',
      prompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: 1,
      status: 'processing',
    });

    // Calculate sprite sheet dimensions
    // Typical sprite frame size: 64x64 or 128x128
    const frameWidth = params?.width || 128;
    const frameHeight = params?.height || 128;
    const sheetWidth = frameWidth * frameCount;
    const sheetHeight = frameHeight;

    // Generate image
    const result = await imageGenerator.generateImage(provider, {
      prompt,
      width: sheetWidth,
      height: sheetHeight,
      quality: 'high',
      ...params,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: result.error || 'Unknown error',
        completedAt: new Date(),
      });
      throw new Error(result.error || 'Image generation failed');
    }

    // Save image to disk
    const image = result.images[0];
    const fileName = `sprite-${characterId}-${animationType}-${viewAngle}-${nanoid(10)}.png`;
    const relativePath = await imageGenerator.saveImage(image, fileName);

    // Create visual asset record
    const asset = await storage.createVisualAsset({
      worldId: character.worldId,
      name: `${character.firstName} ${character.lastName} ${animationType} Sprite`,
      description: `${animationType} animation sprite sheet (${viewAngle} view) with ${frameCount} frames`,
      assetType: 'character_sprite',
      characterId: character.id,
      filePath: relativePath,
      fileName,
      fileSize: image.data.length,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      generationProvider: provider,
      generationPrompt: prompt,
      generationParams: params || {},
      purpose: 'procedural',
      usageContext: '2d_game',
      tags: ['sprite', 'animation', animationType, viewAngle, character.occupation || 'character'].filter(Boolean) as string[],
      status: 'completed',
      metadata: {
        animationType,
        viewAngle,
        frameCount,
        frameWidth,
        frameHeight,
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

    return asset.id;
  }

  /**
   * Batch generate sprite sheets for a character (all animations)
   */
  async batchGenerateCharacterSprites(
    characterId: string,
    viewAngle: 'side' | 'front' | 'back' | 'top-down' | 'isometric',
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string[]> {
    const character = await storage.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    const animations: Array<{ type: 'idle' | 'walk' | 'run' | 'jump' | 'attack'; frames: number }> = [
      { type: 'idle', frames: 4 },
      { type: 'walk', frames: 8 },
      { type: 'run', frames: 8 },
      { type: 'jump', frames: 6 },
      { type: 'attack', frames: 6 },
    ];

    const job = await storage.createGenerationJob({
      worldId: character.worldId,
      jobType: 'batch_generation',
      assetType: 'character_sprite',
      prompt: `Batch generate ${animations.length} sprite animations for ${character.firstName} ${character.lastName}`,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: animations.length,
      status: 'processing',
    });

    const assetIds: string[] = [];
    let completed = 0;

    for (const anim of animations) {
      try {
        const assetId = await this.generateCharacterSprite(
          characterId,
          anim.type,
          viewAngle,
          anim.frames,
          provider,
          params
        );
        assetIds.push(assetId);
        completed++;

        // Update progress
        await storage.updateGenerationJob(job.id, {
          progress: completed / animations.length,
          completedCount: completed,
        });
      } catch (error) {
        console.error(`Failed to generate ${anim.type} sprite for character ${characterId}:`, error);
      }
    }

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: completed,
      generatedAssetIds: assetIds,
      completedAt: new Date(),
    });

    return assetIds;
  }

  /**
   * Batch generate character portraits for all characters in a world
   */
  async batchGenerateCharacterPortraits(
    worldId: string,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string[]> {
    const characters = await storage.getCharacters(worldId);

    const job = await storage.createGenerationJob({
      worldId,
      jobType: 'batch_generation',
      assetType: 'character_portrait',
      prompt: `Batch generate portraits for ${characters.length} characters`,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: characters.length,
      status: 'processing',
    });

    const assetIds: string[] = [];
    let completed = 0;

    for (const character of characters) {
      try {
        const assetId = await this.generateCharacterPortrait(character.id, provider, params);
        assetIds.push(assetId);
        completed++;

        // Update progress
        await storage.updateGenerationJob(job.id, {
          progress: completed / characters.length,
          completedCount: completed,
        });
      } catch (error) {
        console.error(`Failed to generate portrait for character ${character.id}:`, error);
      }
    }

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: completed,
      generatedAssetIds: assetIds,
      completedAt: new Date(),
    });

    return assetIds;
  }

  /**
   * Batch generate building exteriors for all businesses in a world
   */
  async batchGenerateBuildingExteriors(
    worldId: string,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string[]> {
    const businesses = await storage.getBusinessesByWorld(worldId);

    const job = await storage.createGenerationJob({
      worldId,
      jobType: 'batch_generation',
      assetType: 'building_exterior',
      prompt: `Batch generate exteriors for ${businesses.length} buildings`,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: businesses.length,
      status: 'processing',
    });

    const assetIds: string[] = [];
    let completed = 0;

    for (const business of businesses) {
      try {
        const assetId = await this.generateBuildingExterior(business.id, provider, params);
        assetIds.push(assetId);
        completed++;

        // Update progress
        await storage.updateGenerationJob(job.id, {
          progress: completed / businesses.length,
          completedCount: completed,
        });
      } catch (error) {
        console.error(`Failed to generate exterior for business ${business.id}:`, error);
      }
    }

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: completed,
      generatedAssetIds: assetIds,
      completedAt: new Date(),
    });

    return assetIds;
  }

  /**
   * Batch generate all map types for a settlement
   */
  async batchGenerateSettlementMaps(
    settlementId: string,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string[]> {
    const settlement = await storage.getSettlement(settlementId);
    if (!settlement) {
      throw new Error(`Settlement ${settlementId} not found`);
    }

    const mapTypes: ('terrain' | 'political' | 'region')[] = ['terrain', 'political', 'region'];

    const job = await storage.createGenerationJob({
      worldId: settlement.worldId,
      jobType: 'batch_generation',
      assetType: 'map_terrain',
      prompt: `Batch generate ${mapTypes.length} maps for settlement ${settlement.name}`,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: mapTypes.length,
      status: 'processing',
    });

    const assetIds: string[] = [];
    let completed = 0;

    for (const mapType of mapTypes) {
      try {
        const assetId = await this.generateSettlementMap(settlementId, mapType, provider, params);
        assetIds.push(assetId);
        completed++;

        // Update progress
        await storage.updateGenerationJob(job.id, {
          progress: completed / mapTypes.length,
          completedCount: completed,
        });
      } catch (error) {
        console.error(`Failed to generate ${mapType} map for settlement ${settlementId}:`, error);
      }
    }

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: completed,
      generatedAssetIds: assetIds,
      completedAt: new Date(),
    });

    return assetIds;
  }

  /**
   * Batch generate images for all artifacts in a world
   */
  async batchGenerateArtifactImages(
    worldId: string,
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string[]> {
    // Get world data to access artifacts from customData
    const world = await storage.getWorld(worldId);
    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    const customData = (world as any).customData || {};
    const artifacts = customData.artifacts as Record<string, any> || {};
    const artifactList = Object.values(artifacts).filter((a: any) => !a.destroyed);

    if (artifactList.length === 0) {
      return [];
    }

    const job = await storage.createGenerationJob({
      worldId,
      jobType: 'batch_generation',
      assetType: 'artifact_image',
      prompt: `Batch generate images for ${artifactList.length} artifacts`,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: artifactList.length,
      status: 'processing',
    });

    const assetIds: string[] = [];
    let completed = 0;

    for (const artifact of artifactList) {
      try {
        const assetId = await this.generateArtifactImage(
          worldId,
          artifact.id,
          artifact.type,
          artifact.name,
          artifact.description,
          provider,
          params
        );
        assetIds.push(assetId);
        completed++;

        // Update progress
        await storage.updateGenerationJob(job.id, {
          progress: completed / artifactList.length,
          completedCount: completed,
        });
      } catch (error) {
        console.error(`Failed to generate image for artifact ${artifact.id}:`, error);
      }
    }

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: completed,
      generatedAssetIds: assetIds,
      completedAt: new Date(),
    });

    return assetIds;
  }

  /**
   * Generate a character texture/skin for 3D models
   */
  async generateCharacterTexture(
    characterId: string,
    textureType: 'face' | 'body' | 'clothing' | 'full',
    artStyle: 'realistic' | 'stylized' | 'anime' | 'painterly',
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string> {
    const character = await storage.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    // Get world context
    let worldContext = 'fantasy';
    if (character.worldId) {
      const world = await storage.getWorld(character.worldId);
      if (world?.description) {
        worldContext = world.description;
      }
    }

    // Generate prompt
    const prompt = generateCharacterTexturePrompt(character, textureType, artStyle, worldContext);

    // Create generation job
    const job = await storage.createGenerationJob({
      worldId: character.worldId,
      jobType: 'single_asset',
      assetType: 'character_texture',
      targetEntityId: characterId,
      targetEntityType: 'character',
      prompt,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: 1,
      status: 'processing',
    });

    // Texture dimensions based on type
    let width = 1024;
    let height = 1024;
    if (textureType === 'face') {
      width = 512;
      height = 512;
    } else if (textureType === 'full') {
      width = 2048;
      height = 2048;
    }

    // Generate image
    const result = await imageGenerator.generateImage(provider, {
      prompt,
      width,
      height,
      quality: 'high',
      ...params,
    });

    if (!result.success || !result.images || result.images.length === 0) {
      await storage.updateGenerationJob(job.id, {
        status: 'failed',
        errorMessage: result.error || 'Unknown error',
        completedAt: new Date(),
      });
      throw new Error(result.error || 'Character texture generation failed');
    }

    // Save image to disk
    const image = result.images[0];
    const fileName = `character-texture-${characterId}-${textureType}-${artStyle}-${nanoid(10)}.png`;
    const relativePath = await imageGenerator.saveImage(image, fileName);

    // Create visual asset record
    const asset = await storage.createVisualAsset({
      worldId: character.worldId,
      name: `${character.firstName} ${character.lastName} ${textureType} Texture`,
      description: `${artStyle} style ${textureType} texture for ${character.firstName} ${character.lastName}`,
      assetType: 'character_texture' as AssetType,
      filePath: relativePath,
      fileName,
      fileSize: image.data.length,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      generationProvider: provider,
      generationPrompt: prompt,
      generationParams: params || {},
      purpose: 'procedural',
      usageContext: '3d_game',
      tags: ['texture', 'character', textureType, artStyle, character.occupation || 'civilian'].filter(Boolean) as string[],
      status: 'completed',
      metadata: {
        characterId,
        textureType,
        artStyle,
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

    console.log(`[VisualAssetGenerator] Generated ${textureType} texture for character ${character.firstName} ${character.lastName}: ${asset.id}`);
    return asset.id;
  }

  /**
   * Batch generate all texture types for a character
   */
  async batchGenerateCharacterTextures(
    characterId: string,
    artStyle: 'realistic' | 'stylized' | 'anime' | 'painterly',
    provider: GenerationProvider,
    params?: Partial<ImageGenerationParams>
  ): Promise<string[]> {
    const character = await storage.getCharacter(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    const textureTypes: ('face' | 'body' | 'clothing' | 'full')[] = ['face', 'body', 'clothing'];

    const job = await storage.createGenerationJob({
      worldId: character.worldId,
      jobType: 'batch_generation',
      assetType: 'character_texture',
      prompt: `Batch generate ${textureTypes.length} textures for ${character.firstName} ${character.lastName}`,
      generationProvider: provider,
      generationParams: params || {},
      batchSize: textureTypes.length,
      status: 'processing',
    });

    const assetIds: string[] = [];
    let completed = 0;

    for (const textureType of textureTypes) {
      try {
        const assetId = await this.generateCharacterTexture(
          characterId,
          textureType,
          artStyle,
          provider,
          params
        );
        assetIds.push(assetId);
        completed++;

        // Update progress
        await storage.updateGenerationJob(job.id, {
          progress: completed / textureTypes.length,
          completedCount: completed,
        });
      } catch (error) {
        console.error(`Failed to generate ${textureType} texture for character ${characterId}:`, error);
      }
    }

    await storage.updateGenerationJob(job.id, {
      status: 'completed',
      progress: 1.0,
      completedCount: completed,
      generatedAssetIds: assetIds,
      completedAt: new Date(),
    });

    return assetIds;
  }

  /**
   * Get all visual assets for an entity
   */
  async getEntityAssets(
    entityId: string,
    entityType: 'character' | 'business' | 'settlement' | 'country' | 'state'
  ) {
    return storage.getVisualAssetsByEntity(entityId, entityType);
  }

  /**
   * Get generation job status
   */
  async getJobStatus(jobId: string) {
    return storage.getGenerationJob(jobId);
  }
}

// Export singleton
export const visualAssetGenerator = new VisualAssetGeneratorService();
