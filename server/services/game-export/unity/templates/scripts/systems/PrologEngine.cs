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
        private readonly Dictionary<string, int> _itemQuantities = new();

        private Action<string, int> onObjectiveCompleted;
        private HashSet<string> completedObjectives = new HashSet<string>();
        private HashSet<string> completedQuests = new HashSet<string>();

        /// <summary>Fired when Prolog determines a quest is complete.</summary>
        public event Action<string> OnQuestCompleted;

        public bool IsInitialized => _initialized;
        public int FactCount => _facts.Count;

        private Action _eventBusUnsubscribe;
        private GameEventBus _eventBusRef;

        public void SetOnObjectiveCompleted(Action<string, int> callback)
        {
            onObjectiveCompleted = callback;
        }

        // ── Initialization ────────────────────────────────────────────────────

        /// <summary>
        /// Initialize the engine with individual data arrays (matching GamePrologEngine.ts signature).
        /// Call once at game start after data is loaded.
        /// </summary>
        public void Initialize(
            InsimulCharacterData[] characters,
            InsimulSettlementData[] settlements,
            InsimulRuleData[] rules,
            InsimulActionData[] actions,
            InsimulQuestData[] quests,
            InsimulTruthData[] truths,
            string content = null)
        {
            _facts.Clear();
            _knowledgeBase.Clear();
            _itemQuantities.Clear();

            // Load pre-generated Prolog content if available
            if (!string.IsNullOrEmpty(content))
            {
                _knowledgeBase.AppendLine(content);
                ParseFactsFromContent(content);
            }

            // Assert character facts
            if (characters != null)
            {
                foreach (var ch in characters)
                {
                    var charId = Sanitize($"{ch.firstName}_{ch.lastName}_{ch.id}");
                    AssertFact($"person({charId})");
                    if (!string.IsNullOrEmpty(ch.firstName))
                        AssertFact($"name({charId}, '{Escape(ch.firstName + " " + (ch.lastName ?? ""))}')");
                    if (ch.birthYear > 0)
                        AssertFact($"birth_year({charId}, {ch.birthYear})");
                    if (!string.IsNullOrEmpty(ch.occupation))
                        AssertFact($"occupation({charId}, {Sanitize(ch.occupation)})");
                    if (!string.IsNullOrEmpty(ch.gender))
                        AssertFact($"gender({charId}, {Sanitize(ch.gender)})");

                    // Assert personality facts if available
                    if (ch.personality != null)
                    {
                        AssertFact($"personality({charId}, openness, {ch.personality.openness:F2})");
                        AssertFact($"personality({charId}, conscientiousness, {ch.personality.conscientiousness:F2})");
                        AssertFact($"personality({charId}, extroversion, {ch.personality.extroversion:F2})");
                        AssertFact($"personality({charId}, agreeableness, {ch.personality.agreeableness:F2})");
                        AssertFact($"personality({charId}, neuroticism, {ch.personality.neuroticism:F2})");
                    }
                }
            }

            // Assert settlement facts
            if (settlements != null)
            {
                foreach (var s in settlements)
                {
                    var sId = Sanitize(!string.IsNullOrEmpty(s.name) ? s.name : s.id);
                    AssertFact($"settlement({sId})");
                    if (!string.IsNullOrEmpty(s.settlementType))
                        AssertFact($"settlement_type({sId}, {Sanitize(s.settlementType)})");
                }
            }

            // Load Prolog content from rules (content is Prolog source of truth)
            if (rules != null)
            {
                foreach (var r in rules)
                {
                    if (!string.IsNullOrEmpty(r.content))
                    {
                        _knowledgeBase.AppendLine(r.content);
                        ParseFactsFromContent(r.content);
                    }
                }
            }

            // Load Prolog content from actions
            if (actions != null)
            {
                foreach (var a in actions)
                {
                    if (!string.IsNullOrEmpty(a.content))
                    {
                        _knowledgeBase.AppendLine(a.content);
                        ParseFactsFromContent(a.content);
                    }
                }
            }

            // Load Prolog content from quests
            if (quests != null)
            {
                foreach (var q in quests)
                {
                    if (!string.IsNullOrEmpty(q.content))
                    {
                        _knowledgeBase.AppendLine(q.content);
                        ParseFactsFromContent(q.content);
                    }
                }
            }

            // Assert truth facts
            if (truths != null)
            {
                foreach (var t in truths)
                {
                    if (!string.IsNullOrEmpty(t.content))
                    {
                        _knowledgeBase.AppendLine(t.content);
                        ParseFactsFromContent(t.content);
                    }
                }
            }

            _initialized = true;
            Debug.Log($"[Insimul] PrologEngine initialized with {_facts.Count} facts");
        }

        /// <summary>
        /// Initialize from a WorldIR data container (convenience overload).
        /// </summary>
        public void Initialize(InsimulWorldIR data)
        {
            var characters = data.entities?.characters;
            var settlements = data.geography?.settlements;
            var rules = data.systems?.rules;
            var actions = data.systems?.actions;
            var quests = data.systems?.quests;
            var truths = data.systems?.truths;
            var content = data.systems?.knowledgeBase;

            // Combine with base rules if present
            InsimulRuleData[] allRules = null;
            if (rules != null || data.systems?.baseRules != null)
            {
                var list = new List<InsimulRuleData>();
                if (rules != null) list.AddRange(rules);
                if (data.systems?.baseRules != null) list.AddRange(data.systems.baseRules);
                allRules = list.ToArray();
            }

            Initialize(characters, settlements, allRules, actions, quests, truths, content);
        }

        /// <summary>
        /// Initialize inventory items as Prolog facts.
        /// Call after Initialize() to sync existing inventory.
        /// </summary>
        public void InitializeInventory(InventoryItem[] items)
        {
            if (!_initialized || items == null) return;

            foreach (var item in items)
            {
                var name = Sanitize(item.name);
                var qty = item.quantity > 0 ? item.quantity : 1;
                AssertFact($"has(player, {name})");
                AssertFact($"has_item(player, {name}, {qty})");
                _itemQuantities[name] = (_itemQuantities.GetValueOrDefault(name, 0)) + qty;

                if (item.type != default)
                    AssertFact($"item_type({name}, {Sanitize(item.type.ToString())})");
                if (item.value > 0)
                    AssertFact($"item_value({name}, {item.value})");

                // Assert taxonomy
                AssertItemTaxonomy(name, item.category, item.material, item.baseType, item.rarity);
            }

            Debug.Log($"[Insimul] PrologEngine initialized {items.Length} inventory items as facts");
        }

        /// <summary>
        /// Initialize world item definitions into Prolog (taxonomy, IS-A chains).
        /// Call at game start with all world items so Prolog knows about every item type.
        /// </summary>
        public void InitializeWorldItems(InsimulItemData[] items)
        {
            if (!_initialized || items == null) return;

            foreach (var item in items)
            {
                var name = Sanitize(item.name);
                if (!string.IsNullOrEmpty(item.itemType))
                    AssertFact($"item_type({name}, {Sanitize(item.itemType)})");
                if (item.value > 0)
                    AssertFact($"item_value({name}, {item.value})");

                AssertItemTaxonomy(name, null, null, null, item.rarity);
            }

            Debug.Log($"[Insimul] PrologEngine initialized {items.Length} world item definitions as facts");
        }

        /// <summary>
        /// Load built-in IS-A reasoning rules so Prolog can reason hierarchically about items.
        /// </summary>
        public void LoadItemReasoningRules()
        {
            if (!_initialized) return;

            var rules = @"
% IS-A reasoning: an item is-a its category
item_is_a(Item, Category) :- item_category(Item, Category).
% IS-A reasoning: an item is-a its base type
item_is_a(Item, BaseType) :- item_base_type(Item, BaseType).
% IS-A reasoning: an item is-a its item type
item_is_a(Item, Type) :- item_type(Item, Type).

% Check if player has any item of a given category/type
has_item_of_type(Player, Type) :- has(Player, Item), item_is_a(Item, Type).

% Check if player has at least N of an item
has_at_least(Player, Item, N) :- has_item(Player, Item, Qty), Qty >= N.
";
            _knowledgeBase.AppendLine(rules);
            ParseFactsFromContent(rules);
            Debug.Log("[Insimul] PrologEngine loaded item IS-A reasoning rules");
        }

        /// <summary>
        /// Load gameplay helper predicates (CEFR comparison, weapon/tool types, skill checks).
        /// Mirrors HELPER_PREDICATES_PROLOG from shared/prolog/helper-predicates.ts.
        /// </summary>
        public void LoadHelperPredicates()
        {
            if (!_initialized) return;

            var rules = @"
% CEFR level ranks
cefr_level_rank(a1, 1).
cefr_level_rank(a2, 2).
cefr_level_rank(b1, 3).
cefr_level_rank(b2, 4).
cefr_level_rank(c1, 5).
cefr_level_rank(c2, 6).
cefr_gte(Actual, Required) :- cefr_level_rank(Actual, AR), cefr_level_rank(Required, RR), AR >= RR.

% Weapon type classification
is_weapon_type(ItemId, sword) :- item_type(ItemId, sword).
is_weapon_type(ItemId, axe) :- item_type(ItemId, axe).
is_weapon_type(ItemId, bow) :- item_type(ItemId, bow).
is_weapon_type(ItemId, staff) :- item_type(ItemId, staff).
is_weapon_type(ItemId, pistol) :- item_type(ItemId, pistol).

% Tool type classification
is_tool_type(ItemId, fishing_rod) :- item_type(ItemId, fishing_rod).
is_tool_type(ItemId, pickaxe) :- item_type(ItemId, pickaxe).
is_tool_type(ItemId, axe) :- item_type(ItemId, axe).
is_tool_type(ItemId, hoe) :- item_type(ItemId, hoe).

% Skill tier names
skill_tier_name(1, novice).
skill_tier_name(2, novice).
skill_tier_name(3, apprentice).
skill_tier_name(4, apprentice).
skill_tier_name(5, journeyman).
skill_tier_name(6, journeyman).
skill_tier_name(7, expert).
skill_tier_name(8, expert).
skill_tier_name(9, expert).
skill_tier_name(10, master).

% Skill level comparison
skill_gte(Actor, Skill, MinLevel) :- has_skill(Actor, Skill, Level), Level >= MinLevel.
";
            _knowledgeBase.AppendLine(rules);
            ParseFactsFromContent(rules);
            Debug.Log("[Insimul] PrologEngine loaded gameplay helper predicates");
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
        /// Returns (allowed, reason).
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

            // If no can_perform fact exists at all, allow by default (graceful degradation)
            if (!HasAnyFactWithPrefix("can_perform("))
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
        /// Check if a specific quest stage is complete.
        /// </summary>
        public bool IsStageComplete(string questId, string stageId, string playerId)
        {
            if (!_initialized) return false;
            return HasFact($"stage_complete({Sanitize(playerId)}, {Sanitize(questId)}, {Sanitize(stageId)})");
        }

        /// <summary>
        /// Evaluate a rule condition via Prolog query.
        /// Returns true if the condition is satisfied.
        /// </summary>
        public bool EvaluateCondition(string prologGoal)
        {
            if (!_initialized) return true;
            return HasFact(NormalizeFact(prologGoal));
        }

        /// <summary>
        /// Register active quest IDs for re-evaluation.
        /// </summary>
        public void SetActiveQuests(List<string> questIds)
        {
            _activeQuestIds.Clear();
            if (questIds != null)
                _activeQuestIds.AddRange(questIds);

            // Clear completion tracking for quests no longer active
            completedObjectives.RemoveWhere(key => {
                var questId = key.Split(':')[0];
                return !_activeQuestIds.Contains(questId);
            });
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
            var prefix = "rule_applies(";
            var results = new List<string>();

            foreach (var fact in _facts)
            {
                if (!fact.StartsWith(prefix)) continue;
                if (fact.Contains($", {actorAtom},") || fact.Contains($", {actorAtom})"))
                {
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
        /// Returns a list of result dictionaries (empty for stub).
        /// For full Prolog unification, integrate a C# Prolog library.
        /// </summary>
        public List<Dictionary<string, object>> Query(string goal)
        {
            if (!_initialized) return new List<Dictionary<string, object>>();

            var normalized = NormalizeFact(goal);
            if (HasFact(normalized))
            {
                return new List<Dictionary<string, object>>
                {
                    new Dictionary<string, object> { { "_match", true } }
                };
            }

            return new List<Dictionary<string, object>>();
        }

        /// <summary>
        /// Get engine stats for debugging.
        /// </summary>
        public (int factCount, int ruleCount) GetStats()
        {
            int ruleCount = 0;
            foreach (var line in _knowledgeBase.ToString().Split('\n'))
            {
                if (line.Contains(":-")) ruleCount++;
            }
            return (_facts.Count, ruleCount);
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

        // ── NPC Intelligence Queries ──────────────────────────────────────────

        /// <summary>
        /// Determine who an NPC should talk to based on personality and relationships.
        /// Stub: scans should_talk_to facts.
        /// </summary>
        public List<string> WhoShouldTalkTo(string npcId)
        {
            if (!_initialized) return new List<string>();
            return ScanBinaryFact("should_talk_to", Sanitize(npcId));
        }

        /// <summary>
        /// Get preferred dialogue topics for an NPC.
        /// </summary>
        public List<string> GetPreferredTopics(string npcId)
        {
            if (!_initialized) return new List<string>();
            return ScanBinaryFact("prefers_topic", Sanitize(npcId));
        }

        /// <summary>
        /// Get an NPC's conflict resolution style.
        /// </summary>
        public string GetConflictStyle(string npcId)
        {
            if (!_initialized) return null;
            var results = ScanBinaryFact("conflict_style", Sanitize(npcId));
            return results.Count > 0 ? results[0] : null;
        }

        /// <summary>
        /// Check if an NPC wants to socialize.
        /// </summary>
        public bool WantsToSocialize(string npcId)
        {
            if (!_initialized) return false;
            return HasFact($"wants_to_socialize({Sanitize(npcId)})");
        }

        /// <summary>
        /// Check if an NPC is grieving.
        /// </summary>
        public bool IsGrieving(string npcId)
        {
            if (!_initialized) return false;
            return HasFact($"is_grieving({Sanitize(npcId)})");
        }

        /// <summary>
        /// Check if this is a first meeting between NPC and player.
        /// Returns true if no mental model exists.
        /// </summary>
        public bool IsFirstMeeting(string npcId, string playerId)
        {
            if (!_initialized) return true;
            return !HasFact($"has_mental_model({Sanitize(npcId)}, {Sanitize(playerId)})");
        }

        /// <summary>
        /// Get NPCs that should be avoided by a given NPC.
        /// </summary>
        public List<string> WhoToAvoid(string npcId)
        {
            if (!_initialized) return new List<string>();
            return ScanBinaryFact("should_avoid", Sanitize(npcId));
        }

        /// <summary>
        /// Check if an NPC is willing to share knowledge with another.
        /// </summary>
        public bool IsWillingToShare(string npcId, string targetId)
        {
            if (!_initialized) return true;
            return HasFact($"willing_to_share({Sanitize(npcId)}, {Sanitize(targetId)})") ||
                   !HasAnyFactWithPrefix("willing_to_share(");
        }

        // ── NPC State Updates ─────────────────────────────────────────────────

        /// <summary>
        /// Update NPC personality facts.
        /// </summary>
        public void UpdateNPCPersonality(string npcId, float openness, float conscientiousness,
            float extroversion, float agreeableness, float neuroticism)
        {
            if (!_initialized) return;
            var id = Sanitize(npcId);
            RetractPattern("personality", id);
            AssertFact($"personality({id}, openness, {openness:F2})");
            AssertFact($"personality({id}, conscientiousness, {conscientiousness:F2})");
            AssertFact($"personality({id}, extroversion, {extroversion:F2})");
            AssertFact($"personality({id}, agreeableness, {agreeableness:F2})");
            AssertFact($"personality({id}, neuroticism, {neuroticism:F2})");
        }

        /// <summary>
        /// Update NPC emotional state facts.
        /// </summary>
        public void UpdateNPCEmotionalState(string npcId, string mood = null,
            float? stressLevel = null, float? socialDesire = null, float? energy = null)
        {
            if (!_initialized) return;
            var id = Sanitize(npcId);
            RetractPattern("mood", id);
            RetractPattern("stress_level", id);
            RetractPattern("social_desire", id);

            if (!string.IsNullOrEmpty(mood))
                AssertFact($"mood({id}, {Sanitize(mood)})");
            if (stressLevel.HasValue)
                AssertFact($"stress_level({id}, {stressLevel.Value:F2})");
            if (socialDesire.HasValue)
                AssertFact($"social_desire({id}, {socialDesire.Value:F2})");
            if (energy.HasValue)
                AssertFact($"energy({id}, {energy.Value:F1})");
        }

        /// <summary>
        /// Update NPC relationship facts.
        /// </summary>
        public void UpdateNPCRelationship(string npc1Id, string npc2Id,
            float? charge = null, float? trust = null, int? conversationCount = null,
            bool? isFriend = null, bool? isEnemy = null)
        {
            if (!_initialized) return;
            var id1 = Sanitize(npc1Id);
            var id2 = Sanitize(npc2Id);

            RetractPattern("relationship_charge", id1, id2);
            RetractPattern("relationship_trust", id1, id2);
            RetractPattern("conversation_count", id1, id2);
            RetractPattern("friends", id1, id2);
            RetractPattern("enemies", id1, id2);

            if (charge.HasValue)
                AssertFact($"relationship_charge({id1}, {id2}, {charge.Value:F2})");
            if (trust.HasValue)
                AssertFact($"relationship_trust({id1}, {id2}, {trust.Value:F2})");
            if (conversationCount.HasValue)
                AssertFact($"conversation_count({id1}, {id2}, {conversationCount.Value})");
            if (isFriend == true)
                AssertFact($"friends({id1}, {id2})");
            if (isEnemy == true)
                AssertFact($"enemies({id1}, {id2})");
        }

        /// <summary>
        /// Record that the player performed an action on an NPC.
        /// </summary>
        public void RecordPlayerAction(string playerId, string npcId, string actionName)
        {
            if (!_initialized) return;
            AssertFact($"player_action({Sanitize(playerId)}, {Sanitize(npcId)}, {Sanitize(actionName)})");
        }

        // ── Event Bus Subscription ────────────────────────────────────────────

        /// <summary>
        /// Subscribe to a GameEventBus and automatically assert/retract facts.
        /// </summary>
        public void SubscribeToEventBus(GameEventBus eventBus)
        {
            _eventBusUnsubscribe?.Invoke();
            _eventBusRef = eventBus;
            _eventBusUnsubscribe = eventBus.OnAny(HandleGameEvent);
        }

        private void HandleGameEvent(GameEvent gameEvent)
        {
            if (!_initialized) return;

            switch (gameEvent)
            {
                case ItemCollectedEvent e:
                {
                    var name = Sanitize(e.itemName);
                    AssertFact($"collected(player, {name}, {e.quantity})");
                    AssertFact($"has(player, {name})");
                    UpdateItemQuantity(name, e.quantity);
                    if (e.taxonomy != null)
                        AssertItemTaxonomy(name, e.taxonomy.category, e.taxonomy.material, e.taxonomy.baseType, e.taxonomy.rarity);
                    break;
                }
                case EnemyDefeatedEvent e:
                    AssertFact($"defeated(player, {Sanitize(e.enemyType)})");
                    break;
                case LocationVisitedEvent e:
                    AssertFact($"visited(player, {Sanitize(e.locationId)})");
                    break;
                case NpcTalkedEvent e:
                    AssertFact($"talked_to(player, {Sanitize(e.npcId)}, {e.turnCount})");
                    break;
                case ItemDeliveredEvent e:
                    AssertFact($"delivered(player, {Sanitize(e.npcId)}, {Sanitize(e.itemName)})");
                    break;
                case VocabularyUsedEvent e:
                    AssertFact($"vocab_used(player, {Sanitize(e.word)}, {(e.correct ? 1 : 0)})");
                    break;
                case ConversationTurnEvent e:
                    if (e.keywords != null)
                    {
                        foreach (var kw in e.keywords)
                            AssertFact($"conversation_keyword(player, {Sanitize(e.npcId)}, {Sanitize(kw)})");
                    }
                    break;
                case QuestAcceptedEvent e:
                    AssertFact($"quest_active(player, {Sanitize(e.questId)})");
                    break;
                case QuestCompletedEvent e:
                    AssertFact($"quest_completed(player, {Sanitize(e.questId)})");
                    break;
                case CombatActionEvent e:
                    AssertFact($"combat_action(player, {Sanitize(e.actionType)}, {Sanitize(e.targetId)})");
                    break;
                case ReputationChangedEvent e:
                    AssertFact($"reputation_change(player, {Sanitize(e.factionId)}, {e.delta})");
                    break;
                case ItemCraftedEvent e:
                {
                    var name = Sanitize(e.itemName);
                    AssertFact($"crafted(player, {name}, {e.quantity})");
                    AssertFact($"has(player, {name})");
                    UpdateItemQuantity(name, e.quantity);
                    if (e.taxonomy != null)
                        AssertItemTaxonomy(name, e.taxonomy.category, e.taxonomy.material, e.taxonomy.baseType, e.taxonomy.rarity);
                    break;
                }
                case LocationDiscoveredEvent e:
                    AssertFact($"discovered(player, {Sanitize(e.locationId)})");
                    break;
                case SettlementEnteredEvent e:
                    AssertFact($"visited(player, {Sanitize(e.settlementId)})");
                    break;
                case PuzzleSolvedEvent e:
                    AssertFact($"puzzle_solved(player, {Sanitize(e.puzzleId)})");
                    break;
                case ItemRemovedEvent e:
                case ItemDroppedEvent e2:
                {
                    string itemName;
                    int qty;
                    if (gameEvent is ItemRemovedEvent re)
                    {
                        itemName = Sanitize(re.itemName);
                        qty = re.quantity > 0 ? re.quantity : 1;
                    }
                    else
                    {
                        var de = (ItemDroppedEvent)gameEvent;
                        itemName = Sanitize(de.itemName);
                        qty = de.quantity > 0 ? de.quantity : 1;
                    }
                    UpdateItemQuantity(itemName, -qty);
                    var remaining = _itemQuantities.GetValueOrDefault(itemName, 0);
                    if (remaining <= 0)
                        RetractFact($"has(player, {itemName})");
                    break;
                }
                case ItemUsedEvent e:
                {
                    var name = Sanitize(e.itemName);
                    UpdateItemQuantity(name, -1);
                    var remaining = _itemQuantities.GetValueOrDefault(name, 0);
                    if (remaining <= 0)
                        RetractFact($"has(player, {name})");
                    break;
                }
                case ItemEquippedEvent e:
                    AssertFact($"equipped(player, {Sanitize(e.itemName)}, {Sanitize(e.slot)})");
                    break;
                case ItemUnequippedEvent e:
                    RetractFact($"equipped(player, {Sanitize(e.itemName)}, {Sanitize(e.slot)})");
                    break;
                case RomanceActionEvent e:
                {
                    var status = e.accepted ? "accepted" : "rejected";
                    AssertFact($"romance_action(player, {Sanitize(e.npcId)}, {Sanitize(e.actionType)}, {status})");
                    // Emit create_truth event for accepted actions
                    if (e.accepted && _eventBusRef != null)
                    {
                        _eventBusRef.Emit(new CreateTruthEvent
                        {
                            characterId = "player",
                            title = $"Romance: {e.actionType} with {e.npcName}",
                            content = $"Player performed {e.actionType} on {e.npcName}",
                            entryType = "romance"
                        });
                    }
                    break;
                }
                case RomanceStageChangedEvent e:
                {
                    RetractPattern("romance_stage", "player", Sanitize(e.npcId));
                    AssertFact($"romance_stage(player, {Sanitize(e.npcId)}, {Sanitize(e.toStage)})");
                    AssertFact($"romance_history(player, {Sanitize(e.npcId)}, {Sanitize(e.fromStage)}, {Sanitize(e.toStage)})");
                    // Emit create_truth event
                    if (_eventBusRef != null)
                    {
                        _eventBusRef.Emit(new CreateTruthEvent
                        {
                            characterId = "player",
                            title = $"Romance stage: {e.fromStage} -> {e.toStage} with {e.npcName}",
                            content = $"Romance stage changed from {e.fromStage} to {e.toStage}",
                            entryType = "romance"
                        });
                    }
                    break;
                }
                case NpcVolitionActionEvent e:
                    AssertFact($"volition_acted({Sanitize(e.npcId)}, {Sanitize(e.actionId)}, {Sanitize(e.targetId)})");
                    break;
                case ConversationOverheardEvent e:
                    AssertFact($"overheard_conversation(player, {Sanitize(e.npcId1)}, {Sanitize(e.npcId2)}, {Sanitize(e.topic)})");
                    break;
                case StateCreatedTruthEvent e:
                    AssertFact($"has_state({Sanitize(e.characterId)}, {Sanitize(e.stateType)})");
                    break;
                case StateExpiredTruthEvent e:
                    RetractPattern("has_state", Sanitize(e.characterId), Sanitize(e.stateType));
                    break;
                case PuzzleFailedEvent e:
                    AssertFact($"puzzle_failed(player, {Sanitize(e.puzzleId)}, {e.attempts})");
                    break;
                case QuestFailedEvent e:
                    AssertFact($"quest_failed(player, {Sanitize(e.questId)})");
                    break;
                case QuestAbandonedEvent e:
                    AssertFact($"quest_abandoned(player, {Sanitize(e.questId)})");
                    RetractPattern("quest_active", "player", Sanitize(e.questId));
                    break;
                case ConversationalActionCompletedEvent e:
                    AssertFact($"conversational_action(player, {Sanitize(e.npcId)}, {Sanitize(e.action)}, {Sanitize(e.questId)})");
                    break;
                case TextFoundEvent e:
                    AssertFact($"text_found(player, {Sanitize(e.textId)})");
                    break;
                case TextReadEvent e:
                    AssertFact($"text_read(player, {Sanitize(e.textId)})");
                    break;
                case SignReadEvent e:
                    AssertFact($"sign_read(player, {Sanitize(e.signId)})");
                    break;
                case ObjectExaminedEvent e:
                    AssertFact($"object_examined(player, {Sanitize(e.objectName)})");
                    break;
                case ObjectIdentifiedEvent e:
                    AssertFact($"object_identified(player, {Sanitize(e.objectName)})");
                    break;
                case ObjectPointedAndNamedEvent e:
                    AssertFact($"object_pointed_named(player, {Sanitize(e.objectName)})");
                    break;
                case WritingSubmittedEvent e:
                    AssertFact($"response_written(player, {e.wordCount})");
                    break;
                case PhotoTakenEvent e:
                    AssertFact($"photo_taken(player, {Sanitize(e.subjectName)})");
                    break;
                case FoodOrderedEvent e:
                    AssertFact($"food_ordered(player, {Sanitize(e.itemName)})");
                    break;
                case PriceHaggledEvent e:
                    AssertFact($"price_haggled(player, {Sanitize(e.itemName)})");
                    break;
                case GiftGivenEvent e:
                    AssertFact($"gift_given(player, {Sanitize(e.npcId)}, {Sanitize(e.itemName)})");
                    break;
                case TranslationAttemptEvent e:
                    if (e.correct)
                        AssertFact($"translation_completed(player, correct)");
                    break;
                case PronunciationAttemptEvent e:
                    AssertFact($"pronunciation_score(player, {Sanitize(e.phrase)}, {e.score}, {e.timestamp})");
                    if (e.passed)
                        AssertFact($"pronunciation_passed(player, {Sanitize(e.phrase)})");
                    break;
                case ReadingCompletedEvent e:
                    AssertFact($"text_read(player, {Sanitize(e.textId)})");
                    break;
                case QuestionsAnsweredEvent e:
                    AssertFact($"comprehension_done(player, {Sanitize(e.textId)})");
                    break;
                case ConversationTurnCountedEvent e:
                {
                    RetractPattern("npc_conversation_turns", "player", Sanitize(e.npcId));
                    AssertFact($"npc_conversation_turns(player, {Sanitize(e.npcId)}, {e.total})");
                    break;
                }
                case PhysicalActionCompletedEvent e:
                    AssertFact($"physical_action_done(player, {Sanitize(e.actionType)})");
                    break;
                case NpcExamCompletedEvent e:
                    AssertFact($"assessment_result(player, {Sanitize(e.examId)}, {e.score}, {e.maxPoints}, {Sanitize(e.cefrLevel)}, {e.timestamp})");
                    AssertFact($"player_cefr_level(player, {Sanitize(e.cefrLevel)})");
                    break;
            }

            ReevaluateQuests();
        }

        // ── Volition & Romance Queries ────────────────────────────────────────

        /// <summary>
        /// Evaluate volition rules for an NPC. Returns scored actions sorted by score descending.
        /// Stub: scans volition_score facts.
        /// </summary>
        public List<(string actionId, string targetId, float score)> EvaluateVolitionRules(string npcId)
        {
            if (!_initialized) return new List<(string, string, float)>();

            var npcAtom = Sanitize(npcId);
            var prefix = $"volition_score({npcAtom}, ";
            var results = new List<(string actionId, string targetId, float score)>();

            foreach (var fact in _facts)
            {
                if (!fact.StartsWith(prefix)) continue;
                // Parse volition_score(npcId, action, target, score)
                var inner = fact.Substring(prefix.Length);
                var parts = inner.TrimEnd(')').Split(',');
                if (parts.Length >= 3)
                {
                    var action = parts[0].Trim();
                    var target = parts[1].Trim();
                    float.TryParse(parts[2].Trim(), out float score);
                    results.Add((action, target, score));
                }
            }

            results.Sort((a, b) => b.score.CompareTo(a.score));
            return results;
        }

        /// <summary>
        /// Get the current romance stage between the player and an NPC.
        /// Returns null if no romance stage exists.
        /// </summary>
        public string GetRomanceStage(string npcId)
        {
            if (!_initialized) return null;
            var results = ScanBinaryFact("romance_stage", "player");
            var npcAtom = Sanitize(npcId);
            // romance_stage(player, npcId, stage) — need to find the one with matching npcId
            var prefix = $"romance_stage(player, {npcAtom}, ";
            foreach (var fact in _facts)
            {
                if (fact.StartsWith(prefix) && fact.EndsWith(")"))
                {
                    return fact.Substring(prefix.Length, fact.Length - prefix.Length - 1).Trim();
                }
            }
            return null;
        }

        /// <summary>
        /// Check if a romance action can be performed with an NPC.
        /// Returns true by default if no romance rules are loaded.
        /// </summary>
        public bool CanPerformRomanceAction(string npcId, string actionType)
        {
            if (!_initialized) return true;

            var pattern = $"can_romance_action(player, {Sanitize(npcId)}, {Sanitize(actionType)})";
            // If no romance rules loaded, allow by default (graceful degradation)
            if (!HasAnyFactWithPrefix("can_romance_action(")) return true;
            return HasFact(pattern);
        }

        // ── Reconciliation & Rewards ─────────────────────────────────────────

        /// <summary>
        /// Reconcile current Prolog state to find all completed quests and objectives.
        /// </summary>
        public (List<string> completedQuests, List<(string questId, int objectiveIndex)> completedObjectives) Reconcile()
        {
            var quests = new List<string>();
            var objectives = new List<(string, int)>();

            if (!_initialized) return (quests, objectives);

            foreach (var questId in _activeQuestIds)
            {
                var sanitizedId = Sanitize(questId);

                // Check objectives
                var objectiveFacts = FindFacts($"quest_objective({sanitizedId},");
                foreach (var fact in objectiveFacts)
                {
                    var parts = fact.Split(',');
                    if (parts.Length < 2) continue;
                    if (!int.TryParse(parts[1].Trim().TrimEnd(')').Trim(), out int idx)) continue;

                    if (HasFact($"objective_complete(player, {sanitizedId}, {idx})"))
                    {
                        objectives.Add((questId, idx));
                    }
                }

                if (IsQuestComplete(questId, "player"))
                {
                    quests.Add(questId);
                }
            }

            return (quests, objectives);
        }

        /// <summary>
        /// Get bonus rewards for a completed quest from Prolog facts.
        /// </summary>
        public List<(string type, int value)> GetBonusRewards(string questId)
        {
            var results = new List<(string, int)>();
            if (!_initialized) return results;

            var facts = FindFacts($"quest_bonus_reward(player, {Sanitize(questId)},");
            foreach (var fact in facts)
            {
                // Parse quest_bonus_reward(player, questId, Type, Value)
                var parts = fact.Split(',');
                if (parts.Length >= 4)
                {
                    var type = parts[2].Trim();
                    int.TryParse(parts[3].Trim().TrimEnd(')'), out int value);
                    results.Add((type, value));
                }
            }

            return results;
        }

        // ── Dispose ──────────────────────────────────────────────────────────

        /// <summary>
        /// Dispose the engine and clear all state.
        /// </summary>
        public void Dispose()
        {
            _eventBusUnsubscribe?.Invoke();
            _eventBusUnsubscribe = null;
            _eventBusRef = null;
            _facts.Clear();
            _knowledgeBase.Clear();
            _activeQuestIds.Clear();
            _itemQuantities.Clear();
            completedObjectives.Clear();
            completedQuests.Clear();
            onObjectiveCompleted = null;
            _initialized = false;
            Debug.Log("[Insimul] PrologEngine disposed");
        }

        private void OnDestroy()
        {
            Dispose();
        }

        // ── Internal Helpers ──────────────────────────────────────────────────

        private void ReevaluateQuests()
        {
            foreach (var questId in _activeQuestIds)
            {
                if (completedQuests.Contains(questId)) continue;

                // Check individual objectives
                if (onObjectiveCompleted != null)
                {
                    CheckObjectiveCompletion(questId);
                }

                // Check whole-quest completion
                if (IsQuestComplete(questId, "player") && !completedQuests.Contains(questId))
                {
                    completedQuests.Add(questId);
                    OnQuestCompleted?.Invoke(questId);
                }
            }
        }

        private void CheckObjectiveCompletion(string questId)
        {
            var sanitizedId = Sanitize(questId);
            var objectiveFacts = FindFacts($"quest_objective({sanitizedId},");

            foreach (var fact in objectiveFacts)
            {
                var parts = fact.Split(',');
                if (parts.Length < 2) continue;

                if (!int.TryParse(parts[1].Trim().TrimEnd(')').Trim(), out int idx)) continue;

                var key = $"{questId}:{idx}";
                if (completedObjectives.Contains(key)) continue;

                var completePattern = $"objective_complete(player, {sanitizedId}, {idx})";
                if (HasFact(completePattern))
                {
                    completedObjectives.Add(key);
                    onObjectiveCompleted?.Invoke(questId, idx);
                }
            }
        }

        private void UpdateItemQuantity(string itemName, int delta)
        {
            var oldQty = _itemQuantities.GetValueOrDefault(itemName, 0);
            var newQty = Math.Max(0, oldQty + delta);
            _itemQuantities[itemName] = newQty;
            RetractPattern("has_item", "player", itemName);
            if (newQty > 0)
                AssertFact($"has_item(player, {itemName}, {newQty})");
        }

        private void AssertItemTaxonomy(string itemName, string category, string material, string baseType, string rarity)
        {
            if (!string.IsNullOrEmpty(category))
            {
                AssertFact($"item_category({itemName}, {Sanitize(category)})");
                AssertFact($"item_is_a({itemName}, {Sanitize(category)})");
            }
            if (!string.IsNullOrEmpty(material))
                AssertFact($"item_material({itemName}, {Sanitize(material)})");
            if (!string.IsNullOrEmpty(baseType))
            {
                AssertFact($"item_base_type({itemName}, {Sanitize(baseType)})");
                AssertFact($"item_is_a({itemName}, {Sanitize(baseType)})");
            }
            if (!string.IsNullOrEmpty(rarity))
                AssertFact($"item_rarity({itemName}, {Sanitize(rarity)})");
        }

        /// <summary>
        /// Scan for binary facts like predicate(firstArg, X) and return all X values.
        /// </summary>
        private List<string> ScanBinaryFact(string predicate, string firstArg)
        {
            var prefix = $"{predicate}({firstArg}, ";
            var results = new List<string>();
            foreach (var fact in _facts)
            {
                if (fact.StartsWith(prefix) && fact.EndsWith(")"))
                {
                    var value = fact.Substring(prefix.Length, fact.Length - prefix.Length - 1).Trim();
                    if (!string.IsNullOrEmpty(value))
                        results.Add(value);
                }
            }
            return results;
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

        /// <summary>
        /// Find all facts matching a given prefix.
        /// </summary>
        private List<string> FindFacts(string prefix)
        {
            var results = new List<string>();
            foreach (var fact in _facts)
            {
                if (fact.StartsWith(prefix))
                    results.Add(fact);
            }
            return results;
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
                if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("%")) continue;
                if (trimmed.Contains(":-")) continue;
                if (trimmed.EndsWith("."))
                {
                    var fact = trimmed.Substring(0, trimmed.Length - 1).Trim();
                    if (!string.IsNullOrEmpty(fact))
                        _facts.Add(fact);
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
