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
        ItemUnequipped
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
