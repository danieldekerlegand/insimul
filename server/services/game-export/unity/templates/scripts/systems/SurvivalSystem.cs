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
        public float damageRate;
    }

    public class SurvivalSystem : MonoBehaviour
    {
        private List<NeedState> _needs = new();

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
                    damageRate = need.damageRate
                });
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
    }
}
