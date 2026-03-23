#include "DataLoader.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Dom/JsonValue.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Serialization/JsonWriter.h"

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
        // Cache WorldIR metadata (assetIdToPath, world3DConfig) for use by
        // LoadConfig3D, ResolveAssetIdToPath, and settlement fallback logic.
        EnsureWorldIRCached();
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

FString UDataLoader::LoadContainers()
{
    return LoadDataFile(TEXT("containers.json"));
}

FString UDataLoader::LoadBaseResources()
{
    return LoadDataFile(TEXT("base-resources.json"));
}

FString UDataLoader::LoadConfig3D()
{
    // 3D config is derived from asset manifest in Babylon.js source.
    // For Unreal, we load the asset manifest and merge world3DConfig from WorldIR.
    FString ManifestJson = LoadDataFile(TEXT("asset-manifest.json"));

    // Merge world3DConfig from IR metadata — this contains procedural building
    // presets, per-type overrides, texture IDs, model scaling, and audio assets.
    // Mirrors DataSource.ts loadConfig3D() which merges IR config properties:
    //   proceduralBuildings, buildingTypeOverrides, wallTextureId, roofTextureId,
    //   modelScaling, audioAssets
    EnsureWorldIRCached();
    if (CachedWorldIR.IsValid())
    {
        const TSharedPtr<FJsonObject>* MetaObj;
        if (CachedWorldIR->TryGetObjectField(TEXT("meta"), MetaObj))
        {
            const TSharedPtr<FJsonObject>* Config3DObj;
            if ((*MetaObj)->TryGetObjectField(TEXT("world3DConfig"), Config3DObj))
            {
                // Serialize the world3DConfig section and append it as a wrapper
                // so callers can access both manifest and IR config
                FString Config3DJson;
                TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&Config3DJson);
                FJsonSerializer::Serialize(Config3DObj->ToSharedRef(), Writer);
                UE_LOG(LogTemp, Log, TEXT("[Insimul] LoadConfig3D: merged world3DConfig from IR (%d chars)"), Config3DJson.Len());

                // Return combined JSON: { "manifest": ..., "world3DConfig": ... }
                return FString::Printf(TEXT("{\"manifest\":%s,\"world3DConfig\":%s}"), *ManifestJson, *Config3DJson);
            }
        }
    }

    return ManifestJson;
}

FString UDataLoader::LoadTheme()
{
    return LoadDataFile(TEXT("theme.json"));
}

// ── Settlement sub-loaders ────────────────────────────────────────────

FString UDataLoader::LoadSettlementBusinesses(const FString& SettlementId)
{
    // In exported games, settlement sub-data is embedded in the geography file.
    // Try geography first; if settlement has no embedded businesses, fall back
    // to deriving from buildings.json (mirrors DataSource.ts behavior).
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadSettlementBusinesses(%s)"), *SettlementId);

    FString GeoJson = LoadDataFile(TEXT("geography.json"));
    if (GeoJson.IsEmpty())
    {
        return DeriveBusinessesFromBuildings(SettlementId);
    }

    // Parse geography and check if settlement has businesses
    TSharedPtr<FJsonObject> GeoObj;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(GeoJson);
    if (FJsonSerializer::Deserialize(Reader, GeoObj) && GeoObj.IsValid())
    {
        const TArray<TSharedPtr<FJsonValue>>* Settlements;
        if (GeoObj->TryGetArrayField(TEXT("settlements"), Settlements))
        {
            for (const auto& Val : *Settlements)
            {
                const TSharedPtr<FJsonObject>* SettObj;
                if (Val->TryGetObject(SettObj))
                {
                    FString Id;
                    (*SettObj)->TryGetStringField(TEXT("id"), Id);
                    if (Id == SettlementId)
                    {
                        const TArray<TSharedPtr<FJsonValue>>* Businesses;
                        if ((*SettObj)->TryGetArrayField(TEXT("businesses"), Businesses) && Businesses->Num() > 0)
                        {
                            // Serialize just the businesses array
                            FString Result;
                            TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&Result);
                            FJsonSerializer::Serialize(*Businesses, Writer);
                            return Result;
                        }
                        break;
                    }
                }
            }
        }
    }

    // Fall back to deriving from buildings data
    return DeriveBusinessesFromBuildings(SettlementId);
}

