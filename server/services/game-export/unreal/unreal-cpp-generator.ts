/**
 * Unreal C++ Generator
 *
 * Generates C++ header and source files for the UE5 project:
 * - Data structs (USTRUCTs for DataTable rows)
 * - Core classes (GameMode, GameInstance, PlayerController)
 * - Character classes (Player, NPC)
 * - Game systems (Action, Combat, Quest, Inventory, Crafting, Resource, Survival, Dialogue, Rule)
 * - World generators (Building, Nature, Road, Dungeon, WorldScale)
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './unreal-project-generator';

const M = 'InsimulExport'; // Module name

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function hGuard(name: string): string {
  return `${M.toUpperCase()}_${name.toUpperCase()}_H`;
}

function apiMacro(): string {
  return `${M.toUpperCase()}_API`;
}

/** Ensure a number renders as a valid C++ float literal (e.g. 1 → "1.f", 0.5 → "0.5f") */
function cppFloat(v: number): string {
  const s = String(v);
  return s.includes('.') ? `${s}f` : `${s}.f`;
}

// ─────────────────────────────────────────────
// Data Structs (DataTable row types)
// ─────────────────────────────────────────────

function genDataStructs(): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const api = apiMacro();
  const base = `Source/${M}/Data`;

  // ── CharacterData.h ──
  files.push({ path: `${base}/CharacterData.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "CharacterData.generated.h"

USTRUCT(BlueprintType)
struct ${api} FInsimulCharacterData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CharacterId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FirstName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LastName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Gender;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsAlive = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Occupation;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CurrentLocation;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Status;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 BirthYear = 0;

    // Personality (Big Five)
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Openness = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Conscientiousness = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Extroversion = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Agreeableness = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Neuroticism = 0.f;
};
` });

  // ── NPCData.h ──
  files.push({ path: `${base}/NPCData.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "NPCData.generated.h"

USTRUCT(BlueprintType)
struct ${api} FInsimulNPCData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CharacterId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NPCRole;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector HomePosition = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float PatrolRadius = 20.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Disposition = 50.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> QuestIds;
};
` });

  // ── ActionData.h ──
  files.push({ path: `${base}/ActionData.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "ActionData.generated.h"

USTRUCT(BlueprintType)
struct ${api} FInsimulActionData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ActionId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ActionType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Category;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Duration = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Difficulty = 0.5f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 EnergyCost = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bRequiresTarget = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Range = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Cooldown = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsActive = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Tags;
};
` });

  // ── RuleData.h ──
  files.push({ path: `${base}/RuleData.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "RuleData.generated.h"

USTRUCT(BlueprintType)
struct ${api} FInsimulRuleData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString RuleId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Content;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString RuleType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Category;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Priority = 5;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Likelihood = 1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsBase = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsActive = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Tags;
};
` });

  // ── QuestData.h ──
  files.push({ path: `${base}/QuestData.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "QuestData.generated.h"

USTRUCT(BlueprintType)
struct ${api} FInsimulQuestObjective : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectiveId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ObjectiveType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsOptional = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 CurrentProgress = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TargetProgress = 1;
};

USTRUCT(BlueprintType)
struct ${api} FInsimulQuestData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Title;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Difficulty;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 ExperienceReward = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString AssignedByCharacterId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Status;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Tags;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> PrerequisiteQuestIds;
};
` });

  // ── SettlementData.h ──
  files.push({ path: `${base}/SettlementData.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "SettlementData.generated.h"

USTRUCT(BlueprintType)
struct ${api} FInsimulSettlementData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Population = 100;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector Position = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Radius = 20.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CountryId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString StateId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString MayorId;
};
` });

  // ── BuildingData.h ──
  files.push({ path: `${base}/BuildingData.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/DataTable.h"
#include "BuildingData.generated.h"

USTRUCT(BlueprintType)
struct ${api} FInsimulBuildingData : public FTableRowBase
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BuildingId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector Position = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Rotation = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BuildingRole;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Floors = 2;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Width = 10.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Depth = 10.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bHasChimney = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bHasBalcony = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ModelAssetKey;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BusinessId;
};
` });

  return files;
}

// ─────────────────────────────────────────────
// Core Classes
// ─────────────────────────────────────────────

