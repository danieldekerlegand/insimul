using System;
using System.Collections.Generic;
using UnityEngine;
using Insimul.Data;

namespace Insimul.Core
{
    /// <summary>
    /// Transaction types for item transfers between entities.
    /// Matches DataSource.ts TransferData.transactionType.
    /// </summary>
    public enum TransactionType
    {
        Buy, Sell, Steal, Discard, Give, QuestReward
    }

    /// <summary>
    /// Data for transferring an item between entities.
    /// Matches the transfer parameter in DataSource.ts.
    /// </summary>
    [Serializable]
    public class TransferData
    {
        public string fromEntityId;
        public string toEntityId;
        public string itemId;
        public string itemName;
        public string itemDescription;
        public string itemType;
        public int quantity = 1;
        public TransactionType transactionType;
        public int totalPrice;
    }

    /// <summary>
    /// Static utility for loading individual data files from Resources/Data.
    /// Matches the DataSource / FileDataSource interface from the Babylon.js source.
    ///
    /// Files loaded:
    ///   world_ir.json, characters.json, npcs.json, quests.json, actions.json,
    ///   rules.json, geography.json, theme.json, asset-manifest.json,
    ///   knowledge-base.pl, items.json
    /// </summary>
    public static class InsimulDataLoader
    {
        private const string DataRoot = "Data/";

        public static T[] LoadArray<T>(string resourcePath)
        {
            var json = Resources.Load<TextAsset>(resourcePath);
            if (json == null)
            {
                Debug.LogWarning($"[Insimul] Could not load: Resources/{resourcePath}");
                return new T[0];
            }
            // Unity's JsonUtility doesn't support top-level arrays,
            // so we wrap in a helper
            string wrapped = "{\"items\":" + json.text + "}";
            var wrapper = JsonUtility.FromJson<ArrayWrapper<T>>(wrapped);
            return wrapper.items;
        }

        /// <summary>
        /// Load a single JSON object (Dictionary-style) from Resources/Data.
        /// </summary>
        public static T LoadSingle<T>(string resourcePath)
        {
            var json = Resources.Load<TextAsset>(resourcePath);
            if (json == null)
            {
                Debug.LogWarning($"[Insimul] Could not load: Resources/{resourcePath}");
                return default;
            }
            return JsonUtility.FromJson<T>(json.text);
        }

        /// <summary>
        /// Load a raw text file from Resources/Data (e.g. Prolog knowledge base).
        /// Returns null if not found.
        /// </summary>
        public static string LoadTextFile(string resourcePath)
        {
            var asset = Resources.Load<TextAsset>(resourcePath);
            if (asset == null)
            {
                Debug.LogWarning($"[Insimul] Could not load text: Resources/{resourcePath}");
                return null;
            }
            return asset.text;
        }

        // ── Array loaders (match DataSource interface) ────────────────────

        public static T[] LoadCharacters<T>() => LoadArray<T>(DataRoot + "characters");
        public static T[] LoadNpcs<T>() => LoadArray<T>(DataRoot + "npcs");
        public static T[] LoadActions<T>() => LoadArray<T>(DataRoot + "actions");
        public static T[] LoadBaseActions<T>() => LoadArray<T>(DataRoot + "base_actions");
        public static T[] LoadRules<T>() => LoadArray<T>(DataRoot + "rules");
        public static T[] LoadBaseRules<T>() => LoadArray<T>(DataRoot + "base_rules");
        public static T[] LoadQuests<T>() => LoadArray<T>(DataRoot + "quests");
        public static T[] LoadSettlements<T>() => LoadArray<T>(DataRoot + "settlements");
        public static T[] LoadBuildings<T>() => LoadArray<T>(DataRoot + "buildings");
        public static T[] LoadItems<T>() => LoadArray<T>(DataRoot + "items");
        public static T[] LoadLootTables<T>() => LoadArray<T>(DataRoot + "loot_tables");
        public static T[] LoadTruths<T>() => LoadArray<T>(DataRoot + "truths");
        public static T[] LoadGrammars<T>() => LoadArray<T>(DataRoot + "grammars");
        public static T[] LoadBusinesses<T>() => LoadArray<T>(DataRoot + "businesses");
        public static T[] LoadRoads<T>() => LoadArray<T>(DataRoot + "roads");
        public static T[] LoadDialogueContexts<T>() => LoadArray<T>(DataRoot + "dialogue_contexts");
        public static T[] LoadResources<T>() => LoadArray<T>(DataRoot + "resources");
        public static T[] LoadCountries<T>() => LoadArray<T>(DataRoot + "countries");
        public static T[] LoadStates<T>() => LoadArray<T>(DataRoot + "states");

