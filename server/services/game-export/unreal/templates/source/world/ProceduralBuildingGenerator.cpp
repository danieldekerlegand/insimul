#include "ProceduralBuildingGenerator.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/Texture2D.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

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

void AProceduralBuildingGenerator::RegisterRoleModel(const FString& Role, UStaticMesh* Mesh, float ScaleHint)
{
    if (Role.IsEmpty() || !Mesh) return;
    RoleModelPrototypes.Add(Role, Mesh);
    if (ScaleHint > 0.0f)
    {
        RoleScaleHints.Add(Role, ScaleHint);
    }
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Registered role model: %s (scaleHint=%.4f)"), *Role, ScaleHint);
}

void AProceduralBuildingGenerator::SetWallTexture(UTexture2D* Texture)
{
    WallTextureOverride = Texture;
}

void AProceduralBuildingGenerator::SetRoofTexture(UTexture2D* Texture)
{
    RoofTextureOverride = Texture;
}

void AProceduralBuildingGenerator::RegisterPresetTexture(const FString& AssetId, UTexture2D* Texture)
{
    PresetTextures.Add(AssetId, Texture);
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
        Presets.Add(TEXT("colonial_stucco"), {
            TEXT("Colonial Stucco"),
            FLinearColor(0.9f, 0.85f, 0.75f),
            FLinearColor(0.25f, 0.25f, 0.3f),
            FLinearColor(0.7f, 0.8f, 0.9f),
            FLinearColor(0.3f, 0.2f, 0.15f),
            TEXT("stucco"), TEXT("colonial"),
            EBuildingRoofStyle::HippedDormers,
            false, true, 3.0f, 3, true,
            FLinearColor(0.15f, 0.3f, 0.15f)
        });
        Presets.Add(TEXT("creole_cottage"), {
            TEXT("Creole Cottage"),
            FLinearColor(0.85f, 0.75f, 0.55f),
            FLinearColor(0.35f, 0.2f, 0.15f),
            FLinearColor(0.6f, 0.7f, 0.8f),
            FLinearColor(0.4f, 0.25f, 0.15f),
            TEXT("wood"), TEXT("creole"),
            EBuildingRoofStyle::SideGable,
            true, true, 3.0f, 4, true,
            FLinearColor(0.2f, 0.25f, 0.3f)
        });
    }
    return Presets;
}