FString UDataLoader::LoadSettlementLots(const FString& SettlementId)
{
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadSettlementLots(%s) — parse from geography"), *SettlementId);
    return LoadDataFile(TEXT("geography.json"));
}

FString UDataLoader::LoadSettlementResidences(const FString& SettlementId)
{
    // Try geography first; if settlement has no embedded residences, fall back
    // to deriving from buildings.json (mirrors DataSource.ts behavior).
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadSettlementResidences(%s)"), *SettlementId);

    FString GeoJson = LoadDataFile(TEXT("geography.json"));
    if (GeoJson.IsEmpty())
    {
        return DeriveResidencesFromBuildings(SettlementId);
    }

    // Parse geography and check if settlement has residences
    TSharedPtr<FJsonObject> GeoObj;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(GeoJson);
    if (FJsonSerializer::Deserialize(Reader, GeoObj) && GeoObj.IsValid())
    {
        const TArray<TSharedPtr<FJsonValue>>* Settlements;
        if (GeoObj->TryGetArrayField(TEXT("settlements"), Settlements))
        {
            for (const auto& Val : *Settlements)
            {
                const TSharedPtr<FJsonObject>* SettObj;
                if (Val->TryGetObject(SettObj))
                {
                    FString Id;
                    (*SettObj)->TryGetStringField(TEXT("id"), Id);
                    if (Id == SettlementId)
                    {
                        const TArray<TSharedPtr<FJsonValue>>* Residences;
                        if ((*SettObj)->TryGetArrayField(TEXT("residences"), Residences) && Residences->Num() > 0)
                        {
                            FString Result;
                            TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&Result);
                            FJsonSerializer::Serialize(*Residences, Writer);
                            return Result;
                        }
                        break;
                    }
                }
            }
        }
    }

    // Fall back to deriving from buildings data
    return DeriveResidencesFromBuildings(SettlementId);
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

FString UDataLoader::GetPlayerInventory(const FString& WorldId, const FString& PlayerId)
{
    // Delegates to GetEntityInventory — WorldId is unused in exported mode.
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] GetPlayerInventory(%s, %s)"), *WorldId, *PlayerId);
    return GetEntityInventory(PlayerId);
}

FString UDataLoader::GetContainerContents(const FString& ContainerId)
{
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] GetContainerContents(%s)"), *ContainerId);

    FString ContainersJson = LoadDataFile(TEXT("containers.json"));
    if (ContainersJson.IsEmpty())
    {
        return TEXT("{}");
    }

    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(ContainersJson);
    TArray<TSharedPtr<FJsonValue>> Containers;
    if (!FJsonSerializer::Deserialize(Reader, Containers))
    {
        return TEXT("{}");
    }

    for (const auto& Val : Containers)
    {
        const TSharedPtr<FJsonObject>* ContObj;
        if (!Val->TryGetObject(ContObj)) continue;

        FString Id;
        (*ContObj)->TryGetStringField(TEXT("id"), Id);
        if (Id == ContainerId)
        {
            FString Result;
            TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&Result);
            FJsonSerializer::Serialize(ContObj->ToSharedRef(), Writer);
            return Result;
        }
    }

    return TEXT("{}");
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

FString UDataLoader::ListPlaythroughs()
{
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ListPlaythroughs()"));

    TArray<TSharedPtr<FJsonValue>> Playthroughs = LoadPlaythroughIndex();

    FString ResultJson;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&ResultJson);
    FJsonSerializer::Serialize(Playthroughs, Writer);
    return ResultJson;
}

