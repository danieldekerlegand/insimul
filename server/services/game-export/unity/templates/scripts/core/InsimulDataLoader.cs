using UnityEngine;
using Insimul.Data;

namespace Insimul.Core
{
    /// <summary>
    /// Static utility for loading individual data files from Resources/Data.
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

        // ── Array loaders ──────────────────────────────────────────

        public static T[] LoadCharacters<T>() => LoadArray<T>(DataRoot + "characters");
        public static T[] LoadNpcs<T>() => LoadArray<T>(DataRoot + "npcs");
        public static T[] LoadActions<T>() => LoadArray<T>(DataRoot + "actions");
        public static T[] LoadRules<T>() => LoadArray<T>(DataRoot + "rules");
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

        // ── Single-object loaders ──────────────────────────────────

        public static T LoadWorldData<T>() => LoadSingle<T>(DataRoot + "world_ir");
        public static T LoadAssetManifest<T>() => LoadSingle<T>(DataRoot + "asset-manifest");
        public static T LoadTheme<T>() => LoadSingle<T>(DataRoot + "theme");
        public static T LoadPlayerConfig<T>() => LoadSingle<T>(DataRoot + "player");
        public static T LoadCombatConfig<T>() => LoadSingle<T>(DataRoot + "combat");
        public static T LoadUIConfig<T>() => LoadSingle<T>(DataRoot + "ui");
        public static T LoadAIConfig<T>() => LoadSingle<T>(DataRoot + "ai_config");
        public static T LoadSurvivalConfig<T>() => LoadSingle<T>(DataRoot + "survival");

        // ── Text file loaders ──────────────────────────────────────

        /// <summary>
        /// Load the Prolog knowledge base as a raw string.
        /// </summary>
        public static string LoadPrologKnowledgeBase() => LoadTextFile(DataRoot + "knowledge_base");

        [System.Serializable]
        private class ArrayWrapper<T>
        {
            public T[] items;
        }
    }
}
