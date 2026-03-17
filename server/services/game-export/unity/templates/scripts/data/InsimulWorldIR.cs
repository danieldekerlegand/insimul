using System;

namespace Insimul.Data
{
    /// <summary>
    /// Root container matching the WorldIR JSON structure.
    /// Use JsonUtility.FromJson&lt;InsimulWorldIR&gt;(json) to deserialize.
    /// </summary>
    [Serializable]
    public class InsimulWorldIR
    {
        public MetaData meta;
        public GeographyData geography;
        public EntitiesData entities;
        public SystemsData systems;
        public ThemeData theme;
        public PlayerData player;
        public UIData ui;
        public CombatData combat;
        public SurvivalData survival;
        public ResourcesData resources;
        public string prologContent;
    }

    [Serializable] public class MetaData
    {
        public string insimulVersion;
        public string worldId;
        public string worldName;
        public string worldType;
        public string seed;
        public int terrainSize;
    }

    [Serializable] public class GeographyData
    {
        public int terrainSize;
        public float[][] heightmap;
        public float[][] slopeMap;
        public InsimulTerrainFeatureData[] terrainFeatures;
        public InsimulSettlementData[] settlements;
        public InsimulCountryData[] countries;
        public InsimulStateData[] states;
        public InsimulWaterFeatureData[] waterFeatures;
    }

    [Serializable] public class InsimulTerrainFeatureData
    {
        public string id;
        public string name;
        public string featureType;
        public Vec3Data position;
        public float radius;
        public float elevation;
        public string description;
    }

    [Serializable] public class EntitiesData
    {
        public InsimulCharacterData[] characters;
        public InsimulNPCData[] npcs;
        public InsimulBuildingData[] buildings;
    }

    [Serializable] public class SystemsData
    {
        public InsimulRuleData[] rules;
        public InsimulRuleData[] baseRules;
        public InsimulActionData[] actions;
        public InsimulActionData[] baseActions;
        public InsimulQuestData[] quests;
        public InsimulItemData[] items;
        public InsimulLootTableData[] lootTables;
        public InsimulTruthData[] truths;
        public InsimulGrammarData[] grammars;
        public InsimulDialogueContextData[] dialogueContexts;
        public InsimulLanguageData[] languages;
        public string knowledgeBase;
        public InsimulAIConfigData aiConfig;
    }

    [Serializable] public class ColorData { public float r, g, b; }

    [Serializable] public class ThemeData
    {
        public VisualThemeData visualTheme;
    }

    [Serializable] public class VisualThemeData
    {
        public ColorData groundColor;
        public ColorData skyColor;
        public ColorData roadColor;
        public float roadRadius;
        public ColorData settlementBaseColor;
        public ColorData settlementRoofColor;
    }

    [Serializable] public class PlayerData
    {
        public Vec3Data startPosition;
        public float initialHealth = 100f;
        public float initialEnergy = 100f;
        public int initialGold;
        public float speed = 5f;
        public float jumpHeight = 1.2f;
        public float gravity = 1f;
        public string modelAsset;
    }

    [Serializable] public class UIData
    {
        public bool showMinimap;
        public bool showHealthBar;
        public bool showStaminaBar;
        public bool showAmmoCounter;
        public bool showCompass;
        public string genreLayout;
    }

    [Serializable] public class CombatData
    {
        public string style;
        public CombatSettingsData settings;
    }

    [Serializable] public class CombatSettingsData
    {
        public float baseDamage;
        public float criticalChance;
        public float criticalMultiplier;
        public float blockReduction;
        public float dodgeChance;
        public float attackCooldown;
        public float combatRange;
    }

    [Serializable] public class SurvivalData
    {
        public SurvivalNeedData[] needs;
    }

    [Serializable] public class SurvivalNeedData
    {
        public string id;
        public string name;
        public string icon;
        public float maxValue;
        public float startValue;
        public float decayRate;
        public float criticalThreshold;
        public float damageRate;
        public float warningThreshold;
    }

    [Serializable] public class ResourcesData
    {
        public ResourceDefData[] definitions;
    }

    [Serializable] public class ResourceDefData
    {
        public string id;
        public string name;
        public string icon;
        public ColorData color;
        public float maxStack;
        public float gatherTime;
        public float respawnTime;
    }

    // ── Item Data ────────────────────────────────────────────────────────

    [Serializable] public class InsimulItemData
    {
        public string id;
        public string name;
        public string description;
        public string itemType;
        public string rarity;
        public int stackSize = 1;
        public float weight;
        public int value;
        public int sellValue;
        public bool tradeable = true;
        public string[] tags;
        // Taxonomy
        public string category;
        public string material;
        public string baseType;

        /// <summary>Whether the item can be possessed/owned by NPCs.</summary>
        public bool possessable;

        /// <summary>Language learning data for vocabulary items.</summary>
        public InsimulLanguageLearningData languageLearningData;
    }

    /// <summary>
    /// Language learning metadata attached to vocabulary items.
    /// Mirrors InventoryItem.languageLearningData from types.ts.
    /// </summary>
    [Serializable] public class InsimulLanguageLearningData
    {
        public string targetWord;
        public string targetLanguage;
        public string pronunciation;
        public string category;
    }

    // ── Loot Tables ──────────────────────────────────────────────────────