FString UDataLoader::StartPlaythrough(const FString& PlaythroughName)
{
    // Generate unique ID: local-{timestamp}-{random}
    const int64 Timestamp = FDateTime::UtcNow().ToUnixTimestamp();
    const int32 Random = FMath::RandRange(1000, 9999);
    const FString NewId = FString::Printf(TEXT("local-%lld-%d"), Timestamp, Random);

    UE_LOG(LogTemp, Log, TEXT("[Insimul] StartPlaythrough(%s) -> %s"), *PlaythroughName, *NewId);

    // Set as current playthrough
    CurrentPlaythroughId = NewId;

    // Build metadata object
    TSharedPtr<FJsonObject> Entry = MakeShared<FJsonObject>();
    const FString NowISO = FDateTime::UtcNow().ToIso8601();
    Entry->SetStringField(TEXT("id"), NewId);
    Entry->SetStringField(TEXT("name"), PlaythroughName);
    Entry->SetStringField(TEXT("status"), TEXT("active"));
    Entry->SetStringField(TEXT("createdAt"), NowISO);
    Entry->SetStringField(TEXT("lastPlayedAt"), NowISO);

    // Persist to index
    TArray<TSharedPtr<FJsonValue>> Playthroughs = LoadPlaythroughIndex();
    Playthroughs.Add(MakeShared<FJsonValueObject>(Entry));
    SavePlaythroughIndex(Playthroughs);

    // Return the new playthrough as JSON
    FString ResultJson;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&ResultJson);
    FJsonSerializer::Serialize(Entry.ToSharedRef(), Writer);
    return ResultJson;
}

FString UDataLoader::GetPlaythrough(const FString& PlaythroughId)
{
    UE_LOG(LogTemp, Log, TEXT("[Insimul] GetPlaythrough(%s)"), *PlaythroughId);

    TArray<TSharedPtr<FJsonValue>> Playthroughs = LoadPlaythroughIndex();
    for (const auto& Val : Playthroughs)
    {
        const TSharedPtr<FJsonObject>* Obj;
        if (Val->TryGetObject(Obj))
        {
            FString Id;
            (*Obj)->TryGetStringField(TEXT("id"), Id);
            if (Id == PlaythroughId)
            {
                FString ResultJson;
                TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&ResultJson);
                FJsonSerializer::Serialize(Obj->ToSharedRef(), Writer);
                return ResultJson;
            }
        }
    }
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

// ── WorldIR caching & asset ID resolution ─────────────────────────────

void UDataLoader::EnsureWorldIRCached()
{
    if (CachedWorldIR.IsValid()) return;

    FString IRJson = LoadDataFile(TEXT("WorldIR.json"));
    if (IRJson.IsEmpty()) return;

    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(IRJson);
    TSharedPtr<FJsonObject> Parsed;
    if (!FJsonSerializer::Deserialize(Reader, Parsed) || !Parsed.IsValid()) return;

    CachedWorldIR = Parsed;

    // Populate assetIdToPath map from meta.assetIdToPath
    const TSharedPtr<FJsonObject>* MetaObj;
    if (CachedWorldIR->TryGetObjectField(TEXT("meta"), MetaObj))
    {
        const TSharedPtr<FJsonObject>* IdMapObj;
        if ((*MetaObj)->TryGetObjectField(TEXT("assetIdToPath"), IdMapObj))
        {
            for (const auto& Pair : (*IdMapObj)->Values)
            {
                FString Path;
                if (Pair.Value->TryGetString(Path))
                {
                    AssetIdToPathMap.Add(Pair.Key, Path);
                }
            }
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Cached %d assetIdToPath entries from WorldIR"), AssetIdToPathMap.Num());
        }
    }
}

FString UDataLoader::ResolveAssetIdToPath(const FString& AssetId) const
{
    if (const FString* Path = AssetIdToPathMap.Find(AssetId))
    {
        return *Path;
    }
    return FString();
}

// ── Buildings fallback helpers ────────────────────────────────────────