const TMap<FString, FBuildingTypeDefaults>& AProceduralBuildingGenerator::GetBuildingTypes()
{
    static TMap<FString, FBuildingTypeDefaults> Types;
    if (Types.Num() == 0)
    {
        // ── Commercial: Food & Drink ──
        Types.Add(TEXT("Bakery"),            { 2, 12, 10, true  });
        Types.Add(TEXT("Restaurant"),        { 2, 15, 12 });
        Types.Add(TEXT("Bar"),               { 2, 12, 10 });
        Types.Add(TEXT("Brewery"),           { 2, 14, 12, true  });

        // ── Commercial: Retail ──
        Types.Add(TEXT("Shop"),              { 2, 10, 8  });
        Types.Add(TEXT("GroceryStore"),      { 2, 14, 12 });
        Types.Add(TEXT("JewelryStore"),      { 2, 10, 8  });
        Types.Add(TEXT("BookStore"),         { 2, 10, 10 });
        Types.Add(TEXT("PawnShop"),          { 2, 10, 8  });
        Types.Add(TEXT("HerbShop"),          { 1, 8,  8  });

        // ── Commercial: Services ──
        Types.Add(TEXT("Bank"),              { 2, 14, 12 });
        Types.Add(TEXT("Hotel"),             { 3, 16, 14, false, true  });
        Types.Add(TEXT("Barbershop"),        { 1, 8,  8  });
        Types.Add(TEXT("Tailor"),            { 2, 10, 8  });
        Types.Add(TEXT("Bathhouse"),         { 1, 14, 12 });
        Types.Add(TEXT("DentalOffice"),      { 2, 10, 10 });
        Types.Add(TEXT("OptometryOffice"),   { 2, 10, 10 });
        Types.Add(TEXT("Pharmacy"),          { 2, 10, 10 });
        Types.Add(TEXT("LawFirm"),           { 3, 12, 10 });
        Types.Add(TEXT("InsuranceOffice"),   { 2, 10, 10 });
        Types.Add(TEXT("RealEstateOffice"),  { 2, 10, 10 });
        Types.Add(TEXT("TattoParlor"),       { 1, 8,  8  });

        // ── Civic ──
        Types.Add(TEXT("Church"),            { 1, 16, 24 });
        Types.Add(TEXT("TownHall"),          { 2, 18, 16 });
        Types.Add(TEXT("School"),            { 2, 18, 16 });
        Types.Add(TEXT("University"),        { 3, 20, 18 });
        Types.Add(TEXT("Hospital"),          { 3, 20, 18 });
        Types.Add(TEXT("PoliceStation"),     { 2, 14, 12 });
        Types.Add(TEXT("FireStation"),       { 2, 14, 14 });
        Types.Add(TEXT("Daycare"),           { 1, 12, 10 });
        Types.Add(TEXT("Mortuary"),          { 1, 12, 10 });

        // ── Industrial ──
        Types.Add(TEXT("Factory"),           { 2, 20, 16, true  });
        Types.Add(TEXT("Farm"),              { 1, 14, 12 });
        Types.Add(TEXT("Warehouse"),         { 1, 18, 14 });
        Types.Add(TEXT("Blacksmith"),        { 1, 12, 10, true  });
        Types.Add(TEXT("Carpenter"),         { 1, 12, 10 });
        Types.Add(TEXT("Butcher"),           { 1, 10, 8  });

        // ── Maritime ──
        Types.Add(TEXT("Harbor"),            { 1, 16, 12 });
        Types.Add(TEXT("Boatyard"),          { 1, 18, 14 });
        Types.Add(TEXT("FishMarket"),        { 1, 14, 10 });
        Types.Add(TEXT("CustomsHouse"),      { 2, 14, 12 });
        Types.Add(TEXT("Lighthouse"),        { 3, 8,  8  });

        // ── Residential ──
        Types.Add(TEXT("house"),             { 2, 10, 10, true  });
        Types.Add(TEXT("apartment"),         { 3, 14, 12 });
        Types.Add(TEXT("mansion"),           { 3, 20, 18, true, true });
        Types.Add(TEXT("cottage"),           { 1, 8,  8,  true  });
        Types.Add(TEXT("townhouse"),         { 2, 8,  12 });
        Types.Add(TEXT("mobile_home"),       { 1, 6,  10 });

        // ── Other/legacy ──
        Types.Add(TEXT("Tavern"),            { 2, 14, 14, false, true  });
        Types.Add(TEXT("Inn"),               { 3, 16, 14, false, true  });
        Types.Add(TEXT("Market"),            { 1, 20, 15 });
        Types.Add(TEXT("Theater"),           { 2, 18, 20 });
        Types.Add(TEXT("Library"),           { 3, 16, 14 });
        Types.Add(TEXT("ApartmentComplex"),  { 5, 18, 16, false, true  });
        Types.Add(TEXT("Windmill"),          { 3, 10, 10 });
        Types.Add(TEXT("Watermill"),         { 2, 14, 12 });
        Types.Add(TEXT("Lumbermill"),        { 1, 16, 12, true  });
        Types.Add(TEXT("Barracks"),          { 2, 18, 14 });
        Types.Add(TEXT("Mine"),              { 1, 12, 10 });
        Types.Add(TEXT("Clinic"),            { 2, 12, 10 });
        Types.Add(TEXT("Stables"),           { 1, 14, 12 });

        // ── Legacy residence keys ──
        Types.Add(TEXT("residence_small"),   { 1, 8,  8  });
        Types.Add(TEXT("residence_medium"),  { 2, 10, 10, true  });
        Types.Add(TEXT("residence_large"),   { 2, 14, 12, true, true  });
        Types.Add(TEXT("residence_mansion"), { 3, 20, 18, true, true  });
    }
    return Types;
}

