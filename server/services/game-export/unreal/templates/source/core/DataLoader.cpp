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
    // Returns base world quests. Per-playthrough state (status, progress,
    // completion) should be overlaid at runtime from save game state.
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

// Local state management: inventories, quest progress, merchant stock, and fines
// are tracked in-memory and persisted via SaveGameState/LoadGameState.
// This mirrors the LocalGameState class from DataSource.ts.
//
// TODO: Implement full in-memory state tracking (TMap<FString, FJsonObject>)
// for inventories, quest updates, merchant caches, and fines.

FString UDataLoader::GetEntityInventory(const FString& EntityId)
{
    // TODO: Return from local state manager instead of empty stub.
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] GetEntityInventory(%s)"), *EntityId);
    return FString::Printf(TEXT("{\"entityId\":\"%s\",\"items\":[],\"gold\":0}"), *EntityId);
}

FString UDataLoader::TransferItem(const FString& TransferJSON)
{
    // TODO: Parse TransferJSON, update source/destination inventories in local state.
    // Handle quantity changes, gold for buy/sell, item stacking.
    UE_LOG(LogTemp, Log, TEXT("[Insimul] TransferItem"));
    return TEXT("{\"success\":true}");
}

FString UDataLoader::GetMerchantInventory(const FString& MerchantId)
{
    // TODO: Check local state cache first. If not cached, look up NPC occupation
    // from characters/npcs data and generate stock based on occupation type.
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] GetMerchantInventory(%s)"), *MerchantId);
    return FString();
}

void UDataLoader::UpdateQuest(const FString& QuestId, const FString& UpdateJSON)
{
    // TODO: Merge UpdateJSON into local quest state overlay.
    UE_LOG(LogTemp, Log, TEXT("[Insimul] UpdateQuest(%s)"), *QuestId);
}

FString UDataLoader::PayFines(const FString& SettlementId)
{
    // TODO: Clear accumulated fines for settlement in local state.
    UE_LOG(LogTemp, Log, TEXT("[Insimul] PayFines(%s)"), *SettlementId);
    return TEXT("{\"success\":true,\"finesPaid\":0}");
}

FString UDataLoader::StartPlaythrough(const FString& PlaythroughName)
{
    // TODO: Generate unique playthrough ID and persist to local state.
    UE_LOG(LogTemp, Log, TEXT("[Insimul] StartPlaythrough(%s)"), *PlaythroughName);
    return FString::Printf(TEXT("{\"id\":\"exported-playthrough\",\"name\":\"%s\"}"), *PlaythroughName);
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

// ── Geography ──────────────────────────────────────────────────────────

FString UDataLoader::LoadGeography()
{
    return LoadDataFile(TEXT("geography.json"));
}

// ── Assets ─────────────────────────────────────────────────────────────

FString UDataLoader::LoadAssetManifest()
{
    return LoadDataFile(TEXT("asset-manifest.json"));
}

// ── Save / Load ────────────────────────────────────────────────────────

bool UDataLoader::SaveGameState(int32 SlotIndex, const FString& GameStateJSON)
{
    if (SlotIndex < 0 || SlotIndex > 2)
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] SaveGameState: invalid slot %d (must be 0-2)"), SlotIndex);
        return false;
    }
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / FString::Printf(TEXT("insimul_save_%d.json"), SlotIndex);
    if (!FFileHelper::SaveStringToFile(GameStateJSON, *SavePath))
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] SaveGameState: failed to write %s"), *SavePath);
        return false;
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] SaveGameState: saved to slot %d (%d chars)"), SlotIndex, GameStateJSON.Len());
    return true;
}

FString UDataLoader::LoadGameState(int32 SlotIndex)
{
    if (SlotIndex < 0 || SlotIndex > 2)
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] LoadGameState: invalid slot %d (must be 0-2)"), SlotIndex);
        return FString();
    }
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / FString::Printf(TEXT("insimul_save_%d.json"), SlotIndex);
    FString Contents;
    if (!FFileHelper::LoadFileToString(Contents, *SavePath))
    {
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadGameState: no save in slot %d"), SlotIndex);
        return FString();
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] LoadGameState: loaded slot %d (%d chars)"), SlotIndex, Contents.Len());
    return Contents;
}

bool UDataLoader::SaveQuestProgress(const FString& QuestProgressJSON)
{
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / TEXT("insimul_quest_progress.json");
    if (!FFileHelper::SaveStringToFile(QuestProgressJSON, *SavePath))
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] SaveQuestProgress: failed to write %s"), *SavePath);
        return false;
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] SaveQuestProgress: saved (%d chars)"), QuestProgressJSON.Len());
    return true;
}

FString UDataLoader::LoadQuestProgress()
{
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / TEXT("insimul_quest_progress.json");
    FString Contents;
    if (!FFileHelper::LoadFileToString(Contents, *SavePath))
    {
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadQuestProgress: no saved quest progress"));
        return FString();
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] LoadQuestProgress: loaded (%d chars)"), Contents.Len());
    return Contents;
}

FString UDataLoader::LoadPlaythroughRelationships()
{
    // No server in exported mode — return empty JSON array
    return TEXT("[]");
}

bool UDataLoader::UpdatePlaythroughRelationship(const FString& FromCharacterId, const FString& ToCharacterId, const FString& Type, float Strength)
{
    // No server in exported mode — no-op
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] UpdatePlaythroughRelationship: no-op in exported mode"));
    return false;
}
