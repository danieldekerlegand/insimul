/**
 * Babylon.js Code Generator
 *
 * Re-export barrel — the real orchestration lives in babylon-exporter-new.ts.
 */
export { exportBabylonProject, exportBabylonProjectAsZip as packageBabylonExport } from './babylon-exporter-new';
export { bundleCoreAssets, generateAssetManifestJson } from '../asset-bundler';
export { get3DGamePath } from './path-utils';
