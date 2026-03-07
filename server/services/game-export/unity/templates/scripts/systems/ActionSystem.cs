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
    }

    /// <summary>
    /// Manages available actions and their execution.
    /// Ported from Insimul's Babylon.js ActionManager.
    /// </summary>
    public class ActionSystem : MonoBehaviour
    {
        private List<InsimulActionData> _actions = new();

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

        public ActionResult ExecuteAction(string actionId, GameObject source, GameObject target = null)
        {
            var result = new ActionResult();
            var action = GetAction(actionId);
            if (action == null || !action.isActive)
            {
                result.success = false;
                result.message = "Action unavailable";
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

            result.success = true;
            result.message = $"Executed: {action.name}";
            Debug.Log($"[Insimul] Executing action: {action.name} ({result.effects.Count} effects)");
            return result;
        }
    }
}
