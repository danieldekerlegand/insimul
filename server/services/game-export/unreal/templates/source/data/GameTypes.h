#pragma once

#include "CoreMinimal.h"
#include "GameTypes.generated.h"

/**
 * Engine-agnostic game types matching shared/game-engine/types.ts.
 *
 * This header collects UENUM/USTRUCT definitions for types that are
 * used across multiple subsystems. Individual subsystems (InventorySystem,
 * CombatSystem, etc.) may define additional system-specific types.
 *
 * Note: InventoryItem, ItemType, EquipmentSlot, and item rarity are
 * defined in InventorySystem.h to avoid circular includes.
 */

// ─── Terrain ─────────────────────────────────────────────────────────────────

/**
 * Terrain feature data (mountain, valley, canyon, etc.).
 * Mirrors TerrainFeatureIR from ir-types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulTerrainFeature
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FeatureType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector Position = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Radius = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Elevation = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
};

// ─── Street Network ─────────────────────────────────────────────────────────

/**
 * Street node types.
 * Mirrors StreetNodeType from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulStreetNodeType : uint8
{
    Intersection UMETA(DisplayName = "Intersection"),
    DeadEnd      UMETA(DisplayName = "Dead End"),
    TJunction    UMETA(DisplayName = "T Junction"),
    CurvePoint   UMETA(DisplayName = "Curve Point")
};

/**
 * Street type classification.
 * Mirrors StreetType from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulStreetType : uint8
{
    MainRoad    UMETA(DisplayName = "Main Road"),
    Avenue      UMETA(DisplayName = "Avenue"),
    Residential UMETA(DisplayName = "Residential"),
    Alley       UMETA(DisplayName = "Alley"),
    Lane        UMETA(DisplayName = "Lane"),
    Boulevard   UMETA(DisplayName = "Boulevard"),
    Highway     UMETA(DisplayName = "Highway")
};

/**
 * A node in the street network graph.
 * Mirrors StreetNodeIR from ir-types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulStreetNode
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector2D Position = FVector2D::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Elevation = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulStreetNodeType NodeType = EInsimulStreetNodeType::Intersection;
};

/**
 * An edge in the street network graph.
 * Mirrors StreetEdgeIR from ir-types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulStreetEdge
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FromNodeId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ToNodeId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulStreetType StreetType = EInsimulStreetType::Residential;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Width = 6.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FVector> Waypoints;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Length = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Condition = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Traffic = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bSidewalks = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bHasStreetLights = false;
};

/**
 * A street network graph for a settlement.
 * Mirrors StreetNetworkIR from ir-types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulStreetNetwork
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FInsimulStreetNode> Nodes;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FInsimulStreetEdge> Edges;
};

// ─── Mercantile ──────────────────────────────────────────────────────────────

/**
 * Shop item: extends inventory item with pricing/stock metadata.
 * Mirrors ShopItem from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulShopItem
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Type;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 BuyPrice = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 SellPrice = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Stock = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxStock = 10;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float RestockRate = 0.f;
    // Taxonomy
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Category;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Material;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BaseType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Rarity;

    /** Whether the item can be possessed/owned by NPCs */
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bPossessable = false;

    // Language learning data (for vocabulary items)
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString TargetWord;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString TargetLanguage;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Pronunciation;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LanguageCategory;
};

/**
 * Merchant inventory data.
 * Mirrors MerchantInventory from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulMerchantInventory
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString MerchantId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString MerchantName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FInsimulShopItem> Items;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 GoldReserve = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float BuyMultiplier = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float SellMultiplier = 1.f;
};

/**
 * Trade transaction types.
 */
UENUM(BlueprintType)
enum class EInsimulTransactionType : uint8
{
    Buy     UMETA(DisplayName = "Buy"),
    Sell    UMETA(DisplayName = "Sell"),
    Steal   UMETA(DisplayName = "Steal"),
    Discard UMETA(DisplayName = "Discard"),
    Give    UMETA(DisplayName = "Give"),
    QuestReward UMETA(DisplayName = "Quest Reward")
};

