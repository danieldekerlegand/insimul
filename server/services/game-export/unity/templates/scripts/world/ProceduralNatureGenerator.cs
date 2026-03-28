using System;
using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.World
{
    public class ProceduralNatureGenerator : MonoBehaviour
    {
        private struct BiomePreset
        {
            public float treeDensity;
            public string treeType;
            public float rockDensity;
            public float shrubDensity;
            public float grassDensity;
            public float flowerDensity;
            public Color foliageColor;
            public Color grassColor;
            public Color rockColor;
            public Color[] flowerColors;
        }

        private static readonly Dictionary<string, BiomePreset> BiomePresets = new Dictionary<string, BiomePreset>
        {
            { "forest", new BiomePreset {
                treeDensity = 0.9f, treeType = "oak", rockDensity = 0.3f, shrubDensity = 0.7f,
                grassDensity = 0.8f, flowerDensity = 0.5f,
                foliageColor = new Color(0.15f, 0.45f, 0.1f), grassColor = new Color(0.2f, 0.5f, 0.15f),
                rockColor = new Color(0.45f, 0.42f, 0.4f),
                flowerColors = new[] { new Color(1f,0.3f,0.3f), new Color(0.9f,0.8f,0.2f), new Color(0.6f,0.3f,0.8f) }
            }},
            { "plains", new BiomePreset {
                treeDensity = 0.15f, treeType = "oak", rockDensity = 0.15f, shrubDensity = 0.3f,
                grassDensity = 1f, flowerDensity = 0.7f,
                foliageColor = new Color(0.25f, 0.55f, 0.15f), grassColor = new Color(0.35f, 0.6f, 0.2f),
                rockColor = new Color(0.5f, 0.48f, 0.44f),
                flowerColors = new[] { new Color(1f,1f,0.3f), new Color(1f,0.5f,0.2f), new Color(0.4f,0.6f,1f), new Color(1f,0.4f,0.6f) }
            }},
            { "mountains", new BiomePreset {
                treeDensity = 0.3f, treeType = "pine", rockDensity = 0.8f, shrubDensity = 0.2f,
                grassDensity = 0.3f, flowerDensity = 0.15f,
                foliageColor = new Color(0.1f, 0.35f, 0.12f), grassColor = new Color(0.25f, 0.4f, 0.18f),
                rockColor = new Color(0.55f, 0.52f, 0.5f),
                flowerColors = new[] { new Color(0.8f,0.8f,1f), new Color(0.6f,0.4f,0.8f), new Color(1f,0.9f,0.5f) }
            }},
            { "desert", new BiomePreset {
                treeDensity = 0.05f, treeType = "dead", rockDensity = 0.4f, shrubDensity = 0.1f,
                grassDensity = 0.05f, flowerDensity = 0.02f,
                foliageColor = new Color(0.4f, 0.5f, 0.2f), grassColor = new Color(0.6f, 0.55f, 0.3f),
                rockColor = new Color(0.7f, 0.6f, 0.45f),
                flowerColors = new[] { new Color(1f,0.3f,0.5f), new Color(1f,0.8f,0.1f), new Color(0.9f,0.5f,0.2f) }
            }},
            { "tundra", new BiomePreset {
                treeDensity = 0.08f, treeType = "pine", rockDensity = 0.5f, shrubDensity = 0.15f,
                grassDensity = 0.2f, flowerDensity = 0.05f,
                foliageColor = new Color(0.2f, 0.35f, 0.22f), grassColor = new Color(0.35f, 0.42f, 0.3f),
                rockColor = new Color(0.6f, 0.6f, 0.62f),
                flowerColors = new[] { new Color(0.7f,0.7f,1f), new Color(1f,1f,0.8f), new Color(0.8f,0.5f,0.7f) }
            }},
            { "wasteland", new BiomePreset {
                treeDensity = 0.03f, treeType = "dead", rockDensity = 0.6f, shrubDensity = 0.05f,
                grassDensity = 0.03f, flowerDensity = 0.01f,
                foliageColor = new Color(0.3f, 0.28f, 0.15f), grassColor = new Color(0.45f, 0.4f, 0.25f),
                rockColor = new Color(0.4f, 0.35f, 0.3f),
                flowerColors = new[] { new Color(0.6f,0.3f,0.3f), new Color(0.5f,0.5f,0.2f), new Color(0.4f,0.3f,0.4f) }
            }},
            { "tropical", new BiomePreset {
                treeDensity = 0.7f, treeType = "palm", rockDensity = 0.2f, shrubDensity = 0.6f,
                grassDensity = 0.7f, flowerDensity = 0.8f,
                foliageColor = new Color(0.1f, 0.6f, 0.15f), grassColor = new Color(0.15f, 0.65f, 0.2f),
                rockColor = new Color(0.5f, 0.45f, 0.4f),
                flowerColors = new[] { new Color(1f,0.2f,0.4f), new Color(1f,0.6f,0.1f), new Color(0.9f,0.2f,0.9f), new Color(1f,1f,0.2f), new Color(0.3f,0.8f,1f) }
            }},
            { "swamp", new BiomePreset {
                treeDensity = 0.5f, treeType = "oak", rockDensity = 0.2f, shrubDensity = 0.5f,
                grassDensity = 0.6f, flowerDensity = 0.3f,
                foliageColor = new Color(0.12f, 0.3f, 0.08f), grassColor = new Color(0.18f, 0.35f, 0.12f),
                rockColor = new Color(0.35f, 0.33f, 0.3f),
                flowerColors = new[] { new Color(0.8f,0.8f,0.3f), new Color(0.5f,0.7f,0.3f), new Color(0.6f,0.3f,0.5f) }
            }},
            { "urban", new BiomePreset {
                treeDensity = 0.05f, treeType = "oak", rockDensity = 0.02f, shrubDensity = 0.08f,
                grassDensity = 0.1f, flowerDensity = 0.1f,
                foliageColor = new Color(0.2f, 0.5f, 0.15f), grassColor = new Color(0.3f, 0.55f, 0.2f),
                rockColor = new Color(0.5f, 0.5f, 0.5f),
                flowerColors = new[] { new Color(1f,0.3f,0.3f), new Color(1f,0.8f,0.2f), new Color(0.8f,0.3f,0.8f) }
            }}
        };

        private Dictionary<string, Material> materialCache = new Dictionary<string, Material>();
        private Dictionary<string, Mesh> treeTemplates = new Dictionary<string, Mesh>();
        private Mesh rockMesh;
        private Mesh shrubMesh;
        private Mesh flowerMesh;
        private Mesh grassQuadMesh;
        private System.Random rng;
        private Func<float, float, bool> positionValidator;
        private Transform natureRoot;
        private int terrainSize;
        private MeshCollider terrainCollider;

        public void SetPositionValidator(Func<float, float, bool> validator)
        {
            positionValidator = validator;
        }

        public void GenerateFromData(InsimulWorldIR worldData)
        {
            terrainSize = worldData.geography != null ? worldData.geography.terrainSize : 200;
            string seed = worldData.meta != null ? worldData.meta.seed ?? "default" : "default";
            rng = new System.Random(seed.GetHashCode());

            var terrainGen = FindFirstObjectByType<TerrainMeshGenerator>();
            if (terrainGen != null)
                terrainCollider = terrainGen.GetComponent<MeshCollider>();

            GameObject rootGo = new GameObject("Nature");
            rootGo.transform.SetParent(transform);
            natureRoot = rootGo.transform;

            BuildTemplateMeshes();

            var biomeZones = worldData.geography?.biomeZones;
            if (biomeZones == null || biomeZones.Length == 0)
            {
                GenerateDefault();
                return;
            }

            foreach (var zone in biomeZones)
            {
                string biomeKey = zone.biome?.ToLowerInvariant() ?? "plains";
                if (!BiomePresets.TryGetValue(biomeKey, out BiomePreset preset))
                    preset = BiomePresets["plains"];

                float density = zone.coverageFraction > 0 ? zone.coverageFraction : 0.3f;
                if (zone.species != null && zone.species.Length > 0)
                    density = Mathf.Max(density, zone.species[0].density);

                string treeType = preset.treeType;
                if (zone.species != null)
                {
                    foreach (var sp in zone.species)
                    {
                        if (!string.IsNullOrEmpty(sp.treeType))
                        {
                            treeType = sp.treeType.ToLowerInvariant();
                            break;
                        }
                    }
                }

                float biomeDensity = density * preset.treeDensity;
                SpawnTrees(treeType, biomeDensity, preset.foliageColor);
                SpawnRocks(density * preset.rockDensity, preset.rockColor);
                SpawnShrubs(density * preset.shrubDensity, preset.foliageColor);
                SpawnGrass(density * preset.grassDensity, preset.grassColor);
                SpawnFlowers(density * preset.flowerDensity, preset.flowerColors);
            }

            Debug.Log($"[Insimul] ProceduralNatureGenerator complete — terrain: {terrainSize}, seed: {seed}");
        }

        private void GenerateDefault()
        {
            var preset = BiomePresets["plains"];
            SpawnTrees("oak", 0.3f, preset.foliageColor);
            SpawnRocks(0.15f, preset.rockColor);
            SpawnShrubs(0.2f, preset.foliageColor);
            SpawnGrass(0.5f, preset.grassColor);
            SpawnFlowers(0.3f, preset.flowerColors);
        }

        #region Template Mesh Building

        private void BuildTemplateMeshes()
        {
            treeTemplates["pine"] = BuildPineTemplate();
            treeTemplates["oak"] = BuildOakTemplate();
            treeTemplates["palm"] = BuildPalmTemplate();
            treeTemplates["dead"] = BuildDeadTemplate();
            rockMesh = BuildRockMesh();
            shrubMesh = BuildShrubMesh();
            flowerMesh = BuildFlowerMesh();
            grassQuadMesh = BuildGrassQuad();
        }

        private Mesh BuildPineTemplate()
        {
            var combine = new List<CombineInstance>();
            // Trunk
            combine.Add(MakeCylinderCI(0.15f, 3f, Vector3.zero));
            // 3 stacked cones
            float y = 2.5f;
            float[] radii = { 1.8f, 1.4f, 1.0f };
            float coneH = 2f;
            foreach (float r in radii)
            {
                combine.Add(MakeConeCI(r, coneH, new Vector3(0, y, 0)));
                y += coneH * 0.6f;
            }
            return CombineAll(combine, "PineTemplate");
        }

        private Mesh BuildOakTemplate()
        {
            var combine = new List<CombineInstance>();
            combine.Add(MakeCylinderCI(0.25f, 2.5f, Vector3.zero));
            combine.Add(MakeSphereCI(2.0f, new Vector3(0, 4f, 0)));
            combine.Add(MakeSphereCI(1.5f, new Vector3(0.8f, 4.8f, 0.5f)));
            return CombineAll(combine, "OakTemplate");
        }

        private Mesh BuildPalmTemplate()
        {
            var combine = new List<CombineInstance>();
            combine.Add(MakeCylinderCI(0.12f, 5f, Vector3.zero));
            var ci = MakeSphereCI(1f, new Vector3(0, 5.5f, 0));
            ci.transform = Matrix4x4.TRS(new Vector3(0, 5.5f, 0), Quaternion.identity, new Vector3(2f, 1f, 2f));
            combine.Add(ci);
            return CombineAll(combine, "PalmTemplate");
        }

        private Mesh BuildDeadTemplate()
        {
            var combine = new List<CombineInstance>();
            combine.Add(MakeCylinderCI(0.15f, 4f, Vector3.zero));
            for (int i = 0; i < 3; i++)
            {
                float angle = 30f + i * 110f;
                float tilt = 40f + i * 15f;
                var rot = Quaternion.Euler(tilt, angle, 0);
                float h = 1.5f + i * 0.3f;
                var ci = new CombineInstance();
                ci.mesh = CreateCylinder(0.06f, h);
                ci.transform = Matrix4x4.TRS(new Vector3(0, 2f + i * 0.6f, 0), rot, Vector3.one);
                combine.Add(ci);
            }
            return CombineAll(combine, "DeadTemplate");
        }

        private Mesh BuildRockMesh()
        {
            Mesh m = CreateSphere(0.5f, 6, 4);
            m.name = "RockTemplate";
            return m;
        }

        private Mesh BuildShrubMesh()
        {
            Mesh m = CreateSphere(0.5f, 8, 6);
            m.name = "ShrubTemplate";
            return m;
        }

        private Mesh BuildFlowerMesh()
        {
            var combine = new List<CombineInstance>();
            // Stem
            combine.Add(MakeCylinderCI(0.02f, 0.3f, Vector3.zero));
            // Head
            combine.Add(MakeSphereCI(0.06f, new Vector3(0, 0.35f, 0)));
            return CombineAll(combine, "FlowerTemplate");
        }

        private Mesh BuildGrassQuad()
        {
            Mesh m = new Mesh { name = "GrassQuad" };
            m.vertices = new[] {
                new Vector3(-0.1f, 0, 0), new Vector3(0.1f, 0, 0),
                new Vector3(-0.05f, 0.4f, 0), new Vector3(0.05f, 0.4f, 0)
            };
            m.triangles = new[] { 0, 2, 1, 1, 2, 3 };
            m.normals = new[] { Vector3.back, Vector3.back, Vector3.back, Vector3.back };
            m.uv = new[] { new Vector2(0,0), new Vector2(1,0), new Vector2(0,1), new Vector2(1,1) };
            return m;
        }

        #endregion

        #region Primitive Helpers

        private CombineInstance MakeCylinderCI(float radius, float height, Vector3 pos)
        {
            return new CombineInstance { mesh = CreateCylinder(radius, height), transform = Matrix4x4.Translate(pos) };
        }

        private CombineInstance MakeSphereCI(float radius, Vector3 pos)
        {
            return new CombineInstance { mesh = CreateSphere(radius, 10, 8), transform = Matrix4x4.Translate(pos) };
        }

        private CombineInstance MakeConeCI(float radius, float height, Vector3 pos)
        {
            return new CombineInstance { mesh = CreateCone(radius, height), transform = Matrix4x4.Translate(pos) };
        }

        private Mesh CombineAll(List<CombineInstance> list, string name)
        {
            Mesh m = new Mesh { name = name };
            m.CombineMeshes(list.ToArray(), true, true);
            m.RecalculateNormals();
            m.RecalculateBounds();
            return m;
        }

        private Mesh CreateCylinder(float radius, float height, int segments = 8)
        {
            Mesh m = new Mesh();
            int count = segments + 1;
            var verts = new List<Vector3>();
            var tris = new List<int>();

            for (int i = 0; i <= segments; i++)
            {
                float a = (float)i / segments * Mathf.PI * 2f;
                float x = Mathf.Cos(a) * radius;
                float z = Mathf.Sin(a) * radius;
                verts.Add(new Vector3(x, 0, z));
                verts.Add(new Vector3(x, height, z));
            }
            for (int i = 0; i < segments; i++)
            {
                int b = i * 2;
                tris.AddRange(new[] { b, b + 1, b + 2, b + 2, b + 1, b + 3 });
            }

            m.vertices = verts.ToArray();
            m.triangles = tris.ToArray();
            m.RecalculateNormals();
            return m;
        }

        private Mesh CreateSphere(float radius, int lonSegments, int latSegments)
        {
            Mesh m = new Mesh();
            var verts = new List<Vector3>();
            var tris = new List<int>();

            for (int lat = 0; lat <= latSegments; lat++)
            {
                float theta = (float)lat / latSegments * Mathf.PI;
                float sinT = Mathf.Sin(theta);
                float cosT = Mathf.Cos(theta);
                for (int lon = 0; lon <= lonSegments; lon++)
                {
                    float phi = (float)lon / lonSegments * Mathf.PI * 2f;
                    verts.Add(new Vector3(sinT * Mathf.Cos(phi), cosT, sinT * Mathf.Sin(phi)) * radius);
                }
            }
            int stride = lonSegments + 1;
            for (int lat = 0; lat < latSegments; lat++)
            {
                for (int lon = 0; lon < lonSegments; lon++)
                {
                    int cur = lat * stride + lon;
                    tris.AddRange(new[] { cur, cur + stride, cur + 1, cur + 1, cur + stride, cur + stride + 1 });
                }
            }
            m.vertices = verts.ToArray();
            m.triangles = tris.ToArray();
            m.RecalculateNormals();
            return m;
        }

        private Mesh CreateCone(float radius, float height, int segments = 8)
        {
            Mesh m = new Mesh();
            var verts = new List<Vector3>();
            var tris = new List<int>();

            verts.Add(new Vector3(0, height, 0)); // tip
            for (int i = 0; i <= segments; i++)
            {
                float a = (float)i / segments * Mathf.PI * 2f;
                verts.Add(new Vector3(Mathf.Cos(a) * radius, 0, Mathf.Sin(a) * radius));
            }
            for (int i = 0; i < segments; i++)
                tris.AddRange(new[] { 0, i + 1, i + 2 });

            m.vertices = verts.ToArray();
            m.triangles = tris.ToArray();
            m.RecalculateNormals();
            return m;
        }

        #endregion

        #region Spawning

        private void SpawnTrees(string treeType, float biomeDensity, Color foliageColor)
        {
            if (biomeDensity <= 0.001f) return;
            string key = treeType.ToLowerInvariant();
            if (!treeTemplates.ContainsKey(key)) key = "oak";
            Mesh template = treeTemplates[key];

            int count = Mathf.Min(300, Mathf.RoundToInt(terrainSize * terrainSize / 400f * biomeDensity));
            Material mat = GetOrCreateMaterial("tree", foliageColor);
            Material trunkMat = GetOrCreateMaterial("trunk", new Color(0.35f, 0.2f, 0.1f));

            Transform folder = CreateFolder("Trees");
            for (int i = 0; i < count; i++)
            {
                if (!TryGetPlacement(0.6f, out Vector3 pos)) continue;

                GameObject go = new GameObject($"Tree_{i}");
                go.transform.SetParent(folder);
                go.transform.position = pos;
                go.transform.rotation = Quaternion.Euler(0, (float)(rng.NextDouble() * 360.0), 0);
                float s = 0.8f + (float)rng.NextDouble() * 0.4f;
                go.transform.localScale = Vector3.one * s;
                go.isStatic = true;

                var mf = go.AddComponent<MeshFilter>();
                mf.sharedMesh = template;
                var mr = go.AddComponent<MeshRenderer>();
                mr.sharedMaterial = mat;

                AddLODGroup(go, 80f, 120f);
            }
        }

        private void SpawnRocks(float biomeDensity, Color rockColor)
        {
            if (biomeDensity <= 0.001f) return;
            int count = Mathf.RoundToInt(30 * biomeDensity);
            Transform folder = CreateFolder("Rocks");

            for (int i = 0; i < count; i++)
            {
                if (!TryGetPlacement(1f, out Vector3 pos)) continue;

                float brightness = 0.9f + (float)rng.NextDouble() * 0.2f;
                Color c = rockColor * brightness;
                c.a = 1f;
                Material mat = GetOrCreateMaterial("rock", c);

                GameObject go = new GameObject($"Rock_{i}");
                go.transform.SetParent(folder);
                go.transform.position = pos;
                go.transform.rotation = Quaternion.Euler(0, (float)(rng.NextDouble() * 360.0), 0);
                float baseScale = 1f + (float)rng.NextDouble() * 3f;
                go.transform.localScale = new Vector3(baseScale, baseScale * 0.6f, baseScale);
                go.isStatic = true;

                var mf = go.AddComponent<MeshFilter>();
                mf.sharedMesh = rockMesh;
                var mr = go.AddComponent<MeshRenderer>();
                mr.sharedMaterial = mat;

                AddLODGroup(go, 50f, 80f);
            }
        }

        private void SpawnShrubs(float biomeDensity, Color foliageColor)
        {
            if (biomeDensity <= 0.001f) return;
            int count = Mathf.RoundToInt(40 * biomeDensity);
            Color dark = foliageColor * 0.7f; dark.a = 1f;
            Material mat = GetOrCreateMaterial("shrub", dark);
            Transform folder = CreateFolder("Shrubs");

            for (int i = 0; i < count; i++)
            {
                if (!TryGetPlacement(0.8f, out Vector3 pos)) continue;

                GameObject go = new GameObject($"Shrub_{i}");
                go.transform.SetParent(folder);
                go.transform.position = pos;
                float s = 0.6f + (float)rng.NextDouble() * 0.5f;
                go.transform.localScale = new Vector3(0.8f * s, 0.5f * s, 0.8f * s);
                go.isStatic = true;

                var mf = go.AddComponent<MeshFilter>();
                mf.sharedMesh = shrubMesh;
                var mr = go.AddComponent<MeshRenderer>();
                mr.sharedMaterial = mat;

                AddLODGroup(go, 40f, 60f);
            }
        }

        private void SpawnGrass(float biomeDensity, Color grassColor)
        {
            if (biomeDensity <= 0.001f) return;
            int totalInstances = Mathf.RoundToInt(500 * biomeDensity);
            if (totalInstances <= 0) return;

            Material mat = GetOrCreateMaterial("grass", grassColor);
            mat.SetFloat("_Mode", 3); // Transparent
            mat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            mat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            mat.SetInt("_ZWrite", 0);
            mat.DisableKeyword("_ALPHATEST_ON");
            mat.EnableKeyword("_ALPHABLEND_ON");
            mat.renderQueue = 3000;
            Color gc = grassColor; gc.a = 0.8f;
            mat.color = gc;

            var matrices = new List<Matrix4x4>();
            float half = terrainSize / 2f;

            for (int i = 0; i < totalInstances; i++)
            {
                float x = (float)(rng.NextDouble() * terrainSize) - half;
                float z = (float)(rng.NextDouble() * terrainSize) - half;
                if (positionValidator != null && positionValidator(x, z)) continue;
                float y = SampleHeight(x, z);
                float slope = SampleSlope(x, z);
                if (slope > 0.7f) continue;

                float rotY = (float)(rng.NextDouble() * 360.0);
                float s = 0.8f + (float)rng.NextDouble() * 0.4f;
                matrices.Add(Matrix4x4.TRS(new Vector3(x, y, z), Quaternion.Euler(0, rotY, 0), Vector3.one * s));
            }

            // Draw in batches of 1023
            int batchSize = 1023;
            Transform folder = CreateFolder("Grass");
            for (int b = 0; b < matrices.Count; b += batchSize)
            {
                int end = Mathf.Min(b + batchSize, matrices.Count);
                var batch = matrices.GetRange(b, end - b).ToArray();

                GameObject batchGo = new GameObject($"GrassBatch_{b / batchSize}");
                batchGo.transform.SetParent(folder);
                batchGo.isStatic = true;
                var drawer = batchGo.AddComponent<GrassInstanceDrawer>();
                drawer.Init(grassQuadMesh, mat, batch, 30f);
            }
        }

        private void SpawnFlowers(float biomeDensity, Color[] flowerColors)
        {
            if (biomeDensity <= 0.001f || flowerColors == null || flowerColors.Length == 0) return;
            int count = Mathf.RoundToInt(50 * biomeDensity);
            Transform folder = CreateFolder("Flowers");

            for (int i = 0; i < count; i++)
            {
                if (!TryGetPlacement(0.5f, out Vector3 pos)) continue;
                Color fc = flowerColors[rng.Next(flowerColors.Length)];
                Material mat = GetOrCreateMaterial("flower", fc);

                GameObject go = new GameObject($"Flower_{i}");
                go.transform.SetParent(folder);
                go.transform.position = pos;
                float s = 0.8f + (float)rng.NextDouble() * 0.5f;
                go.transform.localScale = Vector3.one * s;
                go.isStatic = true;

                var mf = go.AddComponent<MeshFilter>();
                mf.sharedMesh = flowerMesh;
                var mr = go.AddComponent<MeshRenderer>();
                mr.sharedMaterial = mat;

                AddLODGroup(go, 25f, 40f);
            }
        }

        #endregion

        #region Placement Helpers

        private bool TryGetPlacement(float maxSlope, out Vector3 pos, int maxAttempts = 10)
        {
            float half = terrainSize / 2f;
            for (int a = 0; a < maxAttempts; a++)
            {
                float x = (float)(rng.NextDouble() * terrainSize) - half;
                float z = (float)(rng.NextDouble() * terrainSize) - half;

                if (positionValidator != null && positionValidator(x, z)) continue;

                float slope = SampleSlope(x, z);
                if (slope > maxSlope) continue;

                float y = SampleHeight(x, z);
                pos = new Vector3(x, y, z);
                return true;
            }
            pos = Vector3.zero;
            return false;
        }

        private float SampleHeight(float x, float z)
        {
            if (terrainCollider != null)
            {
                Ray ray = new Ray(new Vector3(x, 500f, z), Vector3.down);
                if (terrainCollider.Raycast(ray, out RaycastHit hit, 1000f))
                    return hit.point.y;
            }
            return 0f;
        }

        private float SampleSlope(float x, float z)
        {
            float d = 1f;
            float hL = SampleHeight(x - d, z);
            float hR = SampleHeight(x + d, z);
            float hU = SampleHeight(x, z + d);
            float hD = SampleHeight(x, z - d);
            float dx = (hR - hL) / (2f * d);
            float dz = (hU - hD) / (2f * d);
            return Mathf.Sqrt(dx * dx + dz * dz) / (1f + Mathf.Sqrt(dx * dx + dz * dz));
        }

        #endregion

        #region Material & LOD Helpers

        private Material GetOrCreateMaterial(string type, Color color)
        {
            string hex = ColorUtility.ToHtmlStringRGB(color);
            string key = $"nature_{type}_{hex}";
            if (materialCache.TryGetValue(key, out Material cached))
                return cached;

            Material mat = new Material(Shader.Find("Standard"));
            mat.color = color;
            mat.SetFloat("_Glossiness", 0.1f);
            mat.SetColor("_SpecColor", new Color(0.04f, 0.04f, 0.04f));
            materialCache[key] = mat;
            return mat;
        }

        private void AddLODGroup(GameObject go, float fullDistance, float cullDistance)
        {
            var lodGroup = go.AddComponent<LODGroup>();
            var renderers = go.GetComponents<Renderer>();
            if (renderers.Length == 0) renderers = go.GetComponentsInChildren<Renderer>();

            float fullScreen = ScreenRelativeSize(fullDistance);
            float cullScreen = ScreenRelativeSize(cullDistance);

            LOD[] lods = new LOD[]
            {
                new LOD(fullScreen, renderers),
                new LOD(cullScreen, new Renderer[0])
            };
            lodGroup.SetLODs(lods);
            lodGroup.RecalculateBounds();
        }

        private float ScreenRelativeSize(float distance)
        {
            return Mathf.Clamp01(2f / (distance + 1f));
        }

        private Transform CreateFolder(string name)
        {
            GameObject go = new GameObject(name);
            go.transform.SetParent(natureRoot);
            go.isStatic = true;
            return go.transform;
        }

        #endregion
    }

    public class GrassInstanceDrawer : MonoBehaviour
    {
        private Mesh mesh;
        private Material material;
        private Matrix4x4[] matrices;
        private float cullDistance;
        private Camera mainCam;

        public void Init(Mesh grassMesh, Material grassMat, Matrix4x4[] instanceMatrices, float maxDistance)
        {
            mesh = grassMesh;
            material = grassMat;
            matrices = instanceMatrices;
            cullDistance = maxDistance;
        }

        private void Update()
        {
            if (mesh == null || material == null || matrices == null || matrices.Length == 0) return;
            if (mainCam == null) mainCam = Camera.main;
            if (mainCam == null) return;

            Vector3 camPos = mainCam.transform.position;
            // Check distance to batch center (first instance)
            Vector3 batchPos = matrices[0].GetColumn(3);
            if (Vector3.Distance(camPos, batchPos) > cullDistance + 20f) return;

            Graphics.DrawMeshInstanced(mesh, 0, material, matrices);
        }
    }
}
