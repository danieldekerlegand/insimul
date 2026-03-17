using System;
using System.Collections.Generic;
using UnityEngine;

namespace Insimul.Systems
{
    /// <summary>
    /// All game event types matching GameEventBus.ts from the Babylon.js source.
    /// </summary>
    public enum GameEventType
    {
        ItemCollected,
        EnemyDefeated,
        LocationVisited,
        NpcTalked,
        ItemDelivered,
        VocabularyUsed,
        ConversationTurn,
        QuestAccepted,
        QuestCompleted,
        CombatAction,
        ReputationChanged,
        ItemCrafted,
        LocationDiscovered,
        SettlementEntered,
        PuzzleSolved,
        ItemRemoved,
        ItemUsed,
        ItemDropped,
        ItemEquipped,
        ItemUnequipped,
        UtteranceEvaluated,
        UtteranceQuestProgress,
        UtteranceQuestCompleted,
        AmbientConversationStarted,
        AmbientConversationEnded,
        VocabularyOverheard,
        StateCreatedTruth,
        StateExpiredTruth,
        RomanceAction,
        RomanceStageChanged,
        NpcVolitionAction,
        PuzzleFailed,
        QuestFailed,
        QuestAbandoned,
        ConversationOverheard,
        CreateTruth,
        // Assessment / onboarding events
        AssessmentStarted,
        AssessmentPhaseStarted,
        AssessmentPhaseCompleted,
        AssessmentTierChange,
        AssessmentCompleted,
        OnboardingStepStarted,
        OnboardingStepCompleted,
        OnboardingCompleted,
        PeriodicAssessmentTriggered,
        AssessmentConversationQuestStart,
        AssessmentConversationCompleted,
        // Visual vocabulary quest events
        VisualVocabPrompted,
        VisualVocabAnswered,
        // Follow directions quest events
        DirectionStepCompleted,
        // NPC exam events
        NpcExamStarted,
        NpcExamListeningReady,
        NpcExamQuestionAnswered,
        NpcExamCompleted
    }

    /// <summary>
    /// Optional taxonomy fields carried on item events for Prolog assertion.
    /// </summary>
    [System.Serializable]
    public class ItemTaxonomy
    {
        public string category;
        public string material;
        public string baseType;
        public string rarity;
        public string itemType;
    }

    // ── Event Data Classes ───────────────────────────────────────────────────

    /// <summary>
    /// Abstract base class for all game events.
    /// </summary>
    public abstract class GameEvent
    {
        public abstract GameEventType EventType { get; }
    }

