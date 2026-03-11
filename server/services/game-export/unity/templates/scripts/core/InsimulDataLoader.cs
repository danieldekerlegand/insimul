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

        // ── Text file loaders ─────────────────────────────────────────────

        /// <summary>
        /// Load the Prolog knowledge base as a raw string (knowledge-base.pl).
        /// </summary>
        public static string LoadPrologContent() => LoadTextFile(DataRoot + "knowledge_base");

        /// <summary>
        /// Load world items from items.json.
        /// </summary>
        public static InsimulItemData[] LoadWorldItems() => LoadArray<InsimulItemData>(DataRoot + "items");

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
