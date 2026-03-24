#include "InsimulGameMode.h"
#include "InsimulMeshActor.h"
#include "InsimulGameInstance.h"
#include "InsimulPlayerController.h"
#include "../Characters/PlayerCharacter.h"
#include "../Characters/NPCCharacter.h"
#include "../World/ProceduralTerrainGenerator.h"
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
    // Load LevelDescriptor.json to get terrain data with heightmap
    FString LevelPath = FPaths::ProjectContentDir() / TEXT("Data/LevelDescriptor.json");
    FString LevelJson;
    TSharedPtr<FJsonObject> LevelObj;

    bool bHasHeightmap = false;
    if (FFileHelper::LoadFileToString(LevelJson, *LevelPath))
    {
        TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(LevelJson);
        if (FJsonSerializer::Deserialize(Reader, LevelObj) && LevelObj.IsValid())
        {
            const TSharedPtr<FJsonObject>* TerrainPtr;
            if (LevelObj->TryGetObjectField(TEXT("terrain"), TerrainPtr))
            {
                const TArray<TSharedPtr<FJsonValue>>* HmArr;
                if ((*TerrainPtr)->TryGetArrayField(TEXT("heightmap"), HmArr) && HmArr->Num() > 0)
                {
                    bHasHeightmap = true;
                }
            }
        }
    }

    if (bHasHeightmap)
    {
        // Spawn ProceduralTerrainGenerator and build mesh from heightmap
        FActorSpawnParameters Params;
        Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

        TerrainGenerator = GetWorld()->SpawnActor<AProceduralTerrainGenerator>(
            AProceduralTerrainGenerator::StaticClass(),
            FVector(WorldCenter.X, WorldCenter.Y, 0.f),
            FRotator::ZeroRotator, Params);

        if (TerrainGenerator)
        {
            const TSharedPtr<FJsonObject>* TerrainPtr;
            LevelObj->TryGetObjectField(TEXT("terrain"), TerrainPtr);
            TerrainGenerator->GenerateFromJson(*TerrainPtr);
            UE_LOG(LogTemp, Warning, TEXT("[Insimul] Terrain generated from heightmap at %s"),
                *WorldCenter.ToString());
        }
        else
        {
            UE_LOG(LogTemp, Error, TEXT("[Insimul] FAILED to spawn ProceduralTerrainGenerator!"));
        }
    }
    else
    {
        // Fallback: flat ground plane when no heightmap is available
        float HalfSize = 200000.f;
        FVector GroundPos = FVector(WorldCenter.X, WorldCenter.Y, -50.f);

        FActorSpawnParameters Params;
        Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

        AInsimulMeshActor* Ground = GetWorld()->SpawnActor<AInsimulMeshActor>(
            AInsimulMeshActor::StaticClass(), GroundPos, FRotator::ZeroRotator, Params);

        if (Ground)
        {
            Ground->MeshComponent->SetStaticMesh(CubeMesh);
            Ground->SetActorScale3D(FVector(HalfSize / 50.f, HalfSize / 50.f, 0.5f));
            Ground->MeshComponent->SetVisibility(true);
            Ground->MeshComponent->SetHiddenInGame(false);

            if (BaseMaterial)
            {
                UMaterialInstanceDynamic* GroundMat = UMaterialInstanceDynamic::Create(BaseMaterial, Ground);
                if (GroundMat)
                {
                    GroundMat->SetVectorParameterValue(TEXT("Color"),
                        FLinearColor({{GROUND_COLOR_R}}, {{GROUND_COLOR_G}}, {{GROUND_COLOR_B}}));
                    Ground->MeshComponent->SetMaterial(0, GroundMat);
                }
            }
            UE_LOG(LogTemp, Warning, TEXT("[Insimul] Flat ground plane at %s — no heightmap available"),
                *GroundPos.ToString());
        }
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

        FString ModelKey = Obj->GetStringField(TEXT("ModelAssetKey"));
        bool bPlaced = false;

        // Try Blueprint class if ModelAssetKey is set and mapped in BuildingBlueprintMap
        if (!ModelKey.IsEmpty() && BuildingBlueprintMap.Contains(ModelKey))
        {
            TSubclassOf<AActor> BPClass = BuildingBlueprintMap[ModelKey];
            if (BPClass)
            {
                FActorSpawnParameters BPParams;
                BPParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
                AActor* BPActor = GetWorld()->SpawnActor<AActor>(BPClass,
                    FVector(X, Y, Z), FRotator(0.f, (float)Rot, 0.f), BPParams);
                if (BPActor)
                {
                    BPActor->SetActorLabel(FString::Printf(TEXT("Building_%d"), Count));
                    bPlaced = true;
                }
            }
        }

        if (!bPlaced)
        {
            // Fallback: procedural colored mesh
            // Wall box
            AInsimulMeshActor* Wall = SpawnColoredMesh(CubeMesh,
                FVector(X, Y, H / 2.0 + Z),
                FVector(W / 100.0, D / 100.0, H / 100.0),
                FLinearColor({{BASE_COLOR_R}}, {{BASE_COLOR_G}}, {{BASE_COLOR_B}}),
                FRotator(0.f, (float)Rot, 0.f));

            // Roof dome
            double RoofDiam = FMath::Max(W, D) / 100.0 * 0.65;
            SpawnColoredMesh(SphereMesh,
                FVector(X, Y, H + Z + 80.0),
                FVector(RoofDiam, RoofDiam, 1.8),
                FLinearColor({{ROOF_COLOR_R}}, {{ROOF_COLOR_G}}, {{ROOF_COLOR_B}}),
                FRotator(0.f, (float)Rot, 0.f));

            if (Count == 0 && Wall)
            {
                UE_LOG(LogTemp, Warning, TEXT("[Insimul] First building at (%f, %f, %f) size %fx%fx%f"),
                    X, Y, Z, W, D, H);
            }
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
                FLinearColor({{ROAD_COLOR_R}}, {{ROAD_COLOR_G}}, {{ROAD_COLOR_B}}),
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

        TSubclassOf<ANPCCharacter> NPCClass = NPCBlueprintClass
            ? NPCBlueprintClass
            : ANPCCharacter::StaticClass();
        ANPCCharacter* NPC = GetWorld()->SpawnActor<ANPCCharacter>(
            NPCClass, SpawnLoc, SpawnRot, Params);

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
