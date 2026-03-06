/**
 * Index file for exported Babylon.js game
 * Exports the BabylonGame class for the main entry point
 */

// Export the main BabylonGame class
export { BabylonGame } from './BabylonGame';

// Export DataSource for file-based loading
export { createDataSource, FileDataSource, type DataSource } from './DataSource';

// Re-export types that might be needed
export type { BabylonGameConfig } from './BabylonGame';