/**
 * Trade transaction record.
 * Mirrors TradeTransaction from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulTradeTransaction
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulTransactionType Type = EInsimulTransactionType::Buy;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TotalPrice = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString MerchantId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bSuccess = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Timestamp = 0.f;
};

/**
 * Transfer data for inventory item transfers between entities.
 * Mirrors DataSource.ts transferItem parameter.
 */
USTRUCT(BlueprintType)
struct FInsimulTransferData
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FromEntityId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ToEntityId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemDescription;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulTransactionType TransactionType = EInsimulTransactionType::Buy;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TotalPrice = 0;
};

// ─── Loot Tables ─────────────────────────────────────────────────────────────

/**
 * Single entry in a loot table.
 * Mirrors LootTableEntry from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulLootTableEntry
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float DropChance = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MinQuantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxQuantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Value = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 SellValue = 0;
};

/**
 * Loot table for an enemy type.
 * Mirrors LootTable from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulLootTable
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString EnemyType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FInsimulLootTableEntry> Entries;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 GoldMin = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 GoldMax = 0;
};

// ─── Resources ───────────────────────────────────────────────────────────────

/**
 * Resource types.
 * Mirrors ResourceType from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulResourceType : uint8
{
    Wood    UMETA(DisplayName = "Wood"),
    Stone   UMETA(DisplayName = "Stone"),
    Iron    UMETA(DisplayName = "Iron"),
    Gold    UMETA(DisplayName = "Gold"),
    Food    UMETA(DisplayName = "Food"),
    Water   UMETA(DisplayName = "Water"),
    Fiber   UMETA(DisplayName = "Fiber"),
    Crystal UMETA(DisplayName = "Crystal"),
    Oil     UMETA(DisplayName = "Oil")
};

/**
 * Resource definition.
 * Mirrors ResourceDefinition from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulResourceDefinition
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulResourceType Type = EInsimulResourceType::Wood;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Icon;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FLinearColor Color = FLinearColor::White;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxStack = 99;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float GatherTime = 2.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float RespawnTime = 60.f;
};

/**
 * Resource node data (world instance of a resource).
 * Mirrors ResourceNodeData from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulResourceNodeData
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NodeId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulResourceType Type = EInsimulResourceType::Wood;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector Position = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Remaining = 10;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxAmount = 10;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsBeingGathered = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float LastGatherTime = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float RespawnTimer = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bDepleted = false;
};

// ─── Crafting ────────────────────────────────────────────────────────────────

/**
 * Item category for crafting recipes.
 * Mirrors ItemCategory from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulItemCategory : uint8
{
    Tool              UMETA(DisplayName = "Tool"),
    Weapon            UMETA(DisplayName = "Weapon"),
    Armor             UMETA(DisplayName = "Armor"),
    Consumable        UMETA(DisplayName = "Consumable"),
    Material          UMETA(DisplayName = "Material"),
    BuildingMaterial  UMETA(DisplayName = "Building Material"),
    Utility           UMETA(DisplayName = "Utility")
};

/**
 * Crafting recipe.
 * Mirrors CraftingRecipe from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulCraftingRecipe
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString RecipeId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulItemCategory Category = EInsimulItemCategory::Tool;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Icon;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TMap<FString, int32> Ingredients;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float CraftTime = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 OutputQuantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 RequiredLevel = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bUnlocked = false;
};

/**
 * Crafted item.
 * Mirrors CraftedItem from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulCraftedItem
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString RecipeId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulItemCategory Category = EInsimulItemCategory::Tool;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Icon;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Durability = -1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 MaxDurability = -1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TMap<FString, float> Stats;
};

// ─── Survival Needs ──────────────────────────────────────────────────────────

/**
 * Need types.
 * Mirrors NeedType from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulNeedType : uint8
{
    Hunger      UMETA(DisplayName = "Hunger"),
    Thirst      UMETA(DisplayName = "Thirst"),
    Temperature UMETA(DisplayName = "Temperature"),
    Stamina     UMETA(DisplayName = "Stamina"),
    Sleep       UMETA(DisplayName = "Sleep")
};

/**
 * Need configuration.
 * Mirrors NeedConfig from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulNeedConfig
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulNeedType Type = EInsimulNeedType::Hunger;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Icon;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float MaxValue = 100.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float StartValue = 100.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float DecayRate = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float CriticalThreshold = 10.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float DamageRate = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float WarningThreshold = 25.f;
};

/**
 * Runtime need state.
 * Mirrors NeedState from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulNeedState
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulNeedType Type = EInsimulNeedType::Hunger;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Current = 100.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Max = 100.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float DecayRate = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsCritical = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsWarning = false;
};

/**
 * Survival event types.
 * Mirrors SurvivalEvent from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulSurvivalEventType : uint8
{
    NeedCritical    UMETA(DisplayName = "Need Critical"),
    NeedWarning     UMETA(DisplayName = "Need Warning"),
    NeedRestored    UMETA(DisplayName = "Need Restored"),
    DamageFromNeed  UMETA(DisplayName = "Damage From Need"),
    NeedSatisfied   UMETA(DisplayName = "Need Satisfied")
};

/**
 * Survival event payload.
 * Mirrors SurvivalEvent from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulSurvivalEvent
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulSurvivalEventType EventType = EInsimulSurvivalEventType::NeedWarning;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulNeedType NeedType = EInsimulNeedType::Hunger;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Value = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Message;
};

// ─── Camera ──────────────────────────────────────────────────────────────────

/**
 * Camera modes.
 * Mirrors CameraMode from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulCameraMode : uint8
{
    FirstPerson  UMETA(DisplayName = "First Person"),
    ThirdPerson  UMETA(DisplayName = "Third Person"),
    Isometric    UMETA(DisplayName = "Isometric"),
    SideScroll   UMETA(DisplayName = "Side Scroll"),
    TopDown      UMETA(DisplayName = "Top Down"),
    Fighting     UMETA(DisplayName = "Fighting")
};

// ─── Audio ───────────────────────────────────────────────────────────────────

/**
 * Audio roles.
 * Mirrors AudioRole from types.ts.
 */
