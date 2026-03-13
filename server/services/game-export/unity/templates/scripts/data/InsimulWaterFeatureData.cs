using System;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulWaterFeatureData
    {
        public string id;
        public string name;
        public string type;
        public string subType;
        public Vec3Data position;
        public float waterLevel;
        public float depth;
        public float width;
        public float flowSpeed;
        public bool isNavigable = true;
        public bool isDrinkable = true;
        public string settlementId;
        public string biome;
        public float transparency = 0.3f;
        public string modelAssetKey;
    }
}
