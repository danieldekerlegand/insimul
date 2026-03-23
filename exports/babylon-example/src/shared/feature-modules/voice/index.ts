/**
 * Voice Module — Definition & Registration
 */

import type { FeatureModuleDefinition } from '../types';

export const VOICE_MODULE: FeatureModuleDefinition = {
  id: 'voice',
  name: 'Voice Interaction',
  description: 'Speech recognition, text-to-speech, and voice streaming for NPC dialogue',
  dependencies: [],
  genreFeatureFlags: ['voiceInteraction'],
  questObjectiveTypes: [],
  questRewardTypes: [],
};

export * from './types';
