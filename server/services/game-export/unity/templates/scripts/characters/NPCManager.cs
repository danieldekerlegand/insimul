using UnityEngine;
using UnityEngine.AI;
using Insimul.Data;

namespace Insimul.Characters
{
    /// <summary>
    /// Spawns and manages all NPCs from IR data.
    /// On Awake, reads Assets/Resources/Data/asset-manifest.json to find a bundled
    /// character GLTF/GLB model loaded via Resources.Load. Falls back to a capsule
    /// primitive when no character asset is available.
    /// </summary>
    public class NPCManager : MonoBehaviour
    {
        private GameObject _npcModelPrefab = null;

        private void Awake()
        {
            LoadNPCModelFromManifest();
        }

        private void LoadNPCModelFromManifest()
        {
            var manifestAsset = Resources.Load<TextAsset>("Data/asset-manifest");
            if (manifestAsset == null)
            {
                Debug.LogWarning("[Insimul] NPCManager: asset-manifest not found — using capsule fallback");
                return;
            }

            var manifest = JsonUtility.FromJson<InsimulAssetManifest>(manifestAsset.text);
            if (manifest?.assets == null) return;

            foreach (var entry in manifest.assets)
            {
                if (entry.category != "character") continue;
                // Skip player-only assets
                if (entry.role == "player_default" || entry.role == "player_texture") continue;
                if (string.IsNullOrEmpty(entry.exportPath)) continue;

                var resourcePath = System.IO.Path.ChangeExtension(entry.exportPath, null);
                var prefab = Resources.Load<GameObject>(resourcePath);
                if (prefab != null)
                {
                    _npcModelPrefab = prefab;
                    Debug.Log($"[Insimul] NPCManager: loaded NPC model — {entry.exportPath}");
                    return;
                }
            }
            Debug.LogWarning("[Insimul] NPCManager: no character asset found in manifest — using capsule fallback");
        }

        public void SpawnNPCs(InsimulWorldIR worldData)
        {
            if (worldData?.entities?.npcs == null) return;

            foreach (var npcData in worldData.entities.npcs)
                SpawnNPC(npcData);

            Debug.Log($"[Insimul] Spawned {worldData.entities.npcs.Length} NPCs");
        }

        private void SpawnNPC(InsimulNPCData data)
        {
            var position = data.homePosition.ToVector3();

            var npcObj = new GameObject($"NPC_{data.characterId}");
            npcObj.tag = "NPC";
            npcObj.transform.position = position;
            npcObj.transform.SetParent(transform);

            if (_npcModelPrefab != null)
            {
                var model = Instantiate(_npcModelPrefab, npcObj.transform);
                model.name = "Model";
                model.transform.localPosition = Vector3.zero;
            }
            else
            {
                var capsule = GameObject.CreatePrimitive(PrimitiveType.Capsule);
                capsule.transform.SetParent(npcObj.transform);
                capsule.transform.localPosition = Vector3.zero;
            }

            npcObj.AddComponent<NavMeshAgent>();
            var controller = npcObj.AddComponent<NPCController>();
            controller.InitFromData(data);
        }
    }
}
