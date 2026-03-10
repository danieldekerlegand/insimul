using System;

namespace Insimul.Data
{
    /// <summary>
    /// Root container matching the WorldIR JSON structure.
    /// Use JsonUtility.FromJson<InsimulWorldIR>(json) to deserialize.
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
        public InsimulSettlementData[] settlements;
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
    }

    [Serializable] public class UIData
    {
        public bool showMinimap;
        public bool showHealthBar;
        public bool showStaminaBar;
        public bool showAmmoCounter;
        public bool showCompass;
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
    }

    [Serializable] public class SurvivalData
    {
        public SurvivalNeedData[] needs;
    }

    [Serializable] public class SurvivalNeedData
    {
        public string id;
        public string name;
        public float maxValue;
        public float startValue;
        public float decayRate;
        public float criticalThreshold;
        public float damageRate;
    }

    [Serializable] public class ResourcesData
    {
        public ResourceDefData[] definitions;
    }

    [Serializable] public class ResourceDefData
    {
        public string id;
        public string name;
        public float maxStack;
        public float gatherTime;
        public float respawnTime;
    }

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
        public string[] tags;
    }

    [Serializable] public class InsimulLootTableData
    {
        public string id;
        public string name;
        public InsimulLootEntryData[] entries;
    }

    [Serializable] public class InsimulLootEntryData
    {
        public string itemId;
        public float weight = 1f;
        public int minQuantity = 1;
        public int maxQuantity = 1;
    }

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
}
