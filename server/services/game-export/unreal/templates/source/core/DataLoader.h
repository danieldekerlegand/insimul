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

    // ── Geography ──────────────────────────────────────────────────────

    /** Load settlements.json (settlements with businesses, lots, residences). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadSettlements();

    /** Load buildings.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadBuildings();

    // ── Items & economy ────────────────────────────────────────────────

    /** Load items.json (item definitions). */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadItems();

    /** Load loot-tables.json. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DataLoader")
    FString LoadLootTables();

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
