/**
 * Tests for NPC daily schedule IR generation.
 */

import { describe, it, expect } from 'vitest';
import { buildNPCSchedule } from '../services/game-export/ir-generator';
import type { NPCDailyScheduleIR, NPCScheduleBlockIR } from '@shared/game-engine/ir-types';

const SETTLEMENT_ID = 'settlement-1';

function makeBuildings() {
  return [
    { id: 'bld-home-1', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_small' } },
    { id: 'bld-home-2', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_medium' } },
    { id: 'bld-home-3', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_large' } },
    { id: 'bld-shop', settlementId: SETTLEMENT_ID, businessId: 'biz-1', spec: { buildingRole: 'bakery' } },
    { id: 'bld-tavern', settlementId: SETTLEMENT_ID, businessId: 'biz-2', spec: { buildingRole: 'tavern' } },
  ];
}

function makeCharacter(overrides: Record<string, any> = {}) {
  return {
    id: 'char-1',
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extroversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    occupation: null as string | null,
    friendIds: [] as string[],
    ...overrides,
  };
}

describe('buildNPCSchedule', () => {
  it('returns a valid schedule with all required fields', () => {
    const schedule = buildNPCSchedule(makeCharacter(), makeBuildings(), SETTLEMENT_ID);
    expect(schedule).toBeDefined();
    expect(schedule.homeBuildingId).toBe('bld-home-1');
    expect(schedule.workBuildingId).toBeNull();
    expect(schedule.friendBuildingIds).toEqual(['bld-home-2', 'bld-home-3']);
    expect(schedule.blocks.length).toBeGreaterThan(0);
    expect(typeof schedule.wakeHour).toBe('number');
    expect(typeof schedule.bedtimeHour).toBe('number');
  });

  it('assigns work building for employed NPCs', () => {
    const schedule = buildNPCSchedule(
      makeCharacter({ occupation: 'baker' }),
      makeBuildings(),
      SETTLEMENT_ID,
    );
    expect(schedule.workBuildingId).toBe('bld-shop');
    const workBlocks = schedule.blocks.filter(b => b.activity === 'work');
    expect(workBlocks.length).toBeGreaterThan(0);
  });

  it('has no work blocks for unemployed NPCs', () => {
    const schedule = buildNPCSchedule(makeCharacter(), makeBuildings(), SETTLEMENT_ID);
    const workBlocks = schedule.blocks.filter(b => b.activity === 'work');
    expect(workBlocks).toHaveLength(0);
  });

  it('blocks are sorted by startHour', () => {
    const schedule = buildNPCSchedule(makeCharacter(), makeBuildings(), SETTLEMENT_ID);
    for (let i = 1; i < schedule.blocks.length; i++) {
      expect(schedule.blocks[i].startHour).toBeGreaterThanOrEqual(schedule.blocks[i - 1].startHour);
    }
  });

  it('includes sleep blocks', () => {
    const schedule = buildNPCSchedule(makeCharacter(), makeBuildings(), SETTLEMENT_ID);
    const sleepBlocks = schedule.blocks.filter(b => b.activity === 'sleep');
    expect(sleepBlocks.length).toBeGreaterThanOrEqual(1);
  });

  it('high conscientiousness wakes earlier and sleeps earlier', () => {
    const highC = buildNPCSchedule(
      makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.9, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 } }),
      makeBuildings(), SETTLEMENT_ID,
    );
    const lowC = buildNPCSchedule(
      makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.1, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 } }),
      makeBuildings(), SETTLEMENT_ID,
    );
    expect(highC.wakeHour).toBeLessThan(lowC.wakeHour);
    expect(highC.bedtimeHour).toBeLessThan(lowC.bedtimeHour);
  });

  it('high extroversion pushes bedtime later', () => {
    const highE = buildNPCSchedule(
      makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.9, agreeableness: 0.5, neuroticism: 0.5 } }),
      makeBuildings(), SETTLEMENT_ID,
    );
    const lowE = buildNPCSchedule(
      makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.1, agreeableness: 0.5, neuroticism: 0.5 } }),
      makeBuildings(), SETTLEMENT_ID,
    );
    expect(highE.bedtimeHour).toBeGreaterThan(lowE.bedtimeHour);
  });

  it('neurotic unemployed NPC stays home in the morning', () => {
    const schedule = buildNPCSchedule(
      makeCharacter({ personality: { openness: 0.5, conscientiousness: 0.5, extroversion: 0.5, agreeableness: 0.5, neuroticism: 0.9 } }),
      makeBuildings(), SETTLEMENT_ID,
    );
    const morningBlock = schedule.blocks.find(b => b.startHour >= 5 && b.startHour < 10 && b.activity !== 'sleep');
    expect(morningBlock?.activity).toBe('idle_at_home');
  });

  it('handles empty buildings list gracefully', () => {
    const schedule = buildNPCSchedule(makeCharacter(), [], SETTLEMENT_ID);
    expect(schedule.homeBuildingId).toBeNull();
    expect(schedule.workBuildingId).toBeNull();
    expect(schedule.friendBuildingIds).toEqual([]);
    expect(schedule.blocks.length).toBeGreaterThan(0);
  });

  it('handles null settlement gracefully', () => {
    const schedule = buildNPCSchedule(makeCharacter(), makeBuildings(), null);
    expect(schedule.blocks.length).toBeGreaterThan(0);
  });

  it('limits friend buildings to 3', () => {
    const buildings = [
      { id: 'r1', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_small' } },
      { id: 'r2', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_small' } },
      { id: 'r3', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_small' } },
      { id: 'r4', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_small' } },
      { id: 'r5', settlementId: SETTLEMENT_ID, businessId: null, spec: { buildingRole: 'residence_small' } },
    ];
    const schedule = buildNPCSchedule(makeCharacter(), buildings, SETTLEMENT_ID);
    // home is r1, friends are r2, r3, r4 (max 3)
    expect(schedule.friendBuildingIds).toHaveLength(3);
  });

  it('every block has valid fields', () => {
    const schedule = buildNPCSchedule(
      makeCharacter({ occupation: 'merchant' }),
      makeBuildings(), SETTLEMENT_ID,
    );
    for (const block of schedule.blocks) {
      expect(block.startHour).toBeGreaterThanOrEqual(0);
      expect(block.startHour).toBeLessThanOrEqual(24);
      expect(block.endHour).toBeGreaterThanOrEqual(0);
      expect(block.endHour).toBeLessThanOrEqual(24);
      expect(typeof block.activity).toBe('string');
      expect(typeof block.priority).toBe('number');
    }
  });

  it('employed schedule includes an eat block', () => {
    const schedule = buildNPCSchedule(
      makeCharacter({ occupation: 'baker' }),
      makeBuildings(), SETTLEMENT_ID,
    );
    const eatBlocks = schedule.blocks.filter(b => b.activity === 'eat');
    expect(eatBlocks.length).toBeGreaterThanOrEqual(1);
  });
});
