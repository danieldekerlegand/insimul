#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "DataLoader.generated.h"

/**
 * Loads exported game data files from Content/Data/.
 * Mirrors the FileDataSource class from Insimul's DataSource.ts.
 *
 * All public loaders return raw JSON strings (FString). Callers are
 * responsible for deserializing into their own USTRUCTs or FJsonObject
 * trees. This keeps DataLoader free of schema dependencies so every
 * subsystem can evolve its types independently.
 */
UCLASS()
class INSIMULEXPORT_API UDataLoader : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    // ── World IR ───────────────────────────────────────────────────────

    /** Load the full WorldIR.json and return its raw JSON string. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadWorldIR();

    // ── Entity data ────────────────────────────────────────────────────

    /** Load characters.json (player-controlled characters). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadCharacters();

    /** Load npcs.json (non-player characters). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadNPCs();

    // ── Systems data ───────────────────────────────────────────────────

    /** Load actions.json (world + base actions). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadActions();

    /** Load rules.json (world + base rules). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadRules();

    /**
     * Load quests.json.
     * NOTE: In Babylon.js, a PlaythroughQuestOverlay merges per-playthrough
     * quest state on top of base quests. In Unreal, implement equivalent
     * overlay logic in your quest subsystem using save/load game state.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadQuests();

    /** Load base actions (from world IR systems section). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadBaseActions();

    /** Load base rules (from world IR systems section). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadBaseRules();

    // ── Geography ──────────────────────────────────────────────────────

    /** Load settlements.json (settlements with businesses, lots, residences). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlements();

    /** Load buildings.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadBuildings();

    /** Load countries.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadCountries();

    /** Load states.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadStates();

    /** Load geography.json (combined geography data). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadGeography();

    // ── Items & economy ────────────────────────────────────────────────

    /** Load items.json (item definitions). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadItems();

    /** Load loot-tables.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadLootTables();

    /** Load world items (items.json — all item definitions). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadWorldItems();

    /** Load containers.json (container definitions). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadContainers();

    /** Load base resources configuration. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadBaseResources();

    /** Load 3D configuration (derived from asset manifest).
     *  Merges world3DConfig from WorldIR metadata including:
     *  proceduralBuildings, buildingTypeOverrides, wallTextureId,
     *  roofTextureId, modelScaling, and audioAssets. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadConfig3D();

    /** Resolve an asset ID (MongoDB ObjectID) to its export file path.
     *  Uses the assetIdToPath map from WorldIR metadata. Returns empty
     *  string if the ID is not found in the map. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Insimul|DataLoader")
    FString ResolveAssetIdToPath(const FString& AssetId) const;

    /** Load theme.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadTheme();

    // ── Settlement sub-loaders ────────────────────────────────────────

    /**
     * Load businesses for a settlement.
     * Reads from the settlements data and filters by SettlementId.
     * Falls back to deriving businesses from buildings.json if the
     * settlement has no embedded businesses array.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlementBusinesses(const FString& SettlementId);

    /** Load lots for a settlement. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlementLots(const FString& SettlementId);

    /**
     * Load residences for a settlement.
     * Falls back to deriving residences from buildings.json if the
     * settlement has no embedded residences array.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlementResidences(const FString& SettlementId);

    // ── Inventory / Transfer ──────────────────────────────────────────

    /**
     * Get entity inventory JSON from local state.
     * Inventories are managed in-memory and persisted via SaveGameState.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString GetEntityInventory(const FString& EntityId);

    /**
     * Transfer an item between entities. Updates local inventory state.
     * Supports buy/sell/steal/give/discard/quest_reward transaction types.
     * Returns JSON with success status and timestamp.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString TransferItem(const FString& TransferJSON);

    /**
     * Get merchant inventory JSON. Generates stock based on NPC occupation
     * if not already cached, then caches for subsequent calls.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString GetMerchantInventory(const FString& MerchantId);

    /**
     * Update quest progress locally. Merges update data into cached quest state.
     * Quest updates are reflected in subsequent LoadQuests calls.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    void UpdateQuest(const FString& QuestId, const FString& UpdateJSON);

    /**
     * Pay fines for a settlement. Clears accumulated fines and returns result JSON.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString PayFines(const FString& SettlementId);

    /**
     * List existing playthroughs. Returns JSON array of playthrough objects.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString ListPlaythroughs();

    /**
     * Start a new playthrough. Returns JSON with unique playthrough ID and name.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString StartPlaythrough(const FString& PlaythroughName);

    // ── Character lookup ──────────────────────────────────────────────

    /** Load a single character by ID from characters.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadCharacter(const FString& CharacterId);

    // ── Narrative ──────────────────────────────────────────────────────

    /** Load truths.json (world truths / lore facts). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadTruths();

    /** Load grammars.json (Tracery grammar definitions). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadGrammars();

    // ── Prolog ─────────────────────────────────────────────────────────

    /** Load knowledge_base.pl as a raw text string (not JSON). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadPrologContent();

    // ── AI & dialogue ──────────────────────────────────────────────────

    /** Load ai-config.json (AI service configuration). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadAIConfig();

    /** Load dialogue-contexts.json (conversation context templates). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadDialogueContexts();

    // ── Assets ─────────────────────────────────────────────────────────

    /** Load geography.json (terrain heightmap, features, etc.). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadGeography();

    /** Load asset-manifest.json (exported asset registry). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadAssetManifest();

    // ── Save / Load ────────────────────────────────────────────────────

    /**
     * Save game state JSON to a numbered slot (0-2).
     * Writes to Saved/SaveGames/insimul_save_<SlotIndex>.json.
     * Returns true on success.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    bool SaveGameState(int32 SlotIndex, const FString& GameStateJSON);

    /**
     * Load game state JSON from a numbered slot (0-2).
     * Returns empty string if the slot has no save data.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadGameState(int32 SlotIndex);

    /**
     * Delete game state from a numbered slot (0-2).
     * Returns true if the file was deleted or did not exist.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    bool DeleteGameState(int32 SlotIndex);

    /**
     * Save quest progress JSON to a dedicated file.
     * Returns true on success.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    bool SaveQuestProgress(const FString& QuestProgressJSON);

    /**
     * Load quest progress JSON from the dedicated file.
     * Returns empty string if no quest progress has been saved.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadQuestProgress();

    // ── Playthrough relationships ─────────────────────────────────────

    /** Load playthrough relationship overlays (returns empty array in exported mode). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadPlaythroughRelationships();

    /** Update a playthrough relationship (no-op in exported mode). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    bool UpdatePlaythroughRelationship(const FString& FromCharacterId, const FString& ToCharacterId, const FString& Type, float Strength);

    // ── Status ─────────────────────────────────────────────────────────

    /** True once at least one file has been loaded successfully. */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul|DataLoader")
    bool bIsInitialized = false;

    /** Returns the Content/Data/ directory path used for file loading. */
    UFUNCTION(BlueprintPure, Category = "Insimul|DataLoader")
    FString GetDataDirectoryPath() const;

private:
    /**
     * Read an arbitrary file from Content/Data/ and return its contents.
     * Returns an empty string on failure and logs a warning.
     */
    FString LoadDataFile(const FString& Filename) const;

    /** Parse and cache the WorldIR JSON for metadata access (assetIdToPath, world3DConfig). */
    void EnsureWorldIRCached();

    /** Derive business entries from buildings.json for a settlement.
     *  Filters buildings by settlementId and businessId presence. */
    FString DeriveBusinessesFromBuildings(const FString& SettlementId) const;

    /** Derive residence entries from buildings.json for a settlement.
     *  Filters buildings by settlementId and residenceId presence. */
    FString DeriveResidencesFromBuildings(const FString& SettlementId) const;

    /** Cached Content/Data path resolved once at initialization. */
    FString DataDirectory;

    /** Cached WorldIR JSON object for metadata access. */
    TSharedPtr<FJsonObject> CachedWorldIR;

    /** Asset ID to file path map from WorldIR meta.assetIdToPath. */
    TMap<FString, FString> AssetIdToPathMap;
};
