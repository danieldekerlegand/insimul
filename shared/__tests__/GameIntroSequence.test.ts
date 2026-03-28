import { describe, it, expect, beforeEach } from 'vitest';
import {
  GameIntroSequence,
  buildIntroPages,
  type IntroContext,
} from '../game-engine/rendering/GameIntroSequence';

function makeContext(overrides?: Partial<IntroContext>): IntroContext {
  return {
    settlementName: 'Villefranche',
    countryName: 'France',
    targetLanguage: 'French',
    writerName: 'Marie Dupont',
    ...overrides,
  };
}

describe('buildIntroPages', () => {
  it('returns multiple pages', () => {
    const pages = buildIntroPages(makeContext());
    expect(pages.length).toBeGreaterThan(1);
  });

  it('includes settlement name in the narrative', () => {
    const pages = buildIntroPages(makeContext());
    const allText = pages.map(p => p.text).join(' ');
    expect(allText).toContain('Villefranche');
  });

  it('includes target language in the narrative', () => {
    const pages = buildIntroPages(makeContext());
    const allText = pages.map(p => p.text).join(' ');
    expect(allText).toContain('French');
  });

  it('includes writer name in the narrative', () => {
    const pages = buildIntroPages(makeContext());
    const allText = pages.map(p => p.text).join(' ');
    expect(allText).toContain('Marie Dupont');
  });

  it('includes country name in the narrative', () => {
    const pages = buildIntroPages(makeContext());
    const allText = pages.map(p => p.text).join(' ');
    expect(allText).toContain('France');
  });

  it('uses player name when provided', () => {
    const pages = buildIntroPages(makeContext({ playerName: 'Daniel' }));
    const allText = pages.map(p => p.text).join(' ');
    expect(allText).toContain('Daniel');
  });

  it('falls back to Traveler when no player name', () => {
    const pages = buildIntroPages(makeContext());
    const allText = pages.map(p => p.text).join(' ');
    expect(allText).toContain('Traveler');
  });

  it('all pages have beatType chapter_intro', () => {
    const pages = buildIntroPages(makeContext());
    expect(pages.every(p => p.beatType === 'chapter_intro')).toBe(true);
  });
});

describe('GameIntroSequence', () => {
  let intro: GameIntroSequence;

  beforeEach(() => {
    intro = new GameIntroSequence();
  });

  it('shouldShowIntro returns true initially', () => {
    expect(intro.shouldShowIntro()).toBe(true);
  });

  it('shouldShowIntro returns false after marking shown', () => {
    intro.markIntroShown();
    expect(intro.shouldShowIntro()).toBe(false);
  });

  it('tracks skip state', () => {
    intro.markIntroShown(true);
    expect(intro.getState().wasSkipped).toBe(true);
  });

  it('tracks non-skip state', () => {
    intro.markIntroShown(false);
    expect(intro.getState().wasSkipped).toBe(false);
  });

  it('records shownAt timestamp', () => {
    intro.markIntroShown();
    expect(intro.getState().shownAt).toBeDefined();
  });

  it('getIntroPages returns pages from context', () => {
    const pages = intro.getIntroPages(makeContext());
    expect(pages.length).toBeGreaterThan(0);
    const allText = pages.map(p => p.text).join(' ');
    expect(allText).toContain('Villefranche');
  });

  it('restoreState restores introShown', () => {
    intro.restoreState({ introShown: true, wasSkipped: false });
    expect(intro.shouldShowIntro()).toBe(false);
  });

  it('restoreState handles partial state', () => {
    intro.restoreState({});
    expect(intro.shouldShowIntro()).toBe(true);
  });
});
