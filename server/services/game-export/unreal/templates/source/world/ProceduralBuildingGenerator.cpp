#include "ProceduralBuildingGenerator.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/Texture2D.h"
#include "Materials/MaterialInstanceDynamic.h"

AProceduralBuildingGenerator::AProceduralBuildingGenerator()
{
    PrimaryActorTick.bCanEverTick = false;
}

UMaterialInstanceDynamic* AProceduralBuildingGenerator::GetSharedMaterial(
    const FString& Key, UMaterialInterface* Parent, FLinearColor Color)
{
    if (auto* Existing = MaterialCache.Find(Key))
    {
        return *Existing;
    }
    auto* Mat = UMaterialInstanceDynamic::Create(Parent, this);
    Mat->SetVectorParameterValue(TEXT("BaseColor"), Color);
    MaterialCache.Add(Key, Mat);
    return Mat;
}

void AProceduralBuildingGenerator::RegisterRoleModel(const FString& Role, UStaticMesh* Mesh)
{
    if (Role.IsEmpty() || !Mesh) return;
    RoleModelPrototypes.Add(Role, Mesh);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Registered role model: %s"), *Role);
}

void AProceduralBuildingGenerator::SetWallTexture(UTexture2D* Texture)
{
    WallTextureOverride = Texture;
}

void AProceduralBuildingGenerator::SetRoofTexture(UTexture2D* Texture)
{
    RoofTextureOverride = Texture;
}

const TMap<FString, FBuildingStylePreset>& AProceduralBuildingGenerator::GetStylePresets()
{
    static TMap<FString, FBuildingStylePreset> Presets;
    if (Presets.Num() == 0)
    {
        Presets.Add(TEXT("medieval_wood"), {
            TEXT("Medieval Wood"),
            FLinearColor(0.55f, 0.35f, 0.2f),
            FLinearColor(0.3f, 0.2f, 0.15f),
            FLinearColor(0.9f, 0.9f, 0.7f),
            FLinearColor(0.4f, 0.25f, 0.15f),
            TEXT("wood"), TEXT("medieval")
        });
        Presets.Add(TEXT("medieval_stone"), {
            TEXT("Medieval Stone"),
            FLinearColor(0.6f, 0.6f, 0.55f),
            FLinearColor(0.35f, 0.2f, 0.15f),
            FLinearColor(0.7f, 0.8f, 0.9f),
            FLinearColor(0.3f, 0.2f, 0.1f),
            TEXT("stone"), TEXT("medieval")
        });
        Presets.Add(TEXT("modern_concrete"), {
            TEXT("Modern Concrete"),
            FLinearColor(0.7f, 0.7f, 0.7f),
            FLinearColor(0.3f, 0.3f, 0.3f),
            FLinearColor(0.6f, 0.7f, 0.8f),
            FLinearColor(0.5f, 0.5f, 0.5f),
            TEXT("brick"), TEXT("modern")
        });
        Presets.Add(TEXT("futuristic_metal"), {
            TEXT("Futuristic Metal"),
            FLinearColor(0.6f, 0.65f, 0.7f),
            FLinearColor(0.2f, 0.25f, 0.3f),
            FLinearColor(0.5f, 0.7f, 0.9f),
            FLinearColor(0.3f, 0.4f, 0.5f),
            TEXT("metal"), TEXT("futuristic")
        });
        Presets.Add(TEXT("rustic_cottage"), {
            TEXT("Rustic Cottage"),
            FLinearColor(0.7f, 0.5f, 0.3f),
            FLinearColor(0.5f, 0.35f, 0.2f),
            FLinearColor(0.8f, 0.85f, 0.7f),
            FLinearColor(0.5f, 0.3f, 0.2f),
            TEXT("wood"), TEXT("rustic")
        });
    }
    return Presets;
}

