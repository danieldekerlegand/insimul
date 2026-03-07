#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "InsimulGameMode.generated.h"

class UStaticMesh;
class UMaterial;
class AInsimulMeshActor;
class ANPCCharacter;

UCLASS()
class INSIMULEXPORT_API AInsimulGameMode : public AGameModeBase
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

    /** Map from ModelAssetKey (e.g. "assets/buildings/xxx.glb") to a Blueprint/Actor class.
     *  Populate via the editor after running Scripts/ImportInsimulAssets.py. */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul Assets")
    TMap<FString, TSubclassOf<AActor>> BuildingBlueprintMap;

    /** Optional NPC Blueprint class — assign after importing GLB character assets. */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul Assets")
    TSubclassOf<ANPCCharacter> NPCBlueprintClass;

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
