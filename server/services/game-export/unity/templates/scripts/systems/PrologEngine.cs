using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    /// <summary>
    /// Current game state snapshot for Prolog fact synchronization.
    /// </summary>
    [System.Serializable]
    public struct PrologGameState
    {
        public string playerCharacterId;
        public string playerName;
        public float playerEnergy;
        public Vector3? playerPosition;
        public string currentSettlement;
        public List<string> nearbyNPCs;
    }

    /// <summary>
    /// Result of an action prerequisite check.
    /// </summary>
    public struct ActionCheckResult
    {
        public bool allowed;
        public string reason;
    }

    /// <summary>
    /// Stub Prolog engine for Unity exports.
    /// Mirrors GamePrologEngine.ts from the Babylon.js source.
    ///
    /// Since Unity does not ship a native Prolog runtime, this implementation
    /// stores the knowledge base as a string and provides basic fact lookup
    /// by scanning asserted facts. For full Prolog unification and rule
    /// evaluation, integrate a C# Prolog library (e.g., CSProlog) and
    /// replace the stub query methods.
    /// </summary>
    public class PrologEngine : MonoBehaviour
    {
        private bool _initialized;
        private readonly HashSet<string> _facts = new();
        private readonly StringBuilder _knowledgeBase = new();
        private readonly List<string> _activeQuestIds = new();

        /// <summary>Fired when Prolog determines a quest is complete.</summary>
        public event Action<string> OnQuestCompleted;

        public bool IsInitialized => _initialized;
        public int FactCount => _facts.Count;

        // ── Initialization ────────────────────────────────────────────────────

        /// <summary>
        /// Initialize the engine with world data.
        /// Call once at game start after data is loaded.
        /// </summary>
        public void Initialize(InsimulWorldIR data)
        {
            _facts.Clear();
            _knowledgeBase.Clear();

            // Load pre-generated Prolog content if available
            if (!string.IsNullOrEmpty(data.prologContent))
            {
                _knowledgeBase.AppendLine(data.prologContent);
                ParseFactsFromContent(data.prologContent);
            }

            // Assert character facts
            if (data.characters != null)
            {
                foreach (var ch in data.characters)
                {
                    var charId = Sanitize($"{ch.firstName}_{ch.lastName}_{ch.id}");
                    AssertFact($"person({charId})");
                    if (!string.IsNullOrEmpty(ch.firstName))
                        AssertFact($"name({charId}, '{Escape(ch.firstName + " " + (ch.lastName ?? ""))}')");
                    if (ch.age > 0)
                        AssertFact($"age({charId}, {ch.age})");
                    if (!string.IsNullOrEmpty(ch.occupation))
                        AssertFact($"occupation({charId}, {Sanitize(ch.occupation)})");
                    if (!string.IsNullOrEmpty(ch.gender))
                        AssertFact($"gender({charId}, {Sanitize(ch.gender)})");
                }
            }

            // Assert settlement facts
            if (data.settlements != null)
            {
                foreach (var s in data.settlements)
                {
                    var sId = Sanitize(!string.IsNullOrEmpty(s.name) ? s.name : s.id);
                    AssertFact($"settlement({sId})");
                    if (!string.IsNullOrEmpty(s.type))
                        AssertFact($"settlement_type({sId}, {Sanitize(s.type)})");
                }
            }

            // Load Prolog content from rules, actions, quests
            LoadContentList(data.systems?.rules, r => r.prologContent);
            LoadContentList(data.systems?.actions, a => a.prologContent);
            LoadContentList(data.systems?.quests, q => q.prologContent);
            LoadContentList(data.systems?.baseRules, r => r.prologContent);

            _initialized = true;
            Debug.Log($"[Insimul] PrologEngine initialized with {_facts.Count} facts");
        }

        /// <summary>
        /// Initialize inventory items as Prolog facts.
        /// Call after Initialize() to sync existing inventory.
        /// </summary>
        public void InitializeInventory(List<InventorySlot> items)
        {
            if (!_initialized || items == null) return;

            foreach (var item in items)
            {
                var name = Sanitize(item.name);
                AssertFact($"has(player, {name})");
                if (item.type != default)
                    AssertFact($"item_type({name}, {Sanitize(item.type.ToString())})");
                if (item.value > 0)
                    AssertFact($"item_value({name}, {item.value})");
            }

            Debug.Log($"[Insimul] PrologEngine initialized {items.Count} inventory items as facts");
        }

        // ── Game State ────────────────────────────────────────────────────────

        /// <summary>
        /// Update game state facts. Call on each state change (position, energy, nearby NPCs).
        /// </summary>
        public void UpdateGameState(PrologGameState state)
        {
            if (!_initialized) return;

            var playerId = Sanitize(state.playerCharacterId);

            // Retract old dynamic state
            RetractPattern("energy", playerId);
            RetractPattern("at_location", playerId);
            RetractPattern("nearby_npc", playerId);

            // Assert current state
            AssertFact($"energy({playerId}, {state.playerEnergy:F1})");

            if (!string.IsNullOrEmpty(state.currentSettlement))
                AssertFact($"at_location({playerId}, {Sanitize(state.currentSettlement)})");

            if (state.nearbyNPCs != null)
            {
                foreach (var npcId in state.nearbyNPCs)
                    AssertFact($"nearby_npc({playerId}, {Sanitize(npcId)})");
            }
        }

        // ── Action Checks ─────────────────────────────────────────────────────

        /// <summary>
        /// Check if an action's Prolog prerequisites are met.
        /// Stub: checks for a can_perform fact in the knowledge base.
        /// </summary>
        public ActionCheckResult CanPerformAction(string actionId, string actorId, string targetId = null)
        {
            if (!_initialized)
                return new ActionCheckResult { allowed = true };

            var actionAtom = Sanitize(actionId);
            var actorAtom = Sanitize(actorId);

            string query;
            if (!string.IsNullOrEmpty(targetId))
                query = $"can_perform({actorAtom}, {actionAtom}, {Sanitize(targetId)})";
            else
                query = $"can_perform({actorAtom}, {actionAtom})";

            if (HasFact(query))
                return new ActionCheckResult { allowed = true };

            // If no can_perform fact exists at all for this action, allow by default
            // (graceful degradation — same as TypeScript source)
            if (!HasAnyFactWithPrefix($"can_perform("))
                return new ActionCheckResult { allowed = true };

            return new ActionCheckResult
            {
                allowed = false,
                reason = $"Prerequisites not met for action: {actionId}"
            };
        }

        // ── Quest Checks ──────────────────────────────────────────────────────

        /// <summary>
        /// Check if a quest is available to the player.
        /// </summary>
        public bool IsQuestAvailable(string questId, string playerId)
        {
            if (!_initialized) return true;

            var fact = $"quest_available({Sanitize(playerId)}, {Sanitize(questId)})";
            if (HasFact(fact)) return true;

            // If no quest_available facts exist, allow by default
            if (!HasAnyFactWithPrefix("quest_available(")) return true;

            return false;
        }

        /// <summary>
        /// Check if a quest is complete for the player.
        /// </summary>
        public bool IsQuestComplete(string questId, string playerId)
        {
            if (!_initialized) return false;
            return HasFact($"quest_complete({Sanitize(playerId)}, {Sanitize(questId)})");
        }

        /// <summary>
        /// Register active quest IDs for re-evaluation.
        /// </summary>
        public void SetActiveQuests(List<string> questIds)
        {
            _activeQuestIds.Clear();
            if (questIds != null)
                _activeQuestIds.AddRange(questIds);
        }

        // ── Rule Queries ──────────────────────────────────────────────────────

        /// <summary>
        /// Find all applicable rules for an actor.
        /// Stub: scans facts for rule_applies predicates matching the actor.
        /// </summary>
        public List<string> GetApplicableRules(string actorId)
        {
            if (!_initialized) return new List<string>();

            var actorAtom = Sanitize(actorId);
            var prefix = $"rule_applies(";
            var results = new List<string>();

            foreach (var fact in _facts)
            {
                if (!fact.StartsWith(prefix)) continue;
                // rule_applies(RuleName, actorId, _)
                if (fact.Contains($", {actorAtom},") || fact.Contains($", {actorAtom})"))
                {
                    // Extract the rule name (first argument)
                    var inner = fact.Substring(prefix.Length);
                    var commaIdx = inner.IndexOf(',');
                    if (commaIdx > 0)
                        results.Add(inner.Substring(0, commaIdx).Trim());
                }
            }

            return results;
        }

        // ── Fact Management ───────────────────────────────────────────────────

        /// <summary>
        /// Assert a new fact into the knowledge base.
        /// </summary>
        public void AssertFact(string fact)
        {
            var normalized = NormalizeFact(fact);
            _facts.Add(normalized);
            _knowledgeBase.AppendLine($"{normalized}.");
        }

        /// <summary>
        /// Retract a fact from the knowledge base.
        /// </summary>
        public void RetractFact(string fact)
        {
            var normalized = NormalizeFact(fact);
            _facts.Remove(normalized);
        }

        /// <summary>
        /// Run a query against the fact store.
        /// Stub: performs exact-match lookup against asserted facts.
        /// For full Prolog unification, integrate a C# Prolog library.
        /// </summary>
        public bool Query(string goal)
        {
            if (!_initialized) return false;
            return HasFact(NormalizeFact(goal));
        }

        /// <summary>
        /// Export the current knowledge base as a Prolog text string.
        /// </summary>
        public string ExportKnowledgeBase()
        {
            var sb = new StringBuilder();
            sb.AppendLine("%% Insimul Prolog Knowledge Base Export");
            sb.AppendLine($"%% Exported at: {DateTime.UtcNow:O}");
            sb.AppendLine($"%% Facts: {_facts.Count}");
            sb.AppendLine();

            foreach (var fact in _facts.OrderBy(f => f))
                sb.AppendLine($"{fact}.");

            return sb.ToString();
        }

        /// <summary>
        /// Dispose the engine and clear all state.
        /// </summary>
        public void Dispose()
        {
            _facts.Clear();
            _knowledgeBase.Clear();
            _activeQuestIds.Clear();
            _initialized = false;
            Debug.Log("[Insimul] PrologEngine disposed");
        }

        private void OnDestroy()
        {
            Dispose();
        }

        // ── Event Handling ────────────────────────────────────────────────────

        /// <summary>
        /// Handle a game event by asserting/retracting Prolog facts.
        /// Call this from your event bus or game manager.
        /// </summary>
        public void HandleItemCollected(string itemName, int quantity)
        {
            if (!_initialized) return;
            var name = Sanitize(itemName);
            AssertFact($"collected(player, {name}, {quantity})");
            AssertFact($"has(player, {name})");
            ReevaluateQuests();
        }

        public void HandleItemRemoved(string itemName)
        {
            if (!_initialized) return;
            RetractFact($"has(player, {Sanitize(itemName)})");
            ReevaluateQuests();
        }

        public void HandleItemEquipped(string itemName, string slot)
        {
            if (!_initialized) return;
            AssertFact($"equipped(player, {Sanitize(itemName)}, {Sanitize(slot)})");
        }

        public void HandleItemUnequipped(string itemName, string slot)
        {
            if (!_initialized) return;
            RetractFact($"equipped(player, {Sanitize(itemName)}, {Sanitize(slot)})");
        }

        public void HandleLocationVisited(string locationId)
        {
            if (!_initialized) return;
            AssertFact($"visited(player, {Sanitize(locationId)})");
            ReevaluateQuests();
        }

        public void HandleNPCTalkedTo(string npcId, int turnCount)
        {
            if (!_initialized) return;
            AssertFact($"talked_to(player, {Sanitize(npcId)}, {turnCount})");
            ReevaluateQuests();
        }

        public void HandleEnemyDefeated(string enemyType)
        {
            if (!_initialized) return;
            AssertFact($"defeated(player, {Sanitize(enemyType)})");
            ReevaluateQuests();
        }

        public void HandleQuestAccepted(string questId)
        {
            if (!_initialized) return;
            AssertFact($"quest_active(player, {Sanitize(questId)})");
        }

        public void HandleQuestCompleted(string questId)
        {
            if (!_initialized) return;
            AssertFact($"quest_completed(player, {Sanitize(questId)})");
        }

        // ── Internal Helpers ──────────────────────────────────────────────────

        private void ReevaluateQuests()
        {
            foreach (var questId in _activeQuestIds)
            {
                if (IsQuestComplete(questId, "player"))
                    OnQuestCompleted?.Invoke(questId);
            }
        }

        private bool HasFact(string fact)
        {
            return _facts.Contains(fact);
        }

        private bool HasAnyFactWithPrefix(string prefix)
        {
            foreach (var fact in _facts)
            {
                if (fact.StartsWith(prefix))
                    return true;
            }
            return false;
        }

        private void RetractPattern(string predicate, string firstArg, string secondArg = null)
        {
            var prefix = secondArg != null
                ? $"{predicate}({firstArg}, {secondArg}"
                : $"{predicate}({firstArg}";

            _facts.RemoveWhere(f => f.StartsWith(prefix));
        }

        private void ParseFactsFromContent(string content)
        {
            if (string.IsNullOrEmpty(content)) return;

            foreach (var line in content.Split('\n'))
            {
                var trimmed = line.Trim();
                // Skip comments and empty lines
                if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("%")) continue;
                // Skip rules (lines containing :-)
                if (trimmed.Contains(":-")) continue;
                // Simple facts end with a period
                if (trimmed.EndsWith("."))
                {
                    var fact = trimmed.Substring(0, trimmed.Length - 1).Trim();
                    if (!string.IsNullOrEmpty(fact))
                        _facts.Add(fact);
                }
            }
        }

        private void LoadContentList<T>(List<T> items, Func<T, string> getContent)
        {
            if (items == null) return;
            foreach (var item in items)
            {
                var content = getContent(item);
                if (!string.IsNullOrEmpty(content))
                {
                    _knowledgeBase.AppendLine(content);
                    ParseFactsFromContent(content);
                }
            }
        }

        private static string NormalizeFact(string fact)
        {
            var trimmed = fact.Trim();
            if (trimmed.EndsWith("."))
                trimmed = trimmed.Substring(0, trimmed.Length - 1).Trim();
            return trimmed;
        }

        private static string Sanitize(string str)
        {
            if (string.IsNullOrEmpty(str)) return "_empty";
            var result = str.ToLowerInvariant();
            result = Regex.Replace(result, @"[^a-z0-9_]", "_");
            result = Regex.Replace(result, @"^([0-9])", "_$1");
            result = Regex.Replace(result, @"_+", "_");
            result = result.TrimEnd('_');
            return string.IsNullOrEmpty(result) ? "_empty" : result;
        }

        private static string Escape(string str)
        {
            return str.Replace("\\", "\\\\").Replace("'", "\\'");
        }
    }
}