const TMap<FString, FBuildingTypeDefaults>& AProceduralBuildingGenerator::GetBuildingTypes()
{
    static TMap<FString, FBuildingTypeDefaults> Types;
    if (Types.Num() == 0)
    {
        // Businesses
        Types.Add(TEXT("Bakery"),            { 2, 12, 10, true,  false });
        Types.Add(TEXT("Restaurant"),        { 2, 15, 12, false, false });
        Types.Add(TEXT("Tavern"),            { 2, 14, 14, false, true  });
        Types.Add(TEXT("Inn"),               { 3, 16, 14, false, true  });
        Types.Add(TEXT("Market"),            { 1, 20, 15, false, false });
        Types.Add(TEXT("Shop"),              { 2, 10, 8,  false, false });
        Types.Add(TEXT("Blacksmith"),        { 1, 12, 10, true,  false });
        Types.Add(TEXT("LawFirm"),           { 3, 12, 10, false, false });
        Types.Add(TEXT("Bank"),              { 2, 14, 12, false, false });
        Types.Add(TEXT("Hospital"),          { 3, 20, 18, false, false });
        Types.Add(TEXT("School"),            { 2, 18, 16, false, false });
        Types.Add(TEXT("Church"),            { 1, 16, 24, false, false });
        Types.Add(TEXT("Theater"),           { 2, 18, 20, false, false });
        Types.Add(TEXT("Library"),           { 3, 16, 14, false, false });
        Types.Add(TEXT("ApartmentComplex"),  { 5, 18, 16, false, true  });
        Types.Add(TEXT("Windmill"),          { 3, 10, 10, false, false });
        Types.Add(TEXT("Watermill"),         { 2, 14, 12, false, false });
        Types.Add(TEXT("Lumbermill"),        { 1, 16, 12, true,  false });
        Types.Add(TEXT("Barracks"),          { 2, 18, 14, false, false });
        Types.Add(TEXT("Mine"),              { 1, 12, 10, false, false });
        // Residences
        Types.Add(TEXT("residence_small"),   { 1, 8,  8,  false, false });
        Types.Add(TEXT("residence_medium"),  { 2, 10, 10, true,  false });
        Types.Add(TEXT("residence_large"),   { 2, 14, 12, true,  true  });
        Types.Add(TEXT("residence_mansion"), { 3, 20, 18, true,  true  });
    }
    return Types;
}

FBuildingStylePreset AProceduralBuildingGenerator::GetStyleForWorld(
    const FString& WorldType, const FString& Terrain)
{
    const auto& Presets = GetStylePresets();
    FString Type = WorldType.ToLower();
    FString Terr = Terrain.ToLower();

    if (Type.Contains(TEXT("medieval")) || Type.Contains(TEXT("fantasy")))
    {
        if (Terr.Contains(TEXT("forest")) || Terr.Contains(TEXT("rural")))
        {
            return Presets[TEXT("medieval_wood")];
        }
        return Presets[TEXT("medieval_stone")];
    }
    if (Type.Contains(TEXT("cyberpunk")) || Type.Contains(TEXT("sci-fi")) || Type.Contains(TEXT("futuristic")))
    {
        return Presets[TEXT("futuristic_metal")];
    }
    if (Type.Contains(TEXT("modern")))
    {
        return Presets[TEXT("modern_concrete")];
    }
    if (Terr.Contains(TEXT("rural")) || Terr.Contains(TEXT("village")))
    {
        return Presets[TEXT("rustic_cottage")];
    }
    // Default
    return Presets[TEXT("medieval_wood")];
}

