/**
 * Tests for QuestNotificationSystem
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GameEventBus } from '../../logic/GameEventBus';
import {
  QuestNotificationSystem,
  type AudioCuePlayer,
} from '../QuestNotificationSystem';

function makeNoopAudio(): AudioCuePlayer {
  return {
    playProgressChime: vi.fn(),
    playCompletionJingle: vi.fn(),
    playReminderChime: vi.fn(),
  };
}

describe("QuestNotificationSystem", () => {
  let eventBus: GameEventBus;
  let audio: ReturnType<typeof makeNoopAudio>;
  let system: QuestNotificationSystem;

  beforeEach(() => {
    vi.useFakeTimers();
    eventBus = new GameEventBus();
    audio = makeNoopAudio();
    system = new QuestNotificationSystem(eventBus, audio, {
      idleThresholdMs: 5000,
      idleCooldownMs: 3000,
      proximityCooldownMs: 2000,
      proximityRadius: 10,
      expirationWarningMs: 5000,
    });
  });

  afterEach(() => {
    system.dispose();
    eventBus.dispose();
    vi.useRealTimers();
  });

  // ── Settings ──────────────────────────────────────────────────────────────

  it("should expose default settings", () => {
    const s = system.getSettings();
    expect(s.enabled).toBe(true);
    expect(s.proximityEnabled).toBe(true);
    expect(s.idleEnabled).toBe(true);
    expect(s.audioEnabled).toBe(true);
  });

  it("should allow updating settings at runtime", () => {
    system.updateSettings({ audioEnabled: false });
    expect(system.getSettings().audioEnabled).toBe(false);
  });

  // ── Audio cues ────────────────────────────────────────────────────────────

  it("should play completion jingle on quest_completed", () => {
    eventBus.emit({ type: "quest_completed", questId: "q1" });
    // Called twice: once for completion, once for first_quest milestone
    expect(audio.playCompletionJingle).toHaveBeenCalled();
  });

  it("should play progress chime on utterance_quest_progress", () => {
    eventBus.emit({
      type: "utterance_quest_progress",
      questId: "q1",
      objectiveId: "obj1",
      current: 2,
      required: 5,
      percentage: 40,
    });
    expect(audio.playProgressChime).toHaveBeenCalledTimes(1);
  });

  it("should not play audio when audioEnabled is false", () => {
    system.updateSettings({ audioEnabled: false });
    eventBus.emit({ type: "quest_completed", questId: "q1" });
    expect(audio.playCompletionJingle).not.toHaveBeenCalled();
  });

  // ── Idle Reminders ────────────────────────────────────────────────────────

  it("should emit idle reminder after no progress", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "idle") events.push(e);
    });

    system.addActiveQuest({
      questId: "q1",
      questTitle: "Learn Greetings",
      objectives: [],
    });

    // Let interval fire (5s threshold, tick at 5s)
    vi.advanceTimersByTime(5100);

    expect(events.length).toBe(1);
    expect(events[0].reminderType).toBe("idle");
    expect(events[0].questTitle).toBe("Learn Greetings");
  });

  it("should not emit idle reminder if no active quests", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => events.push(e));

    vi.advanceTimersByTime(6000);
    expect(events.length).toBe(0);
  });

  it("should respect idle cooldown", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "idle") events.push(e);
    });

    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [],
    });

    // First idle reminder at 5s
    vi.advanceTimersByTime(5100);
    expect(events.length).toBe(1);

    // Next tick at 10s — cooldown is 3s, last reminder was ~5s, so 5s > 3s cooldown: fires
    vi.advanceTimersByTime(5000);
    expect(events.length).toBe(2);
  });

  it("should reset idle timer on progress events", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "idle") events.push(e);
    });

    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [],
    });

    // 4s — below threshold, no reminder
    vi.advanceTimersByTime(4000);
    expect(events.length).toBe(0);

    // Progress event resets idle timer
    eventBus.emit({ type: "item_collected", itemId: "i1", itemName: "Coin", quantity: 1 });

    // At 5s from start (1s after progress), tick fires but only 1s since progress — no reminder
    vi.advanceTimersByTime(1000);
    expect(events.length).toBe(0);

    // At 10s from start (6s after progress), tick fires — 6s > 5s threshold: reminder
    vi.advanceTimersByTime(5000);
    expect(events.length).toBe(1);
  });

  it("should not emit idle reminder when disabled", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => events.push(e));

    system.updateSettings({ idleEnabled: false });
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [],
    });

    vi.advanceTimersByTime(6000);
    expect(events.length).toBe(0);
  });

  // ── Proximity Reminders ───────────────────────────────────────────────────

  it("should emit proximity reminder when player is near objective", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "proximity") events.push(e);
    });

    system.setPlayerPositionSupplier(() => ({ x: 5, z: 5 }));
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Talk Quest",
      objectives: [
        {
          questId: "q1",
          questTitle: "Talk Quest",
          objectiveType: "talk_to_npc",
          targetName: "Elder Maria",
          position: { x: 8, z: 5 },
        },
      ],
    });

    // Let the internal interval fire once
    vi.advanceTimersByTime(5100);

    expect(events.length).toBe(1);
    expect(events[0].reminderType).toBe("proximity");
    expect(events[0].message).toContain("Talk to");
    expect(events[0].message).toContain("Elder Maria");
    expect(audio.playReminderChime).toHaveBeenCalled();
  });

  it("should not emit proximity reminder when player is far", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "proximity") events.push(e);
    });

    system.setPlayerPositionSupplier(() => ({ x: 100, z: 100 }));
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Talk Quest",
      objectives: [
        {
          questId: "q1",
          questTitle: "Talk Quest",
          objectiveType: "talk_to_npc",
          targetName: "Elder Maria",
          position: { x: 5, z: 5 },
        },
      ],
    });

    vi.advanceTimersByTime(5100);
    expect(events.length).toBe(0);
  });

  it("should respect proximity cooldown per quest", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "proximity") events.push(e);
    });

    system.setPlayerPositionSupplier(() => ({ x: 5, z: 5 }));
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [
        {
          questId: "q1",
          questTitle: "Test",
          objectiveType: "visit_location",
          targetName: "Market",
          position: { x: 5, z: 5 },
        },
      ],
    });

    // First tick fires proximity
    vi.advanceTimersByTime(5100);
    expect(events.length).toBe(1);

    // Still within cooldown (2s), no new reminder
    vi.advanceTimersByTime(1000);
    expect(events.length).toBe(1);

    // After cooldown passes (another 5s tick with cooldown elapsed)
    vi.advanceTimersByTime(4000);
    expect(events.length).toBe(2);
  });

  it("should use correct verb for visit_location objective", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "proximity") events.push(e);
    });

    system.setPlayerPositionSupplier(() => ({ x: 0, z: 0 }));
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Explore",
      objectives: [
        {
          questId: "q1",
          questTitle: "Explore",
          objectiveType: "visit_location",
          targetName: "Town Square",
          position: { x: 0, z: 0 },
        },
      ],
    });

    vi.advanceTimersByTime(5100);
    expect(events[0].message).toContain("Visit");
    expect(events[0].message).toContain("Town Square");
  });

  // ── Expiration ────────────────────────────────────────────────────────────

  it("should emit expiring warning before quest expires", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "expiring") events.push(e);
    });

    const now = Date.now();
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Timed Quest",
      expiresAt: now + 4000 + 5100, // expires after the first tick but within warning window
      objectives: [],
    });

    // First tick at 5s: timeLeft = 4000, within 5s warning window
    vi.advanceTimersByTime(5100);

    expect(events.length).toBe(1);
    expect(events[0].reminderType).toBe("expiring");
    expect(events[0].message).toContain("expires in");
  });

  it("should emit quest_expired when time runs out", () => {
    const expired: any[] = [];
    eventBus.on("quest_expired", (e) => expired.push(e));

    const now = Date.now();
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Expired Quest",
      expiresAt: now - 1000, // already expired
      objectives: [],
    });

    vi.advanceTimersByTime(5100);

    expect(expired.length).toBe(1);
    expect(expired[0].questId).toBe("q1");
    expect(expired[0].questTitle).toBe("Expired Quest");
  });

  it("should only warn about expiration once per quest", () => {
    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "expiring") events.push(e);
    });

    const now = Date.now();
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Timed",
      expiresAt: now + 8000, // within 5s warning, won't expire before second tick
      objectives: [],
    });

    vi.advanceTimersByTime(5100);
    expect(events.length).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(events.length).toBe(1); // no duplicate
  });

  // ── Milestones ────────────────────────────────────────────────────────────

  it("should emit first_quest milestone on first completion", () => {
    const milestones: any[] = [];
    eventBus.on("quest_milestone", (e) => milestones.push(e));

    eventBus.emit({ type: "quest_completed", questId: "q1" });

    expect(milestones.length).toBe(1);
    expect(milestones[0].milestoneType).toBe("first_quest");
    expect(milestones[0].label).toBe("First Quest Complete!");
  });

  it("should emit five_quests milestone after 5 completions", () => {
    const milestones: any[] = [];
    eventBus.on("quest_milestone", (e) => milestones.push(e));

    for (let i = 1; i <= 5; i++) {
      eventBus.emit({ type: "quest_completed", questId: `q${i}` });
    }

    const fiveQuestsMilestone = milestones.find(
      (m) => m.milestoneType === "five_quests"
    );
    expect(fiveQuestsMilestone).toBeDefined();
    expect(fiveQuestsMilestone.label).toBe("5 Quests Complete!");
  });

  it("should emit first_perfect milestone on perfect score", () => {
    const milestones: any[] = [];
    eventBus.on("quest_milestone", (e) => milestones.push(e));

    eventBus.emit({
      type: "utterance_quest_completed",
      questId: "q1",
      objectiveId: "obj1",
      finalScore: 100,
      xpAwarded: 50,
    });

    expect(milestones.length).toBe(1);
    expect(milestones[0].milestoneType).toBe("first_perfect");
  });

  it("should emit first_chain milestone when chain is recorded", () => {
    const milestones: any[] = [];
    eventBus.on("quest_milestone", (e) => milestones.push(e));

    system.recordChainCompleted();

    const chainMilestone = milestones.find(
      (m) => m.milestoneType === "first_chain"
    );
    expect(chainMilestone).toBeDefined();
    expect(chainMilestone.label).toBe("First Quest Chain Complete!");
  });

  it("should not emit same milestone twice", () => {
    const milestones: any[] = [];
    eventBus.on("quest_milestone", (e) => milestones.push(e));

    eventBus.emit({ type: "quest_completed", questId: "q1" });
    eventBus.emit({ type: "quest_completed", questId: "q2" });

    const firstQuestMilestones = milestones.filter(
      (m) => m.milestoneType === "first_quest"
    );
    expect(firstQuestMilestones.length).toBe(1);
  });

  it("should support loading milestone state", () => {
    const milestones: any[] = [];
    eventBus.on("quest_milestone", (e) => milestones.push(e));

    system.loadMilestoneState({ totalCompleted: 4 });
    eventBus.emit({ type: "quest_completed", questId: "q5" });

    expect(milestones.some((m) => m.milestoneType === "five_quests")).toBe(true);
  });

  // ── Quest Management ──────────────────────────────────────────────────────

  it("should remove quest on quest_completed", () => {
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [],
    });

    eventBus.emit({ type: "quest_completed", questId: "q1" });

    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "idle") events.push(e);
    });
    vi.advanceTimersByTime(6000);
    expect(events.length).toBe(0);
  });

  it("should remove quest on quest_failed", () => {
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [],
    });

    eventBus.emit({ type: "quest_failed", questId: "q1" });

    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "idle") events.push(e);
    });
    vi.advanceTimersByTime(6000);
    expect(events.length).toBe(0);
  });

  it("should remove quest on quest_abandoned", () => {
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [],
    });

    eventBus.emit({ type: "quest_abandoned", questId: "q1" });

    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => {
      if (e.reminderType === "idle") events.push(e);
    });
    vi.advanceTimersByTime(6000);
    expect(events.length).toBe(0);
  });

  // ── Notifications disabled ────────────────────────────────────────────────

  it("should not emit anything when system is disabled", () => {
    system.updateSettings({ enabled: false });

    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => events.push(e));
    eventBus.on("quest_expired", (e) => events.push(e));

    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      expiresAt: Date.now() - 1000,
      objectives: [],
    });

    system.setPlayerPositionSupplier(() => ({ x: 0, z: 0 }));
    vi.advanceTimersByTime(6000);

    expect(events.length).toBe(0);
  });

  // ── Dispose ───────────────────────────────────────────────────────────────

  it("should clean up on dispose", () => {
    system.addActiveQuest({
      questId: "q1",
      questTitle: "Test",
      objectives: [],
    });

    system.dispose();

    const events: any[] = [];
    eventBus.on("quest_reminder", (e) => events.push(e));
    vi.advanceTimersByTime(10000);
    expect(events.length).toBe(0);
  });
});
