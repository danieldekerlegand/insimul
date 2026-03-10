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

        public const float SPAWN_CLEAR_RADIUS = 15f;

        private static readonly (int min, int max, float radius)[] PopScale = new[]
        {
            (0, 50, 20f), (51, 200, 35f), (201, 1000, 55f),
            (1001, 5000, 80f), (5001, int.MaxValue, 120f)
        };

        public static float GetSettlementRadius(int population)
        {
            if (population <= 50) return 20f;
            if (population <= 200) return 35f;
            if (population <= 1000) return 55f;
            if (population <= 5000) return 80f;
            return 120f;
        }

        public static string GetSettlementTier(int population)
        {
            if (population < 100) return "hamlet";
            if (population < 500) return "village";
            if (population < 2000) return "town";
            if (population < 10000) return "city";
            return "metropolis";
        }

        public static Vector3[] GenerateLotPositions(Vector3 settlementPosition, float settlementRadius, int lotCount)
        {
            var positions = new Vector3[lotCount];
            if (lotCount <= 0) return positions;

            int cols = Mathf.CeilToInt(Mathf.Sqrt(lotCount));
            int rows = Mathf.CeilToInt((float)lotCount / cols);
            float lotSpacing = 20f;
            float gridWidth = (cols - 1) * lotSpacing;
            float gridHeight = (rows - 1) * lotSpacing;

            // Simple seeded random based on position
            System.Random rand = new System.Random(
                settlementPosition.GetHashCode());

            for (int i = 0; i < lotCount; i++)
            {
                int row = i / cols;
                int col = i % cols;

                float baseX = settlementPosition.x - gridWidth / 2f + col * lotSpacing;
                float baseZ = settlementPosition.z - gridHeight / 2f + row * lotSpacing;

                float jitterX = ((float)rand.NextDouble() - 0.5f) * 4f;
                float jitterZ = ((float)rand.NextDouble() - 0.5f) * 4f;

                float lotX = baseX + jitterX;
                float lotZ = baseZ + jitterZ;

                // Push lots outside spawn clear radius
                float dx = lotX - settlementPosition.x;
                float dz = lotZ - settlementPosition.z;
                float dist = Mathf.Sqrt(dx * dx + dz * dz);
                if (dist < SPAWN_CLEAR_RADIUS)
                {
                    float angle = dist > 0.001f
                        ? Mathf.Atan2(dz, dx)
                        : i * Mathf.PI * 0.618f;
                    lotX = settlementPosition.x + Mathf.Cos(angle) * SPAWN_CLEAR_RADIUS;
                    lotZ = settlementPosition.z + Mathf.Sin(angle) * SPAWN_CLEAR_RADIUS;
                }

                positions[i] = new Vector3(lotX, 0f, lotZ);
            }

            return positions;
        }

        public static int CalculateOptimalWorldSize(int countryCount, int stateCount, int settlementCount)
        {
            float maxEntities = Mathf.Max(
                countryCount,
                Mathf.Max(stateCount / 2f, settlementCount / 5f));

            if (maxEntities <= 4f) return 512;
            if (maxEntities <= 9f) return 768;
            if (maxEntities <= 16f) return 1024;
            if (maxEntities <= 25f) return 1536;
            return 2048;
        }
    }
}
