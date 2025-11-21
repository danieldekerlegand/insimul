/**
 * Image Upscaling and Enhancement Service
 *
 * Provides AI-powered upscaling and quality enhancement for generated images
 */

import sharp from 'sharp';
import { storage } from '../db/storage.js';
import type { VisualAsset, InsertVisualAsset } from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface UpscaleOptions {
  scale: 2 | 4 | 8;
  model?: 'esrgan' | 'real-esrgan' | 'gfpgan' | 'codeformer';
  faceEnhancement?: boolean;
}

export interface EnhancementOptions {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  sharpness?: number; // 0 to 100
  denoise?: number; // 0 to 100
}

export interface QualityMetrics {
  resolution: { width: number; height: number };
  fileSize: number;
  estimatedQuality: 'low' | 'medium' | 'high' | 'ultra';
  sharpness: number;
  suggestions: string[];
}

/**
 * Upscale an image using AI upscaling
 */
export async function upscaleImage(
  assetId: string,
  options: UpscaleOptions
): Promise<{ success: boolean; newAssetId?: string; error?: string }> {
  try {
    const asset = await storage.getVisualAsset(assetId);
    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }

    const publicDir = path.resolve(__dirname, '../../client/public');
    const assetPath = path.join(publicDir, asset.filePath);

    if (!fs.existsSync(assetPath)) {
      return { success: false, error: 'Asset file not found' };
    }

    // Read the original image
    const imageBuffer = fs.readFileSync(assetPath);

    let upscaledBuffer: Buffer;

    // Use Replicate API for AI upscaling if available
    if (process.env.REPLICATE_API_KEY && options.model && options.model !== 'esrgan') {
      const result = await upscaleWithReplicate(imageBuffer, options);
      if (!result.success || !result.buffer) {
        // Fallback to sharp if Replicate fails
        upscaledBuffer = await upscaleWithSharp(imageBuffer, options.scale);
      } else {
        upscaledBuffer = result.buffer;
      }
    } else {
      // Use sharp for basic upscaling
      upscaledBuffer = await upscaleWithSharp(imageBuffer, options.scale);
    }

    // Create new asset entry
    const newFileName = `${path.parse(asset.fileName).name}_upscaled_${options.scale}x.png`;
    const newFilePath = path.join(path.dirname(asset.filePath), newFileName);
    const newAssetPath = path.join(publicDir, newFilePath);

    // Save upscaled image
    fs.writeFileSync(newAssetPath, upscaledBuffer);

    // Get new dimensions
    const metadata = await sharp(upscaledBuffer).metadata();

    // Create database entry
    const newAsset: InsertVisualAsset = {
      worldId: asset.worldId,
      name: `${asset.name} (${options.scale}x Upscaled)`,
      description: `AI upscaled version of ${asset.name}`,
      assetType: asset.assetType,
      characterId: asset.characterId,
      businessId: asset.businessId,
      settlementId: asset.settlementId,
      countryId: asset.countryId,
      stateId: asset.stateId,
      filePath: newFilePath,
      fileName: newFileName,
      fileSize: upscaledBuffer.length,
      mimeType: 'image/png',
      width: metadata.width,
      height: metadata.height,
      generationProvider: asset.generationProvider,
      generationPrompt: asset.generationPrompt,
      parentAssetId: assetId,
      version: (asset.version || 1) + 1,
      purpose: asset.purpose,
      usageContext: asset.usageContext,
      tags: [...(asset.tags || []), 'upscaled', `${options.scale}x`],
      status: 'completed',
      metadata: {
        upscaling: {
          originalAssetId: assetId,
          scale: options.scale,
          model: options.model || 'sharp',
          upscaledAt: new Date().toISOString()
        }
      }
    };

    const createdAsset = await storage.createVisualAsset(newAsset);

    return {
      success: true,
      newAssetId: createdAsset.id
    };
  } catch (error: any) {
    console.error('Upscaling error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upscale using sharp (basic bicubic upscaling)
 */
async function upscaleWithSharp(buffer: Buffer, scale: number): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const newWidth = (metadata.width || 512) * scale;
  const newHeight = (metadata.height || 512) * scale;

  return await image
    .resize(newWidth, newHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Upscale using Replicate AI models
 */
async function upscaleWithReplicate(
  buffer: Buffer,
  options: UpscaleOptions
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  try {
    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Replicate API key not configured' };
    }

    // Determine which model to use
    let modelVersion = '';
    switch (options.model) {
      case 'real-esrgan':
        modelVersion = 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b';
        break;
      case 'gfpgan':
        modelVersion = 'tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3';
        break;
      case 'codeformer':
        modelVersion = 'sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56';
        break;
      default:
        return { success: false, error: 'Unsupported model' };
    }

    // Convert buffer to base64
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`;

    // Create prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          image: base64Image,
          scale: options.scale,
          face_enhance: options.faceEnhancement || false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    while ((result.status === 'starting' || result.status === 'processing') && attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'failed') {
      return { success: false, error: result.error || 'Upscaling failed' };
    }

    if (!result.output) {
      return { success: false, error: 'No output from upscaling' };
    }

    // Download the upscaled image
    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    const imageResponse = await fetch(imageUrl);
    const upscaledBuffer = Buffer.from(await imageResponse.arrayBuffer());

    return { success: true, buffer: upscaledBuffer };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Enhance an image with filters
 */
export async function enhanceImage(
  assetId: string,
  options: EnhancementOptions
): Promise<{ success: boolean; newAssetId?: string; error?: string }> {
  try {
    const asset = await storage.getVisualAsset(assetId);
    if (!asset) {
      return { success: false, error: 'Asset not found' };
    }

    const publicDir = path.resolve(__dirname, '../../client/public');
    const assetPath = path.join(publicDir, asset.filePath);

    if (!fs.existsSync(assetPath)) {
      return { success: false, error: 'Asset file not found' };
    }

    let image = sharp(assetPath);

    // Apply brightness adjustment
    if (options.brightness !== undefined && options.brightness !== 0) {
      const brightnessMultiplier = 1 + (options.brightness / 100);
      image = image.modulate({ brightness: brightnessMultiplier });
    }

    // Apply saturation adjustment
    if (options.saturation !== undefined && options.saturation !== 0) {
      const saturationMultiplier = 1 + (options.saturation / 100);
      image = image.modulate({ saturation: saturationMultiplier });
    }

    // Apply sharpening
    if (options.sharpness && options.sharpness > 0) {
      const sharpAmount = options.sharpness / 20; // Scale to reasonable values
      image = image.sharpen(sharpAmount);
    }

    // Apply denoising (using blur and then sharpen)
    if (options.denoise && options.denoise > 0) {
      const blurAmount = options.denoise / 50;
      image = image.blur(blurAmount);
    }

    // Get enhanced buffer
    const enhancedBuffer = await image.png({ compressionLevel: 9 }).toBuffer();

    // Create new asset entry
    const newFileName = `${path.parse(asset.fileName).name}_enhanced.png`;
    const newFilePath = path.join(path.dirname(asset.filePath), newFileName);
    const newAssetPath = path.join(publicDir, newFilePath);

    // Save enhanced image
    fs.writeFileSync(newAssetPath, enhancedBuffer);

    // Get new dimensions
    const metadata = await sharp(enhancedBuffer).metadata();

    // Create database entry
    const newAsset: InsertVisualAsset = {
      worldId: asset.worldId,
      name: `${asset.name} (Enhanced)`,
      description: `Enhanced version of ${asset.name}`,
      assetType: asset.assetType,
      characterId: asset.characterId,
      businessId: asset.businessId,
      settlementId: asset.settlementId,
      countryId: asset.countryId,
      stateId: asset.stateId,
      filePath: newFilePath,
      fileName: newFileName,
      fileSize: enhancedBuffer.length,
      mimeType: 'image/png',
      width: metadata.width,
      height: metadata.height,
      generationProvider: asset.generationProvider,
      generationPrompt: asset.generationPrompt,
      parentAssetId: assetId,
      version: (asset.version || 1) + 1,
      purpose: asset.purpose,
      usageContext: asset.usageContext,
      tags: [...(asset.tags || []), 'enhanced'],
      status: 'completed',
      metadata: {
        enhancement: {
          originalAssetId: assetId,
          options,
          enhancedAt: new Date().toISOString()
        }
      }
    };

    const createdAsset = await storage.createVisualAsset(newAsset);

    return {
      success: true,
      newAssetId: createdAsset.id
    };
  } catch (error: any) {
    console.error('Enhancement error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze image quality and provide recommendations
 */
export async function analyzeImageQuality(assetId: string): Promise<QualityMetrics | null> {
  try {
    const asset = await storage.getVisualAsset(assetId);
    if (!asset) {
      return null;
    }

    const publicDir = path.resolve(__dirname, '../../client/public');
    const assetPath = path.join(publicDir, asset.filePath);

    if (!fs.existsSync(assetPath)) {
      return null;
    }

    const image = sharp(assetPath);
    const metadata = await image.metadata();
    const stats = await image.stats();

    // Calculate estimated quality based on resolution and file size
    const totalPixels = (metadata.width || 0) * (metadata.height || 0);
    const bytesPerPixel = (asset.fileSize || 0) / totalPixels;

    let estimatedQuality: QualityMetrics['estimatedQuality'] = 'medium';
    if (totalPixels >= 2048 * 2048 && bytesPerPixel > 1) {
      estimatedQuality = 'ultra';
    } else if (totalPixels >= 1024 * 1024 && bytesPerPixel > 0.5) {
      estimatedQuality = 'high';
    } else if (totalPixels < 512 * 512 || bytesPerPixel < 0.3) {
      estimatedQuality = 'low';
    }

    // Estimate sharpness from channel statistics
    const channelStats = stats.channels;
    const avgStdDev = channelStats.reduce((sum, ch) => sum + ch.stdev, 0) / channelStats.length;
    const sharpness = Math.min(100, (avgStdDev / 50) * 100);

    // Generate suggestions
    const suggestions: string[] = [];

    if (estimatedQuality === 'low') {
      suggestions.push('Consider upscaling this image for better quality');
    }

    if (totalPixels < 1024 * 1024) {
      suggestions.push('Resolution is below 1024x1024 - upscaling recommended');
    }

    if (sharpness < 40) {
      suggestions.push('Image appears soft - try applying sharpening filter');
    }

    if (bytesPerPixel < 0.5) {
      suggestions.push('Image may have compression artifacts - consider re-generating at higher quality');
    }

    // Check if it's already upscaled
    if (asset.tags?.includes('upscaled')) {
      suggestions.push('This image has already been upscaled');
    }

    if (suggestions.length === 0) {
      suggestions.push('Image quality looks good!');
    }

    return {
      resolution: {
        width: metadata.width || 0,
        height: metadata.height || 0
      },
      fileSize: asset.fileSize || 0,
      estimatedQuality,
      sharpness: Math.round(sharpness),
      suggestions
    };
  } catch (error: any) {
    console.error('Quality analysis error:', error);
    return null;
  }
}

/**
 * Compare two images (before/after)
 */
export async function compareImages(
  originalAssetId: string,
  processedAssetId: string
): Promise<{
  original: QualityMetrics;
  processed: QualityMetrics;
  improvements: string[];
} | null> {
  try {
    const originalMetrics = await analyzeImageQuality(originalAssetId);
    const processedMetrics = await analyzeImageQuality(processedAssetId);

    if (!originalMetrics || !processedMetrics) {
      return null;
    }

    const improvements: string[] = [];

    // Compare resolutions
    const resolutionIncrease = (
      (processedMetrics.resolution.width * processedMetrics.resolution.height) /
      (originalMetrics.resolution.width * originalMetrics.resolution.height)
    );

    if (resolutionIncrease > 1.5) {
      improvements.push(`Resolution increased by ${Math.round((resolutionIncrease - 1) * 100)}%`);
    }

    // Compare sharpness
    if (processedMetrics.sharpness > originalMetrics.sharpness + 10) {
      improvements.push(`Sharpness improved by ${Math.round(processedMetrics.sharpness - originalMetrics.sharpness)}%`);
    }

    // Compare quality levels
    const qualityLevels = ['low', 'medium', 'high', 'ultra'];
    const originalQualityIndex = qualityLevels.indexOf(originalMetrics.estimatedQuality);
    const processedQualityIndex = qualityLevels.indexOf(processedMetrics.estimatedQuality);

    if (processedQualityIndex > originalQualityIndex) {
      improvements.push(`Quality level improved from ${originalMetrics.estimatedQuality} to ${processedMetrics.estimatedQuality}`);
    }

    if (improvements.length === 0) {
      improvements.push('No significant improvements detected');
    }

    return {
      original: originalMetrics,
      processed: processedMetrics,
      improvements
    };
  } catch (error: any) {
    console.error('Comparison error:', error);
    return null;
  }
}
