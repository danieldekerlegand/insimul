/**
 * Path utilities for the Babylon exporter
 */

export function get3DGamePath(): string {
  // Check if we're in development or production
  if (process.env.NODE_ENV === 'production') {
    // In production, use relative path
    return './client/src/components/3DGame';
  }
  
  // In development, use absolute path
  // Try to detect the project root from the current working directory
  const cwd = process.cwd();
  
  // If we're already in the insimul directory
  if (cwd.includes('insimul')) {
    return `${cwd}/client/src/components/3DGame`;
  }
  
  // Fallback to Daniel's path for now
  return '/Users/danieldekerlegand/Development/school/insimul/client/src/components/3DGame';
}
