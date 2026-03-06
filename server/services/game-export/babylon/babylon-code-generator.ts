/**
 * Babylon.js Code Generator
 * 
 * This module provides utility functions for generating Babylon.js game code.
 * The main generation happens in babylon-exporter-new.ts which uses the individual functions.
 */

// Re-export individual generators for use in the main exporter
export { exportBabylonProject, exportBabylonProjectAsZip as packageBabylonExport } from './babylon-exporter-new';
export { generateSceneFiles } from './babylon-scene-generator';
export { bundleCoreAssets, generateAssetManifestJson } from '../asset-bundler';
export { get3DGamePath } from './path-utils';
