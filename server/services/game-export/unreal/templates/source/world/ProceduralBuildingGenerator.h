#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ProceduralBuildingGenerator.generated.h"

/**
 * Style preset data for a building visual style.
 */
USTRUCT(BlueprintType)
struct FBuildingStylePreset
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FLinearColor BaseColor;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FLinearColor RoofColor;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FLinearColor WindowColor;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FLinearColor DoorColor;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString MaterialType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ArchitectureStyle;
};

/**
 * Default dimensions for a building type.
 */
USTRUCT(BlueprintType)
struct FBuildingTypeDefaults
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Floors = 2;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Width = 10.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Depth = 10.0f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bHasChimney = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bHasBalcony = false;
};

UCLASS()
class INSIMULEXPORT_API AProceduralBuildingGenerator : public AActor
{
    GENERATED_BODY()

public:
    AProceduralBuildingGenerator();

    UFUNCTION(BlueprintCallable, Category = "Building")
    void GenerateBuilding(FVector Position, float Rotation, int32 Floors,
                          float Width, float Depth, const FString& BuildingRole);

    /** Register a prefab model mesh for a building role. When GenerateBuilding is called
     *  with a matching role, this mesh is instanced instead of procedural geometry. */
    UFUNCTION(BlueprintCallable, Category = "Building")
    void RegisterRoleModel(const FString& Role, UStaticMesh* Mesh);

    /** Override wall texture for procedural buildings. */
    UFUNCTION(BlueprintCallable, Category = "Building")
    void SetWallTexture(UTexture2D* Texture);

    /** Override roof texture for procedural buildings. */
    UFUNCTION(BlueprintCallable, Category = "Building")
    void SetRoofTexture(UTexture2D* Texture);

    /** Return an appropriate style preset for the given world type and terrain. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Building")
    static FBuildingStylePreset GetStyleForWorld(const FString& WorldType, const FString& Terrain);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor BaseColor = FLinearColor({{BASE_COLOR_R}}, {{BASE_COLOR_G}}, {{BASE_COLOR_B}});

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Style")
    FLinearColor RoofColor = FLinearColor({{ROOF_COLOR_R}}, {{ROOF_COLOR_G}}, {{ROOF_COLOR_B}});

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Performance")
    float LODCullDistance = 15000.0f;

    /** Style presets indexed by name (medieval_wood, medieval_stone, etc.). */
    static const TMap<FString, FBuildingStylePreset>& GetStylePresets();

    /** Default building dimensions indexed by business type. */
    static const TMap<FString, FBuildingTypeDefaults>& GetBuildingTypes();

private:
    UPROPERTY()
    TMap<FString, UMaterialInstanceDynamic*> MaterialCache;

    /** Role-based model prototypes registered via RegisterRoleModel. */
    UPROPERTY()
    TMap<FString, UStaticMesh*> RoleModelPrototypes;

    /** Optional texture overrides for procedural wall/roof materials. */
    UPROPERTY()
    UTexture2D* WallTextureOverride = nullptr;

    UPROPERTY()
    UTexture2D* RoofTextureOverride = nullptr;

    UMaterialInstanceDynamic* GetSharedMaterial(const FString& Key, UMaterialInterface* Parent, FLinearColor Color);
};
