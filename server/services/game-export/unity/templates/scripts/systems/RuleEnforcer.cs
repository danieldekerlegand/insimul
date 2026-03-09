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

        /// <summary>Whether a Prolog knowledge base is attached for enhanced rule evaluation.</summary>
        public bool HasPrologKB { get; private set; }

        private string _prologContent;

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

        /// <summary>
        /// Check if an action is allowed, consulting Prolog KB when available.
        /// Mirrors RuleEnforcer.canPerformActionAsync from the Babylon.js source.
        /// </summary>
        public bool CanPerformAction(string actionId, string actionType, string context)
        {
            if (HasPrologKB)
            {
                Debug.Log($"[Insimul] Consulting Prolog KB for action {actionId}");
                // TODO: Integrate Prolog evaluation for rules with prologContent
            }

            var violations = EvaluateRules(context);
            return violations.Count == 0;
        }

        /// <summary>Attach a Prolog knowledge base string for logic-based rule evaluation.</summary>
        public void SetPrologKnowledgeBase(string prologContent)
        {
            _prologContent = prologContent;
            HasPrologKB = !string.IsNullOrEmpty(prologContent);
            Debug.Log($"[Insimul] Prolog KB {(HasPrologKB ? "attached" : "cleared")} ({(prologContent?.Length ?? 0)} chars)");
        }
    }
}
