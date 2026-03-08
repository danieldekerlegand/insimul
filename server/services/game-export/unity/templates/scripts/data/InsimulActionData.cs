using System;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulActionEffectData
    {
        public string category;
        public string type;
        public string operatorStr;
        public float value;
        public string first;
    }

    [Serializable]
    public class InsimulActionData
    {
        public string id;
        public string name;
        public string description;
        public string actionType;
        public string category;
        public float duration = 1f;
        public float difficulty = 0.5f;
        public int energyCost = 1;
        public bool requiresTarget;
        public float range;
        public float cooldown;
        public bool isActive = true;
        public string[] tags;
        public InsimulActionEffectData[] effects;
    }
}
