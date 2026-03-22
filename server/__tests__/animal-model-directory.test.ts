/**
 * Tests for animal model directory organization.
 *
 * Verifies that animal models are located in the dedicated animals/ directory
 * (not mixed in with characters/quaternius/) and that migration 030 correctly
 * targets the animals directory for animal assets.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../client/public');
const ANIMALS_DIR = path.join(PUBLIC_DIR, 'assets/models/animals');
const CHARACTERS_DIR = path.join(PUBLIC_DIR, 'assets/models/characters/quaternius');

const EXPECTED_ANIMALS = [
  'animal_alpaca',
  'animal_bull',
  'animal_cow',
  'animal_deer',
  'animal_donkey',
  'animal_fox',
  'animal_horse',
  'animal_horse_white',
  'animal_husky',
  'animal_shibainu',
  'animal_stag',
  'animal_wolf',
];

describe('Animal model directory organization', () => {
  it('animals directory exists', () => {
    expect(fs.existsSync(ANIMALS_DIR)).toBe(true);
  });

  it('all expected animal models are in the animals directory', () => {
    const entries = fs.readdirSync(ANIMALS_DIR);
    for (const animal of EXPECTED_ANIMALS) {
      expect(entries).toContain(animal);
    }
  });

  it('each animal directory contains a .gltf file', () => {
    for (const animal of EXPECTED_ANIMALS) {
      const animalDir = path.join(ANIMALS_DIR, animal);
      expect(fs.existsSync(animalDir)).toBe(true);
      const files = fs.readdirSync(animalDir);
      const hasGltf = files.some(f => f.endsWith('.gltf') || f.endsWith('.glb'));
      expect(hasGltf, `${animal} should contain a .gltf or .glb file`).toBe(true);
    }
  });

  it('no animal models remain in characters/quaternius directory', () => {
    if (!fs.existsSync(CHARACTERS_DIR)) return; // dir may not exist
    const entries = fs.readdirSync(CHARACTERS_DIR);
    const animalEntries = entries.filter(e => e.startsWith('animal_'));
    expect(animalEntries).toEqual([]);
  });
});

describe('Migration 030 animal pack configuration', () => {
  it('targets animals category, not characters', async () => {
    const migrationPath = path.resolve(__dirname, '../migrations/030-organize-all-quaternius-assets.ts');
    const content = fs.readFileSync(migrationPath, 'utf-8');

    // The animals pack should target the 'animals' category
    expect(content).toContain("category: 'animals'");
    expect(content).toContain("assetType: 'model_animal'");

    // Should NOT target characters for animals
    // Find the animals pack block and verify it doesn't use 'characters'
    const animalPackMatch = content.match(
      /Ultimate Animated Animals[\s\S]*?category:\s*'(\w+)'/
    );
    expect(animalPackMatch).not.toBeNull();
    expect(animalPackMatch![1]).toBe('animals');
  });

  it('DEST_DIRS includes animals path', () => {
    const migrationPath = path.resolve(__dirname, '../migrations/030-organize-all-quaternius-assets.ts');
    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain("assets/models/animals");
  });
});
