using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class ActionSystem : MonoBehaviour
    {
        private List<InsimulActionData> _actions = new();

        public int ActionCount => _actions.Count;

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

        public bool ExecuteAction(string actionId, GameObject source, GameObject target = null)
        {
            var action = GetAction(actionId);
            if (action == null || !action.isActive) return false;
            // TODO: Check prerequisites, apply effects
            Debug.Log($"[Insimul] Executing action: {action.name}");
            return true;
        }
    }
}