function genCoreClasses(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const api = apiMacro();
  const base = `Source/${M}/Core`;

  // ── InsimulGameInstance.h ──
  files.push({ path: `${base}/InsimulGameInstance.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "InsimulGameInstance.generated.h"

UCLASS()
class ${api} UInsimulGameInstance : public UGameInstance
{
    GENERATED_BODY()

public:
    virtual void Init() override;

    /** Load the WorldIR JSON from Content/Data */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    bool LoadWorldData();

    /** Parsed IR data accessible to all systems */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString WorldName;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString WorldType;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString GenreId;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    int32 TerrainSize = 512;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString Seed;

    /** Raw JSON string for sub-system parsing */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString RawWorldIRJson;

private:
    bool bDataLoaded = false;
};
` });

  // ── InsimulGameInstance.cpp ──
  files.push({ path: `${base}/InsimulGameInstance.cpp`, content: `#include "InsimulGameInstance.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UInsimulGameInstance::Init()
{
    Super::Init();
    LoadWorldData();
}

bool UInsimulGameInstance::LoadWorldData()
{
    if (bDataLoaded) return true;

    FString FilePath = FPaths::ProjectContentDir() / TEXT("Data/WorldIR.json");
    FString JsonString;

    if (!FFileHelper::LoadFileToString(JsonString, *FilePath))
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to load WorldIR.json from %s"), *FilePath);
        return false;
    }

    RawWorldIRJson = JsonString;

    TSharedPtr<FJsonObject> JsonObj;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);

    if (!FJsonSerializer::Deserialize(Reader, JsonObj) || !JsonObj.IsValid())
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to parse WorldIR.json"));
        return false;
    }

    // Parse meta section
    const TSharedPtr<FJsonObject>* MetaObj;
    if (JsonObj->TryGetObjectField(TEXT("meta"), MetaObj))
    {
        WorldName = (*MetaObj)->GetStringField(TEXT("worldName"));
        WorldType = (*MetaObj)->GetStringField(TEXT("worldType"));
        Seed = (*MetaObj)->GetStringField(TEXT("seed"));
        TerrainSize = (*MetaObj)->GetIntegerField(TEXT("exportVersion"));

        const TSharedPtr<FJsonObject>* GenreObj;
        if ((*MetaObj)->TryGetObjectField(TEXT("genreConfig"), GenreObj))
        {
            GenreId = (*GenreObj)->GetStringField(TEXT("id"));
        }
    }

    // Parse terrain size from geography
    const TSharedPtr<FJsonObject>* GeoObj;
    if (JsonObj->TryGetObjectField(TEXT("geography"), GeoObj))
    {
        TerrainSize = (*GeoObj)->GetIntegerField(TEXT("terrainSize"));
    }

    bDataLoaded = true;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded world: %s (type: %s, genre: %s, terrain: %d)"),
        *WorldName, *WorldType, *GenreId, TerrainSize);

    return true;
}
` });

  // ── InsimulMeshActor.h ──
  files.push({ path: `${base}/InsimulMeshActor.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "InsimulMeshActor.generated.h"

class UStaticMeshComponent;

UCLASS()
class ${api} AInsimulMeshActor : public AActor
{
    GENERATED_BODY()

public:
    AInsimulMeshActor();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly)
    UStaticMeshComponent* MeshComponent;
};
` });

  // ── InsimulMeshActor.cpp ──
  files.push({ path: `${base}/InsimulMeshActor.cpp`, content: `#include "InsimulMeshActor.h"
#include "Components/StaticMeshComponent.h"

AInsimulMeshActor::AInsimulMeshActor()
{
    MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
    RootComponent = MeshComponent;
}
` });

  // ── CreateLevelCommandlet.h ──
  files.push({ path: `${base}/CreateLevelCommandlet.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Commandlets/Commandlet.h"
#include "CreateLevelCommandlet.generated.h"

UCLASS()
class UCreateLevelCommandlet : public UCommandlet
{
    GENERATED_BODY()

public:
    UCreateLevelCommandlet();
    virtual int32 Main(const FString& Params) override;
};
` });

  // ── CreateLevelCommandlet.cpp ──
  files.push({ path: `${base}/CreateLevelCommandlet.cpp`, content: `#include "CreateLevelCommandlet.h"
#include "InsimulGameMode.h"
#include "InsimulMeshActor.h"
#include "../Characters/NPCCharacter.h"
#include "Engine/World.h"
#include "Engine/StaticMesh.h"
#include "Materials/Material.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "GameFramework/WorldSettings.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/SkyLightComponent.h"
#include "Components/SkyAtmosphereComponent.h"
#include "UObject/Package.h"
#include "UObject/SavePackage.h"
#include "UObject/ConstructorHelpers.h"
#include "HAL/FileManager.h"
#include "Misc/Paths.h"
#include "Misc/FileHelper.h"
#include "Serialization/JsonSerializer.h"
#include "Dom/JsonObject.h"

UCreateLevelCommandlet::UCreateLevelCommandlet()
{
    IsClient = false;
    IsEditor = true;
    IsServer = false;
    LogToConsole = true;
}

// Helper to load JSON array from Content/Data
static TArray<TSharedPtr<FJsonValue>> LoadJsonArrayFile(const FString& FileName)
{
    TArray<TSharedPtr<FJsonValue>> Arr;
    FString Path = FPaths::ProjectContentDir() / TEXT("Data") / FileName;
    FString Json;
    if (!FFileHelper::LoadFileToString(Json, *Path))
    {
        UE_LOG(LogTemp, Error, TEXT("[Commandlet] Failed to load JSON: %s"), *Path);
        return Arr;
    }
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Json);
    if (!FJsonSerializer::Deserialize(Reader, Arr))
    {
        UE_LOG(LogTemp, Error, TEXT("[Commandlet] Failed to parse JSON: %s"), *FileName);
    }
    return Arr;
}

// Helper to spawn colored mesh actor
static AInsimulMeshActor* SpawnColoredMesh(UWorld* World, UStaticMesh* Mesh, UMaterial* BaseMat,
    const FVector& Pos, const FVector& Scale, const FLinearColor& Color, const FRotator& Rot = FRotator::ZeroRotator)
{
    if (!World || !Mesh || !BaseMat) return nullptr;

    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
    
    AInsimulMeshActor* Actor = World->SpawnActor<AInsimulMeshActor>(AInsimulMeshActor::StaticClass(), Pos, Rot, Params);
    if (!Actor) return nullptr;

    Actor->MeshComponent->SetStaticMesh(Mesh);
    Actor->SetActorScale3D(Scale);
    Actor->MeshComponent->SetVisibility(true);
    Actor->MeshComponent->SetHiddenInGame(false);

    UMaterialInstanceDynamic* Mat = UMaterialInstanceDynamic::Create(BaseMat, Actor);
    if (Mat)
    {
        Mat->SetVectorParameterValue(TEXT("Color"), Color);
        Actor->MeshComponent->SetMaterial(0, Mat);
    }

    Actor->SetFlags(RF_Public);
    return Actor;
}

int32 UCreateLevelCommandlet::Main(const FString& Params)
{
    UE_LOG(LogTemp, Display, TEXT("[Insimul] ===== CreateLevel Commandlet ====="));

    // Load mesh assets
    UStaticMesh* CubeMesh = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Cube.Cube"));
    UStaticMesh* SphereMesh = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    UMaterial* BaseMaterial = LoadObject<UMaterial>(nullptr, TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));

    if (!CubeMesh || !SphereMesh || !BaseMaterial)
    {
        UE_LOG(LogTemp, Error, TEXT("[Commandlet] Failed to load basic shape meshes!"));
        return 1;
    }

    FString MapPackageName = TEXT("/Game/Maps/MainWorld");
    FString FilePath = FPackageName::LongPackageNameToFilename(MapPackageName, FPackageName::GetMapPackageExtension());

    // Delete existing map
    if (IFileManager::Get().FileExists(*FilePath))
    {
        IFileManager::Get().Delete(*FilePath);
    }

    // Create package and world
    FString Dir = FPaths::GetPath(FilePath);
    IFileManager::Get().MakeDirectory(*Dir, true);

    UPackage* MapPackage = CreatePackage(*MapPackageName);
    MapPackage->FullyLoad();
    MapPackage->MarkPackageDirty();

    UWorld* NewWorld = UWorld::CreateWorld(EWorldType::Editor, false, FName(TEXT("MainWorld")), MapPackage);
    if (!NewWorld)
    {
        UE_LOG(LogTemp, Error, TEXT("[Commandlet] Failed to create world!"));
        return 1;
    }

    NewWorld->SetFlags(RF_Public);
    NewWorld->Rename(TEXT("MainWorld"), MapPackage);

    if (NewWorld->PersistentLevel)
    {
        NewWorld->PersistentLevel->SetFlags(RF_Public);
    }

    // Initialize world for spawning
    NewWorld->InitWorld();

    // Set WorldSettings GameMode
    AWorldSettings* Settings = NewWorld->GetWorldSettings();
    if (Settings)
    {
        Settings->DefaultGameMode = AInsimulGameMode::StaticClass();
        Settings->SetFlags(RF_Public);
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] WorldSettings.DefaultGameMode set"));
    }

    // ═══════════════════════════════════════════
    // SPAWN ALL GAME OBJECTS
    // ═══════════════════════════════════════════

    FVector WorldCenter = FVector::ZeroVector;

    // ── 1. SPAWN BUILDINGS ──
    TArray<TSharedPtr<FJsonValue>> Buildings = LoadJsonArrayFile(TEXT("DT_Buildings.json"));
    if (Buildings.Num() > 0)
    {
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawning %d buildings..."), Buildings.Num());
        
        double SumX = 0, SumY = 0;
        int32 Count = 0;

        for (const TSharedPtr<FJsonValue>& Val : Buildings)
        {
            const TSharedPtr<FJsonObject> Obj = Val->AsObject();
            if (!Obj.IsValid()) continue;

            double X = Obj->GetNumberField(TEXT("X"));
            double Y = Obj->GetNumberField(TEXT("Y"));
            double Width = Obj->GetNumberField(TEXT("Width"));
            double Depth = Obj->GetNumberField(TEXT("Depth"));
            double Height = Obj->GetNumberField(TEXT("Height"));

            FVector Pos(X, Y, Height / 2.0);
            FVector Scale(Width / 100.0, Depth / 100.0, Height / 100.0);
            FLinearColor Color(0.8f, 0.7f, 0.6f);

            AInsimulMeshActor* Building = SpawnColoredMesh(NewWorld, CubeMesh, BaseMaterial, Pos, Scale, Color);
            if (Building)
            {
                Building->SetActorLabel(FString::Printf(TEXT("Building_%d"), Count));
            }

            SumX += X;
            SumY += Y;
            Count++;
        }

        if (Count > 0)
        {
            WorldCenter = FVector(SumX / Count, SumY / Count, 0.0);
        }

        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawned %d buildings — WorldCenter: %s"), Count, *WorldCenter.ToString());
    }

    // ── 2. SPAWN TERRAIN ──
    float HalfSize = 200000.f;
    FVector GroundPos = FVector(WorldCenter.X, WorldCenter.Y, -50.f);
    AInsimulMeshActor* Ground = SpawnColoredMesh(NewWorld, CubeMesh, BaseMaterial, GroundPos,
        FVector(HalfSize / 50.f, HalfSize / 50.f, 0.5f), FLinearColor(0.9f, 0.6f, 0.4f));
    if (Ground)
    {
        Ground->SetActorLabel(TEXT("Terrain"));
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawned terrain at %s"), *GroundPos.ToString());
    }

    // ── 3. SPAWN LIGHTING ──
    FActorSpawnParameters LightParams;
    LightParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

    // Directional Light
    AInsimulMeshActor* DirLightHost = NewWorld->SpawnActor<AInsimulMeshActor>(AInsimulMeshActor::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, LightParams);
    if (DirLightHost)
    {
        DirLightHost->SetActorLabel(TEXT("DirectionalLight"));
        UDirectionalLightComponent* DirLight = NewObject<UDirectionalLightComponent>(DirLightHost, TEXT("DirectionalLight"));
        DirLight->SetupAttachment(DirLightHost->GetRootComponent());
        DirLight->RegisterComponent();
        DirLight->SetIntensity(10000.f);
        DirLight->SetWorldRotation(FRotator(-45.f, 0.f, 0.f));
        DirLight->SetLightColor(FLinearColor(1.0f, 0.95f, 0.9f));
        DirLightHost->SetFlags(RF_Public);
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawned directional light"));
    }

    // Sky Atmosphere + Sky Light
    AInsimulMeshActor* SkyHost = NewWorld->SpawnActor<AInsimulMeshActor>(AInsimulMeshActor::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, LightParams);
    if (SkyHost)
    {
        SkyHost->SetActorLabel(TEXT("SkyAtmosphere"));
        USkyAtmosphereComponent* SkyAtm = NewObject<USkyAtmosphereComponent>(SkyHost, TEXT("SkyAtmosphere"));
        SkyAtm->SetupAttachment(SkyHost->GetRootComponent());
        SkyAtm->RegisterComponent();

        USkyLightComponent* SkyLight = NewObject<USkyLightComponent>(SkyHost, TEXT("SkyLight"));
        SkyLight->SetupAttachment(SkyHost->GetRootComponent());
        SkyLight->RegisterComponent();
        SkyLight->SetIntensity(5.f);
        SkyLight->bRealTimeCapture = true;
        SkyLight->RecaptureSky();
        SkyHost->SetFlags(RF_Public);
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawned sky atmosphere + sky light"));
    }

    // ── 4. SPAWN ROADS ──
    TArray<TSharedPtr<FJsonValue>> Roads = LoadJsonArrayFile(TEXT("DT_Roads.json"));
    if (Roads.Num() > 0)
    {
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawning road segments..."));
        int32 SegCount = 0;

        for (const TSharedPtr<FJsonValue>& Val : Roads)
        {
            const TSharedPtr<FJsonObject> Obj = Val->AsObject();
            if (!Obj.IsValid()) continue;

            double RoadWidth = Obj->GetNumberField(TEXT("Width"));
            const TArray<TSharedPtr<FJsonValue>>* WP;
            if (!Obj->TryGetArrayField(TEXT("Waypoints"), WP)) continue;

            for (int32 i = 0; i < WP->Num() - 1; i++)
            {
                const TSharedPtr<FJsonObject> A = (*WP)[i]->AsObject();
                const TSharedPtr<FJsonObject> B = (*WP)[i + 1]->AsObject();
                if (!A.IsValid() || !B.IsValid()) continue;

                double AX = A->GetNumberField(TEXT("X"));
                double AY = A->GetNumberField(TEXT("Y"));
                double BX = B->GetNumberField(TEXT("X"));
                double BY = B->GetNumberField(TEXT("Y"));

                double DX = BX - AX;
                double DY = BY - AY;
                double Len = FMath::Sqrt(DX * DX + DY * DY);
                if (Len < 1.0) continue;

                double Angle = FMath::RadiansToDegrees(FMath::Atan2(DY, DX));
                FVector RoadPos((AX + BX) / 2.0, (AY + BY) / 2.0, 5.0);
                FVector RoadScale(Len / 100.0, RoadWidth / 100.0, 0.1);
                FRotator RoadRot(0.f, (float)Angle, 0.f);

                AInsimulMeshActor* Road = SpawnColoredMesh(NewWorld, CubeMesh, BaseMaterial, RoadPos, RoadScale, FLinearColor(0.35f, 0.28f, 0.2f), RoadRot);
                if (Road)
                {
                    Road->SetActorLabel(FString::Printf(TEXT("Road_%d"), SegCount));
                }
                SegCount++;
            }
        }

        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawned %d road segments"), SegCount);
    }

    // ── 5. SPAWN NPCs ──
    TArray<TSharedPtr<FJsonValue>> NPCs = LoadJsonArrayFile(TEXT("DT_NPCs.json"));
    if (NPCs.Num() > 0)
    {
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawning %d NPCs..."), NPCs.Num());

        for (int32 i = 0; i < NPCs.Num(); i++)
        {
            const TSharedPtr<FJsonObject> Obj = NPCs[i]->AsObject();
            if (!Obj.IsValid()) continue;

            double X = Obj->GetNumberField(TEXT("X"));
            double Y = Obj->GetNumberField(TEXT("Y"));
            FVector NPCPos(X, Y, 100.0);

            FActorSpawnParameters NPCParams;
            NPCParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

            ANPCCharacter* NPC = NewWorld->SpawnActor<ANPCCharacter>(ANPCCharacter::StaticClass(), NPCPos, FRotator::ZeroRotator, NPCParams);
            if (NPC)
            {
                NPC->SetActorLabel(FString::Printf(TEXT("NPC_%d"), i));
                NPC->SetFlags(RF_Public);
            }
        }

        UE_LOG(LogTemp, Display, TEXT("[Commandlet] Spawned %d NPCs"), NPCs.Num());
    }

    UE_LOG(LogTemp, Display, TEXT("[Commandlet] All game objects spawned into map"));

    // ═══════════════════════════════════════════
    // SAVE MAP
    // ═══════════════════════════════════════════

    FSavePackageArgs SaveArgs;
    SaveArgs.TopLevelFlags = RF_Public;
    bool bSaved = UPackage::SavePackage(MapPackage, NewWorld, *FilePath, SaveArgs);

    if (bSaved)
    {
        UE_LOG(LogTemp, Display, TEXT("[Commandlet] MainWorld saved successfully to: %s"), *FilePath);
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("[Commandlet] Failed to save MainWorld to: %s"), *FilePath);
        return 1;
    }

    return 0;
}
` });

  // ── InsimulGameMode.h ──
  files.push({ path: `${base}/InsimulGameMode.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "InsimulGameMode.generated.h"

class UStaticMesh;
class UMaterial;
class AInsimulMeshActor;

UCLASS()
class ${api} AInsimulGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    AInsimulGameMode();

    virtual void InitGame(const FString& MapName, const FString& Options, FString& ErrorMessage) override;
    virtual void BeginPlay() override;
    virtual void StartPlay() override;

    /** Spawn all world entities from IR data */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    void SpawnWorldEntities();

private:
    void SetupLighting();
    void GenerateTerrain();
    void SpawnBuildings();
    void SpawnRoads();
    void SpawnNPCs();

    /** Load a JSON array from Content/Data */
    TArray<TSharedPtr<FJsonValue>> LoadJsonArrayFile(const FString& FileName);

    /** Spawn a static-mesh actor with a colored material */
    AInsimulMeshActor* SpawnColoredMesh(UStaticMesh* Mesh, FVector Location, FVector Scale,
                                        FLinearColor Color, FRotator Rotation = FRotator::ZeroRotator);

    UPROPERTY() UStaticMesh* CubeMesh;
    UPROPERTY() UStaticMesh* SphereMesh;
    UPROPERTY() UStaticMesh* CylinderMesh;
    UPROPERTY() UMaterial* BaseMaterial;
    UPROPERTY() UTexture2D* GroundTexture;

    FVector WorldCenter = FVector::ZeroVector;
};
` });

  // ── InsimulGameMode.cpp ──
  files.push({ path: `${base}/InsimulGameMode.cpp`, content: `#include "InsimulGameMode.h"
#include "InsimulMeshActor.h"
#include "InsimulGameInstance.h"
#include "InsimulPlayerController.h"
#include "../Characters/PlayerCharacter.h"
#include "../Characters/NPCCharacter.h"
#include "Engine/World.h"
#include "Engine/StaticMesh.h"
#include "Engine/Texture2D.h"
#include "Kismet/GameplayStatics.h"
#include "Components/StaticMeshComponent.h"
#include "Components/DirectionalLightComponent.h"
#include "Components/SkyLightComponent.h"
#include "Components/SkyAtmosphereComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "UObject/ConstructorHelpers.h"

AInsimulGameMode::AInsimulGameMode()
{
    PlayerControllerClass = AInsimulPlayerController::StaticClass();
    DefaultPawnClass = APlayerCharacter::StaticClass();

    static ConstructorHelpers::FObjectFinder<UStaticMesh> CF(TEXT("/Engine/BasicShapes/Cube.Cube"));
    if (CF.Succeeded()) { CubeMesh = CF.Object; } else { UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to load Cube mesh")); }

    static ConstructorHelpers::FObjectFinder<UStaticMesh> SF(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if (SF.Succeeded()) { SphereMesh = SF.Object; } else { UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to load Sphere mesh")); }

    static ConstructorHelpers::FObjectFinder<UStaticMesh> CyF(TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
    if (CyF.Succeeded()) { CylinderMesh = CyF.Object; } else { UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to load Cylinder mesh")); }

    static ConstructorHelpers::FObjectFinder<UMaterial> MF(TEXT("/Engine/BasicShapes/BasicShapeMaterial.BasicShapeMaterial"));
    if (MF.Succeeded()) { BaseMaterial = MF.Object; } else { UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to load BasicShapeMaterial")); }

    // Load bundled ground texture
    static ConstructorHelpers::FObjectFinder<UTexture2D> GroundTexFinder(TEXT("/Game/Assets/ground/ground"));
    if (GroundTexFinder.Succeeded()) 
    { 
        GroundTexture = GroundTexFinder.Object; 
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] Ground texture loaded successfully"));
    } 
    else 
    { 
        UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to load ground texture from /Game/Assets/ground/ground")); 
    }

    UE_LOG(LogTemp, Warning, TEXT("[Insimul] ===== GameMode CONSTRUCTED ====="));
}

void AInsimulGameMode::InitGame(const FString& MapName, const FString& Options, FString& ErrorMessage)
{
    Super::InitGame(MapName, Options, ErrorMessage);
    UE_LOG(LogTemp, Warning, TEXT("[Insimul] ===== InitGame called — Map: %s ====="), *MapName);

    UInsimulGameInstance* GI = Cast<UInsimulGameInstance>(GetGameInstance());
    if (GI)
    {
        GI->LoadWorldData();
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] World loaded: %s (terrain: %d)"), *GI->WorldName, GI->TerrainSize);
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] GameInstance is NULL!"));
    }
}

void AInsimulGameMode::BeginPlay()
{
    Super::BeginPlay();
    
    // Verify mesh assets loaded
    UE_LOG(LogTemp, Warning, TEXT("[Insimul] Mesh assets: Cube=%s, Sphere=%s, Cylinder=%s, Material=%s"),
        CubeMesh ? TEXT("OK") : TEXT("NULL"),
        SphereMesh ? TEXT("OK") : TEXT("NULL"),
        CylinderMesh ? TEXT("OK") : TEXT("NULL"),
        BaseMaterial ? TEXT("OK") : TEXT("NULL"));
}

void AInsimulGameMode::StartPlay()
{
    Super::StartPlay();
    UE_LOG(LogTemp, Warning, TEXT("[Insimul] ===== StartPlay ====="));

    // Check if entities are already pre-placed in the map
    TArray<AActor*> FoundBuildings;
    UGameplayStatics::GetAllActorsOfClass(GetWorld(), AInsimulMeshActor::StaticClass(), FoundBuildings);

    if (FoundBuildings.Num() > 0)
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] Found %d pre-placed actors in map — skipping runtime spawn"), FoundBuildings.Num());
        
        // Calculate WorldCenter from existing buildings for player teleport
        FVector Sum = FVector::ZeroVector;
        int32 BuildingCount = 0;
        for (AActor* Actor : FoundBuildings)
        {
            if (Actor->GetActorLabel().StartsWith(TEXT("Building_")))
            {
                Sum += Actor->GetActorLocation();
                BuildingCount++;
            }
        }
        if (BuildingCount > 0)
        {
            WorldCenter = Sum / BuildingCount;
            WorldCenter.Z = 0.0;
        }
    }
    else
    {
        // No pre-placed entities — spawn at runtime (fallback for PIE testing)
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] No pre-placed actors found — spawning at runtime"));
        SpawnWorldEntities();
    }

    // Teleport player pawn to the centre of the world
    APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
    if (PC)
    {
        APawn* Pawn = PC->GetPawn();
        if (Pawn)
        {
            FVector Dest = WorldCenter + FVector(0.0, 0.0, 300.0);
            Pawn->SetActorLocation(Dest);
            UE_LOG(LogTemp, Warning, TEXT("[Insimul] Player teleported to %s"), *Dest.ToString());
        }
        else
        {
            UE_LOG(LogTemp, Error, TEXT("[Insimul] PlayerController has NO pawn!"));
        }
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] No PlayerController found!"));
    }
}

// ─── helpers ───────────────────────────────────────

TArray<TSharedPtr<FJsonValue>> AInsimulGameMode::LoadJsonArrayFile(const FString& FileName)
{
    TArray<TSharedPtr<FJsonValue>> Arr;
    FString Path = FPaths::ProjectContentDir() / TEXT("Data") / FileName;
    FString Json;
    if (!FFileHelper::LoadFileToString(Json, *Path))
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] FAILED to load JSON: %s"), *Path);
        return Arr;
    }
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Json);
    if (!FJsonSerializer::Deserialize(Reader, Arr))
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] FAILED to parse JSON: %s"), *Path);
        return Arr;
    }
    UE_LOG(LogTemp, Warning, TEXT("[Insimul] Loaded %s — %d entries"), *FileName, Arr.Num());
    return Arr;
}

AInsimulMeshActor* AInsimulGameMode::SpawnColoredMesh(UStaticMesh* Mesh, FVector Location, FVector Scale,
                                                       FLinearColor Color, FRotator Rotation)
{
    if (!Mesh)
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] SpawnColoredMesh — Mesh is NULL!"));
        return nullptr;
    }

    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

    AInsimulMeshActor* Actor = GetWorld()->SpawnActor<AInsimulMeshActor>(
        AInsimulMeshActor::StaticClass(), Location, Rotation, Params);

    if (!Actor)
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] SpawnColoredMesh — SpawnActor FAILED at %s"), *Location.ToString());
        return nullptr;
    }

    Actor->MeshComponent->SetStaticMesh(Mesh);
    Actor->SetActorScale3D(Scale);

    if (BaseMaterial)
    {
        UMaterialInstanceDynamic* DM = UMaterialInstanceDynamic::Create(BaseMaterial, Actor);
        if (DM)
        {
            DM->SetVectorParameterValue(TEXT("Color"), Color);
            Actor->MeshComponent->SetMaterial(0, DM);
        }
        else
        {
            UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to create dynamic material for mesh at %s"), *Location.ToString());
        }
    }
    else
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] BaseMaterial is NULL — mesh will have no material!"));
    }

    // Verify mesh visibility settings
    Actor->MeshComponent->SetVisibility(true);
    Actor->MeshComponent->SetHiddenInGame(false);
    Actor->SetActorHiddenInGame(false);

    return Actor;
}

// ─── world spawning ────────────────────────────────

void AInsimulGameMode::SpawnWorldEntities()
{
    UE_LOG(LogTemp, Warning, TEXT("[Insimul] === SpawnWorldEntities START ==="));

    // Spawn buildings FIRST to compute WorldCenter
    SpawnBuildings();

    // Now set up lighting and terrain centred on the content
    SetupLighting();
    GenerateTerrain();
    SpawnRoads();
    SpawnNPCs();

    UE_LOG(LogTemp, Warning, TEXT("[Insimul] === SpawnWorldEntities DONE — center %s ==="), *WorldCenter.ToString());
}

void AInsimulGameMode::SetupLighting()
{
    UWorld* World = GetWorld();
    if (!World) { UE_LOG(LogTemp, Error, TEXT("[Insimul] SetupLighting — World is NULL!")); return; }

    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

    // --- Directional sun light (use AInsimulMeshActor as a reliable spawnable host) ---
    {
        AInsimulMeshActor* SunHost = World->SpawnActor<AInsimulMeshActor>(
            AInsimulMeshActor::StaticClass(), WorldCenter, FRotator::ZeroRotator, Params);
        if (SunHost)
        {
            // Hide the mesh — this actor is just a component host
            SunHost->MeshComponent->SetVisibility(false);
            SunHost->MeshComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);

            UDirectionalLightComponent* Sun = NewObject<UDirectionalLightComponent>(SunHost, TEXT("Sun"));
            Sun->SetupAttachment(SunHost->GetRootComponent());
            Sun->SetRelativeRotation(FRotator(-50.f, -30.f, 0.f));
            Sun->Intensity = 10000.f; // Physically-based lux units — typical daylight
            Sun->LightColor = FColor(255, 244, 214);
            Sun->CastShadows = true;
            Sun->RegisterComponent();
            UE_LOG(LogTemp, Warning, TEXT("[Insimul] Directional light spawned (intensity=10000)"));
        }
        else
        {
            UE_LOG(LogTemp, Error, TEXT("[Insimul] FAILED to spawn sun actor!"));
        }
    }

    // --- Sky atmosphere + sky light ---
    {
        AInsimulMeshActor* SkyHost = World->SpawnActor<AInsimulMeshActor>(
            AInsimulMeshActor::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, Params);
        if (SkyHost)
        {
            SkyHost->MeshComponent->SetVisibility(false);
            SkyHost->MeshComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);

            USkyAtmosphereComponent* Atmo = NewObject<USkyAtmosphereComponent>(SkyHost, TEXT("Atmo"));
            Atmo->SetupAttachment(SkyHost->GetRootComponent());
            Atmo->RegisterComponent();

            USkyLightComponent* Sky = NewObject<USkyLightComponent>(SkyHost, TEXT("SkyLight"));
            Sky->SetupAttachment(SkyHost->GetRootComponent());
            Sky->SetIntensity(5.f); // Boost ambient lighting
            Sky->bRealTimeCapture = true;
            Sky->RegisterComponent();
            Sky->RecaptureSky(); // Force initial capture

            UE_LOG(LogTemp, Warning, TEXT("[Insimul] Sky atmosphere + sky light spawned (intensity=5)"));
        }
        else
        {
            UE_LOG(LogTemp, Error, TEXT("[Insimul] FAILED to spawn sky actor!"));
        }
    }
}

void AInsimulGameMode::GenerateTerrain()
{
    // Centre ground plane at WorldCenter so it covers all buildings
    float HalfSize = 200000.f; // 2 km radius
    FVector GroundPos = FVector(WorldCenter.X, WorldCenter.Y, -50.f);
    
    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
    
    AInsimulMeshActor* Ground = GetWorld()->SpawnActor<AInsimulMeshActor>(
        AInsimulMeshActor::StaticClass(), GroundPos, FRotator::ZeroRotator, Params);
    
    if (!Ground)
    {
        UE_LOG(LogTemp, Error, TEXT("[Insimul] FAILED to spawn ground plane!"));
        return;
    }
    
    Ground->MeshComponent->SetStaticMesh(CubeMesh);
    Ground->SetActorScale3D(FVector(HalfSize / 50.f, HalfSize / 50.f, 0.5f));
    Ground->MeshComponent->SetVisibility(true);
    Ground->MeshComponent->SetHiddenInGame(false);
    
    // Apply ground texture if available
    if (GroundTexture && BaseMaterial)
    {
        UMaterialInstanceDynamic* GroundMat = UMaterialInstanceDynamic::Create(BaseMaterial, Ground);
        if (GroundMat)
        {
            GroundMat->SetTextureParameterValue(TEXT("Texture"), GroundTexture);
            GroundMat->SetVectorParameterValue(TEXT("Color"), FLinearColor::White); // Use white to show texture
            Ground->MeshComponent->SetMaterial(0, GroundMat);
            UE_LOG(LogTemp, Warning, TEXT("[Insimul] Ground plane with texture at %s — OK"), *GroundPos.ToString());
        }
        else
        {
            UE_LOG(LogTemp, Error, TEXT("[Insimul] Failed to create ground material"));
        }
    }
    else
    {
        // Fallback to solid color
        if (BaseMaterial)
        {
            UMaterialInstanceDynamic* GroundMat = UMaterialInstanceDynamic::Create(BaseMaterial, Ground);
            if (GroundMat)
            {
                GroundMat->SetVectorParameterValue(TEXT("Color"), 
                    FLinearColor(${cppFloat(ir.theme.visualTheme.groundColor.r)}, ${cppFloat(ir.theme.visualTheme.groundColor.g)}, ${cppFloat(ir.theme.visualTheme.groundColor.b)}));
                Ground->MeshComponent->SetMaterial(0, GroundMat);
            }
        }
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] Ground plane (no texture) at %s — OK"), *GroundPos.ToString());
    }
}

void AInsimulGameMode::SpawnBuildings()
{
    TArray<TSharedPtr<FJsonValue>> Arr = LoadJsonArrayFile(TEXT("DT_Buildings.json"));

    double SumX = 0, SumY = 0;
    int32 Count = 0;

    for (const TSharedPtr<FJsonValue>& Val : Arr)
    {
        const TSharedPtr<FJsonObject> Obj = Val->AsObject();
        if (!Obj.IsValid()) continue;

        const TSharedPtr<FJsonObject>* PosPtr;
        if (!Obj->TryGetObjectField(TEXT("Position"), PosPtr)) continue;

        double X  = (*PosPtr)->GetNumberField(TEXT("X"));
        double Y  = (*PosPtr)->GetNumberField(TEXT("Y"));
        double Z  = (*PosPtr)->GetNumberField(TEXT("Z"));
        double Rot = Obj->GetNumberField(TEXT("Rotation"));
        int32 Floors = Obj->GetIntegerField(TEXT("Floors"));
        double W = Obj->GetNumberField(TEXT("Width"));
        double D = Obj->GetNumberField(TEXT("Depth"));

        double H = Floors * 300.0; // 3 m per floor

        // Wall box
        AInsimulMeshActor* Wall = SpawnColoredMesh(CubeMesh,
            FVector(X, Y, H / 2.0 + Z),
            FVector(W / 100.0, D / 100.0, H / 100.0),
            FLinearColor(${cppFloat(ir.theme.visualTheme.settlementBaseColor.r)}, ${cppFloat(ir.theme.visualTheme.settlementBaseColor.g)}, ${cppFloat(ir.theme.visualTheme.settlementBaseColor.b)}),
            FRotator(0.f, (float)Rot, 0.f));

        // Roof dome
        double RoofDiam = FMath::Max(W, D) / 100.0 * 0.65;
        SpawnColoredMesh(SphereMesh,
            FVector(X, Y, H + Z + 80.0),
            FVector(RoofDiam, RoofDiam, 1.8),
            FLinearColor(${cppFloat(ir.theme.visualTheme.settlementRoofColor.r)}, ${cppFloat(ir.theme.visualTheme.settlementRoofColor.g)}, ${cppFloat(ir.theme.visualTheme.settlementRoofColor.b)}),
            FRotator(0.f, (float)Rot, 0.f));

        if (Count == 0 && Wall)
        {
            UE_LOG(LogTemp, Warning, TEXT("[Insimul] First building at (%f, %f, %f) size %fx%fx%f"),
                X, Y, Z, W, D, H);
        }

        SumX += X;
        SumY += Y;
        Count++;
    }

    if (Count > 0)
    {
        WorldCenter = FVector(SumX / Count, SumY / Count, 0.0);
    }

    UE_LOG(LogTemp, Warning, TEXT("[Insimul] Spawned %d buildings — WorldCenter %s"), Count, *WorldCenter.ToString());
}

void AInsimulGameMode::SpawnRoads()
{
    TArray<TSharedPtr<FJsonValue>> Arr = LoadJsonArrayFile(TEXT("DT_Roads.json"));
    int32 SegCount = 0;

    for (const TSharedPtr<FJsonValue>& Val : Arr)
    {
        const TSharedPtr<FJsonObject> Obj = Val->AsObject();
        if (!Obj.IsValid()) continue;

        double RoadWidth = Obj->GetNumberField(TEXT("Width"));

        const TArray<TSharedPtr<FJsonValue>>* WP;
        if (!Obj->TryGetArrayField(TEXT("Waypoints"), WP)) continue;

        for (int32 i = 0; i < WP->Num() - 1; i++)
        {
            const TSharedPtr<FJsonObject> A = (*WP)[i]->AsObject();
            const TSharedPtr<FJsonObject> B = (*WP)[i + 1]->AsObject();
            if (!A.IsValid() || !B.IsValid()) continue;

            double AX = A->GetNumberField(TEXT("X"));
            double AY = A->GetNumberField(TEXT("Y"));
            double BX = B->GetNumberField(TEXT("X"));
            double BY = B->GetNumberField(TEXT("Y"));

            double DX = BX - AX;
            double DY = BY - AY;
            double Len = FMath::Sqrt(DX * DX + DY * DY);
            if (Len < 1.0) continue;
            double Angle = FMath::RadiansToDegrees(FMath::Atan2(DY, DX));

            SpawnColoredMesh(CubeMesh,
                FVector((AX + BX) / 2.0, (AY + BY) / 2.0, 5.0),
                FVector(Len / 100.0, RoadWidth / 100.0, 0.1),
                FLinearColor(${cppFloat(ir.theme.visualTheme.roadColor.r)}, ${cppFloat(ir.theme.visualTheme.roadColor.g)}, ${cppFloat(ir.theme.visualTheme.roadColor.b)}),
                FRotator(0.f, (float)Angle, 0.f));
            SegCount++;
        }
    }

    UE_LOG(LogTemp, Warning, TEXT("[Insimul] Spawned %d road segments"), SegCount);
}

void AInsimulGameMode::SpawnNPCs()
{
    TArray<TSharedPtr<FJsonValue>> Arr = LoadJsonArrayFile(TEXT("DT_NPCs.json"));
    int32 Spawned = 0;

    for (const TSharedPtr<FJsonValue>& Val : Arr)
    {
        const TSharedPtr<FJsonObject> Obj = Val->AsObject();
        if (!Obj.IsValid()) continue;

        FString CharId = Obj->GetStringField(TEXT("CharacterId"));
        FString Role   = Obj->GetStringField(TEXT("Role"));
        double Patrol  = Obj->GetNumberField(TEXT("PatrolRadius"));
        double Disp    = Obj->GetNumberField(TEXT("Disposition"));

        const TSharedPtr<FJsonObject>* PosPtr;
        if (!Obj->TryGetObjectField(TEXT("HomePosition"), PosPtr)) continue;

        double X = (*PosPtr)->GetNumberField(TEXT("X"));
        double Y = (*PosPtr)->GetNumberField(TEXT("Y"));
        double Z = (*PosPtr)->GetNumberField(TEXT("Z"));

        FVector SpawnLoc(X, Y, Z + 100.0);
        FRotator SpawnRot = FRotator::ZeroRotator;

        FActorSpawnParameters Params;
        Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

        ANPCCharacter* NPC = GetWorld()->SpawnActor<ANPCCharacter>(
            ANPCCharacter::StaticClass(), SpawnLoc, SpawnRot, Params);

        if (NPC)
        {
            NPC->InitFromData(CharId, Role, FVector(X, Y, Z), (float)Patrol, (float)Disp);
            Spawned++;
        }
        else
        {
            UE_LOG(LogTemp, Error, TEXT("[Insimul] FAILED to spawn NPC %s"), *CharId);
        }
    }

    UE_LOG(LogTemp, Warning, TEXT("[Insimul] Spawned %d NPCs"), Spawned);
}
` });

  // ── InsimulPlayerController.h ──
  files.push({ path: `${base}/InsimulPlayerController.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "InsimulPlayerController.generated.h"

UCLASS()
class ${api} AInsimulPlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    virtual void BeginPlay() override;
    virtual void SetupInputComponent() override;
};
` });

  // ── InsimulPlayerController.cpp ──
  files.push({ path: `${base}/InsimulPlayerController.cpp`, content: `#include "InsimulPlayerController.h"

void AInsimulPlayerController::BeginPlay()
{
    Super::BeginPlay();
    // Enhanced Input setup happens here
}

void AInsimulPlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();
    // TODO: Bind Enhanced Input actions (Move, Look, Jump, Interact, Attack, etc.)
}
` });

  return files;
}

