using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    /// <summary>
    /// Generates roads from IR data. Uses street network segments from settlements
    /// for named streets with waypoints, and falls back to simple point-to-point
    /// roads for inter-settlement connections.
    /// </summary>
    public class RoadGenerator : MonoBehaviour
    {
        public Color roadColor = new Color({{ROAD_COLOR_R}}f, {{ROAD_COLOR_G}}f, {{ROAD_COLOR_B}}f);
        public float roadWidth = {{ROAD_WIDTH}}f;

        [Tooltip("Height offset above terrain to prevent z-fighting")]
        public float roadElevation = 0.05f;

        public void GenerateFromData(InsimulWorldIR worldData)
        {
            int streetCount = 0;
            int roadCount = 0;

            // Generate named streets from settlement street networks
            if (worldData?.geography?.settlements != null)
            {
                foreach (var settlement in worldData.geography.settlements)
                {
                    if (settlement.streetNetwork?.segments == null) continue;
                    foreach (var segment in settlement.streetNetwork.segments)
                    {
                        GenerateStreetSegment(segment, settlement.position);
                        streetCount++;
                    }
                }
            }

            // Generate inter-settlement roads
            if (worldData?.entities?.buildings != null)
            {
                var irJson = Resources.Load<TextAsset>("Data/roads");
                if (irJson != null)
                {
                    var roads = JsonUtility.FromJson<RoadArray>("{\"items\":" + irJson.text + "}");
                    if (roads?.items != null)
                    {
                        foreach (var road in roads.items)
                        {
                            if (road.waypoints != null && road.waypoints.Length >= 2)
                            {
                                GenerateRoadFromWaypoints(road.waypoints, road.width);
                                roadCount++;
                            }
                        }
                    }
                }
            }

            Debug.Log($"[Insimul] Roads: {streetCount} street segments, {roadCount} inter-settlement roads");
        }

        private void GenerateStreetSegment(InsimulStreetSegment segment, Vec3Data settlementPos)
        {
            if (segment.waypoints == null || segment.waypoints.Length < 2) return;

            var roadObj = new GameObject($"Street_{segment.name}_{segment.id}");
            roadObj.transform.SetParent(transform);

            var lr = roadObj.AddComponent<LineRenderer>();
            lr.positionCount = segment.waypoints.Length;

            for (int i = 0; i < segment.waypoints.Length; i++)
            {
                var wp = segment.waypoints[i].ToVector3();
                lr.SetPosition(i, wp + Vector3.up * roadElevation);
            }

            float w = segment.width > 0 ? segment.width : roadWidth;
            lr.startWidth = w;
            lr.endWidth = w;
            lr.material = new Material(Shader.Find("Unlit/Color"));
            lr.material.color = roadColor;
            lr.numCapVertices = 2;
            lr.numCornerVertices = 3;
        }

        private void GenerateRoadFromWaypoints(Vec3Data[] waypoints, float width)
        {
            var roadObj = new GameObject("Road");
            roadObj.transform.SetParent(transform);

            var lr = roadObj.AddComponent<LineRenderer>();
            lr.positionCount = waypoints.Length;

            for (int i = 0; i < waypoints.Length; i++)
            {
                lr.SetPosition(i, waypoints[i].ToVector3() + Vector3.up * roadElevation);
            }

            float w = width > 0 ? width : roadWidth;
            lr.startWidth = w;
            lr.endWidth = w;
            lr.material = new Material(Shader.Find("Unlit/Color"));
            lr.material.color = roadColor;
            lr.numCapVertices = 2;
            lr.numCornerVertices = 3;
        }

        public void GenerateRoad(Vector3 from, Vector3 to, float width)
        {
            var roadObj = new GameObject("Road");
            roadObj.transform.SetParent(transform);

            var lr = roadObj.AddComponent<LineRenderer>();
            lr.positionCount = 2;
            lr.SetPosition(0, from + Vector3.up * roadElevation);
            lr.SetPosition(1, to + Vector3.up * roadElevation);
            lr.startWidth = width;
            lr.endWidth = width;
            lr.material = new Material(Shader.Find("Unlit/Color"));
            lr.material.color = roadColor;
        }

        [System.Serializable]
        private class RoadArray { public RoadEntry[] items; }

        [System.Serializable]
        private class RoadEntry
        {
            public string fromId;
            public string toId;
            public float width;
            public Vec3Data[] waypoints;
        }
    }
}
