/**
 * Tests for direction quest generation and waypoint proximity detection.
 */
import { describe, it, expect } from 'vitest';
import {
  generateDirectionSteps,
  generateNavigationRoute,
  isWithinStepRadius,
  type Position,
  type LocationInfo,
  type DirectionQuestConfig,
} from '../navigation/direction-quest-generator';

// ── Helpers ──────────────────────────────────────────────────────────────────

const pos = (x: number, z: number): Position => ({ x, y: 0, z });

const loc = (name: string, x: number, z: number): LocationInfo => ({
  name,
  position: pos(x, z),
});

// ── generateDirectionSteps ───────────────────────────────────────────────────

describe('generateDirectionSteps', () => {
  const baseConfig: DirectionQuestConfig = {
    stepCount: 3,
    startPosition: pos(0, 0),
    locations: [
      loc('Market', 20, 0),
      loc('Town Hall', 40, 20),
      loc('Library', 60, 10),
    ],
    targetLanguage: 'french',
    difficulty: 'intermediate',
  };

  it('generates the requested number of steps', () => {
    const steps = generateDirectionSteps(baseConfig);
    expect(steps).toHaveLength(3);
  });

  it('generates fewer steps when fewer locations are available', () => {
    const config = {
      ...baseConfig,
      stepCount: 5,
      locations: [loc('Market', 20, 0), loc('Town Hall', 40, 20)],
    };
    const steps = generateDirectionSteps(config);
    expect(steps).toHaveLength(2);
  });

  it('returns empty array when no locations available', () => {
    const config = { ...baseConfig, locations: [] };
    const steps = generateDirectionSteps(config);
    expect(steps).toHaveLength(0);
  });

  it('each step has instruction, englishHint, targetPosition, and radius', () => {
    const steps = generateDirectionSteps(baseConfig);
    for (const step of steps) {
      expect(step.instruction).toBeTruthy();
      expect(step.englishHint).toBeTruthy();
      expect(step.targetPosition).toBeDefined();
      expect(step.targetPosition.x).toEqual(expect.any(Number));
      expect(step.targetPosition.z).toEqual(expect.any(Number));
      expect(step.radius).toBeGreaterThan(0);
    }
  });

  it('uses French vocabulary for French target language', () => {
    const steps = generateDirectionSteps(baseConfig);
    // At least one step should contain French words
    const hasfrench = steps.some(
      s => s.instruction.includes("jusqu'à") || s.instruction.includes('Marchez vers'),
    );
    expect(hasfrench).toBe(true);
  });

  it('uses default vocabulary for unknown languages', () => {
    const config = { ...baseConfig, targetLanguage: 'Chitimacha' };
    const steps = generateDirectionSteps(config);
    const hasDefault = steps.some(
      s => s.instruction.includes('Walk toward') || s.instruction.includes('until you reach'),
    );
    expect(hasDefault).toBe(true);
  });

  it('beginner difficulty uses simple "Go to" instructions', () => {
    const config = { ...baseConfig, difficulty: 'beginner' as const };
    const steps = generateDirectionSteps(config);
    for (const step of steps) {
      expect(step.instruction).toContain('Allez à');
    }
  });

  it('beginner difficulty has larger radius', () => {
    const config = { ...baseConfig, difficulty: 'beginner' as const };
    const steps = generateDirectionSteps(config);
    for (const step of steps) {
      expect(step.radius).toBe(8);
    }
  });

  it('advanced difficulty has smaller radius', () => {
    const config = { ...baseConfig, difficulty: 'advanced' as const };
    const steps = generateDirectionSteps(config);
    for (const step of steps) {
      expect(step.radius).toBe(4);
    }
  });

  it('skips locations that are too close to current position', () => {
    const config = {
      ...baseConfig,
      stepCount: 1,
      locations: [
        loc('Too Close', 2, 2),  // < 5 units from start (distance ~2.83)
        loc('Far Enough', 20, 0),
      ],
    };
    const steps = generateDirectionSteps(config);
    // Should pick "Far Enough" first since "Too Close" is < 5 units away
    expect(steps).toHaveLength(1);
    expect(steps[0].targetPosition.x).toBe(20);
  });
});

// ── generateNavigationRoute ──────────────────────────────────────────────────

describe('generateNavigationRoute', () => {
  it('generates a route through intermediates to destination', () => {
    const start = pos(0, 0);
    const destination = loc('Castle', 100, 100);
    const intermediates = [loc('Bridge', 30, 30), loc('Forest', 60, 60)];

    const steps = generateNavigationRoute(
      start,
      destination,
      intermediates,
      'spanish',
      'advanced',
    );

    expect(steps.length).toBeGreaterThanOrEqual(1);
    // Last step should target the destination
    const lastStep = steps[steps.length - 1];
    expect(lastStep.targetPosition.x).toBe(100);
    expect(lastStep.targetPosition.z).toBe(100);
  });

  it('works with no intermediates', () => {
    const start = pos(0, 0);
    const destination = loc('Castle', 50, 50);

    const steps = generateNavigationRoute(start, destination, [], 'french');
    expect(steps).toHaveLength(1);
    expect(steps[0].targetPosition.x).toBe(50);
  });

  it('uses Spanish vocabulary for Spanish target language', () => {
    const start = pos(0, 0);
    const destination = loc('Plaza', 50, 50);

    const steps = generateNavigationRoute(start, destination, [], 'spanish', 'beginner');
    expect(steps[0].instruction).toContain('Vaya a');
  });
});

// ── isWithinStepRadius ───────────────────────────────────────────────────────

describe('isWithinStepRadius', () => {
  const step = {
    instruction: 'Go north',
    englishHint: 'Go north',
    targetPosition: pos(10, 10),
    radius: 5,
  };

  it('returns true when player is at the target', () => {
    expect(isWithinStepRadius(pos(10, 10), step)).toBe(true);
  });

  it('returns true when player is within radius', () => {
    expect(isWithinStepRadius(pos(12, 10), step)).toBe(true);
  });

  it('returns false when player is outside radius', () => {
    expect(isWithinStepRadius(pos(20, 20), step)).toBe(false);
  });

  it('returns true when exactly at the radius boundary', () => {
    expect(isWithinStepRadius(pos(15, 10), step)).toBe(true);
  });

  it('ignores y coordinate in distance calculation', () => {
    const playerPos = { x: 10, y: 100, z: 10 };
    expect(isWithinStepRadius(playerPos, step)).toBe(true);
  });
});
