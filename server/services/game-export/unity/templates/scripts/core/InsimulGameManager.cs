using UnityEngine;
using Insimul.Data;

namespace Insimul.Core
{
    /// <summary>
    /// Central game manager — singleton that orchestrates all systems.
    /// Attach to an empty GameObject in the scene.
    /// </summary>
    public class InsimulGameManager : MonoBehaviour
    {
        public static InsimulGameManager Instance { get; private set; }

        [Header("World Data")]
        public InsimulWorldIR WorldData { get; private set; }
        public bool IsDataLoaded { get; private set; }

        [Header("Settings")]
        public string worldIRPath = "Data/WorldIR";

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            LoadWorldData();
        }

        private void Start()
        {
            if (IsDataLoaded) SpawnWorld();
        }

        public void LoadWorldData()
        {
            var json = Resources.Load<TextAsset>(worldIRPath);
            if (json == null)
            {
                Debug.LogError("[Insimul] Failed to load WorldIR from Resources/" + worldIRPath);
                return;
            }
            WorldData = JsonUtility.FromJson<InsimulWorldIR>(json.text);
            IsDataLoaded = true;
            Debug.Log($"[Insimul] Loaded world: {WorldData.meta.worldName} (type: {WorldData.meta.worldType})");
        }

        private void SpawnWorld()
        {
            Debug.Log("[Insimul] Spawning world entities...");
            // Terrain
            var wsm = FindObjectOfType<Insimul.World.WorldScaleManager>();
            if (wsm != null) wsm.Initialize(WorldData);

            // Buildings
            var bg = FindObjectOfType<Insimul.World.ProceduralBuildingGenerator>();
            if (bg != null) bg.GenerateFromData(WorldData);

            // Roads
            var rg = FindObjectOfType<Insimul.World.RoadGenerator>();
            if (rg != null) rg.GenerateFromData(WorldData);

            // Water features
            var wfg = FindObjectOfType<Insimul.World.WaterFeatureGenerator>();
            if (wfg != null) wfg.GenerateFromData(WorldData);

            // NPCs
            var npcMgr = FindObjectOfType<Insimul.Characters.NPCManager>();
            if (npcMgr != null) npcMgr.SpawnNPCs(WorldData);

            // Systems
            var actionSys = FindObjectOfType<Insimul.Systems.ActionSystem>();
            if (actionSys != null) actionSys.LoadFromData(WorldData);

            var questSys = FindObjectOfType<Insimul.Systems.QuestSystem>();
            if (questSys != null) questSys.LoadFromData(WorldData);

            var combatSys = FindObjectOfType<Insimul.Systems.CombatSystem>();
            if (combatSys != null) combatSys.LoadFromData(WorldData);

            var ruleSys = FindObjectOfType<Insimul.Systems.RuleEnforcer>();
            if (ruleSys != null) ruleSys.LoadFromData(WorldData);

            var survivalSys = FindObjectOfType<Insimul.Systems.SurvivalSystem>();
            if (survivalSys != null) survivalSys.LoadFromData(WorldData);

            Debug.Log("[Insimul] World spawning complete.");
        }
    }
}