FString UDataLoader::DeriveBusinessesFromBuildings(const FString& SettlementId) const
{
    // Mirrors DataSource.ts: filter buildings by settlementId + businessId,
    // then project into business-like objects.
    FString BuildingsJson = LoadDataFile(TEXT("buildings.json"));
    if (BuildingsJson.IsEmpty()) return TEXT("[]");

    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(BuildingsJson);
    TArray<TSharedPtr<FJsonValue>> Buildings;
    if (!FJsonSerializer::Deserialize(Reader, Buildings)) return TEXT("[]");

    TArray<TSharedPtr<FJsonValue>> Results;
    for (const auto& Val : Buildings)
    {
        const TSharedPtr<FJsonObject>* BldgObj;
        if (!Val->TryGetObject(BldgObj)) continue;

        FString BSettId;
        (*BldgObj)->TryGetStringField(TEXT("settlementId"), BSettId);
        if (BSettId != SettlementId) continue;

        FString BusinessId;
        if (!(*BldgObj)->TryGetStringField(TEXT("businessId"), BusinessId) || BusinessId.IsEmpty()) continue;

        // Derive business entry from building data
        TSharedPtr<FJsonObject> Biz = MakeShared<FJsonObject>();
        FString BldgId;
        (*BldgObj)->TryGetStringField(TEXT("id"), BldgId);
        Biz->SetStringField(TEXT("id"), BusinessId.IsEmpty() ? BldgId : BusinessId);
        Biz->SetStringField(TEXT("settlementId"), SettlementId);

        // Extract buildingRole from spec object
        FString Role = TEXT("Shop");
        const TSharedPtr<FJsonObject>* SpecObj;
        if ((*BldgObj)->TryGetObjectField(TEXT("spec"), SpecObj))
        {
            (*SpecObj)->TryGetStringField(TEXT("buildingRole"), Role);
        }
        Biz->SetStringField(TEXT("businessType"), Role);
        Biz->SetStringField(TEXT("name"), Role);

        // occupantIds: first is owner, rest are employees
        const TArray<TSharedPtr<FJsonValue>>* OccupantIds;
        if ((*BldgObj)->TryGetArrayField(TEXT("occupantIds"), OccupantIds) && OccupantIds->Num() > 0)
        {
            FString OwnerId;
            (*OccupantIds)[0]->TryGetString(OwnerId);
            Biz->SetStringField(TEXT("ownerId"), OwnerId);

            TArray<TSharedPtr<FJsonValue>> Employees;
            for (int32 i = 1; i < OccupantIds->Num(); ++i)
            {
                Employees.Add((*OccupantIds)[i]);
            }
            Biz->SetArrayField(TEXT("employees"), Employees);
        }

        Results.Add(MakeShared<FJsonValueObject>(Biz));
    }

    FString ResultJson;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&ResultJson);
    FJsonSerializer::Serialize(Results, Writer);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Derived %d businesses from buildings for settlement %s"), Results.Num(), *SettlementId);
    return ResultJson;
}