const TMap<FString, FZoneScale>& AProceduralBuildingGenerator::GetZoneScale()
{
    static TMap<FString, FZoneScale> Scales;
    if (Scales.Num() == 0)
    {
        Scales.Add(TEXT("commercial"),  { 1.3f, 1.15f, 1.1f });
        Scales.Add(TEXT("residential"), { 1.0f, 1.0f,  1.0f });
    }
    return Scales;
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

    // Compute porch elevation if the style calls for a porch
    float PorchElevation = 0.0f;
    if (CurrentStyle.bHasPorch)
    {
        PorchElevation = CurrentStyle.PorchSteps * 0.2f; // ~20cm per step
        Position.Z += PorchElevation;
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Porch elevation=%.1f (%d steps), raised body to Z=%.1f"),
            PorchElevation, CurrentStyle.PorchSteps, Position.Z);
    }

    // Check for a registered role model first.
    // Note: full clones are used (not GPU instances) to ensure compatibility
    // with render-to-texture captures like minimap snapshots.
    bool bUsedModel = false;
    if (auto* ModelPtr = RoleModelPrototypes.Find(BuildingRole))
    {
        UStaticMesh* Model = *ModelPtr;
        if (Model)
        {
            // Validate model is usable (has vertices and is not too small)
            FBoxSphereBounds ModelBounds = Model->GetBounds();
            float ModelExtent = ModelBounds.SphereRadius;
            bool bModelUsable = ModelExtent > 0.01f && Model->GetNumVertices(0) > 0;

            if (bModelUsable)
            {
                auto* MeshComp = NewObject<UStaticMeshComponent>(this);
                MeshComp->SetStaticMesh(Model);
                MeshComp->SetWorldLocation(Position);
                MeshComp->SetWorldRotation(FRotator(0, FMath::RadiansToDegrees(Rotation), 0));
                // Apply stored scaleHint if available; otherwise leave at default scale.
                // scaleHint converts the model's native units to real-world meters.
                if (auto* HintPtr = RoleScaleHints.Find(BuildingRole))
                {
                    float S = *HintPtr;
                    MeshComp->SetWorldScale3D(FVector(S, S, S));
                    UE_LOG(LogTemp, Log, TEXT("[Insimul] Applied scaleHint=%.4f to %s"), S, *BuildingRole);
                }
                MeshComp->SetMobility(EComponentMobility::Static);
                MeshComp->SetCullDistance(LODCullDistance);
                MeshComp->RegisterComponent();
                MeshComp->AttachToComponent(GetRootComponent(),
                    FAttachmentTransformRules::KeepWorldTransform);
                UE_LOG(LogTemp, Log, TEXT("[Insimul] Placed role model for %s"), *BuildingRole);
                bUsedModel = true;
            }
            else
            {
                UE_LOG(LogTemp, Warning, TEXT("[Insimul] Model for %s unusable (verts=%d, extent=%.4f), falling back to procedural"),
                    *BuildingRole, Model->GetNumVertices(0), ModelExtent);
            }
        }
    }

    if (bUsedModel)
    {
        // Even with a model, we may still add a porch
        if (CurrentStyle.bHasPorch)
        {
            CreatePorch(GetRootComponent(), Width, Depth, CurrentStyle.PorchDepth,
                        CurrentStyle.PorchSteps, PorchElevation, BaseColor, nullptr);
        }
        return;
    }

    // Procedural fallback — spawn a cube placeholder scaled to building dimensions
    // Performance: mark as static for Unreal's static mesh batching
    SetMobility(EComponentMobility::Static);

    // LOD: cull at configured distance
    if (auto* RootComp = GetRootComponent())
    {
        RootComp->SetCullDistance(LODCullDistance);
    }

    // Create porch if style requires it
    if (CurrentStyle.bHasPorch)
    {
        CreatePorch(GetRootComponent(), Width, Depth, CurrentStyle.PorchDepth,
                    CurrentStyle.PorchSteps, PorchElevation, BaseColor, nullptr);
    }

    // Porch setback: push all geometry back in local -Z so the porch + stairs
    // don't cover the sidewalk. Shift by 3/4 of the total porch extension.
    if (CurrentStyle.bHasPorch)
    {
        const float StepDepth = 0.4f;
        float PorchExtension = CurrentStyle.PorchDepth + CurrentStyle.PorchSteps * StepDepth;
        float Setback = PorchExtension * 0.75f;
        TArray<USceneComponent*> ChildComponents;
        GetRootComponent()->GetChildrenComponents(false, ChildComponents);
        for (auto* Child : ChildComponents)
        {
            FVector Loc = Child->GetRelativeLocation();
            Loc.Y -= Setback; // Unreal: Y is forward/back in local space
            Child->SetRelativeLocation(Loc);
        }
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Porch setback=%.2f applied"), Setback);
    }

    // Use RoofStyle enum for roof selection instead of just architecture style string
    CreateRoofFromStyle(GetRootComponent(), CurrentStyle.RoofStyle, Width, Depth,
                        Floors, RoofColor, nullptr);

    // Add ironwork balconies on every upper floor if style calls for it
    if (CurrentStyle.bHasIronworkBalcony && Floors > 1)
    {
        for (int32 Floor = 1; Floor < Floors; ++Floor)
        {
            AddIronworkBalcony(GetRootComponent(), Width, Depth, Floor, BaseColor, nullptr);
        }
    }

    // Propagate LOD cull distance to all child components so unmerged children
    // (e.g. door, roof) don't remain visible when the parent building is LOD-hidden.
    TArray<USceneComponent*> Children;
    GetRootComponent()->GetChildrenComponents(true, Children);
    for (auto* Child : Children)
    {
        if (auto* PrimComp = Cast<UPrimitiveComponent>(Child))
        {
            if (PrimComp->LDMaxDrawDistance <= 0.f)
            {
                PrimComp->SetCullDistance(LODCullDistance);
            }
        }
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

void AProceduralBuildingGenerator::SetProceduralConfig(const FString& ConfigJson)
{
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(ConfigJson);
    TSharedPtr<FJsonObject> Parsed;
    if (FJsonSerializer::Deserialize(Reader, Parsed) && Parsed.IsValid())
    {
        ProceduralConfig = Parsed;
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Procedural config loaded"));
    }
    else
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] Failed to parse procedural config JSON"));
    }
}

