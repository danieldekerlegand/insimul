import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@babylonjs/core', () => import('./babylon-mock'));

import { Scene, Mesh, StandardMaterial, Vector3 } from '@babylonjs/core';
import {
  NPCModularAssembler,
  deriveBodyType,
  type NPCBodyType,
} from '../NPCModularAssembler';

describe('NPCModularAssembler', () => {
  let scene: Scene;
  let assembler: NPCModularAssembler;

  beforeEach(() => {
    scene = new Scene();
    assembler = new NPCModularAssembler(scene);
  });

  afterEach(() => {
    assembler.dispose();
  });

  describe('assemble', () => {
    it('returns a root mesh with expected child body parts', () => {
      const result = assembler.assemble('char-001', 'civilian', 'average');

      expect(result.root).toBeInstanceOf(Mesh);
      expect(result.root.name).toContain('npc_modular_char-001');

      const expectedParts = [
        'head', 'torso',
        'upperArm_left', 'upperArm_right',
        'lowerArm_left', 'lowerArm_right',
        'upperLeg_left', 'upperLeg_right',
        'lowerLeg_left', 'lowerLeg_right',
      ];
      for (const part of expectedParts) {
        expect(result.parts.has(part)).toBe(true);
      }
      expect(result.parts.size).toBe(10);
    });

    it('assigns all body parts as children of root', () => {
      const result = assembler.assemble('char-002', 'guard', 'athletic');
      const children = result.root.getChildMeshes();

      // All 10 parts should be children
      expect(children.length).toBe(10);
    });

    it('assigns materials to all body parts', () => {
      const result = assembler.assemble('char-003', 'merchant', 'heavy');

      for (const [, part] of result.parts) {
        expect(part.material).toBeTruthy();
        expect(part.material).toBeInstanceOf(StandardMaterial);
      }
    });

    it('uses skin material for head and forearms', () => {
      const result = assembler.assemble('char-004', 'civilian', 'average');

      const headMat = result.parts.get('head')!.material;
      const leftForearmMat = result.parts.get('lowerArm_left')!.material;
      const rightForearmMat = result.parts.get('lowerArm_right')!.material;

      // Skin parts share the same material instance
      expect(headMat).toBe(leftForearmMat);
      expect(headMat).toBe(rightForearmMat);
    });

    it('uses clothing material for torso and upper arms', () => {
      const result = assembler.assemble('char-005', 'civilian', 'average');

      const torsoMat = result.parts.get('torso')!.material;
      const leftUpperArmMat = result.parts.get('upperArm_left')!.material;
      const rightUpperArmMat = result.parts.get('upperArm_right')!.material;

      expect(torsoMat).toBe(leftUpperArmMat);
      expect(torsoMat).toBe(rightUpperArmMat);
    });

    it('makes body parts non-pickable and root pickable', () => {
      const result = assembler.assemble('char-006', 'civilian', 'average');

      expect(result.root.isPickable).toBe(true);
      for (const [, part] of result.parts) {
        expect(part.isPickable).toBe(false);
      }
    });

    it('applies appearance scale to root', () => {
      const result = assembler.assemble('char-007', 'civilian', 'average');

      // Scale should be set (not default 1,1,1 necessarily)
      expect(result.root.scaling).toBeTruthy();
      expect(result.root.scaling).toBeInstanceOf(Vector3);
    });

    it('returns appearance and bodyType in result', () => {
      const result = assembler.assemble('char-008', 'guard', 'slim');

      expect(result.bodyType).toBe('slim');
      expect(result.appearance).toBeTruthy();
      expect(result.appearance.skinColor).toBeTruthy();
      expect(result.appearance.clothingColor).toBeTruthy();
    });
  });

  describe('determinism', () => {
    it('produces identical results for same character ID', () => {
      const r1 = assembler.assemble('determinism-test', 'civilian', 'average');
      const r2 = assembler.assemble('determinism-test', 'civilian', 'average');

      expect(r1.appearance.skinColor.r).toBe(r2.appearance.skinColor.r);
      expect(r1.appearance.clothingColor.r).toBe(r2.appearance.clothingColor.r);
      expect(r1.appearance.scale.y).toBe(r2.appearance.scale.y);
    });

    it('produces different appearances for different character IDs', () => {
      const ids = ['npc-a', 'npc-b', 'npc-c', 'npc-d', 'npc-e'];
      const appearances = ids.map(id =>
        assembler.assemble(id, 'civilian', 'average').appearance
      );

      const uniqueSkin = new Set(appearances.map(a => a.skinColor.r.toFixed(4)));
      expect(uniqueSkin.size).toBeGreaterThan(1);
    });
  });

  describe('body types', () => {
    it('supports all four body types', () => {
      const types: NPCBodyType[] = ['average', 'athletic', 'heavy', 'slim'];
      for (const bt of types) {
        const result = assembler.assemble(`bt-${bt}`, 'civilian', bt);
        expect(result.bodyType).toBe(bt);
        expect(result.parts.size).toBe(10);
      }
    });

    it('returns different proportions for each body type', () => {
      const avgHeight = NPCModularAssembler.computeHeight('average');
      const atkHeight = NPCModularAssembler.computeHeight('athletic');
      const hvyHeight = NPCModularAssembler.computeHeight('heavy');
      const slmHeight = NPCModularAssembler.computeHeight('slim');

      // All heights should be positive and varying
      expect(avgHeight).toBeGreaterThan(0);
      expect(atkHeight).toBeGreaterThan(0);
      expect(hvyHeight).toBeGreaterThan(0);
      expect(slmHeight).toBeGreaterThan(0);

      const heights = new Set([
        avgHeight.toFixed(4), atkHeight.toFixed(4),
        hvyHeight.toFixed(4), slmHeight.toFixed(4),
      ]);
      expect(heights.size).toBeGreaterThan(1);
    });
  });

  describe('roles', () => {
    it('handles all NPC roles', () => {
      const roles = [
        'civilian', 'guard', 'soldier', 'merchant', 'questgiver',
        'farmer', 'blacksmith', 'innkeeper', 'priest', 'teacher',
        'doctor', 'child', 'elder', 'noble', 'beggar', 'sailor',
      ] as const;
      for (const role of roles) {
        const result = assembler.assemble(`role-${role}`, role, 'average');
        expect(result.root).toBeInstanceOf(Mesh);
        expect(result.appearance.roleTint).toBeTruthy();
      }
    });
  });

  describe('material caching', () => {
    it('shares materials for NPCs with same appearance colors', () => {
      // Same character ID produces same appearance → same materials
      const r1 = assembler.assemble('cache-test', 'civilian', 'average');
      const r2 = assembler.assemble('cache-test', 'civilian', 'average');

      expect(r1.parts.get('head')!.material).toBe(r2.parts.get('head')!.material);
    });
  });

  describe('static methods', () => {
    it('computeHeight returns positive values', () => {
      expect(NPCModularAssembler.computeHeight('average')).toBeGreaterThan(1);
      expect(NPCModularAssembler.computeHeight('average')).toBeLessThan(3);
    });

    it('getProportions returns valid proportions', () => {
      const p = NPCModularAssembler.getProportions('athletic');
      expect(p.headRadius).toBeGreaterThan(0);
      expect(p.torsoWidth).toBeGreaterThan(0);
      expect(p.torsoHeight).toBeGreaterThan(0);
      expect(p.upperArmLength).toBeGreaterThan(0);
      expect(p.lowerArmLength).toBeGreaterThan(0);
      expect(p.upperLegLength).toBeGreaterThan(0);
      expect(p.lowerLegLength).toBeGreaterThan(0);
    });
  });
});

describe('deriveBodyType', () => {
  it('returns athletic for muscular/guard traits', () => {
    expect(deriveBodyType(['muscular'], undefined)).toBe('athletic');
    expect(deriveBodyType([], 'guard')).toBe('athletic');
    expect(deriveBodyType(['strong'], 'blacksmith')).toBe('athletic');
  });

  it('returns heavy for stout/cook traits', () => {
    expect(deriveBodyType(['stout'], undefined)).toBe('heavy');
    expect(deriveBodyType([], 'innkeeper')).toBe('heavy');
  });

  it('returns slim for thin/scholar traits', () => {
    expect(deriveBodyType(['slender'], undefined)).toBe('slim');
    expect(deriveBodyType([], 'mage')).toBe('slim');
  });

  it('returns average as default', () => {
    expect(deriveBodyType([], undefined)).toBe('average');
    expect(deriveBodyType(undefined, undefined)).toBe('average');
    expect(deriveBodyType([], 'farmer')).toBe('average');
  });
});