FString UDataLoader::DeriveResidencesFromBuildings(const FString& SettlementId) const
{
    // Mirrors DataSource.ts: filter buildings by settlementId + residenceId,
    // then project into residence-like objects.
    FString BuildingsJson = LoadDataFile(TEXT("buildings.json"));
    if (BuildingsJson.IsEmpty()) return TEXT("[]");

    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(BuildingsJson);
    TArray<TSharedPtr<FJsonValue>> Buildings;
    if (!FJsonSerializer::Deserialize(Reader, Buildings)) return TEXT("[]");

    TArray<TSharedPtr<FJsonValue>> Results;
    for (const auto& Val : Buildings)
    {
        const TSharedPtr<FJsonObject>* BldgObj;
        if (!Val->TryGetObject(BldgObj)) continue;

        FString BSettId;
        (*BldgObj)->TryGetStringField(TEXT("settlementId"), BSettId);
        if (BSettId != SettlementId) continue;

        FString ResidenceId;
        if (!(*BldgObj)->TryGetStringField(TEXT("residenceId"), ResidenceId) || ResidenceId.IsEmpty()) continue;

        // Derive residence entry from building data
        TSharedPtr<FJsonObject> Res = MakeShared<FJsonObject>();
        FString BldgId;
        (*BldgObj)->TryGetStringField(TEXT("id"), BldgId);
        Res->SetStringField(TEXT("id"), ResidenceId.IsEmpty() ? BldgId : ResidenceId);
        Res->SetStringField(TEXT("settlementId"), SettlementId);

        // Extract buildingRole from spec object
        FString Role = TEXT("House");
        const TSharedPtr<FJsonObject>* SpecObj;
        if ((*BldgObj)->TryGetObjectField(TEXT("spec"), SpecObj))
        {
            (*SpecObj)->TryGetStringField(TEXT("buildingRole"), Role);
        }
        Res->SetStringField(TEXT("residenceType"), Role);
        Res->SetStringField(TEXT("name"), Role);

        // occupantIds
        const TArray<TSharedPtr<FJsonValue>>* OccupantIds;
        if ((*BldgObj)->TryGetArrayField(TEXT("occupantIds"), OccupantIds))
        {
            Res->SetArrayField(TEXT("occupantIds"), *OccupantIds);
        }
        else
        {
            Res->SetArrayField(TEXT("occupantIds"), TArray<TSharedPtr<FJsonValue>>());
        }

        Results.Add(MakeShared<FJsonValueObject>(Res));
    }

    FString ResultJson;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&ResultJson);
    FJsonSerializer::Serialize(Results, Writer);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Derived %d residences from buildings for settlement %s"), Results.Num(), *SettlementId);
    return ResultJson;
}

// ── Save / Load ────────────────────────────────────────────────────────

bool UDataLoader::SaveGameState(int32 SlotIndex, const FString& GameStateJSON, const FString& PlaythroughId)
{
    if (SlotIndex < 0 || SlotIndex > 2)
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] SaveGameState: invalid slot %d (must be 0-2)"), SlotIndex);
        return false;
    }
    const FString EffectiveId = ResolvePlaythroughId(PlaythroughId);
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / FString::Printf(TEXT("insimul_save_%s_%d.json"), *EffectiveId, SlotIndex);
    if (!FFileHelper::SaveStringToFile(GameStateJSON, *SavePath))
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] SaveGameState: failed to write %s"), *SavePath);
        return false;
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] SaveGameState: saved to playthrough %s slot %d (%d chars)"), *EffectiveId, SlotIndex, GameStateJSON.Len());

    // Update lastPlayedAt in index
    TArray<TSharedPtr<FJsonValue>> Playthroughs = LoadPlaythroughIndex();
    for (const auto& Val : Playthroughs)
    {
        const TSharedPtr<FJsonObject>* Obj;
        if (Val->TryGetObject(Obj))
        {
            FString Id;
            (*Obj)->TryGetStringField(TEXT("id"), Id);
            if (Id == EffectiveId)
            {
                (*Obj)->SetStringField(TEXT("lastPlayedAt"), FDateTime::UtcNow().ToIso8601());
                break;
            }
        }
    }
    SavePlaythroughIndex(Playthroughs);

    return true;
}

FString UDataLoader::LoadGameState(int32 SlotIndex, const FString& PlaythroughId)
{
    if (SlotIndex < 0 || SlotIndex > 2)
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] LoadGameState: invalid slot %d (must be 0-2)"), SlotIndex);
        return FString();
    }
    const FString EffectiveId = ResolvePlaythroughId(PlaythroughId);
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / FString::Printf(TEXT("insimul_save_%s_%d.json"), *EffectiveId, SlotIndex);
    FString Contents;
    if (!FFileHelper::LoadFileToString(Contents, *SavePath))
    {
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadGameState: no save for playthrough %s slot %d"), *EffectiveId, SlotIndex);
        return FString();
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] LoadGameState: loaded playthrough %s slot %d (%d chars)"), *EffectiveId, SlotIndex, Contents.Len());
    return Contents;
}

