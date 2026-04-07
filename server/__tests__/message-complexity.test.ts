/**
 * Message Complexity Classification Tests
 *
 * Tests for the tiered model routing classifier.
 */

import { describe, it, expect } from 'vitest';
import { classifyMessageComplexity } from '../services/conversation/http-bridge.js';

describe('classifyMessageComplexity', () => {
  it('should classify "bonjour" with 3 history messages as simple', () => {
    expect(classifyMessageComplexity('bonjour', 3)).toBe('simple');
  });

  it('should classify "oui merci" with 4 history messages as simple', () => {
    expect(classifyMessageComplexity('oui merci', 4)).toBe('simple');
  });

  it('should classify a long question as complex', () => {
    expect(classifyMessageComplexity('Can you tell me about the history of this village?', 5)).toBe('complex');
  });

  it('should classify messages with question marks as complex', () => {
    expect(classifyMessageComplexity('vraiment?', 5)).toBe('complex');
  });

  it('should classify messages with quest keywords as complex', () => {
    expect(classifyMessageComplexity('tell me about the mission', 5)).toBe('complex');
  });

  it('should classify short messages with no history as complex', () => {
    expect(classifyMessageComplexity('ok', 1)).toBe('complex');
  });

  it('should classify short messages with history < 3 as complex', () => {
    expect(classifyMessageComplexity('ok', 2)).toBe('complex');
  });

  it('should classify "merci beaucoup" with enough history as simple', () => {
    expect(classifyMessageComplexity('merci beaucoup', 5)).toBe('simple');
  });

  it('should classify "explain how this works" as complex', () => {
    expect(classifyMessageComplexity('explain how this works', 10)).toBe('complex');
  });
});
