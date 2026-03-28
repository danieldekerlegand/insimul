/**
 * Shared export naming utilities.
 *
 * Format: [WorldNameCamelCase][Babylon|Unreal|Unity|Godot][Web|Electron][Cloud|Local]
 * Examples: "LaLouisianeUnrealCloud", "LaLouisianeBabylonWebLocal"
 */

/**
 * Convert a world name to CamelCase by splitting on non-alphanumeric chars
 * and capitalizing the first letter of each word.
 *
 * "La Louisiane" → "LaLouisiane"
 * "my cool world" → "MyCoolWorld"
 */
export function worldNameToCamelCase(worldName: string): string {
  return worldName
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'InsimulWorld';
}

/**
 * Build the canonical export name used for both the ZIP filename and
 * the top-level folder inside the ZIP archive.
 */
export function buildExportName(
  worldName: string,
  engine: 'Babylon' | 'Unreal' | 'Unity' | 'Godot',
  aiMode: string | undefined,
  /** Only used for Babylon exports (Web | Electron) */
  mode?: string,
): string {
  const safeName = worldNameToCamelCase(worldName);
  const modeLabel = engine === 'Babylon' && mode
    ? mode.charAt(0).toUpperCase() + mode.slice(1)
    : '';
  const aiLabel = aiMode === 'local' ? 'Local' : 'Cloud';
  return `${safeName}${engine}${modeLabel}${aiLabel}`;
}
