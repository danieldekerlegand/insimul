using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    public class RoadGenerator : MonoBehaviour
    {
        public Color roadColor = new Color({{ROAD_COLOR_R}}f, {{ROAD_COLOR_G}}f, {{ROAD_COLOR_B}}f);
        public float roadWidth = {{ROAD_WIDTH}}f;

        public void GenerateFromData(InsimulWorldIR worldData)
        {
            // TODO: Generate LineRenderer or mesh-based roads from WorldIR road data
            Debug.Log("[Insimul] RoadGenerator — stub (implement mesh roads)");
        }

        public void GenerateRoad(Vector3 from, Vector3 to, float width)
        {
            var roadObj = new GameObject("Road");
            roadObj.transform.SetParent(transform);

            var lr = roadObj.AddComponent<LineRenderer>();
            lr.positionCount = 2;
            lr.SetPosition(0, from + Vector3.up * 0.05f);
            lr.SetPosition(1, to + Vector3.up * 0.05f);
            lr.startWidth = width;
            lr.endWidth = width;
            lr.material = new Material(Shader.Find("Unlit/Color"));
            lr.material.color = roadColor;
        }
    }
}