UENUM(BlueprintType)
enum class EInsimulAudioRole : uint8
{
    Footstep UMETA(DisplayName = "Footstep"),
    Ambient  UMETA(DisplayName = "Ambient"),
    Combat   UMETA(DisplayName = "Combat"),
    Interact UMETA(DisplayName = "Interact"),
    Music    UMETA(DisplayName = "Music")
};

// ─── Player Configuration ────────────────────────────────────────────────────

/**
 * Player configuration.
 * Mirrors PlayerConfig from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulPlayerConfig
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector StartPosition = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ModelAsset;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float InitialEnergy = 100.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 InitialGold = 100;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float InitialHealth = 100.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Speed = 600.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float JumpHeight = 420.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Gravity = -980.f;
};

// ─── UI Configuration ────────────────────────────────────────────────────────

/**
 * UI configuration.
 * Mirrors UIConfig from types.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulUIConfig
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bShowMinimap = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bShowHealthBar = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bShowStaminaBar = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bShowAmmoCounter = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bShowCompass = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString GenreLayout;
};

// ─── Street Networks ────────────────────────────────────────────────────────

USTRUCT(BlueprintType)
struct FStreetNode
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float X = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Z = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> IntersectionOf;
};

USTRUCT(BlueprintType)
struct FStreetWaypoint
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) float X = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Z = 0.f;
};

USTRUCT(BlueprintType)
struct FStreetSegment
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Direction; // NS, EW, radial, ring
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> NodeIds;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FStreetWaypoint> Waypoints;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Width = 2.5f;
};

USTRUCT(BlueprintType)
struct FStreetNetwork
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FStreetNode> Nodes;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FStreetSegment> Segments;
};
