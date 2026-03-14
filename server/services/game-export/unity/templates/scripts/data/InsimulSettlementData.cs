using System;
using UnityEngine;

namespace Insimul.Data
{
    [Serializable]
    public class InsimulStreetNode
    {
        public string id;
        public Vec3Data position;
        public string[] intersectionOf;
    }

    [Serializable]
    public class InsimulStreetSegment
    {
        public string id;
        public string name;
        public string direction;
        public string[] nodeIds;
        public Vec3Data[] waypoints;
        public float width = 2.5f;
    }

    [Serializable]
    public class InsimulStreetNetwork
    {
        public string layout;
        public InsimulStreetNode[] nodes;
        public InsimulStreetSegment[] segments;
    }

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

        public InsimulLotData[] lots;
        public InsimulStreetNetwork streetNetwork;
    }
}
