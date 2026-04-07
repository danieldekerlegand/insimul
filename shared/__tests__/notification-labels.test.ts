import { describe, it, expect } from 'vitest';
import {
  NOTIFICATION_TEMPLATES,
  NOTIFICATION_LABEL_WORDS,
  getNotificationTitle,
  getNotificationDescription,
  type NotificationTranslationLookupFn,
} from '../language/notification-labels';
import { shouldTranslateUIKey } from '../language/ui-localization';
import type { CEFRLevel } from '../assessment/cefr-mapping';

// ── NOTIFICATION_TEMPLATES Registry ──────────────────────────────────────────

describe('NOTIFICATION_TEMPLATES', () => {
  it('contains all expected quest notification event types', () => {
    const expected = [
      'quest_accepted', 'quest_completed', 'quest_failed', 'quest_abandoned',
      'utterance_quest_progress', 'utterance_quest_completed',
      'quest_reminder', 'quest_expired',
      'quest_milestone', 'daily_quests_reset',
    ];
    for (const key of expected) {
      expect(NOTIFICATION_TEMPLATES[key], `missing template for ${key}`).toBeDefined();
      expect(NOTIFICATION_TEMPLATES[key].title).toBeTruthy();
    }
  });

  it('all entries have non-empty title strings', () => {
    for (const [key, template] of Object.entries(NOTIFICATION_TEMPLATES)) {
      expect(template.title, `${key} should have a title`).toBeTruthy();
    }
  });

  it('daily_quests_reset has a static description', () => {
    expect(NOTIFICATION_TEMPLATES.daily_quests_reset.description).toBe(
      'New daily quests are available!',
    );
  });
});

// ── NOTIFICATION_LABEL_WORDS ─────────────────────────────────────────────────

describe('NOTIFICATION_LABEL_WORDS', () => {
  it('is a deduplicated list', () => {
    const unique = new Set(NOTIFICATION_LABEL_WORDS);
    expect(unique.size).toBe(NOTIFICATION_LABEL_WORDS.length);
  });

  it('includes key notification phrases', () => {
    expect(NOTIFICATION_LABEL_WORDS).toContain('New Quest!');
    expect(NOTIFICATION_LABEL_WORDS).toContain('Quest Complete!');
    expect(NOTIFICATION_LABEL_WORDS).toContain('Quest Failed');
    expect(NOTIFICATION_LABEL_WORDS).toContain('Milestone!');
  });

  it('includes static descriptions', () => {
    expect(NOTIFICATION_LABEL_WORDS).toContain('New daily quests are available!');
  });
});

// ── getNotificationTitle ─────────────────────────────────────────────────────

describe('getNotificationTitle', () => {
  it('returns English title when no lookup is provided', () => {
    expect(getNotificationTitle('quest_completed', 'C1')).toBe('Quest Complete!');
  });

  it('returns English title at A1 even with lookup', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'Quest Complete!' ? 'Quete terminee!' : undefined;
    expect(getNotificationTitle('quest_completed', 'A1', lookup)).toBe('Quest Complete!');
  });

  it('returns English title at B2 (below C1 threshold)', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'Quest Complete!' ? 'Quete terminee!' : undefined;
    expect(getNotificationTitle('quest_completed', 'B2', lookup)).toBe('Quest Complete!');
  });

  it('returns translated title at C1 with lookup', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'Quest Complete!' ? 'Quete terminee!' : undefined;
    expect(getNotificationTitle('quest_completed', 'C1', lookup)).toBe('Quete terminee!');
  });

  it('returns translated title at C2 with lookup', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'New Quest!' ? 'Nouvelle Quete!' : undefined;
    expect(getNotificationTitle('quest_accepted', 'C2', lookup)).toBe('Nouvelle Quete!');
  });

  it('returns English when lookup returns undefined at C1', () => {
    const lookup: NotificationTranslationLookupFn = () => undefined;
    expect(getNotificationTitle('quest_completed', 'C1', lookup)).toBe('Quest Complete!');
  });

  it('returns eventType string for unknown event types', () => {
    expect(getNotificationTitle('unknown_event', 'C1')).toBe('unknown_event');
  });

  it('respects english_only mode at C1', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'Quest Complete!' ? 'Quete terminee!' : undefined;
    expect(getNotificationTitle('quest_completed', 'C1', lookup, 'english_only')).toBe('Quest Complete!');
  });

  it('respects maximum mode at A1', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'Quest Complete!' ? 'Quete terminee!' : undefined;
    expect(getNotificationTitle('quest_completed', 'A1', lookup, 'maximum')).toBe('Quete terminee!');
  });
});

// ── getNotificationDescription ───────────────────────────────────────────────

