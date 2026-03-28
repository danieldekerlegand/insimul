/**
 * Game Intro Sequence
 *
 * Builds and manages the narrative intro cutscene shown when a new playthrough
 * starts. Establishes where the player is, why they're here, the inciting
 * incident (missing writer), and the player's goal.
 *
 * The intro is generated from the world's narrative data (settlement name,
 * target language, writer name). It's skippable for returning players and
 * only shown once per playthrough.
 */

import type { CutscenePageData } from './NarrativeCutscenePanel';

// ── Types ────────────────────────────────────────────────────────────────────

export interface IntroContext {
  settlementName: string;
  countryName: string;
  targetLanguage: string;
  writerName: string;
  playerName?: string;
}

export interface GameIntroState {
  /** Whether the intro has been shown this playthrough */
  introShown: boolean;
  /** Timestamp when intro was shown */
  shownAt?: string;
  /** Whether the player skipped the intro */
  wasSkipped: boolean;
}

// ── Intro Page Builder ──────────────────────────────────────────────────────

/**
 * Build the multi-page intro cutscene from world context.
 */
export function buildIntroPages(context: IntroContext): CutscenePageData[] {
  const { settlementName, countryName, targetLanguage, writerName, playerName } = context;
  const name = playerName || 'Traveler';

  return [
    {
      text: `Welcome to ${settlementName}, a quiet town nestled in the heart of ${countryName}.\n\nThe cobblestone streets wind between colorful buildings, and the air carries the sound of ${targetLanguage} spoken by the locals going about their day.`,
      chapterTitle: 'A New Beginning',
      beatType: 'chapter_intro',
    },
    {
      text: `You've arrived as part of a language immersion program — a chance to learn ${targetLanguage} by living among native speakers.\n\nBut ${settlementName} holds more than lessons. The town has been unsettled since the disappearance of ${writerName}, a beloved local writer whose unfinished manuscript may hold secrets about the region's forgotten history.`,
      beatType: 'chapter_intro',
    },
    {
      text: `Your goal is simple, ${name}: explore the town, learn the language, and piece together the mystery of ${writerName}'s disappearance.\n\nSpeak with the townsfolk. Read the signs and notices. Every conversation brings you closer to fluency — and closer to the truth.`,
      chapterTitle: 'Your Journey Begins',
      beatType: 'chapter_intro',
    },
  ];
}

// ── Game Intro Sequence Manager ─────────────────────────────────────────────

export class GameIntroSequence {
  private state: GameIntroState = {
    introShown: false,
    wasSkipped: false,
  };

  /** Get pages for the intro cutscene */
  getIntroPages(context: IntroContext): CutscenePageData[] {
    return buildIntroPages(context);
  }

  /** Check if intro should be shown (hasn't been shown yet) */
  shouldShowIntro(): boolean {
    return !this.state.introShown;
  }

  /** Mark intro as shown */
  markIntroShown(skipped: boolean = false): void {
    this.state.introShown = true;
    this.state.shownAt = new Date().toISOString();
    this.state.wasSkipped = skipped;
  }

  /** Get state for persistence */
  getState(): Readonly<GameIntroState> {
    return this.state;
  }

  /** Restore state from save data */
  restoreState(saved: Partial<GameIntroState>): void {
    if (saved.introShown !== undefined) this.state.introShown = saved.introShown;
    if (saved.shownAt !== undefined) this.state.shownAt = saved.shownAt;
    if (saved.wasSkipped !== undefined) this.state.wasSkipped = saved.wasSkipped;
  }
}