        // ── Single-object loaders ─────────────────────────────────────────

        public static T LoadWorld<T>() => LoadSingle<T>(DataRoot + "world_ir");
        public static T LoadWorldData<T>() => LoadSingle<T>(DataRoot + "world_ir");
        public static T LoadAssetManifest<T>() => LoadSingle<T>(DataRoot + "asset-manifest");
        public static T LoadAssets<T>() => LoadSingle<T>(DataRoot + "asset-manifest");
        public static T LoadTheme<T>() => LoadSingle<T>(DataRoot + "theme");
        public static T LoadPlayerConfig<T>() => LoadSingle<T>(DataRoot + "player");
        public static T LoadCombatConfig<T>() => LoadSingle<T>(DataRoot + "combat");
        public static T LoadUIConfig<T>() => LoadSingle<T>(DataRoot + "ui");
        public static T LoadConfig3D<T>() => LoadSingle<T>(DataRoot + "config3d");
        public static T LoadAIConfig<T>() => LoadSingle<T>(DataRoot + "ai_config");
        public static T LoadSurvivalConfig<T>() => LoadSingle<T>(DataRoot + "survival");
        public static T LoadBaseResources<T>() => LoadSingle<T>(DataRoot + "base_resources");

        // ── Character lookup ──────────────────────────────────────────────

        /// <summary>
        /// Load a single character by ID from the characters array.
        /// </summary>
        public static InsimulCharacterData LoadCharacter(string characterId)
        {
            var characters = LoadArray<InsimulCharacterData>(DataRoot + "characters");
            if (characters == null) return null;
            foreach (var ch in characters)
            {
                if (ch.id == characterId) return ch;
            }
            return null;
        }

        // ── Settlement sub-data loaders ───────────────────────────────────

        /// <summary>
        /// Load businesses for a specific settlement.
        /// Scans all businesses and filters by settlementId.
        /// </summary>
        public static T[] LoadSettlementBusinesses<T>(string settlementId) where T : class
        {
            return LoadFilteredArray<T>(DataRoot + "businesses", settlementId);
        }

        /// <summary>
        /// Load lots for a specific settlement.
        /// </summary>
        public static T[] LoadSettlementLots<T>(string settlementId) where T : class
        {
            return LoadFilteredArray<T>(DataRoot + "lots", settlementId);
        }

        /// <summary>
        /// Load residences for a specific settlement.
        /// </summary>
        public static T[] LoadSettlementResidences<T>(string settlementId) where T : class
        {
            return LoadFilteredArray<T>(DataRoot + "residences", settlementId);
        }

        // ── Entity inventory (local stub) ─────────────────────────────────

        /// <summary>
        /// Get entity inventory. In exported games, returns empty inventory.
        /// </summary>
        public static InsimulEntityInventory GetEntityInventory(string worldId, string entityId)
        {
            return new InsimulEntityInventory
            {
                entityId = entityId,
                items = new InsimulItemData[0],
                gold = 0
            };
        }

        /// <summary>
        /// Transfer item between entities. In exported games, handled locally.
        /// Returns success status.
        /// </summary>
        public static bool TransferItem(string worldId, TransferData transfer)
        {
            Debug.Log($"[Insimul] Item transferred: {transfer.itemName} ({transfer.transactionType})");
            return true;
        }

        /// <summary>
        /// Get merchant inventory. In exported games, returns null.
        /// </summary>
        public static InsimulMerchantInventory GetMerchantInventory(string worldId, string merchantId)
        {
            return null;
        }

        // ── Playthrough management ────────────────────────────────────────

        /// <summary>
        /// List existing playthroughs. Returns empty array for exported games.
        /// </summary>
        public static string[] ListPlaythroughs()
        {
            return new string[0];
        }

        /// <summary>
        /// Start a new playthrough with a local ID.
        /// </summary>
        public static string StartPlaythrough(string playthroughName)
        {
            string id = $"exported-{System.DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
            Debug.Log($"[Insimul] StartPlaythrough({playthroughName}) => {id}");
            return $"{{\"id\":\"{id}\",\"name\":\"{playthroughName}\"}}";
        }

        // ── Text file loaders ─────────────────────────────────────────────

        /// <summary>
        /// Load the Prolog knowledge base as a raw string (knowledge-base.pl).
        /// </summary>
        public static string LoadPrologContent() => LoadTextFile(DataRoot + "knowledge_base");

