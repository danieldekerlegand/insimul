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

// ── Geography ──────────────────────────────────────────────────────────

FString UDataLoader::LoadSettlements()
{
    return LoadDataFile(TEXT("settlements.json"));
}

FString UDataLoader::LoadBuildings()
{
    return LoadDataFile(TEXT("buildings.json"));
}

// ── Items & economy ────────────────────────────────────────────────────

FString UDataLoader::LoadItems()
{
    return LoadDataFile(TEXT("items.json"));
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
