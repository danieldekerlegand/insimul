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

    /** Load quests.json. */
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

    /** Load base resources configuration. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadBaseResources();

    /** Load 3D configuration (derived from asset manifest). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadConfig3D();

    /** Load theme.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadTheme();

    // ── Settlement sub-loaders ────────────────────────────────────────

    /**
     * Load businesses for a settlement.
     * Reads from the settlements data and filters by SettlementId.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlementBusinesses(const FString& SettlementId);

    /** Load lots for a settlement. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlementLots(const FString& SettlementId);

    /** Load residences for a settlement. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlementResidences(const FString& SettlementId);

    // ── Inventory / Transfer ──────────────────────────────────────────

    /**
     * Get entity inventory JSON (returns empty inventory for exported games).
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString GetEntityInventory(const FString& EntityId);

    /**
     * Get merchant inventory JSON (returns empty for exported games).
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString GetMerchantInventory(const FString& MerchantId);

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

    /** Cached Content/Data path resolved once at initialization. */
    FString DataDirectory;
};