    [Serializable] public class InsimulLootTableData
    {
        public string id;
        public string name;
        public string enemyType;
        public InsimulLootEntryData[] entries;
        public int goldMin;
        public int goldMax;
    }

    [Serializable] public class InsimulLootEntryData
    {
        public string itemId;
        public string itemName;
        public string itemType;
        public float dropChance = 1f;
        public float weight = 1f;
        public int minQuantity = 1;
        public int maxQuantity = 1;
        public int value;
        public int sellValue;
    }

    // ── Truths / Grammars / Dialogue / Language ──────────────────────────

    [Serializable] public class InsimulTruthData
    {
        public string id;
        public string name;
        public string content;
        public string category;
    }

    [Serializable] public class InsimulGrammarData
    {
        public string id;
        public string name;
        public string content;
    }

    [Serializable] public class InsimulDialogueContextData
    {
        public string id;
        public string name;
        public string content;
    }

    [Serializable] public class InsimulLanguageData
    {
        public string id;
        public string name;
        public string content;
    }

    [Serializable] public class InsimulAIConfigData
    {
        public string provider;
        public string model;
        public float temperature;
        public int maxTokens;
        public string systemPrompt;
    }

    // ── Geography sub-types ──────────────────────────────────────────────

    [Serializable] public class InsimulCountryData
    {
        public string id;
        public string name;
    }

    [Serializable] public class InsimulStateData
    {
        public string id;
        public string name;
        public string countryId;
        public string terrain;
    }

    // ── Mercantile types ─────────────────────────────────────────────────

    [Serializable] public class InsimulShopItemData
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
        public string rarity;

        public bool possessable;
        public InsimulLanguageLearningData languageLearningData;
    }

    [Serializable] public class InsimulMerchantInventoryData
    {
        public string merchantId;
        public string merchantName;
        public InsimulShopItemData[] items;
        public int goldReserve;
        public float buyMultiplier = 1f;
        public float sellMultiplier = 1f;
    }

    [Serializable] public class InsimulTradeTransactionData
    {
        public string type; // buy, sell, steal, discard
        public string itemId;
        public int quantity;
        public int totalPrice;
        public string merchantId;
        public bool success;
        public long timestamp;
    }

    // ── Resource types ───────────────────────────────────────────────────

    /// <summary>
    /// Resource type enum matching shared/game-engine/types.ts ResourceType.
    /// </summary>
    public enum InsimulResourceType
    {
        Wood, Stone, Iron, Gold, Food, Water, Fiber, Crystal, Oil
    }

    // ── Crafting ─────────────────────────────────────────────────────────

    [Serializable] public class InsimulCraftingRecipeData
    {
        public string id;
        public string name;
        public string description;
        public string category; // tool, weapon, armor, consumable, material, building_material, utility
        public string icon;
        public InsimulCraftingIngredient[] ingredients;
        public float craftTime;
        public int outputQuantity = 1;
        public int requiredLevel;
        public bool unlocked;
    }

    [Serializable] public class InsimulCraftingIngredient
    {
        public string resourceType;
        public int quantity;
    }

    // ── Survival events ──────────────────────────────────────────────────

    /// <summary>
    /// Need type enum matching shared/game-engine/types.ts NeedType.
    /// </summary>
    public enum InsimulNeedType
    {
        Hunger, Thirst, Temperature, Stamina, Sleep
    }

    [Serializable] public class InsimulNeedConfigData
    {
        public string id; // NeedType as string
        public string name;
        public string icon;
        public float maxValue;
        public float startValue;
        public float decayRate;
        public float criticalThreshold;
        public float damageRate;
        public float warningThreshold;
    }

    [Serializable] public class InsimulNeedStateData
    {
        public string id;
        public float current;
        public float max;
        public float decayRate;
        public bool isCritical;
        public bool isWarning;
    }

    [Serializable] public class InsimulSurvivalEventData
    {
        public string type; // need_critical, need_warning, need_restored, damage_from_need, need_satisfied
        public string needType;
        public float value;
        public string message;
    }

    // ── Camera ───────────────────────────────────────────────────────────

    /// <summary>
    /// Camera mode enum matching shared/game-engine/types.ts CameraMode.
    /// </summary>
    public enum InsimulCameraMode
    {
        FirstPerson, ThirdPerson, Isometric, SideScroll, TopDown, Fighting
    }

    // ── Audio ────────────────────────────────────────────────────────────

    /// <summary>
    /// Audio role enum matching shared/game-engine/types.ts AudioRole.
    /// </summary>
    public enum InsimulAudioRole
    {
        Footstep, Ambient, Combat, Interact, Music
    }

    // ── Street Networks ─────────────────────────────────────────────────

    [Serializable]
    public class StreetNode
    {
        public string id;
        public float x;
        public float z;
        public string[] intersectionOf;
    }

    [Serializable]
    public class StreetWaypoint
    {
        public float x;
        public float z;
    }

    [Serializable]
    public class StreetSegment
    {
        public string id;
        public string name;
        public string direction; // "NS", "EW", "radial", "ring"
        public string[] nodeIds;
        public StreetWaypoint[] waypoints;
        public float width;
    }

    [Serializable]
    public class StreetNetwork
    {
        public StreetNode[] nodes;
        public StreetSegment[] segments;
    }
}