// ─────────────────────────────────────────────
// Character Classes
// ─────────────────────────────────────────────

function genCharacterClasses(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const api = apiMacro();
  const base = `Source/${M}/Characters`;
  const genre = ir.meta.genreConfig;

  // ── PlayerCharacter.h ──
  files.push({ path: `${base}/PlayerCharacter.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "PlayerCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;

UCLASS()
class ${api} APlayerCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    APlayerCharacter();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

    // Camera
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    USpringArmComponent* SpringArm;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
    UCameraComponent* Camera;

    // Stats
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
    float Health = ${ir.player.initialHealth}.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
    float MaxHealth = ${ir.player.initialHealth}.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
    float Energy = ${ir.player.initialEnergy}.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Stats")
    int32 Gold = ${ir.player.initialGold};

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
    float MoveSpeed = ${ir.player.speed}.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
    float JumpStrength = ${ir.player.jumpHeight}.f;

    // Movement input
    void MoveForward(float Value);
    void MoveRight(float Value);
    void LookUp(float Value);
    void Turn(float Value);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void Attack();

    UFUNCTION(BlueprintCallable, Category = "Interaction")
    void Interact();
};
` });

  // ── PlayerCharacter.cpp ──
  files.push({ path: `${base}/PlayerCharacter.cpp`, content: `#include "PlayerCharacter.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Components/CapsuleComponent.h"

APlayerCharacter::APlayerCharacter()
{
    PrimaryActorTick.bCanEverTick = true;

    // Capsule
    GetCapsuleComponent()->InitCapsuleSize(42.f, 96.f);

    // Spring Arm
    SpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("SpringArm"));
    SpringArm->SetupAttachment(RootComponent);
    SpringArm->TargetArmLength = 300.f;
    SpringArm->bUsePawnControlRotation = true;

    // Camera
    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(SpringArm, USpringArmComponent::SocketName);
    Camera->bUsePawnControlRotation = false;

    // Movement
    GetCharacterMovement()->MaxWalkSpeed = MoveSpeed * 100.f;
    GetCharacterMovement()->JumpZVelocity = JumpStrength * 100.f;
    GetCharacterMovement()->GravityScale = ${cppFloat(ir.player.gravity)};

    bUseControllerRotationYaw = false;
    GetCharacterMovement()->bOrientRotationToMovement = true;
}

void APlayerCharacter::BeginPlay()
{
    Super::BeginPlay();
}

void APlayerCharacter::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void APlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    PlayerInputComponent->BindAxis("MoveForward", this, &APlayerCharacter::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &APlayerCharacter::MoveRight);
    PlayerInputComponent->BindAxis("LookUp", this, &APlayerCharacter::LookUp);
    PlayerInputComponent->BindAxis("Turn", this, &APlayerCharacter::Turn);
    PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    PlayerInputComponent->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);
    PlayerInputComponent->BindAction("Attack", IE_Pressed, this, &APlayerCharacter::Attack);
    PlayerInputComponent->BindAction("Interact", IE_Pressed, this, &APlayerCharacter::Interact);
}

void APlayerCharacter::MoveForward(float Value)
{
    if (Value == 0.f) return;
    const FRotator Rot = Controller->GetControlRotation();
    const FRotator YawRot(0, Rot.Yaw, 0);
    const FVector Dir = FRotationMatrix(YawRot).GetUnitAxis(EAxis::X);
    AddMovementInput(Dir, Value);
}

void APlayerCharacter::MoveRight(float Value)
{
    if (Value == 0.f) return;
    const FRotator Rot = Controller->GetControlRotation();
    const FRotator YawRot(0, Rot.Yaw, 0);
    const FVector Dir = FRotationMatrix(YawRot).GetUnitAxis(EAxis::Y);
    AddMovementInput(Dir, Value);
}

void APlayerCharacter::LookUp(float Value)
{
    AddControllerPitchInput(Value);
}

void APlayerCharacter::Turn(float Value)
{
    AddControllerYawInput(Value);
}

void APlayerCharacter::Attack()
{
    // TODO: Trigger combat system attack
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Player Attack"));
}

void APlayerCharacter::Interact()
{
    // TODO: Line trace for interactable actors (NPCs, objects)
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Player Interact"));
}
` });

  // ── NPCCharacter.h ──
  files.push({ path: `${base}/NPCCharacter.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "NPCCharacter.generated.h"

UENUM(BlueprintType)
enum class ENPCState : uint8
{
    Idle        UMETA(DisplayName = "Idle"),
    Patrol      UMETA(DisplayName = "Patrol"),
    Talking     UMETA(DisplayName = "Talking"),
    Fleeing     UMETA(DisplayName = "Fleeing"),
    Pursuing    UMETA(DisplayName = "Pursuing"),
    Alert       UMETA(DisplayName = "Alert"),
};

UCLASS()
class ${api} ANPCCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    ANPCCharacter();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

    /** Initialize from IR NPC data */
    UFUNCTION(BlueprintCallable, Category = "Insimul|NPC")
    void InitFromData(const FString& InCharacterId, const FString& InNPCRole,
                      FVector InHomePosition, float InPatrolRadius, float InDisposition);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FString CharacterId;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FString NPCRole;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FVector HomePosition = FVector::ZeroVector;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    float PatrolRadius = 20.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    float Disposition = 50.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    ENPCState CurrentState = ENPCState::Idle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FString SettlementId;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    TArray<FString> QuestIds;

    UFUNCTION(BlueprintCallable, Category = "NPC")
    void StartDialogue(AActor* Initiator);
};
` });

  // ── NPCCharacter.cpp ──
  files.push({ path: `${base}/NPCCharacter.cpp`, content: `#include "NPCCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"

ANPCCharacter::ANPCCharacter()
{
    PrimaryActorTick.bCanEverTick = true;
    GetCharacterMovement()->MaxWalkSpeed = 200.f;
    AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;
}

void ANPCCharacter::BeginPlay()
{
    Super::BeginPlay();
}

void ANPCCharacter::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    // Simple state machine
    switch (CurrentState)
    {
    case ENPCState::Idle:
        // Stand at home position
        break;
    case ENPCState::Patrol:
        // Move within PatrolRadius of HomePosition
        break;
    case ENPCState::Talking:
        // Face dialogue partner
        break;
    case ENPCState::Fleeing:
        // Move away from threat
        break;
    case ENPCState::Pursuing:
        // Move toward target
        break;
    case ENPCState::Alert:
        // Look around
        break;
    }
}

void ANPCCharacter::InitFromData(const FString& InCharacterId, const FString& InNPCRole,
                                  FVector InHomePosition, float InPatrolRadius, float InDisposition)
{
    CharacterId = InCharacterId;
    NPCRole = InNPCRole;
    HomePosition = InHomePosition;
    PatrolRadius = InPatrolRadius;
    Disposition = InDisposition;

    SetActorLocation(HomePosition);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] NPC %s initialized at %s (role: %s)"),
        *CharacterId, *HomePosition.ToString(), *NPCRole);
}

void ANPCCharacter::StartDialogue(AActor* Initiator)
{
    CurrentState = ENPCState::Talking;
    // TODO: Trigger dialogue subsystem with this NPC's data
    UE_LOG(LogTemp, Log, TEXT("[Insimul] NPC %s starting dialogue"), *CharacterId);
}
` });

  return files;
}

