using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Systems
{
    [System.Serializable]
    public class NeedState
    {
        public string id;
        public string name;
        public float value;
        public float maxValue;
        public float decayRate;
        public float criticalThreshold;
        public float warningThreshold;
        public float damageRate;
        public bool wasCritical;
        public bool wasWarning;
    }

    public class SurvivalSystem : MonoBehaviour
    {
        private List<NeedState> _needs = new();
        private bool _damageEnabled = true;
        private float _globalDamageMultiplier = 1f;

        public event System.Action<string, float> OnNeedWarning;
        public event System.Action<string, float> OnNeedCritical;
        public event System.Action<string, float> OnDamageFromNeed;

        public void LoadFromData(InsimulWorldIR worldData)
        {
            if (worldData?.survival?.needs == null) return;
            foreach (var need in worldData.survival.needs)
            {
                _needs.Add(new NeedState
                {
                    id = need.id, name = need.name,
                    value = need.startValue, maxValue = need.maxValue,
                    decayRate = need.decayRate, criticalThreshold = need.criticalThreshold,
                    warningThreshold = need.warningThreshold, damageRate = need.damageRate
                });
            }

            if (worldData.survival.damageConfig != null)
            {
                _damageEnabled = worldData.survival.damageConfig.enabled;
                _globalDamageMultiplier = worldData.survival.damageConfig.globalDamageMultiplier;
            }

            Debug.Log($"[Insimul] SurvivalSystem loaded {_needs.Count} needs");
        }

        private void Update()
        {
            foreach (var need in _needs)
            {
                if (need.decayRate > 0)
                {
                    need.value -= need.decayRate * Time.deltaTime;
                    need.value = Mathf.Clamp(need.value, 0f, need.maxValue);
                }

                bool isCritical = need.value <= need.criticalThreshold;
                bool isWarning = need.value <= need.warningThreshold && !isCritical;

                if (isCritical && !need.wasCritical)
                    OnNeedCritical?.Invoke(need.id, need.value);
                else if (isWarning && !need.wasWarning)
                    OnNeedWarning?.Invoke(need.id, need.value);

                need.wasCritical = isCritical;
                need.wasWarning = isWarning;

                if (_damageEnabled && need.value <= 0f && need.damageRate > 0f)
                {
                    float damage = need.damageRate * _globalDamageMultiplier * Time.deltaTime;
                    OnDamageFromNeed?.Invoke(need.id, damage);
                }
            }
        }

        public float GetNeedValue(string needId)
        {
            var need = _needs.Find(n => n.id == needId);
            return need?.value ?? 0f;
        }

        public void ModifyNeed(string needId, float delta)
        {
            var need = _needs.Find(n => n.id == needId);
            if (need != null)
                need.value = Mathf.Clamp(need.value + delta, 0f, need.maxValue);
        }

        public IReadOnlyList<NeedState> GetAllNeeds() => _needs;
    }
}