FBuildingStylePreset AProceduralBuildingGenerator::PresetToBuildingStyle(const FString& PresetName, int32 Seed)
{
    const auto& Presets = GetStylePresets();
    if (const FBuildingStylePreset* Found = Presets.Find(PresetName))
    {
        return *Found;
    }

    // Deterministic fallback: use seed to pick from available presets
    TArray<FString> Keys;
    Presets.GetKeys(Keys);
    if (Keys.Num() > 0)
    {
        int32 Idx = FMath::Abs(Seed) % Keys.Num();
        return Presets[Keys[Idx]];
    }

    // Ultimate fallback
    FBuildingStylePreset Default;
    Default.Name = TEXT("Default");
    Default.BaseColor = FLinearColor(0.6f, 0.6f, 0.6f);
    Default.RoofColor = FLinearColor(0.3f, 0.2f, 0.15f);
    Default.WindowColor = FLinearColor(0.7f, 0.8f, 0.9f);
    Default.DoorColor = FLinearColor(0.4f, 0.25f, 0.15f);
    Default.MaterialType = TEXT("wood");
    Default.ArchitectureStyle = TEXT("medieval");
    return Default;
}

float AProceduralBuildingGenerator::CreateRoofFromStyle(USceneComponent* Parent,
    EBuildingRoofStyle RoofStyle, float Width, float Depth,
    int32 Floors, FLinearColor Color, UMaterialInterface* BaseMaterial)
{
    const float FloorHeight = 4.0f;
    const float PeakedRoofHeight = 3.0f;

    switch (RoofStyle)
    {
    case EBuildingRoofStyle::Gable:
        CreateGableRoofMesh(Parent, Width, Depth, PeakedRoofHeight, Color, BaseMaterial);
        return PeakedRoofHeight;

    case EBuildingRoofStyle::Hip:
        CreateHipRoofMesh(Parent, Width, Depth, PeakedRoofHeight, Color, BaseMaterial);
        return PeakedRoofHeight;

    case EBuildingRoofStyle::Flat:
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Flat roof, height=0.5"));
        return 0.5f;

    case EBuildingRoofStyle::SideGable:
        // Side gable is a gable rotated 90 degrees
        CreateGableRoofMesh(Parent, Depth, Width, PeakedRoofHeight, Color, BaseMaterial);
        return PeakedRoofHeight;

    case EBuildingRoofStyle::HippedDormers:
        // Base hip roof with dormers indicated
        CreateHipRoofMesh(Parent, Width, Depth, PeakedRoofHeight, Color, BaseMaterial);
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Hipped roof with dormers"));
        return PeakedRoofHeight;

    default:
        return CreateRoof(Parent, TEXT("medieval"), Width, Depth, Floors, Color, BaseMaterial);
    }
}