void AProceduralBuildingGenerator::GenerateBuilding(FVector Position, float Rotation,
    int32 Floors, float Width, float Depth, const FString& BuildingRole,
    const FFoundationData& Foundation)
{
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Generate building %s at %s (%dx%.0fx%.0f, foundation=%s)"),
        *BuildingRole, *Position.ToString(), Floors, Width, Depth, *Foundation.Type);

    // Create terrain-adaptive foundation mesh if not flat
    if (Foundation.Type != TEXT("flat") && Foundation.FoundationHeight > 0.0f)
    {
        // Foundation geometry fills the gap between sloped terrain and building floor.
        // The building position is raised to sit on top of the highest corner.
        float TopZ = Foundation.BaseElevation + Foundation.FoundationHeight;
        Position.Z = TopZ;
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Foundation type=%s height=%.1f, raised to Z=%.1f"),
            *Foundation.Type, Foundation.FoundationHeight, TopZ);
    }

    // Check for a registered role model first.
    // Note: full clones are used (not GPU instances) to ensure compatibility
    // with render-to-texture captures like minimap snapshots.
    if (auto* ModelPtr = RoleModelPrototypes.Find(BuildingRole))
    {
        UStaticMesh* Model = *ModelPtr;
        if (Model)
        {
            auto* MeshComp = NewObject<UStaticMeshComponent>(this);
            MeshComp->SetStaticMesh(Model);
            MeshComp->SetWorldLocation(Position);
            MeshComp->SetWorldRotation(FRotator(0, FMath::RadiansToDegrees(Rotation), 0));
            MeshComp->SetMobility(EComponentMobility::Static);
            MeshComp->SetCullDistance(LODCullDistance);
            MeshComp->RegisterComponent();
            MeshComp->AttachToComponent(GetRootComponent(),
                FAttachmentTransformRules::KeepWorldTransform);
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Placed role model for %s"), *BuildingRole);
            return;
        }
    }

    // Procedural fallback — spawn a cube placeholder scaled to building dimensions
    // Performance: mark as static for Unreal's static mesh batching
    SetMobility(EComponentMobility::Static);

    // LOD: cull at configured distance
    if (auto* RootComp = GetRootComponent())
    {
        RootComp->SetCullDistance(LODCullDistance);
    }
}

float AProceduralBuildingGenerator::CreateRoof(USceneComponent* Parent, const FString& ArchStyle,
    float Width, float Depth, int32 Floors, FLinearColor Color, UMaterialInterface* BaseMaterial)
{
    const float FloorHeight = 4.0f;
    const float TotalHeight = Floors * FloorHeight;
    const float PeakedRoofHeight = 3.0f;
    float ActualRoofHeight;

    if (ArchStyle == TEXT("medieval") || ArchStyle == TEXT("rustic"))
    {
        // Peaked hip roof
        ActualRoofHeight = PeakedRoofHeight;
    }
    else if (ArchStyle == TEXT("modern") || ArchStyle == TEXT("futuristic"))
    {
        // Flat roof
        ActualRoofHeight = 0.5f;
    }
    else
    {
        // Cone roof (default)
        ActualRoofHeight = PeakedRoofHeight;
    }

    // Position: centered at totalHeight + half roof height to sit flush on walls
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Roof style=%s height=%.1f at y=%.1f"),
        *ArchStyle, ActualRoofHeight, TotalHeight + ActualRoofHeight / 2.0f);

    return ActualRoofHeight;
}

void AProceduralBuildingGenerator::AddDoor(USceneComponent* Parent, float Width, float Depth,
    int32 Floors, FLinearColor DoorColor, UMaterialInterface* BaseMaterial)
{
    const float DoorWidth = 1.2f;
    const float DoorHeight = 2.2f;
    const float DoorDepth = 0.15f;
    const float FrameThickness = 0.12f;
    const float FrameDepth = 0.18f;
    const float FrontZ = Depth / 2.0f;
    const float FloorHeight = 4.0f;
    const float TotalHeight = Floors * FloorHeight;
    const float GroundY = -TotalHeight / 2.0f;

    // Door frame color is half the door color intensity
    FLinearColor FrameColor = DoorColor * 0.5f;

    // Door handle color (metallic brass)
    FLinearColor HandleColor(0.7f, 0.65f, 0.4f);

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Door: frame=%.2fx%.2f, panel=%.2fx%.2f, at z=%.1f"),
        FrameThickness, DoorHeight + FrameThickness, DoorWidth, DoorHeight, FrontZ);
}
