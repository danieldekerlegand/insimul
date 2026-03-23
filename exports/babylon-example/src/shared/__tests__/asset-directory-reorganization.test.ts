import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as assetPaths from '../asset-paths';

const {
  CONTAINERS_BASE,
  MARKERS_BASE,
  CORE_CONTAINERS,
  CORE_MARKERS,
  CORE_PROPS,
  containerModelPath,
  markerModelPath,
} = assetPaths;

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'client/public/assets');

describe('Asset directory reorganization: quest-objects → containers/markers/props', () => {
  describe('asset-paths constants', () => {
    it('CONTAINERS_BASE points to models/containers', () => {
      expect(CONTAINERS_BASE).toBe('assets/models/containers');
    });

    it('MARKERS_BASE points to models/markers', () => {
      expect(MARKERS_BASE).toBe('assets/models/markers');
    });

    it('no longer exports QUEST_OBJECTS_BASE', () => {
      expect((assetPaths as any).QUEST_OBJECTS_BASE).toBeUndefined();
    });

    it('no longer exports questObjectPath', () => {
      expect((assetPaths as any).questObjectPath).toBeUndefined();
    });
  });

  describe('helper functions', () => {
    it('containerModelPath builds correct relative path', () => {
      expect(containerModelPath('chest.glb')).toBe('assets/models/containers/chest.glb');
    });

    it('markerModelPath builds correct relative path', () => {
      expect(markerModelPath('quest_marker.glb')).toBe('assets/models/markers/quest_marker.glb');
    });
  });

  describe('CORE asset definitions', () => {
    it('CORE_CONTAINERS lists container models', () => {
      expect(CORE_CONTAINERS.length).toBeGreaterThanOrEqual(2);
      const roles = CORE_CONTAINERS.map(d => d.role);
      expect(roles).toContain('quest_chest');
      expect(roles).toContain('treasure_chest');
    });

    it('CORE_MARKERS lists marker models', () => {
      expect(CORE_MARKERS.length).toBeGreaterThanOrEqual(2);
      const roles = CORE_MARKERS.map(d => d.role);
      expect(roles).toContain('quest_marker');
      expect(roles).toContain('lantern_marker');
    });

    it('CORE_PROPS lists prop/collectible models', () => {
      expect(CORE_PROPS.length).toBeGreaterThanOrEqual(4);
      const roles = CORE_PROPS.map(d => d.role);
      expect(roles).toContain('quest_collectible');
      expect(roles).toContain('quest_water_bottle');
    });

    it('no CORE asset references quest-objects path', () => {
      const allDefs = [...CORE_CONTAINERS, ...CORE_MARKERS, ...CORE_PROPS];
      for (const def of allDefs) {
        expect(def.sourcePath).not.toContain('quest-objects');
        expect(def.exportPath).not.toContain('quest-objects');
      }
    });
  });

  describe('physical asset files', () => {
    it('containers directory exists with expected files', () => {
      const dir = path.join(ASSETS_DIR, 'models/containers');
      expect(fs.existsSync(dir)).toBe(true);
      const files = fs.readdirSync(dir);
      expect(files).toContain('chest.glb');
      expect(files).toContain('treasure_chest.gltf');
    });

    it('markers directory exists with expected files', () => {
      const dir = path.join(ASSETS_DIR, 'models/markers');
      expect(fs.existsSync(dir)).toBe(true);
      const files = fs.readdirSync(dir);
      expect(files).toContain('quest_marker.glb');
      expect(files).toContain('lantern_marker.gltf');
    });

    it('props directory contains moved collectibles', () => {
      const dir = path.join(ASSETS_DIR, 'models/props');
      expect(fs.existsSync(dir)).toBe(true);
      const files = fs.readdirSync(dir);
      expect(files).toContain('collectible_gem.glb');
      expect(files).toContain('water_bottle.glb');
      expect(files).toContain('avocado_collectible.glb');
      expect(files).toContain('brass_lamp.gltf');
    });

    it('quest-objects directory no longer exists', () => {
      const dir = path.join(ASSETS_DIR, 'models/quest-objects');
      expect(fs.existsSync(dir)).toBe(false);
    });
  });
});