bool UDataLoader::DeleteGameState(int32 SlotIndex, const FString& PlaythroughId)
{
    if (SlotIndex < 0 || SlotIndex > 2)
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] DeleteGameState: invalid slot %d (must be 0-2)"), SlotIndex);
        return false;
    }
    const FString EffectiveId = ResolvePlaythroughId(PlaythroughId);
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / FString::Printf(TEXT("insimul_save_%s_%d.json"), *EffectiveId, SlotIndex);
    if (IFileManager::Get().FileExists(*SavePath))
    {
        IFileManager::Get().Delete(*SavePath);
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] DeleteGameState: deleted playthrough %s slot %d"), *EffectiveId, SlotIndex);
    return true;
}

bool UDataLoader::SaveQuestProgress(const FString& QuestProgressJSON, const FString& PlaythroughId)
{
    const FString EffectiveId = ResolvePlaythroughId(PlaythroughId);
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / FString::Printf(TEXT("insimul_quest_progress_%s.json"), *EffectiveId);
    if (!FFileHelper::SaveStringToFile(QuestProgressJSON, *SavePath))
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] SaveQuestProgress: failed to write %s"), *SavePath);
        return false;
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] SaveQuestProgress: saved for playthrough %s (%d chars)"), *EffectiveId, QuestProgressJSON.Len());
    return true;
}

FString UDataLoader::LoadQuestProgress(const FString& PlaythroughId)
{
    const FString EffectiveId = ResolvePlaythroughId(PlaythroughId);
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString SavePath = SaveDir / FString::Printf(TEXT("insimul_quest_progress_%s.json"), *EffectiveId);
    FString Contents;
    if (!FFileHelper::LoadFileToString(Contents, *SavePath))
    {
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] LoadQuestProgress: no saved quest progress for playthrough %s"), *EffectiveId);
        return FString();
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] LoadQuestProgress: loaded for playthrough %s (%d chars)"), *EffectiveId, Contents.Len());
    return Contents;
}

// ── Playthrough index helpers ─────────────────────────────────────────

FString UDataLoader::ResolvePlaythroughId(const FString& PlaythroughId) const
{
    if (!PlaythroughId.IsEmpty())
    {
        return PlaythroughId;
    }
    if (!CurrentPlaythroughId.IsEmpty())
    {
        return CurrentPlaythroughId;
    }
    return TEXT("default");
}

TArray<TSharedPtr<FJsonValue>> UDataLoader::LoadPlaythroughIndex() const
{
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    const FString IndexPath = SaveDir / TEXT("insimul_playthroughs.json");
    FString Contents;
    if (!FFileHelper::LoadFileToString(Contents, *IndexPath))
    {
        return TArray<TSharedPtr<FJsonValue>>();
    }

    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Contents);
    TArray<TSharedPtr<FJsonValue>> Result;
    if (!FJsonSerializer::Deserialize(Reader, Result))
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] LoadPlaythroughIndex: failed to parse %s"), *IndexPath);
        return TArray<TSharedPtr<FJsonValue>>();
    }
    return Result;
}

bool UDataLoader::SavePlaythroughIndex(const TArray<TSharedPtr<FJsonValue>>& Playthroughs) const
{
    const FString SaveDir = FPaths::ProjectSavedDir() / TEXT("SaveGames");
    // Ensure SaveGames directory exists
    IFileManager::Get().MakeDirectory(*SaveDir, true);
    const FString IndexPath = SaveDir / TEXT("insimul_playthroughs.json");

    FString JsonStr;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonStr);
    FJsonSerializer::Serialize(Playthroughs, Writer);

    if (!FFileHelper::SaveStringToFile(JsonStr, *IndexPath))
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] SavePlaythroughIndex: failed to write %s"), *IndexPath);
        return false;
    }
    return true;
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
