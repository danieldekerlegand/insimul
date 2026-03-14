using System;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulSettlementData
    {
        public string id;
        public string name;
        public string description;
        public string settlementType;
        public int population = 100;
        public Vec3Data position;
        public float radius = 20f;
        public string countryId;
        public string stateId;
        public string mayorId;

        // Elevation profile (null if no heightmap available)
        public float minElevation;
        public float maxElevation;
        public float meanElevation;
        public float elevationRange;
        public string slopeClass = "flat";
    }
}
