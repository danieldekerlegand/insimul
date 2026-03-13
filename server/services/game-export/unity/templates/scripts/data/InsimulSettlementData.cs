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
        public InsimulStreetNetworkData streetNetwork;
    }

    [Serializable]
    public class InsimulStreetNetworkData
    {
        public InsimulStreetNodeData[] nodes;
        public InsimulStreetEdgeData[] edges;
    }

    [Serializable]
    public class InsimulStreetNodeData
    {
        public string id;
        public Vec2Data position;
        public float elevation;
        public string type;
    }

    [Serializable]
    public class InsimulStreetEdgeData
    {
        public string id;
        public string name;
        public string fromNodeId;
        public string toNodeId;
        public string streetType;
        public float width;
        public Vec3Data[] waypoints;
        public float length;
        public float condition;
        public float traffic;
        public bool sidewalks;
        public bool hasStreetLights;
    }

    [Serializable]
    public class Vec2Data
    {
        public float x;
        public float z;
    }
}
