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

            // Generate terrain from heightmap or flat fallback
            GenerateTerrain(worldData.geography.heightmap);
        }

        private void GenerateTerrain(float[][] heightmap)
        {
            var terrainGO = new GameObject("Terrain");
            terrainGO.transform.position = Vector3.zero;

            var meshGen = terrainGO.AddComponent<TerrainMeshGenerator>();
            meshGen.GenerateFromHeightmap(heightmap, terrainSize, groundColor);
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

        /// <summary>
        /// Distribute settlements within territory bounds, using 25% margin and
        /// center-placement for single settlements.
        /// </summary>
        public static Vector3[] DistributeSettlements(
            Vector3 boundsMin, Vector3 boundsMax, Vector3 boundsCenter,
            int settlementCount, float[] radii, int worldSeed)
        {
            var positions = new Vector3[settlementCount];
            if (settlementCount <= 0) return positions;

            float boundsW = boundsMax.x - boundsMin.x;
            float boundsH = boundsMax.z - boundsMin.z;

            // Reserve 25% of the world radius as margin on each side so buildings
            // never approach the terrain edge (which shows as void/water on the minimap).
            float margin = Mathf.Min(boundsW, boundsH) * 0.25f;
            float safeMinX = boundsMin.x + margin;
            float safeMaxX = boundsMax.x - margin;
            float safeMinZ = boundsMin.z + margin;
            float safeMaxZ = boundsMax.z - margin;

            System.Random rand = new System.Random(worldSeed);

            for (int index = 0; index < settlementCount; index++)
            {
                float radius = (index < radii.Length) ? radii[index] : 20f;
                Vector3 position;

                if (settlementCount == 1)
                {
                    // Single settlement: place exactly at world center
                    position = boundsCenter;
                }
                else
                {
                    int attempts = 0;
                    const int maxAttempts = 50;
                    bool placed = false;
                    position = Vector3.zero;

                    while (attempts < maxAttempts)
                    {
                        float x = safeMinX + (float)rand.NextDouble() * Mathf.Max(safeMaxX - safeMinX, 1f);
                        float z = safeMinZ + (float)rand.NextDouble() * Mathf.Max(safeMaxZ - safeMinZ, 1f);
                        position = new Vector3(x, 0f, z);

                        // Check if too close to other settlements
                        bool tooClose = false;
                        for (int j = 0; j < index; j++)
                        {
                            float dist = Vector3.Distance(position, positions[j]);
                            float otherRadius = (j < radii.Length) ? radii[j] : 20f;
                            if (dist < (radius + otherRadius + 10f))
                            {
                                tooClose = true;
                                break;
                            }
                        }

                        if (!tooClose)
                        {
                            placed = true;
                            break;
                        }
                        attempts++;
                    }

                    // If couldn't find good position, use grid fallback centered in the safe zone
                    if (!placed)
                    {
                        int cols = Mathf.CeilToInt(Mathf.Sqrt(settlementCount));
                        int row = index / cols;
                        int col = index % cols;

                        float cellWidth = (safeMaxX - safeMinX) / cols;
                        float cellHeight = (safeMaxZ - safeMinZ) / Mathf.CeilToInt((float)settlementCount / cols);

                        position = new Vector3(
                            safeMinX + col * cellWidth + cellWidth / 2f,
                            0f,
                            safeMinZ + row * cellHeight + cellHeight / 2f
                        );
                    }
                }

                positions[index] = position;
            }

            return positions;
        }

        /// <summary>
        /// Calculate recommended world size based on entity counts.
        /// Minimum 1024 so that a single town's server-generated street grid
        /// (mapSize 500-1000) fits comfortably within the world with margin.
        /// </summary>
        public static int CalculateOptimalWorldSize(int countryCount, int stateCount, int settlementCount)
        {
            float maxEntities = Mathf.Max(
                countryCount,
                Mathf.Max(stateCount / 2f, settlementCount / 5f));

            if (maxEntities <= 4f) return 1024;
            if (maxEntities <= 9f) return 1536;
            if (maxEntities <= 16f) return 2048;
            if (maxEntities <= 25f) return 2560;
            return 3072;
        }
    }
}
