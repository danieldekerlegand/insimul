using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    public class RuleEnforcer : MonoBehaviour
    {
        private List<InsimulRuleData> _rules = new();

        public int RuleCount => _rules.Count;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.systems?.rules != null)
                _rules.AddRange(worldData.systems.rules);
            if (worldData?.systems?.baseRules != null)
                _rules.AddRange(worldData.systems.baseRules);
            Debug.Log($"[Insimul] RuleEnforcer loaded {_rules.Count} rules");
        }

        public List<InsimulRuleData> EvaluateRules(string context)
        {
            var applicable = new List<InsimulRuleData>();
            foreach (var rule in _rules)
            {
                if (!rule.isActive) continue;
                // TODO: Evaluate rule conditions against context
                applicable.Add(rule);
            }
            return applicable;
        }
    }
}