describe('getNotificationDescription', () => {
  it('returns dynamic description as-is for events without static templates', () => {
    const desc = 'Quest abc123 completed';
    expect(getNotificationDescription('quest_completed', desc, 'C1')).toBe(desc);
  });

  it('returns static description in English below C1', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'New daily quests are available!' ? 'De nouvelles quetes sont disponibles!' : undefined;
    expect(
      getNotificationDescription('daily_quests_reset', '', 'B2', lookup),
    ).toBe('New daily quests are available!');
  });

  it('returns translated static description at C1', () => {
    const lookup: NotificationTranslationLookupFn = (eng) =>
      eng === 'New daily quests are available!' ? 'De nouvelles quetes sont disponibles!' : undefined;
    expect(
      getNotificationDescription('daily_quests_reset', '', 'C1', lookup),
    ).toBe('De nouvelles quetes sont disponibles!');
  });

  it('returns English static description when lookup returns undefined at C1', () => {
    const lookup: NotificationTranslationLookupFn = () => undefined;
    expect(
      getNotificationDescription('daily_quests_reset', '', 'C1', lookup),
    ).toBe('New daily quests are available!');
  });

  it('dynamic descriptions pass through regardless of CEFR level', () => {
    const desc = '75% complete (3/4)';
    const lookup: NotificationTranslationLookupFn = () => 'translated';
    // utterance_quest_progress has no static description, so dynamic desc passes through
    expect(getNotificationDescription('utterance_quest_progress', desc, 'C2', lookup)).toBe(desc);
  });
});

// ── CEFR Namespace Gating ────────────────────────────────────────────────────

describe('notification namespace gating', () => {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  it('notifications namespace is NOT translated below C1', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as CEFRLevel[]) {
      expect(
        shouldTranslateUIKey('notifications.title', level),
        `notifications should not translate at ${level}`,
      ).toBe(false);
    }
  });

  it('notifications namespace IS translated at C1 and C2', () => {
    for (const level of ['C1', 'C2'] as CEFRLevel[]) {
      expect(
        shouldTranslateUIKey('notifications.title', level),
        `notifications should translate at ${level}`,
      ).toBe(true);
    }
  });

  it('notifications.description also gated at C1+', () => {
    expect(shouldTranslateUIKey('notifications.description', 'B2')).toBe(false);
    expect(shouldTranslateUIKey('notifications.description', 'C1')).toBe(true);
  });

  it('english_only mode blocks translation at all levels', () => {
    for (const level of levels) {
      expect(shouldTranslateUIKey('notifications.title', level, 'english_only')).toBe(false);
    }
  });

  it('maximum mode enables translation at all levels', () => {
    for (const level of levels) {
      expect(shouldTranslateUIKey('notifications.title', level, 'maximum')).toBe(true);
    }
  });
});

// ── Integration: progressive translation behavior ────────────────────────────

describe('progressive notification translation integration', () => {
  const frenchLookup: NotificationTranslationLookupFn = (eng) => {
    const map: Record<string, string> = {
      'New Quest!': 'Nouvelle Quete!',
      'Quest Complete!': 'Quete terminee!',
      'Quest Failed': 'Quete echouee',
      'Quest Progress': 'Progression de la quete',
      'Milestone!': 'Jalon!',
      'Daily Quests': 'Quetes quotidiennes',
      'New daily quests are available!': 'De nouvelles quetes sont disponibles!',
    };
    return map[eng];
  };

  it('A1-B2: all notifications remain in English', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as CEFRLevel[]) {
      expect(getNotificationTitle('quest_accepted', level, frenchLookup)).toBe('New Quest!');
      expect(getNotificationTitle('quest_completed', level, frenchLookup)).toBe('Quest Complete!');
      expect(getNotificationTitle('quest_failed', level, frenchLookup)).toBe('Quest Failed');
    }
  });

  it('C1: notification titles translate to French', () => {
    expect(getNotificationTitle('quest_accepted', 'C1', frenchLookup)).toBe('Nouvelle Quete!');
    expect(getNotificationTitle('quest_completed', 'C1', frenchLookup)).toBe('Quete terminee!');
    expect(getNotificationTitle('quest_failed', 'C1', frenchLookup)).toBe('Quete echouee');
    expect(getNotificationTitle('quest_milestone', 'C1', frenchLookup)).toBe('Jalon!');
  });

  it('C2: notification titles translate to French', () => {
    expect(getNotificationTitle('quest_accepted', 'C2', frenchLookup)).toBe('Nouvelle Quete!');
    expect(getNotificationTitle('daily_quests_reset', 'C2', frenchLookup)).toBe('Quetes quotidiennes');
  });

  it('C1: static descriptions translate, dynamic descriptions pass through', () => {
    // Static description (daily_quests_reset)
    expect(
      getNotificationDescription('daily_quests_reset', '', 'C1', frenchLookup),
    ).toBe('De nouvelles quetes sont disponibles!');

    // Dynamic description (quest_completed — no static template)
    const dynamicDesc = 'Quest quest_123 completed';
    expect(
      getNotificationDescription('quest_completed', dynamicDesc, 'C1', frenchLookup),
    ).toBe(dynamicDesc);
  });
});