        /// <summary>
        /// Load world items from items.json.
        /// </summary>
        public static InsimulItemData[] LoadWorldItems() => LoadArray<InsimulItemData>(DataRoot + "items");

        /// <summary>
        /// Load geography data (heightmap, terrain features) from geography.json.
        /// </summary>
        public static InsimulGeographyData LoadGeography() => LoadSingle<InsimulGeographyData>(DataRoot + "geography");

        // ── Save / Load ──────────────────────────────────────────────────

        /// <summary>
        /// Save game state to a numbered slot (0-2).
        /// Writes to Application.persistentDataPath/insimul_save_{slotIndex}.json.
        /// </summary>
        public static bool SaveGameState(int slotIndex, string gameStateJSON)
        {
            if (slotIndex < 0 || slotIndex > 2)
            {
                Debug.LogWarning($"[Insimul] SaveGameState: invalid slot {slotIndex} (must be 0-2)");
                return false;
            }
            try
            {
                string savePath = Application.persistentDataPath + $"/insimul_save_{slotIndex}.json";
                System.IO.File.WriteAllText(savePath, gameStateJSON);
                Debug.Log($"[Insimul] SaveGameState: saved to slot {slotIndex}");
                return true;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[Insimul] SaveGameState failed: {e.Message}");
                return false;
            }
        }

        /// <summary>
        /// Load game state from a numbered slot (0-2).
        /// Returns null if no save exists in that slot.
        /// </summary>
        public static string LoadGameState(int slotIndex)
        {
            if (slotIndex < 0 || slotIndex > 2)
            {
                Debug.LogWarning($"[Insimul] LoadGameState: invalid slot {slotIndex} (must be 0-2)");
                return null;
            }
            string savePath = Application.persistentDataPath + $"/insimul_save_{slotIndex}.json";
            if (!System.IO.File.Exists(savePath))
            {
                return null;
            }
            try
            {
                string json = System.IO.File.ReadAllText(savePath);
                Debug.Log($"[Insimul] LoadGameState: loaded slot {slotIndex}");
                return json;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[Insimul] LoadGameState failed: {e.Message}");
                return null;
            }
        }

        /// <summary>
        /// Save quest progress JSON to a dedicated file.
        /// Returns true on success.
        /// </summary>
        public static bool SaveQuestProgress(string questProgressJSON)
        {
            string savePath = Application.persistentDataPath + "/insimul_quest_progress.json";
            try
            {
                System.IO.File.WriteAllText(savePath, questProgressJSON);
                Debug.Log("[Insimul] SaveQuestProgress: saved");
                return true;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[Insimul] SaveQuestProgress failed: {e.Message}");
                return false;
            }
        }

        /// <summary>
        /// Load quest progress JSON from the dedicated file.
        /// Returns null if no quest progress has been saved.
        /// </summary>
        public static string LoadQuestProgress()
        {
            string savePath = Application.persistentDataPath + "/insimul_quest_progress.json";
            if (!System.IO.File.Exists(savePath))
            {
                return null;
            }
            try
            {
                string json = System.IO.File.ReadAllText(savePath);
                Debug.Log("[Insimul] LoadQuestProgress: loaded");
                return json;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"[Insimul] LoadQuestProgress failed: {e.Message}");
                return null;
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────

        private static T[] LoadFilteredArray<T>(string resourcePath, string settlementId) where T : class
        {
            var all = LoadArray<T>(resourcePath);
            if (all == null || all.Length == 0) return new T[0];
            // Filter by settlementId field via reflection (generic approach)
            var results = new List<T>();
            var field = typeof(T).GetField("settlementId");
            if (field == null) return all;
            foreach (var item in all)
            {
                if ((string)field.GetValue(item) == settlementId)
                    results.Add(item);
            }
            return results.ToArray();
        }

        [Serializable]
        private class ArrayWrapper<T>
        {
            public T[] items;
        }
    }

    // ── Helper data classes for loader returns ────────────────────────────

    [Serializable]
    public class InsimulEntityInventory
    {
        public string entityId;
        public InsimulItemData[] items;
        public int gold;
    }

    [Serializable]
    public class InsimulMerchantInventory
    {
        public string merchantId;
        public string merchantName;
        public InsimulShopItem[] items;
        public int goldReserve;
        public float buyMultiplier = 1f;
        public float sellMultiplier = 1f;
    }

    [Serializable]
    public class InsimulShopItem
    {
        public string id;
        public string name;
        public string description;
        public string itemType;
        public int buyPrice;
        public int sellPrice;
        public int stock;
        public int maxStock;
        public float restockRate;
    }
}