// ─────────────────────────────────────────────
// Game Systems
// ─────────────────────────────────────────────

function genSystemClasses(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const api = apiMacro();
  const base = `Source/${M}/Systems`;
  const genre = ir.meta.genreConfig;

  // Helper to generate a subsystem pair (h + cpp)
  function subsystem(name: string, description: string, extraProps: string, extraIncludes: string, initBody: string, extraCppMethods = ''): void {
    files.push({ path: `${base}/${name}.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
${extraIncludes}
#include "${name}.generated.h"

/**
 * ${description}
 * Ported from Insimul's Babylon.js ${name} to Unreal subsystem.
 */
UCLASS()
class ${api} U${name} : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|${name}")
    void LoadFromIR(const FString& JsonString);

${extraProps}
};
` });

    files.push({ path: `${base}/${name}.cpp`, content: `#include "${name}.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void U${name}::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ${name} initialized"));
}

void U${name}::Deinitialize()
{
    Super::Deinitialize();
}

void U${name}::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

${initBody}
}
${extraCppMethods}
` });
  }

  // ActionSystem
  subsystem('ActionSystem', 'Manages available actions and their execution',
    `    UPROPERTY(BlueprintReadOnly, Category = "Actions")
    int32 ActionCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Actions")
    bool ExecuteAction(const FString& ActionId, AActor* Source, AActor* Target);`,
    '',
    `    const TArray<TSharedPtr<FJsonValue>>* ActionsArr;
    const TSharedPtr<FJsonObject>* SystemsObj;
    if (Root->TryGetObjectField(TEXT("systems"), SystemsObj) &&
        (*SystemsObj)->TryGetArrayField(TEXT("actions"), ActionsArr))
    {
        ActionCount = ActionsArr->Num();
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d actions"), ActionCount);
    }`,
    `
bool UActionSystem::ExecuteAction(const FString& ActionId, AActor* Source, AActor* Target)
{
    // TODO: Look up action by ID, validate preconditions, apply effects
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ExecuteAction: %s"), *ActionId);
    return true;
}
`
  );

  // RuleEnforcer
  subsystem('RuleEnforcer', 'Evaluates and enforces game rules',
    `    UPROPERTY(BlueprintReadOnly, Category = "Rules")
    int32 RuleCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Rules")
    TArray<FString> EvaluateRules(const FString& Context);`,
    '',
    `    const TSharedPtr<FJsonObject>* SystemsObj;
    if (Root->TryGetObjectField(TEXT("systems"), SystemsObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* RulesArr;
        if ((*SystemsObj)->TryGetArrayField(TEXT("rules"), RulesArr))
        {
            RuleCount = RulesArr->Num();
        }
        const TArray<TSharedPtr<FJsonValue>>* BaseArr;
        if ((*SystemsObj)->TryGetArrayField(TEXT("baseRules"), BaseArr))
        {
            RuleCount += BaseArr->Num();
        }
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d rules"), RuleCount);
    }`,
    `
TArray<FString> URuleEnforcer::EvaluateRules(const FString& Context)
{
    // TODO: Evaluate loaded rules against the given context
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EvaluateRules: %s"), *Context);
    return TArray<FString>();
}
`
  );

  // CombatSystem
  const cs = ir.combat.settings;
  subsystem('CombatSystem', 'Handles all combat styles (melee, ranged, turn-based, fighting)',
    `    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    FString CombatStyle = TEXT("${ir.combat.style}");

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float BaseDamage = ${cppFloat(cs.baseDamage)};

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float CriticalChance = ${cppFloat(cs.criticalChance)};

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float CriticalMultiplier = ${cppFloat(cs.criticalMultiplier)};

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float BlockReduction = ${cppFloat(cs.blockReduction)};

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat")
    float DodgeChance = ${cppFloat(cs.dodgeChance)};

    UFUNCTION(BlueprintCallable, Category = "Combat")
    float CalculateDamage(float BaseDmg, bool bIsCritical);`,
    '',
    `    const TSharedPtr<FJsonObject>* CombatObj;
    if (Root->TryGetObjectField(TEXT("combat"), CombatObj))
    {
        CombatStyle = (*CombatObj)->GetStringField(TEXT("style"));
        const TSharedPtr<FJsonObject>* Settings;
        if ((*CombatObj)->TryGetObjectField(TEXT("settings"), Settings))
        {
            BaseDamage = (*Settings)->GetNumberField(TEXT("baseDamage"));
            CriticalChance = (*Settings)->GetNumberField(TEXT("criticalChance"));
            CriticalMultiplier = (*Settings)->GetNumberField(TEXT("criticalMultiplier"));
            BlockReduction = (*Settings)->GetNumberField(TEXT("blockReduction"));
            DodgeChance = (*Settings)->GetNumberField(TEXT("dodgeChance"));
        }
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Combat style: %s, BaseDamage: %.1f"), *CombatStyle, BaseDamage);
    }`,
    `
float UCombatSystem::CalculateDamage(float BaseDmg, bool bIsCritical)
{
    float Dmg = BaseDmg > 0.f ? BaseDmg : BaseDamage;
    if (bIsCritical && FMath::FRand() < CriticalChance)
    {
        Dmg *= CriticalMultiplier;
    }
    return FMath::Max(0.f, Dmg);
}
`
  );

  // QuestSystem
  subsystem('QuestSystem', 'Tracks quests, objectives, and completion',
    `    UPROPERTY(BlueprintReadOnly, Category = "Quests")
    int32 QuestCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Quests")
    bool AcceptQuest(const FString& QuestId);

    UFUNCTION(BlueprintCallable, Category = "Quests")
    bool CompleteObjective(const FString& QuestId, const FString& ObjectiveId);`,
    '',
    `    const TSharedPtr<FJsonObject>* SystemsObj;
    if (Root->TryGetObjectField(TEXT("systems"), SystemsObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* QuestsArr;
        if ((*SystemsObj)->TryGetArrayField(TEXT("quests"), QuestsArr))
        {
            QuestCount = QuestsArr->Num();
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d quests"), QuestCount);
        }
    }`,
    `
bool UQuestSystem::AcceptQuest(const FString& QuestId)
{
    // TODO: Mark quest as active, notify UI
    UE_LOG(LogTemp, Log, TEXT("[Insimul] AcceptQuest: %s"), *QuestId);
    return true;
}

bool UQuestSystem::CompleteObjective(const FString& QuestId, const FString& ObjectiveId)
{
    // TODO: Increment objective progress, check quest completion
    UE_LOG(LogTemp, Log, TEXT("[Insimul] CompleteObjective: %s / %s"), *QuestId, *ObjectiveId);
    return true;
}
`
  );

  // InventorySystem
  subsystem('InventorySystem', 'Player inventory with item stacks',
    `    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Inventory")
    int32 MaxSlots = 20;

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool AddItem(const FString& ItemId, int32 Count);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool RemoveItem(const FString& ItemId, int32 Count);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    int32 GetItemCount(const FString& ItemId);`,
    '',
    `    UE_LOG(LogTemp, Log, TEXT("[Insimul] InventorySystem loaded from IR"));`,
    `
bool UInventorySystem::AddItem(const FString& ItemId, int32 Count)
{
    // TODO: Add item stacks to inventory, respect MaxSlots
    UE_LOG(LogTemp, Log, TEXT("[Insimul] AddItem: %s x%d"), *ItemId, Count);
    return true;
}

bool UInventorySystem::RemoveItem(const FString& ItemId, int32 Count)
{
    // TODO: Remove item stacks from inventory
    UE_LOG(LogTemp, Log, TEXT("[Insimul] RemoveItem: %s x%d"), *ItemId, Count);
    return true;
}

int32 UInventorySystem::GetItemCount(const FString& ItemId)
{
    // TODO: Return count of ItemId in inventory
    return 0;
}
`
  );

  // CraftingSystem
  if (genre.features.crafting) {
    subsystem('CraftingSystem', 'Recipe-based crafting',
      `    UFUNCTION(BlueprintCallable, Category = "Crafting")
    bool CanCraft(const FString& RecipeId);

    UFUNCTION(BlueprintCallable, Category = "Crafting")
    bool Craft(const FString& RecipeId);`,
      '',
      `    UE_LOG(LogTemp, Log, TEXT("[Insimul] CraftingSystem loaded from IR"));`,
      `
bool UCraftingSystem::CanCraft(const FString& RecipeId)
{
    // TODO: Check if player has required materials
    return false;
}

bool UCraftingSystem::Craft(const FString& RecipeId)
{
    // TODO: Consume materials and produce item
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Craft: %s"), *RecipeId);
    return false;
}
`
    );
  }

  // ResourceSystem
  if (genre.features.resources) {
    subsystem('ResourceSystem', 'Resource gathering and node management',
      `    UPROPERTY(BlueprintReadOnly, Category = "Resources")
    int32 ResourceTypeCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Resources")
    bool GatherResource(const FString& NodeId);`,
      '',
      `    const TSharedPtr<FJsonObject>* ResObj;
    if (Root->TryGetObjectField(TEXT("resources"), ResObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* DefsArr;
        if ((*ResObj)->TryGetArrayField(TEXT("definitions"), DefsArr))
        {
            ResourceTypeCount = DefsArr->Num();
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d resource types"), ResourceTypeCount);
        }
    }`,
      `
bool UResourceSystem::GatherResource(const FString& NodeId)
{
    // TODO: Deplete resource node and add to inventory
    UE_LOG(LogTemp, Log, TEXT("[Insimul] GatherResource: %s"), *NodeId);
    return true;
}
`
    );
  }

  // SurvivalSystem
  if (ir.survival) {
    subsystem('SurvivalSystem', 'Survival needs (hunger, thirst, temperature, stamina, sleep)',
      `    UPROPERTY(BlueprintReadOnly, Category = "Survival")
    int32 NeedCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Survival")
    float GetNeedValue(const FString& NeedId);

    UFUNCTION(BlueprintCallable, Category = "Survival")
    void ModifyNeed(const FString& NeedId, float Delta);`,
      '',
      `    const TSharedPtr<FJsonObject>* SurvObj;
    if (Root->TryGetObjectField(TEXT("survival"), SurvObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* NeedsArr;
        if ((*SurvObj)->TryGetArrayField(TEXT("needs"), NeedsArr))
        {
            NeedCount = NeedsArr->Num();
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d survival needs"), NeedCount);
        }
    }`,
      `
float USurvivalSystem::GetNeedValue(const FString& NeedId)
{
    // TODO: Return current value for the given need
    return 100.f;
}

void USurvivalSystem::ModifyNeed(const FString& NeedId, float Delta)
{
    // TODO: Adjust need value and clamp
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ModifyNeed: %s by %.1f"), *NeedId, Delta);
}
`
    );
  }

  // DialogueSystem
  subsystem('DialogueSystem', 'NPC dialogue and conversation management',
    `    UFUNCTION(BlueprintCallable, Category = "Dialogue")
    void StartDialogue(const FString& NPCCharacterId);

    UFUNCTION(BlueprintCallable, Category = "Dialogue")
    void EndDialogue();

    UPROPERTY(BlueprintReadOnly, Category = "Dialogue")
    bool bIsInDialogue = false;

    UPROPERTY(BlueprintReadOnly, Category = "Dialogue")
    FString CurrentNPCId;`,
    '',
    `    UE_LOG(LogTemp, Log, TEXT("[Insimul] DialogueSystem loaded from IR"));`,
    `
void UDialogueSystem::StartDialogue(const FString& NPCCharacterId)
{
    bIsInDialogue = true;
    CurrentNPCId = NPCCharacterId;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] StartDialogue with NPC: %s"), *NPCCharacterId);
}

void UDialogueSystem::EndDialogue()
{
    bIsInDialogue = false;
    CurrentNPCId = TEXT("");
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EndDialogue"));
}
`
  );

  return files;
}

