/**
 * Unity GUID Manager
 *
 * Generates deterministic GUIDs for Unity assets using MD5 hashes of asset paths.
 * Unity uses 128-bit hex GUIDs (32 hex chars) in .meta files and scene references.
 * Deterministic generation ensures the same world export always produces
 * identical GUIDs, enabling stable cross-references.
 */

import { createHash } from 'crypto';

/**
 * Generate a deterministic Unity GUID from an asset path.
 * Uses MD5 hash of the path string to produce a 32-char hex string.
 */
export function generateGuid(assetPath: string): string {
  return createHash('md5').update(assetPath).digest('hex');
}

/**
 * Generate a deterministic fileID (local identifier) for a component
 * within a Unity scene or prefab. Uses a hash of the path + component name
 * truncated to a positive 32-bit integer range.
 */
export function generateFileId(assetPath: string, componentName: string): number {
  const hash = createHash('md5').update(`${assetPath}:${componentName}`).digest();
  // Read first 4 bytes as unsigned 32-bit, mask to positive range
  return (hash.readUInt32BE(0) & 0x7fffffff) || 1;
}

/**
 * Tracks all GUIDs assigned during an export session.
 * Ensures no collisions and provides lookup by path.
 */
export class GuidRegistry {
  private guidsByPath = new Map<string, string>();
  private fileIdCounter = 1;
  private fileIdsByKey = new Map<string, number>();

  /** Get or create a GUID for the given asset path. */
  getGuid(assetPath: string): string {
    let guid = this.guidsByPath.get(assetPath);
    if (!guid) {
      guid = generateGuid(assetPath);
      this.guidsByPath.set(assetPath, guid);
    }
    return guid;
  }

  /** Get the next sequential fileID for scene objects. */
  nextFileId(): number {
    return this.fileIdCounter++;
  }

  /**
   * Get a deterministic fileID for a named component within a scene.
   * Same key always returns the same ID within this registry.
   */
  getFileId(key: string): number {
    let id = this.fileIdsByKey.get(key);
    if (!id) {
      id = this.nextFileId();
      this.fileIdsByKey.set(key, id);
    }
    return id;
  }

  /** Return all registered path → GUID mappings. */
  entries(): [string, string][] {
    return [...this.guidsByPath.entries()];
  }
}

/**
 * Generate a .meta file for a Unity asset (script, scene, folder, etc.).
 */
export function generateMetaFile(assetPath: string, guid: string, importerType: MetaImporterType): string {
  const lines = [
    'fileFormatVersion: 2',
    `guid: ${guid}`,
  ];

  switch (importerType) {
    case 'MonoImporter':
      lines.push(
        'MonoImporter:',
        '  externalObjects: {}',
        '  serializedVersion: 2',
        '  defaultReferences: []',
        '  executionOrder: 0',
        '  icon: {instanceID: 0}',
        '  userData: ',
        '  assetBundleName: ',
        '  assetBundleVariant: ',
      );
      break;

    case 'DefaultImporter':
      lines.push(
        'DefaultImporter:',
        '  externalObjects: {}',
        '  userData: ',
        '  assetBundleName: ',
        '  assetBundleVariant: ',
      );
      break;

    case 'TextScriptImporter':
      lines.push(
        'TextScriptImporter:',
        '  externalObjects: {}',
        '  userData: ',
        '  assetBundleName: ',
        '  assetBundleVariant: ',
      );
      break;

    case 'FolderImporter':
      lines.push(
        'folderAsset: yes',
        'DefaultImporter:',
        '  externalObjects: {}',
        '  userData: ',
        '  assetBundleName: ',
        '  assetBundleVariant: ',
      );
      break;
  }

  return lines.join('\n') + '\n';
}

export type MetaImporterType = 'MonoImporter' | 'DefaultImporter' | 'TextScriptImporter' | 'FolderImporter';

/**
 * Determine the correct importer type for a file based on its extension.
 */
export function getImporterType(filePath: string): MetaImporterType {
  if (filePath.endsWith('.cs')) return 'MonoImporter';
  if (filePath.endsWith('.unity')) return 'DefaultImporter';
  if (filePath.endsWith('.json') || filePath.endsWith('.txt') || filePath.endsWith('.md')) return 'TextScriptImporter';
  if (filePath.endsWith('.asset')) return 'DefaultImporter';
  if (filePath.endsWith('.asmdef')) return 'DefaultImporter';
  return 'DefaultImporter';
}

/**
 * Generate .meta files for all generated files that live under Assets/.
 * Returns the meta files as GeneratedFile entries.
 */
export function generateMetaFiles(
  files: { path: string; content: string }[],
  registry: GuidRegistry,
): { path: string; content: string }[] {
  const metaFiles: { path: string; content: string }[] = [];
  const folders = new Set<string>();

  for (const file of files) {
    // Only generate .meta for files inside Assets/
    if (!file.path.startsWith('Assets/')) continue;

    // Track parent folders
    const parts = file.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      folders.add(parts.slice(0, i).join('/'));
    }

    const guid = registry.getGuid(file.path);
    const importerType = getImporterType(file.path);
    metaFiles.push({
      path: `${file.path}.meta`,
      content: generateMetaFile(file.path, guid, importerType),
    });
  }

  // Generate .meta for tracked folders (skip "Assets" root — Unity manages that)
  for (const folder of folders) {
    if (folder === 'Assets') continue;
    const guid = registry.getGuid(folder);
    metaFiles.push({
      path: `${folder}.meta`,
      content: generateMetaFile(folder, guid, 'FolderImporter'),
    });
  }

  return metaFiles;
}
