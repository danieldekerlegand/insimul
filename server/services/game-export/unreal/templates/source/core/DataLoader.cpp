#include "DataLoader.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"

void UDataLoader::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);

    DataDirectory = FPaths::ProjectContentDir() / TEXT("Data");

    UE_LOG(LogTemp, Log, TEXT("[Insimul] DataLoader initialized – data path: %s"), *DataDirectory);
}

void UDataLoader::Deinitialize()
{
    Super::Deinitialize();
}

// ── Private helper ─────────────────────────────────────────────────────

FString UDataLoader::LoadDataFile(const FString& Filename) const
{
    const FString FilePath = DataDirectory / Filename;
    FString Contents;

    if (!FFileHelper::LoadFileToString(Contents, *FilePath))
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] DataLoader: failed to load %s"), *FilePath);
        return FString();
    }

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] DataLoader: loaded %s (%d chars)"), *Filename, Contents.Len());
    return Contents;
}

FString UDataLoader::GetDataDirectoryPath() const
{
    return DataDirectory;
}

// ── World IR ───────────────────────────────────────────────────────────

FString UDataLoader::LoadWorldIR()
{
    FString Result = LoadDataFile(TEXT("WorldIR.json"));
    if (!Result.IsEmpty())
    {
        bIsInitialized = true;
    }
    return Result;
}

// ── Entity data ────────────────────────────────────────────────────────

FString UDataLoader::LoadCharacters()
{
    return LoadDataFile(TEXT("characters.json"));
}

FString UDataLoader::LoadNPCs()
{
    return LoadDataFile(TEXT("npcs.json"));
}

// ── Systems data ───────────────────────────────────────────────────────

FString UDataLoader::LoadActions()
{
    return LoadDataFile(TEXT("actions.json"));
}

FString UDataLoader::LoadRules()
{
    return LoadDataFile(TEXT("rules.json"));
}

FString UDataLoader::LoadQuests()
{
    return LoadDataFile(TEXT("quests.json"));
}

FString UDataLoader::LoadBaseActions()
{
    // Base actions are embedded in the world IR under systems.actions
    // For exported games, they are bundled with the main actions.json
    return LoadDataFile(TEXT("actions.json"));
}

FString UDataLoader::LoadBaseRules()
{
    // Base rules are embedded in the world IR under systems.rules
    return LoadDataFile(TEXT("rules.json"));
}

// ── Geography ──────────────────────────────────────────────────────────

FString UDataLoader::LoadSettlements()
{
    return LoadDataFile(TEXT("settlements.json"));
}

FString UDataLoader::LoadBuildings()
{
    return LoadDataFile(TEXT("buildings.json"));
}

FString UDataLoader::LoadCountries()
{
    return LoadDataFile(TEXT("countries.json"));
}

FString UDataLoader::LoadStates()
{
    return LoadDataFile(TEXT("states.json"));
}

FString UDataLoader::LoadGeography()
{
    return LoadDataFile(TEXT("geography.json"));
}

// ── Items & economy ────────────────────────────────────────────────────

FString UDataLoader::LoadItems()
{
    return LoadDataFile(TEXT("items.json"));
}

FString UDataLoader::LoadWorldItems()
{
    return LoadDataFile(TEXT("items.json"));
}

FString UDataLoader::LoadBaseResources()
{
    return LoadDataFile(TEXT("base-resources.json"));
}

FString UDataLoader::LoadConfig3D()
{
    // 3D config is derived from asset manifest in Babylon.js source.
    // For Unreal, we load the asset manifest which contains model mappings.
    return LoadDataFile(TEXT("asset-manifest.json"));
}

FString UDataLoader::LoadTheme()
{
    return LoadDataFile(TEXT("theme.json"));
}

// ── Settlement sub-loaders ────────────────────────────────────────────

FString UDataLoader::LoadSettlementBusinesses(const FString& SettlementId)
{
    // In exported games, settlement sub-data is embedded in the geography file.
    // Parse and filter here as a convenience.
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadSettlementBusinesses(%s) — parse from geography"), *SettlementId);
    return LoadDataFile(TEXT("geography.json"));
}

FString UDataLoader::LoadSettlementLots(const FString& SettlementId)
{
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadSettlementLots(%s) — parse from geography"), *SettlementId);
    return LoadDataFile(TEXT("geography.json"));
}

FString UDataLoader::LoadSettlementResidences(const FString& SettlementId)
{
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadSettlementResidences(%s) — parse from geography"), *SettlementId);
    return LoadDataFile(TEXT("geography.json"));
}

// ── Inventory / Transfer ──────────────────────────────────────────────

FString UDataLoader::GetEntityInventory(const FString& EntityId)
{
    // In exported games, inventory is managed locally by InventorySystem.
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] GetEntityInventory(%s) — local-only in exported games"), *EntityId);
    return FString::Printf(TEXT("{\"entityId\":\"%s\",\"items\":[],\"gold\":0}"), *EntityId);
}

FString UDataLoader::GetMerchantInventory(const FString& MerchantId)
{
    // In exported games, merchant inventory is managed locally.
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] GetMerchantInventory(%s) — local-only in exported games"), *MerchantId);
    return FString();
}

// ── Character lookup ──────────────────────────────────────────────────

FString UDataLoader::LoadCharacter(const FString& CharacterId)
{
    // Load all characters and find the one with matching ID.
    // Callers should cache the full characters array for repeated lookups.
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadCharacter(%s) — loads full characters file"), *CharacterId);
    return LoadDataFile(TEXT("characters.json"));
}

FString UDataLoader::LoadLootTables()
{
    return LoadDataFile(TEXT("loot-tables.json"));
}

// ── Narrative ──────────────────────────────────────────────────────────

FString UDataLoader::LoadTruths()
{
    return LoadDataFile(TEXT("truths.json"));
}

FString UDataLoader::LoadGrammars()
{
    return LoadDataFile(TEXT("grammars.json"));
}

// ── Prolog ─────────────────────────────────────────────────────────────

FString UDataLoader::LoadPrologContent()
{
    return LoadDataFile(TEXT("knowledge_base.pl"));
}

// ── AI & dialogue ──────────────────────────────────────────────────────

FString UDataLoader::LoadAIConfig()
{
    return LoadDataFile(TEXT("ai-config.json"));
}

FString UDataLoader::LoadDialogueContexts()
{
    return LoadDataFile(TEXT("dialogue-contexts.json"));
}

// ── Assets ─────────────────────────────────────────────────────────────

FString UDataLoader::LoadAssetManifest()
{
    return LoadDataFile(TEXT("asset-manifest.json"));
}