// ─────────────────────────────────────────────
// World Generators
// ─────────────────────────────────────────────

function genWorldGenerators(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const api = apiMacro();
  const base = `Source/${M}/World`;
  const theme = ir.theme.visualTheme;

  // ── WorldScaleManager.h ──
  files.push({ path: `${base}/WorldScaleManager.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "WorldScaleManager.generated.h"

UCLASS()
class ${api} UWorldScaleManager : public UWorldSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;

    UPROPERTY(BlueprintReadOnly, Category = "World")
    int32 TerrainSize = ${ir.geography.terrainSize};

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FLinearColor GroundColor = FLinearColor(${cppFloat(theme.groundColor.r)}, ${cppFloat(theme.groundColor.g)}, ${cppFloat(theme.groundColor.b)});

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FLinearColor SkyColor = FLinearColor(${cppFloat(theme.skyColor.r)}, ${cppFloat(theme.skyColor.g)}, ${cppFloat(theme.skyColor.b)});

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FLinearColor RoadColor = FLinearColor(${cppFloat(theme.roadColor.r)}, ${cppFloat(theme.roadColor.g)}, ${cppFloat(theme.roadColor.b)});

    UFUNCTION(BlueprintCallable, Category = "World")
    float GetSettlementRadius(int32 Population);
};
` });

  files.push({ path: `${base}/WorldScaleManager.cpp`, content: `#include "WorldScaleManager.h"

void UWorldScaleManager::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] WorldScaleManager initialized (terrain: %d)"), TerrainSize);
}

float UWorldScaleManager::GetSettlementRadius(int32 Population)
{
    struct FPopTier { int32 Min; int32 Max; float Radius; };
    static const FPopTier Tiers[] = {
        {0, 50, 20.f}, {51, 200, 35.f}, {201, 1000, 55.f},
        {1001, 5000, 80.f}, {5001, INT32_MAX, 120.f}
    };

    for (const auto& T : Tiers)
    {
        if (Population <= T.Max) return T.Radius;
    }
    return 20.f;
}
` });

  // ── ProceduralBuildingGenerator.h ──
  files.push({ path: `${base}/ProceduralBuildingGenerator.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ProceduralBuildingGenerator.generated.h"

UCLASS()
class ${api} AProceduralBuildingGenerator : public AActor
{
    GENERATED_BODY()

public:
    AProceduralBuildingGenerator();

    UFUNCTION(BlueprintCallable, Category = "Building")
    void GenerateBuilding(FVector Position, float Rotation, int32 Floors,
                          float Width, float Depth, const FString& BuildingRole);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor BaseColor = FLinearColor(${cppFloat(theme.settlementBaseColor.r)}, ${cppFloat(theme.settlementBaseColor.g)}, ${cppFloat(theme.settlementBaseColor.b)});

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor RoofColor = FLinearColor(${cppFloat(theme.settlementRoofColor.r)}, ${cppFloat(theme.settlementRoofColor.g)}, ${cppFloat(theme.settlementRoofColor.b)});
};
` });

  files.push({ path: `${base}/ProceduralBuildingGenerator.cpp`, content: `#include "ProceduralBuildingGenerator.h"

AProceduralBuildingGenerator::AProceduralBuildingGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AProceduralBuildingGenerator::GenerateBuilding(FVector Position, float Rotation,
    int32 Floors, float Width, float Depth, const FString& BuildingRole)
{
    // TODO: Generate procedural building mesh using ProceduralMeshComponent
    // For now, spawn a cube placeholder scaled to building dimensions
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate building %s at %s (%dx%.0fx%.0f)"),
        *BuildingRole, *Position.ToString(), Floors, Width, Depth);
}
` });

  // ── RoadGenerator.h ──
  files.push({ path: `${base}/RoadGenerator.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "RoadGenerator.generated.h"

UCLASS()
class ${api} ARoadGenerator : public AActor
{
    GENERATED_BODY()

public:
    ARoadGenerator();

    UFUNCTION(BlueprintCallable, Category = "Roads")
    void GenerateRoad(const TArray<FVector>& Waypoints, float Width);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor RoadColor = FLinearColor(${cppFloat(theme.roadColor.r)}, ${cppFloat(theme.roadColor.g)}, ${cppFloat(theme.roadColor.b)});

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    float RoadRadius = ${cppFloat(theme.roadRadius)};
};
` });

  files.push({ path: `${base}/RoadGenerator.cpp`, content: `#include "RoadGenerator.h"

ARoadGenerator::ARoadGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

void ARoadGenerator::GenerateRoad(const TArray<FVector>& Waypoints, float Width)
{
    // TODO: Generate road spline mesh between waypoints
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate road with %d waypoints, width %.1f"),
        Waypoints.Num(), Width);
}
` });

  // ── ProceduralNatureGenerator.h ──
  files.push({ path: `${base}/ProceduralNatureGenerator.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ProceduralNatureGenerator.generated.h"

UCLASS()
class ${api} AProceduralNatureGenerator : public AActor
{
    GENERATED_BODY()

public:
    AProceduralNatureGenerator();

    UFUNCTION(BlueprintCallable, Category = "Nature")
    void GenerateNature(int32 TerrainSize, const FString& Seed);
};
` });

  files.push({ path: `${base}/ProceduralNatureGenerator.cpp`, content: `#include "ProceduralNatureGenerator.h"

AProceduralNatureGenerator::AProceduralNatureGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AProceduralNatureGenerator::GenerateNature(int32 TerrainSize, const FString& Seed)
{
    // TODO: Scatter foliage using UInstancedStaticMeshComponent
    // Use seeded random with the world seed for deterministic placement
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate nature for terrain %d (seed: %s)"),
        TerrainSize, *Seed);
}
` });

  // ── ProceduralDungeonGenerator.h ──
  files.push({ path: `${base}/ProceduralDungeonGenerator.h`, content: `#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ProceduralDungeonGenerator.generated.h"

UCLASS()
class ${api} AProceduralDungeonGenerator : public AActor
{
    GENERATED_BODY()

public:
    AProceduralDungeonGenerator();

    UFUNCTION(BlueprintCallable, Category = "Dungeon")
    void GenerateDungeon(const FString& Seed, int32 FloorCount, int32 RoomsPerFloor);
};
` });

  files.push({ path: `${base}/ProceduralDungeonGenerator.cpp`, content: `#include "ProceduralDungeonGenerator.h"

AProceduralDungeonGenerator::AProceduralDungeonGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

void AProceduralDungeonGenerator::GenerateDungeon(const FString& Seed,
    int32 FloorCount, int32 RoomsPerFloor)
{
    // TODO: Generate dungeon rooms and corridors procedurally
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate dungeon — %d floors, %d rooms/floor (seed: %s)"),
        FloorCount, RoomsPerFloor, *Seed);
}
` });

  return files;
}

// ═════════════════════════════════════════════
// Public API
// ═════════════════════════════════════════════

export function generateCppFiles(ir: WorldIR): GeneratedFile[] {
  return [
    ...genDataStructs(),
    ...genCoreClasses(ir),
    ...genCharacterClasses(ir),
    ...genSystemClasses(ir),
    ...genWorldGenerators(ir),
  ];
}
