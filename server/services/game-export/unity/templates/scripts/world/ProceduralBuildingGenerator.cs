using UnityEngine;
using System.Collections.Generic;
using Insimul.Data;

namespace Insimul.World
{
    /// <summary>
    /// Generates buildings from world IR data.
    /// When a building has a modelAssetKey or a registered role model, the corresponding
    /// prefab is instanced. Falls back to procedural cube geometry when no model is available.
    /// Uses shared material cache and LOD groups for performance.
    /// </summary>
    public class ProceduralBuildingGenerator : MonoBehaviour
    {
        public Color baseColor = new Color({{BASE_COLOR_R}}f, {{BASE_COLOR_G}}f, {{BASE_COLOR_B}}f);
        public Color roofColor = new Color({{ROOF_COLOR_R}}f, {{ROOF_COLOR_G}}f, {{ROOF_COLOR_B}}f);

        [Tooltip("Distance at which buildings are culled")]
        public float lodCullDistance = 150f;

        private Dictionary<string, Material> _materialCache = new Dictionary<string, Material>();

        /// <summary>Role-based model prototypes registered via RegisterRoleModel.</summary>
        private Dictionary<string, GameObject> _roleModelPrototypes = new Dictionary<string, GameObject>();

        /// <summary>Optional wall texture override for procedural buildings.</summary>
        private Texture2D _wallTexture;

        /// <summary>Optional roof texture override for procedural buildings.</summary>
        private Texture2D _roofTexture;

        #region Style Presets

        public struct BuildingStylePreset
        {
            public string name;
            public Color baseColor;
            public Color roofColor;
            public Color windowColor;
            public Color doorColor;
            public string materialType;
            public string architectureStyle;
        }

        public struct BuildingTypeDefaults
        {
            public int floors;
            public float width;
            public float depth;
            public bool hasChimney;
            public bool hasBalcony;
        }

        public static readonly Dictionary<string, BuildingStylePreset> STYLE_PRESETS =
            new Dictionary<string, BuildingStylePreset>
        {
            { "medieval_wood", new BuildingStylePreset {
                name = "Medieval Wood",
                baseColor = new Color(0.55f, 0.35f, 0.2f),
                roofColor = new Color(0.3f, 0.2f, 0.15f),
                windowColor = new Color(0.9f, 0.9f, 0.7f),
                doorColor = new Color(0.4f, 0.25f, 0.15f),
                materialType = "wood", architectureStyle = "medieval"
            }},
            { "medieval_stone", new BuildingStylePreset {
                name = "Medieval Stone",
                baseColor = new Color(0.6f, 0.6f, 0.55f),
                roofColor = new Color(0.35f, 0.2f, 0.15f),
                windowColor = new Color(0.7f, 0.8f, 0.9f),
                doorColor = new Color(0.3f, 0.2f, 0.1f),
                materialType = "stone", architectureStyle = "medieval"
            }},
            { "modern_concrete", new BuildingStylePreset {
                name = "Modern Concrete",
                baseColor = new Color(0.7f, 0.7f, 0.7f),
                roofColor = new Color(0.3f, 0.3f, 0.3f),
                windowColor = new Color(0.6f, 0.7f, 0.8f),
                doorColor = new Color(0.5f, 0.5f, 0.5f),
                materialType = "brick", architectureStyle = "modern"
            }},
            { "futuristic_metal", new BuildingStylePreset {
                name = "Futuristic Metal",
                baseColor = new Color(0.6f, 0.65f, 0.7f),
                roofColor = new Color(0.2f, 0.25f, 0.3f),
                windowColor = new Color(0.5f, 0.7f, 0.9f),
                doorColor = new Color(0.3f, 0.4f, 0.5f),
                materialType = "metal", architectureStyle = "futuristic"
            }},
            { "rustic_cottage", new BuildingStylePreset {
                name = "Rustic Cottage",
                baseColor = new Color(0.7f, 0.5f, 0.3f),
                roofColor = new Color(0.5f, 0.35f, 0.2f),
                windowColor = new Color(0.8f, 0.85f, 0.7f),
                doorColor = new Color(0.5f, 0.3f, 0.2f),
                materialType = "wood", architectureStyle = "rustic"
            }}
        };

