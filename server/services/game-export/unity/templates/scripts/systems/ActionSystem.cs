using System;
using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    /// <summary>
    /// Effect produced by an action execution.
    /// </summary>
    [System.Serializable]
    public class ActionEffect
    {
        /// <summary>Effect type: relationship, attribute, status, event, item, knowledge, gold</summary>
        public string type;
        public string target;
        public string description;
        public float value;
        /// <summary>For item effects: the item identifier.</summary>
        public string itemId;
        /// <summary>For item effects: quantity to give/take.</summary>
        public int quantity;
    }

    /// <summary>
    /// Result of executing an action.
    /// </summary>
    public class ActionResult
    {
        public bool success;
        public string message;
        public int energyUsed;
        public List<ActionEffect> effects = new();
        public string narrativeText;
    }

    /// <summary>
    /// Tracks per-action cooldown and usage state.
    /// </summary>
    [System.Serializable]
    public class ActionState
    {
        public string actionId;
        public float lastUsed;
        public float cooldownRemaining;
        public int timesUsed;
    }

    /// <summary>
    /// Manages available actions and their execution.
    /// Ported from Insimul's Babylon.js ActionManager.
    /// </summary>
    public class ActionSystem : MonoBehaviour
    {
        private List<InsimulActionData> _actions = new();
        private Dictionary<string, ActionState> _actionStates = new();

        public int ActionCount => _actions.Count;

        /// <summary>Fired when an action produces a gold effect.</summary>
        public event Action<int> OnGoldEffect;
        /// <summary>Fired when an action produces an item effect.</summary>
        public event Action<string, int> OnItemEffect;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.systems?.actions != null)
                _actions.AddRange(worldData.systems.actions);
            if (worldData?.systems?.baseActions != null)
                _actions.AddRange(worldData.systems.baseActions);
            Debug.Log($"[Insimul] ActionSystem loaded {_actions.Count} actions");
        }

        public InsimulActionData GetAction(string id)
        {
            return _actions.Find(a => a.id == id);
        }

        /// <summary>Get all action IDs matching a category (social, combat, mental, etc.).</summary>
        public List<string> GetActionsByCategory(string category)
        {
            var result = new List<string>();
            foreach (var action in _actions)
            {
                if (action.actionType == category)
                    result.Add(action.id);
            }
            return result;
        }

        /// <summary>Check whether an action can be performed given current context.</summary>
        public bool CanPerformAction(string actionId, float playerEnergy, bool hasTarget, out string reason)
        {
            var action = GetAction(actionId);
            if (action == null)
            {
                reason = "Action not found";
                return false;
            }

            if (!action.isActive)
            {
                reason = "Action not available";
                return false;
            }

            if (_actionStates.TryGetValue(actionId, out var state) && state.cooldownRemaining > 0f)
            {
                reason = $"On cooldown ({state.cooldownRemaining:F1}s remaining)";
                return false;
            }

            if (action.energyCost > 0 && action.energyCost > playerEnergy)
            {
                reason = $"Not enough energy (need {action.energyCost})";
                return false;
            }

            if (action.requiresTarget && !hasTarget)
            {
                reason = "Requires a target";
                return false;
            }

            reason = "";
            return true;
        }

        /// <summary>Tick cooldowns -- call once per frame with Time.deltaTime.</summary>
        public void UpdateCooldowns(float deltaTime)
        {
            foreach (var kvp in _actionStates)
            {
                if (kvp.Value.cooldownRemaining > 0f)
                    kvp.Value.cooldownRemaining = Mathf.Max(0f, kvp.Value.cooldownRemaining - deltaTime);
            }
        }

        /// <summary>Get remaining cooldown for an action (0 if ready).</summary>
        public float GetCooldown(string actionId)
        {
            if (_actionStates.TryGetValue(actionId, out var state))
                return state.cooldownRemaining;
            return 0f;
        }

        public ActionResult ExecuteAction(string actionId, GameObject source, GameObject target = null)
        {
            var result = new ActionResult();
            var action = GetAction(actionId);

            // Validate via CanPerformAction
            if (!CanPerformAction(actionId, 100f, target != null, out string reason))
            {
                result.success = false;
                result.message = reason;
                return result;
            }

            // Process effects from action definition
            if (action.effects != null)
            {
                foreach (var effect in action.effects)
                {
                    var category = effect.category ?? "";
                    var ae = new ActionEffect
                    {
                        type = category,
                        target = effect.first == "initiator" ? "player" : (target?.name ?? ""),
                        value = effect.value,
                        description = $"{effect.type} {effect.operatorStr ?? ""} {effect.value}"
                    };

                    if (category == "item")
                    {
                        ae.itemId = effect.type;
                        ae.quantity = (int)effect.value;
                        OnItemEffect?.Invoke(ae.itemId, ae.quantity);
                    }
                    else if (category == "gold")
                    {
                        OnGoldEffect?.Invoke((int)effect.value);
                    }

                    result.effects.Add(ae);
                }
            }

            // Generate narrative text
            string targetName = target != null ? target.name : "someone";
            result.narrativeText = GenerateNarrativeText(action, "You", targetName);

            // Update action state and start cooldown
            if (!_actionStates.TryGetValue(actionId, out var state))
            {
                state = new ActionState { actionId = actionId };
                _actionStates[actionId] = state;
            }
            state.lastUsed = Time.time;
            state.timesUsed += 1;
            if (action.cooldown > 0)
                state.cooldownRemaining = action.cooldown;

            result.success = true;
            result.message = $"{action.name} performed successfully";
            result.energyUsed = action.energyCost;
            Debug.Log($"[Insimul] Executing action: {action.name} ({result.effects.Count} effects)");
            return result;
        }

        private string GenerateNarrativeText(InsimulActionData action, string actorName, string targetName)
        {
            if (action.narrativeTemplates != null && action.narrativeTemplates.Length > 0)
            {
                var template = action.narrativeTemplates[UnityEngine.Random.Range(0, action.narrativeTemplates.Length)];
                return template.Replace("{actor}", actorName).Replace("{target}", targetName);
            }

            // Fallback
            string verb = !string.IsNullOrEmpty(action.verbPast) ? action.verbPast : action.name.ToLower();
            return $"You {verb}.";
        }
    }
}
