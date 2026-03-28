using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    /// <summary>
    /// Generates a terrain mesh from a heightmap 2D array loaded at runtime.
    /// Reads heightmap data from the WorldIR geography section and builds
    /// a procedural mesh with normals, UVs, slope-based vertex colors,
    /// and a MeshCollider for physics.
    /// </summary>
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer), typeof(MeshCollider))]
    public class TerrainMeshGenerator : MonoBehaviour
    {
        [Header("Terrain Settings")]
        public float elevationScale = 20f;
        public float grassSlopeMax = 0.3f;
        public float rockSlopeMax = 0.6f;

        private MeshFilter meshFilter;
        private MeshRenderer meshRenderer;
        private MeshCollider meshCollider;

        private void Awake()
        {
            meshFilter = GetComponent<MeshFilter>();
            meshRenderer = GetComponent<MeshRenderer>();
            meshCollider = GetComponent<MeshCollider>();
        }

        /// <summary>
        /// Build terrain mesh from heightmap data. Called by WorldScaleManager.
        /// </summary>
        public void GenerateFromHeightmap(float[][] heightmap, int terrainSize, Color groundColor)
        {
            if (heightmap == null || heightmap.Length == 0)
            {
                Debug.LogWarning("[Insimul Terrain] No heightmap data — generating flat mesh");
                GenerateFlatMesh(terrainSize, groundColor);
                return;
            }

            int resolution = heightmap.Length;
            BuildMesh(heightmap, resolution, terrainSize, groundColor);
        }

        /// <summary>
        /// Fallback: generate a flat terrain mesh when no heightmap is available.
        /// </summary>
        public void GenerateFlatMesh(int terrainSize, Color groundColor)
        {
            int resolution = 4;
            float[][] flat = new float[resolution][];
            for (int i = 0; i < resolution; i++)
            {
                flat[i] = new float[resolution];
            }
            BuildMesh(flat, resolution, terrainSize, groundColor);
        }

        private void BuildMesh(float[][] heightmap, int resolution, int terrainSize, Color groundColor)
        {
            int vertCount = resolution * resolution;
            int quadCount = (resolution - 1) * (resolution - 1);
            float cellSize = (float)terrainSize / (resolution - 1);
            float halfSize = terrainSize / 2f;

            Vector3[] vertices = new Vector3[vertCount];
            Vector2[] uvs = new Vector2[vertCount];

            // Generate vertices from heightmap
            for (int row = 0; row < resolution; row++)
            {
                for (int col = 0; col < resolution; col++)
                {
                    int idx = row * resolution + col;
                    float x = col * cellSize - halfSize;
                    float z = row * cellSize - halfSize;
                    float y = heightmap[row][col] * elevationScale;

                    vertices[idx] = new Vector3(x, y, z);
                    uvs[idx] = new Vector2(
                        (float)col / (resolution - 1),
                        (float)row / (resolution - 1));
                }
            }

            // Generate triangles (two per quad)
            int[] triangles = new int[quadCount * 6];
            int triIdx = 0;

            for (int row = 0; row < resolution - 1; row++)
            {
                for (int col = 0; col < resolution - 1; col++)
                {
                    int bl = row * resolution + col;
                    int br = bl + 1;
                    int tl = bl + resolution;
                    int tr = tl + 1;

                    // First triangle (BL, TL, BR)
                    triangles[triIdx++] = bl;
                    triangles[triIdx++] = tl;
                    triangles[triIdx++] = br;

                    // Second triangle (BR, TL, TR)
                    triangles[triIdx++] = br;
                    triangles[triIdx++] = tl;
                    triangles[triIdx++] = tr;
                }
            }

            // Compute normals from triangle cross products
            Vector3[] normals = new Vector3[vertCount];

            for (int i = 0; i < triangles.Length; i += 3)
            {
                Vector3 v0 = vertices[triangles[i]];
                Vector3 v1 = vertices[triangles[i + 1]];
                Vector3 v2 = vertices[triangles[i + 2]];
                Vector3 normal = Vector3.Cross(v1 - v0, v2 - v0).normalized;

                normals[triangles[i]] += normal;
                normals[triangles[i + 1]] += normal;
                normals[triangles[i + 2]] += normal;
            }

            // Normalize accumulated normals and compute elevation+slope-based vertex colors
            // Matches Babylon.js: green lowlands → brown midlands → gray highlands → white peaks
            Color[] colors = new Color[vertCount];
            float maxY = elevationScale > 0 ? elevationScale : 1f;

            for (int i = 0; i < vertCount; i++)
            {
                normals[i] = normals[i].normalized;
                float slope = 1f - Mathf.Abs(normals[i].y);
                float elevNorm = Mathf.Clamp01(vertices[i].y / maxY); // 0=low, 1=peak
                colors[i] = ElevationToVertexColor(elevNorm, slope);
            }

            // Build Unity mesh
            Mesh mesh = new Mesh();
            mesh.name = "InsimulTerrain";

            // Use 32-bit indices for large terrains (>65k vertices)
            if (vertCount > 65000)
                mesh.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;

            mesh.vertices = vertices;
            mesh.triangles = triangles;
            mesh.normals = normals;
            mesh.uv = uvs;
            mesh.colors = colors;

            meshFilter.mesh = mesh;

            // Apply material — use vertex colors for biome-based terrain coloring
            Material mat = new Material(Shader.Find("Standard"));
            mat.color = Color.white; // white base so vertex colors show through
            mat.SetFloat("_Glossiness", 0.1f);
            mat.SetFloat("_Metallic", 0f);
            meshRenderer.material = mat;

            // Set up collision
            meshCollider.sharedMesh = mesh;

            Debug.Log($"[Insimul Terrain] Built mesh: {vertCount} verts, {triangles.Length / 3} tris, size {terrainSize}, elevation scale {elevationScale}");
        }

        /// <summary>
        /// Map elevation and slope to a direct vertex color matching Babylon.js biome coloring.
        /// Low = deep green, Mid = light green → brown, High = gray, Peak = white.
        /// Steep slopes blend toward rock gray regardless of elevation.
        /// </summary>
        private Color ElevationToVertexColor(float elevNorm, float slope)
        {
            // Base color from elevation bands
            Color baseColor;
            if (elevNorm < 0.3f)
            {
                float t = elevNorm / 0.3f;
                baseColor = Color.Lerp(
                    new Color(0.15f, 0.42f, 0.12f), // deep green
                    new Color(0.30f, 0.55f, 0.18f), // light green
                    t);
            }
            else if (elevNorm < 0.6f)
            {
                float t = (elevNorm - 0.3f) / 0.3f;
                baseColor = Color.Lerp(
                    new Color(0.30f, 0.55f, 0.18f), // light green
                    new Color(0.45f, 0.35f, 0.20f), // brown
                    t);
            }
            else if (elevNorm < 0.85f)
            {
                float t = (elevNorm - 0.6f) / 0.25f;
                baseColor = Color.Lerp(
                    new Color(0.45f, 0.35f, 0.20f), // brown
                    new Color(0.55f, 0.53f, 0.50f), // gray
                    t);
            }
            else
            {
                float t = (elevNorm - 0.85f) / 0.15f;
                baseColor = Color.Lerp(
                    new Color(0.55f, 0.53f, 0.50f), // gray
                    new Color(0.92f, 0.92f, 0.95f), // white/snow
                    t);
            }

            // Blend toward rock gray on steep slopes
            if (slope > grassSlopeMax)
            {
                float slopeBlend = Mathf.Clamp01((slope - grassSlopeMax) / (rockSlopeMax - grassSlopeMax));
                baseColor = Color.Lerp(baseColor, new Color(0.50f, 0.48f, 0.45f), slopeBlend);
            }

            return baseColor;
        }
    }
}