        public static readonly Dictionary<string, BuildingTypeDefaults> BUILDING_TYPES =
            new Dictionary<string, BuildingTypeDefaults>
        {
            // Businesses
            { "Bakery",           new BuildingTypeDefaults { floors = 2, width = 12, depth = 10, hasChimney = true  } },
            { "Restaurant",       new BuildingTypeDefaults { floors = 2, width = 15, depth = 12 } },
            { "Tavern",           new BuildingTypeDefaults { floors = 2, width = 14, depth = 14, hasBalcony = true  } },
            { "Inn",              new BuildingTypeDefaults { floors = 3, width = 16, depth = 14, hasBalcony = true  } },
            { "Market",           new BuildingTypeDefaults { floors = 1, width = 20, depth = 15 } },
            { "Shop",             new BuildingTypeDefaults { floors = 2, width = 10, depth = 8  } },
            { "Blacksmith",       new BuildingTypeDefaults { floors = 1, width = 12, depth = 10, hasChimney = true  } },
            { "LawFirm",          new BuildingTypeDefaults { floors = 3, width = 12, depth = 10 } },
            { "Bank",             new BuildingTypeDefaults { floors = 2, width = 14, depth = 12 } },
            { "Hospital",         new BuildingTypeDefaults { floors = 3, width = 20, depth = 18 } },
            { "School",           new BuildingTypeDefaults { floors = 2, width = 18, depth = 16 } },
            { "Church",           new BuildingTypeDefaults { floors = 1, width = 16, depth = 24 } },
            { "Theater",          new BuildingTypeDefaults { floors = 2, width = 18, depth = 20 } },
            { "Library",          new BuildingTypeDefaults { floors = 3, width = 16, depth = 14 } },
            { "ApartmentComplex", new BuildingTypeDefaults { floors = 5, width = 18, depth = 16, hasBalcony = true  } },
            { "Windmill",         new BuildingTypeDefaults { floors = 3, width = 10, depth = 10 } },
            { "Watermill",        new BuildingTypeDefaults { floors = 2, width = 14, depth = 12 } },
            { "Lumbermill",       new BuildingTypeDefaults { floors = 1, width = 16, depth = 12, hasChimney = true  } },
            { "Barracks",         new BuildingTypeDefaults { floors = 2, width = 18, depth = 14 } },
            { "Mine",             new BuildingTypeDefaults { floors = 1, width = 12, depth = 10 } },
            // Residences
            { "residence_small",   new BuildingTypeDefaults { floors = 1, width = 8,  depth = 8  } },
            { "residence_medium",  new BuildingTypeDefaults { floors = 2, width = 10, depth = 10, hasChimney = true  } },
            { "residence_large",   new BuildingTypeDefaults { floors = 2, width = 14, depth = 12, hasBalcony = true, hasChimney = true } },
            { "residence_mansion", new BuildingTypeDefaults { floors = 3, width = 20, depth = 18, hasBalcony = true, hasChimney = true } }
        };

        /// <summary>Return an appropriate style preset for the given world type and terrain.</summary>
        public static BuildingStylePreset GetStyleForWorld(string worldType, string terrain)
        {
            string type = (worldType ?? "").ToLower();
            string terr = (terrain ?? "").ToLower();

            if (type.Contains("medieval") || type.Contains("fantasy"))
            {
                if (terr.Contains("forest") || terr.Contains("rural"))
                    return STYLE_PRESETS["medieval_wood"];
                return STYLE_PRESETS["medieval_stone"];
            }
            if (type.Contains("cyberpunk") || type.Contains("sci-fi") || type.Contains("futuristic"))
                return STYLE_PRESETS["futuristic_metal"];
            if (type.Contains("modern"))
                return STYLE_PRESETS["modern_concrete"];
            if (terr.Contains("rural") || terr.Contains("village"))
                return STYLE_PRESETS["rustic_cottage"];

            return STYLE_PRESETS["medieval_wood"];
        }

        #endregion

        /// <summary>Register a prefab model for a building role. Matching roles use this
        /// prefab instead of procedural geometry.</summary>
        public void RegisterRoleModel(string role, GameObject prefab)
        {
            if (string.IsNullOrEmpty(role) || prefab == null) return;
            _roleModelPrototypes[role] = prefab;
            Debug.Log($"[Insimul] Registered role model: {role}");
        }

        /// <summary>Override wall texture for procedural buildings.</summary>
        public void SetWallTexture(Texture2D texture)
        {
            _wallTexture = texture;
        }

        /// <summary>Override roof texture for procedural buildings.</summary>
        public void SetRoofTexture(Texture2D texture)
        {
            _roofTexture = texture;
        }

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

            int loadedCount = 0, roleCount = 0, proceduralCount = 0;
            foreach (var bld in worldData.entities.buildings)
            {
                var pos = bld.position.ToVector3();
                bool placed = false;

                // 1. Check role model prototypes first
                if (!placed && !string.IsNullOrEmpty(bld.buildingRole) &&
                    _roleModelPrototypes.TryGetValue(bld.buildingRole, out var rolePrefab))
                {
                    var go = Instantiate(rolePrefab, pos, Quaternion.Euler(0, bld.rotation, 0), transform);
                    go.name = $"Building_{bld.id}";
                    go.tag = "Building";
                    go.isStatic = true;
                    roleCount++;
                    placed = true;
                }

                // 2. Try modelAssetKey from IR data
                if (!placed && !string.IsNullOrEmpty(bld.modelAssetKey))
                {
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

                // 3. Procedural fallback
                if (!placed)
                {
                    GenerateBuildingProcedural(pos, bld.rotation, bld.floors, bld.width, bld.depth, bld.buildingRole);
                    proceduralCount++;
                }
            }
            Debug.Log($"[Insimul] Buildings: {loadedCount} from assets, {roleCount} from role models, {proceduralCount} procedural");
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

            // Apply wall texture override or shared color material
            var renderer = building.GetComponent<Renderer>();
            if (renderer != null)
            {
                if (_wallTexture != null)
                {
                    var wallMat = GetSharedMaterial("wall_tex", Color.white);
                    wallMat.mainTexture = _wallTexture;
                    renderer.sharedMaterial = wallMat;
                }
                else
                {
                    renderer.sharedMaterial = GetSharedMaterial("wall", baseColor);
                }
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
                if (_roofTexture != null)
                {
                    var roofMat = GetSharedMaterial("roof_tex", Color.white);
                    roofMat.mainTexture = _roofTexture;
                    roofRenderer.sharedMaterial = roofMat;
                }
                else
                {
                    roofRenderer.sharedMaterial = GetSharedMaterial("roof", roofColor);
                }
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
