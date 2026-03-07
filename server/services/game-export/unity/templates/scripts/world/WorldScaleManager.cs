using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    public class WorldScaleManager : MonoBehaviour
    {
        [Header("World")]
        public int terrainSize = {{TERRAIN_SIZE}};
        public Color groundColor = new Color({{GROUND_COLOR_R}}f, {{GROUND_COLOR_G}}f, {{GROUND_COLOR_B}}f);
        public Color skyColor = new Color({{SKY_COLOR_R}}f, {{SKY_COLOR_G}}f, {{SKY_COLOR_B}}f);
        public Color roadColor = new Color({{ROAD_COLOR_R}}f, {{ROAD_COLOR_G}}f, {{ROAD_COLOR_B}}f);

        public void Initialize(InsimulWorldIR worldData)
        {
            terrainSize = worldData.geography.terrainSize;
            Debug.Log($"[Insimul] WorldScaleManager initialized (terrain: {terrainSize})");

            // Set skybox color
            RenderSettings.ambientSkyColor = skyColor;
            Camera.main.backgroundColor = skyColor;

            // Generate flat terrain
            GenerateTerrain();
        }

        private void GenerateTerrain()
        {
            var plane = GameObject.CreatePrimitive(PrimitiveType.Plane);
            plane.name = "Terrain";
            plane.transform.localScale = new Vector3(terrainSize / 10f, 1f, terrainSize / 10f);
            plane.transform.position = Vector3.zero;

            var renderer = plane.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material = new Material(Shader.Find("Standard"));
                renderer.material.color = groundColor;
            }
        }

        public static float GetSettlementRadius(int population)
        {
            if (population <= 50) return 20f;
            if (population <= 200) return 35f;
            if (population <= 1000) return 55f;
            if (population <= 5000) return 80f;
            return 120f;
        }
    }
}