void AProceduralBuildingGenerator::CreateGableRoofMesh(USceneComponent* Parent,
    float Width, float Depth, float Height, FLinearColor Color, UMaterialInterface* BaseMaterial)
{
    // Gable roof: two sloping planes meeting at a ridge along the depth axis
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Gable roof: %.1fx%.1f height=%.1f"), Width, Depth, Height);

    // Vertex positions for a gable roof:
    // Ridge runs along the depth (front-to-back) axis at the center of width
    // Two triangular faces on each end, two rectangular slopes on each side
    // Implementation would create a ProceduralMeshComponent with custom vertices
    // For template purposes, we log the geometry parameters
}

void AProceduralBuildingGenerator::CreateHipRoofMesh(USceneComponent* Parent,
    float Width, float Depth, float Height, FLinearColor Color, UMaterialInterface* BaseMaterial)
{
    // Hip roof: four sloping planes meeting at a ridge
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Hip roof: %.1fx%.1f height=%.1f"), Width, Depth, Height);

    // Vertex positions for a hip roof:
    // Ridge is shorter than the building length, with four sloping faces
    // Each corner rises to meet the ridge rather than forming a gable triangle
    // Implementation would create a ProceduralMeshComponent with custom vertices
}

void AProceduralBuildingGenerator::CreatePorch(USceneComponent* Parent,
    float BuildingWidth, float BuildingDepth, float PorchDepth, int32 PorchSteps,
    float PorchElevation, FLinearColor Color, UMaterialInterface* BaseMaterial)
{
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Creating porch: width=%.1f porchDepth=%.1f steps=%d elevation=%.1f"),
        BuildingWidth, PorchDepth, PorchSteps, PorchElevation);

    const float StepHeight = PorchElevation / FMath::Max(PorchSteps, 1);
    const float StepDepth = 0.3f;

    // Foundation/deck: a flat platform extending from the building front
    // Positioned at PorchElevation height, extending PorchDepth forward
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Porch deck: %.1fx%.1f at height=%.1f"),
        BuildingWidth, PorchDepth, PorchElevation);

    // Steps: descending from porch deck to ground level
    for (int32 i = 0; i < PorchSteps; ++i)
    {
        float StepZ = PorchElevation - (i + 1) * StepHeight;
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Porch step %d: z=%.2f depth=%.2f"),
            i, StepZ, StepDepth);
    }

    // Posts: vertical columns at porch corners supporting a potential overhang
    const float PostRadius = 0.1f;
    const float PostHeight = 2.8f;
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Porch posts: radius=%.2f height=%.1f"), PostRadius, PostHeight);
}

void AProceduralBuildingGenerator::AddShutters(USceneComponent* Parent, FVector WindowPosition,
    float WindowWidth, float WindowHeight, FLinearColor ShutterColor, UMaterialInterface* BaseMaterial)
{
    // Shutters are thin boxes flanking each window
    const float ShutterWidth = WindowWidth * 0.3f;
    const float ShutterDepth = 0.05f;

    // Left shutter
    FVector LeftPos = WindowPosition - FVector(WindowWidth / 2.0f + ShutterWidth / 2.0f, 0, 0);
    // Right shutter
    FVector RightPos = WindowPosition + FVector(WindowWidth / 2.0f + ShutterWidth / 2.0f, 0, 0);

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Shutters: %.2fx%.2f flanking window at %s"),
        ShutterWidth, WindowHeight, *WindowPosition.ToString());
}

void AProceduralBuildingGenerator::AddIronworkBalcony(USceneComponent* Parent,
    float Width, float Depth, int32 Floor, FLinearColor Color, UMaterialInterface* BaseMaterial)
{
    const float FloorHeight = 4.0f;
    const float BalconyDepth = 1.2f;
    const float RailHeight = 1.0f;
    const float BalusterSpacing = 0.12f;
    const float BalusterRadius = 0.015f;

    float FloorZ = Floor * FloorHeight;

    // Balcony floor plate
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Ironwork balcony floor %d: width=%.1f depth=%.1f at z=%.1f"),
        Floor, Width, BalconyDepth, FloorZ);

    // Ironwork balusters: thin vertical rods at regular intervals
    int32 NumBalusters = FMath::FloorToInt(Width / BalusterSpacing);
    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Ironwork balusters: %d at spacing=%.3f radius=%.3f"),
        NumBalusters, BalusterSpacing, BalusterRadius);
}