    public class ItemCollectedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemCollected;
        public string itemId;
        public string itemName;
        public int quantity;
        public ItemTaxonomy taxonomy;
    }

    public class EnemyDefeatedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.EnemyDefeated;
        public string entityId;
        public string enemyType;
    }

    public class LocationVisitedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.LocationVisited;
        public string locationId;
        public string locationName;
    }

    public class NpcTalkedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.NpcTalked;
        public string npcId;
        public string npcName;
        public int turnCount;
    }

    public class ItemDeliveredEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemDelivered;
        public string npcId;
        public string itemId;
        public string itemName;
    }

    public class VocabularyUsedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.VocabularyUsed;
        public string word;
        public bool correct;
    }

    public class ConversationTurnEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ConversationTurn;
        public string npcId;
        public string[] keywords;
    }

    public class QuestAcceptedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.QuestAccepted;
        public string questId;
        public string questTitle;
    }

    public class QuestCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.QuestCompleted;
        public string questId;
    }

    public class CombatActionEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.CombatAction;
        public string actionType;
        public string targetId;
    }

    public class ReputationChangedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ReputationChanged;
        public string factionId;
        public int delta;
    }

    public class ItemCraftedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemCrafted;
        public string itemId;
        public string itemName;
        public int quantity;
        public ItemTaxonomy taxonomy;
    }

    public class LocationDiscoveredEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.LocationDiscovered;
        public string locationId;
        public string locationName;
    }

    public class SettlementEnteredEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.SettlementEntered;
        public string settlementId;
        public string settlementName;
    }

    public class PuzzleSolvedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.PuzzleSolved;
        public string puzzleId;
    }

    public class ItemRemovedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemRemoved;
        public string itemId;
        public string itemName;
        public int quantity;
    }

    public class ItemUsedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemUsed;
        public string itemId;
        public string itemName;
    }

    public class ItemDroppedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemDropped;
        public string itemId;
        public string itemName;
        public int quantity;
    }

    public class ItemEquippedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemEquipped;
        public string itemId;
        public string itemName;
        public string slot;
    }

    public class ItemUnequippedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ItemUnequipped;
        public string itemId;
        public string itemName;
        public string slot;
    }

    public class UtteranceEvaluatedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.UtteranceEvaluated;
        public string objectiveId;
        public string input;
        public float score;
        public bool passed;
        public string feedback;
    }

    public class UtteranceQuestProgressEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.UtteranceQuestProgress;
        public string questId;
        public string objectiveId;
        public int current;
        public int required;
        public float percentage;
    }

    public class UtteranceQuestCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.UtteranceQuestCompleted;
        public string questId;
        public string objectiveId;
        public float finalScore;
        public int xpAwarded;
    }

    public class AmbientConversationStartedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AmbientConversationStarted;
        public string conversationId;
        public string[] participants;
        public string locationId;
        public string topic;
    }

    public class AmbientConversationEndedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AmbientConversationEnded;
        public string conversationId;
        public string[] participants;
        public int durationMs;
        public int vocabularyCount;
    }

    public class VocabularyOverheardEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.VocabularyOverheard;
        public string word;
        public string translation;
        public string language;
        public string context;
        public string conversationId;
        public string speakerNpcId;
    }

    public class StateCreatedTruthEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.StateCreatedTruth;
        public string characterId;
        public string stateType;
        public string cause;
        public string title;
        public string content;
        public string entryType;
    }

    public class StateExpiredTruthEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.StateExpiredTruth;
        public string characterId;
        public string stateType;
        public string cause;
        public string title;
        public string content;
        public string entryType;
    }

    public class RomanceActionEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.RomanceAction;
        public string npcId;
        public string npcName;
        public string actionType;
        public bool accepted;
        public string stageChange;
    }

    public class RomanceStageChangedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.RomanceStageChanged;
        public string npcId;
        public string npcName;
        public string fromStage;
        public string toStage;
    }

    public class NpcVolitionActionEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.NpcVolitionAction;
        public string npcId;
        public string actionId;
        public string targetId;
        public float score;
    }

    public class PuzzleFailedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.PuzzleFailed;
        public string puzzleId;
        public string puzzleType;
        public int attempts;
    }

    public class QuestFailedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.QuestFailed;
        public string questId;
    }

    public class QuestAbandonedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.QuestAbandoned;
        public string questId;
    }

    public class ConversationOverheardEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.ConversationOverheard;
        public string npcId1;
        public string npcId2;
        public string topic;
        public string languageUsed;
    }

    public class CreateTruthEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.CreateTruth;
        public string characterId;
        public string title;
        public string content;
        public string entryType;
        public string category;
    }

    // ── Assessment / Onboarding Events ───────────────────────────────────────

    public class AssessmentStartedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AssessmentStarted;
        public string sessionId;
        public string instrumentId;
        public string phase;
        public string participantId;
        public string assessmentType;
        public string playerId;
    }

    public class AssessmentPhaseStartedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AssessmentPhaseStarted;
        public string sessionId;
        public string instrumentId;
        public string phase;
        public string phaseId;
        public int phaseIndex;
    }

    public class AssessmentPhaseCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AssessmentPhaseCompleted;
        public string sessionId;
        public string instrumentId;
        public string phase;
        public float score;
        public string phaseId;
        public float maxScore;
    }

    public class AssessmentTierChangeEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AssessmentTierChange;
        public string participantId;
        public string instrumentId;
        public string fromTier;
        public string toTier;
        public float score;
    }

    public class AssessmentCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AssessmentCompleted;
        public string sessionId;
        public string instrumentId;
        public float totalScore;
        public float gainScore;
        public float totalMaxScore;
        public string cefrLevel;
    }

    public class OnboardingStepStartedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.OnboardingStepStarted;
        public string stepId;
        public int stepIndex;
        public int totalSteps;
    }

    public class OnboardingStepCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.OnboardingStepCompleted;
        public string stepId;
        public int stepIndex;
        public int totalSteps;
        public int durationMs;
    }

    public class OnboardingCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.OnboardingCompleted;
        public int totalSteps;
        public int totalDurationMs;
    }

    public class PeriodicAssessmentTriggeredEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.PeriodicAssessmentTriggered;
        public int level;
        public string tier;
    }

    public class AssessmentConversationQuestStartEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AssessmentConversationQuestStart;
        public string phaseId;
        public string[] topics;
        public int minExchanges;
        public int maxExchanges;
    }

    public class AssessmentConversationCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.AssessmentConversationCompleted;
        public string npcId;
        public float score;
    }

    // ── Visual Vocabulary / Follow Directions Events ────────────────────────

    public class VisualVocabPromptedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.VisualVocabPrompted;
        public string targetId;
        public string questId;
        public string objectiveId;
        public bool isActivity;
    }

    public class VisualVocabAnsweredEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.VisualVocabAnswered;
        public string targetId;
        public string questId;
        public bool passed;
        public float score;
        public string playerAnswer;
    }

    public class DirectionStepCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.DirectionStepCompleted;
        public string questId;
        public string objectiveId;
        public int stepIndex;
        public int stepsCompleted;
        public int stepsRequired;
    }

    // ── NPC Exam Events ──────────────────────────────────────────────────────

    public class NpcExamStartedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.NpcExamStarted;
        public string examId;
        public string npcId;
        public string npcName;
        public string businessType;
        public string examType;
        public string category;
        public int questionCount;
    }

    [System.Serializable]
    public class NpcExamQuestion
    {
        public string id;
        public string questionText;
        public int maxPoints;
    }

    public class NpcExamListeningReadyEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.NpcExamListeningReady;
        public string examId;
        public string audioUrl;
        public string passage;
        public NpcExamQuestion[] questions;
        public int maxReplays;
    }

    public class NpcExamQuestionAnsweredEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.NpcExamQuestionAnswered;
        public string examId;
        public string questionId;
        public bool correct;
        public float score;
        public int maxPoints;
    }

    public class NpcExamCompletedEvent : GameEvent
    {
        public override GameEventType EventType => GameEventType.NpcExamCompleted;
        public string examId;
        public string npcId;
        public float score;
        public float maxScore;
        public float percentage;
        public bool passed;
        public float totalScore;
        public float totalMaxPoints;
        public string cefrLevel;
        public string category;
    }

    // ── Event Bus ────────────────────────────────────────────────────────────

    /// <summary>
    /// Centralized typed event system that bridges player actions to quest tracking
    /// and Prolog fact assertion. Ported from GameEventBus.ts (Babylon.js source).
    ///
    /// Usage:
    ///   var unsub = GameEventBus.Instance.On&lt;ItemCollectedEvent&gt;(e => Debug.Log(e.itemName));
    ///   GameEventBus.Instance.Emit(new ItemCollectedEvent { itemId = "...", itemName = "Sword", quantity = 1 });
    ///   unsub(); // unsubscribe
    /// </summary>
    public class GameEventBus
    {
        private static GameEventBus _instance;
        public static GameEventBus Instance => _instance ??= new GameEventBus();

        private readonly Dictionary<GameEventType, List<Action<GameEvent>>> _handlers = new();
        private readonly List<Action<GameEvent>> _globalHandlers = new();

        /// <summary>
        /// Subscribe to a specific event type via its concrete subclass.
        /// Returns an Action that unsubscribes when invoked.
        /// </summary>
        public Action On<T>(Action<T> handler) where T : GameEvent
        {
            // Determine event type from a temporary instance
            var sample = Activator.CreateInstance<T>();
            var eventType = sample.EventType;

            Action<GameEvent> wrapped = (e) =>
            {
                if (e is T typed)
                {
                    try { handler(typed); }
                    catch (Exception ex)
                    {
                        Debug.LogError($"[GameEventBus] Error in handler for {eventType}: {ex}");
                    }
                }
            };

            if (!_handlers.ContainsKey(eventType))
                _handlers[eventType] = new List<Action<GameEvent>>();

            _handlers[eventType].Add(wrapped);

            return () => _handlers[eventType]?.Remove(wrapped);
        }

        /// <summary>
        /// Subscribe to all events regardless of type.
        /// Returns an Action that unsubscribes when invoked.
        /// </summary>
        public Action OnAny(Action<GameEvent> handler)
        {
            _globalHandlers.Add(handler);
            return () => _globalHandlers.Remove(handler);
        }

        /// <summary>
        /// Emit an event to all matching handlers and all global handlers.
        /// </summary>
        public void Emit(GameEvent gameEvent)
        {
            // Type-specific handlers
            if (_handlers.TryGetValue(gameEvent.EventType, out var list))
            {
                for (int i = list.Count - 1; i >= 0; i--)
                {
                    try { list[i]?.Invoke(gameEvent); }
                    catch (Exception ex)
                    {
                        Debug.LogError($"[GameEventBus] Error in handler for {gameEvent.EventType}: {ex}");
                    }
                }
            }

            // Global handlers
            for (int i = _globalHandlers.Count - 1; i >= 0; i--)
            {
                try { _globalHandlers[i]?.Invoke(gameEvent); }
                catch (Exception ex)
                {
                    Debug.LogError($"[GameEventBus] Error in global handler: {ex}");
                }
            }
        }

        /// <summary>
        /// Remove all handlers.
        /// </summary>
        public void Dispose()
        {
            _handlers.Clear();
            _globalHandlers.Clear();
        }
    }
}
