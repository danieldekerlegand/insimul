using UnityEngine;
using System.Collections.Generic;
using Insimul.Data;

namespace Insimul.World
{
    /// <summary>
    /// Generates buildings from world IR data.
    /// When a building has a modelAssetKey, the corresponding bundled GLTF/GLB is loaded
    /// via Resources.Load (assets must be in Assets/Resources/). Falls back to procedural
    /// cube geometry when no model is available.
    /// Uses shared material cache and LOD groups for performance.
    /// </summary>
    public class ProceduralBuildingGenerator : MonoBehaviour
    {
        public Color baseColor = new Color({{BASE_COLOR_R}}f, {{BASE_COLOR_G}}f, {{BASE_COLOR_B}}f);
        public Color roofColor = new Color({{ROOF_COLOR_R}}f, {{ROOF_COLOR_G}}f, {{ROOF_COLOR_B}}f);

        [Tooltip("Distance at which buildings are culled")]
        public float lodCullDistance = 150f;

        private Dictionary<string, Material> _materialCache = new Dictionary<string, Material>();

        private Material GetSharedMaterial(string key, Color color)
        {
            if (_materialCache.TryGetValue(key, out var cached)) return cached;
            var mat = new Material(Shader.Find("Standard"));
            mat.color = color;
            _materialCache[key] = mat;
            return mat;
        }

        public void GenerateFromData(InsimulWorldIR worldData)
        {
            if (worldData?.entities?.buildings == null) return;

            int loadedCount = 0, proceduralCount = 0;
            foreach (var bld in worldData.entities.buildings)
            {
                var pos = bld.position.ToVector3();
                bool placed = false;

                if (!string.IsNullOrEmpty(bld.modelAssetKey))
                {
                    // Strip file extension — Resources.Load doesn't use it
                    var resourcePath = System.IO.Path.ChangeExtension(bld.modelAssetKey, null);
                    var prefab = Resources.Load<GameObject>(resourcePath);
                    if (prefab != null)
                    {
                        var go = Instantiate(prefab, pos, Quaternion.Euler(0, bld.rotation, 0), transform);
                        go.name = $"Building_{bld.id}";
                        go.tag = "Building";
                        go.isStatic = true;
                        loadedCount++;
                        placed = true;
                    }
                }

                if (!placed)
                {
                    GenerateBuildingProcedural(pos, bld.rotation, bld.floors, bld.width, bld.depth, bld.buildingRole);
                    proceduralCount++;
                }
            }
            Debug.Log($"[Insimul] Buildings: {loadedCount} from assets, {proceduralCount} procedural");
        }

        private void GenerateBuildingProcedural(Vector3 position, float rotation, int floors,
            float width, float depth, string role)
        {
            float floorHeight = 3f;
            float totalHeight = floors * floorHeight;

            // Base
            var building = GameObject.CreatePrimitive(PrimitiveType.Cube);
            building.name = $"Building_{role}";
            building.tag = "Building";
            building.transform.position = position + Vector3.up * totalHeight / 2f;
            building.transform.localScale = new Vector3(width, totalHeight, depth);
            building.transform.rotation = Quaternion.Euler(0, rotation, 0);
            building.transform.SetParent(transform);

            // Shared material instead of per-building allocation
            var renderer = building.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.sharedMaterial = GetSharedMaterial("wall", baseColor);
            }

            // Roof
            var roof = GameObject.CreatePrimitive(PrimitiveType.Cube);
            roof.name = "Roof";
            roof.transform.position = position + Vector3.up * (totalHeight + 0.5f);
            roof.transform.localScale = new Vector3(width + 1f, 1f, depth + 1f);
            roof.transform.rotation = Quaternion.Euler(0, rotation, 0);
            roof.transform.SetParent(building.transform);

            var roofRenderer = roof.GetComponent<Renderer>();
            if (roofRenderer != null)
            {
                roofRenderer.sharedMaterial = GetSharedMaterial("roof", roofColor);
            }

            // Mark as static for batching and add LOD culling
            building.isStatic = true;
            roof.isStatic = true;

            var lodGroup = building.AddComponent<LODGroup>();
            var renderers = building.GetComponentsInChildren<Renderer>();
            lodGroup.SetLODs(new LOD[] {
                new LOD(lodCullDistance / 1000f, renderers),
                new LOD(0, new Renderer[0])
            });
            lodGroup.RecalculateBounds();
        }
    }
}
