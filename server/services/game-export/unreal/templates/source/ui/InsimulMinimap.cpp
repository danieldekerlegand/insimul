#include "InsimulMinimap.h"
#include "Components/CanvasPanelSlot.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "Engine/TextureRenderTarget2D.h"
#include "Components/SceneCaptureComponent2D.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/PlayerController.h"
#include "Blueprint/WidgetLayoutLibrary.h"

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────

void UInsimulMinimap::NativeConstruct()
{
    Super::NativeConstruct();

    // Default zoom levels: 5000, 10000, 20000 (UE units ≈ 50m, 100m, 200m)
    if (ZoomLevels.Num() == 0)
    {
        ZoomLevels.Add(5000.f);
        ZoomLevels.Add(10000.f);
        ZoomLevels.Add(20000.f);
    }

    InitializeMinimap();
}

void UInsimulMinimap::NativeTick(const FGeometry& MyGeometry, float InDeltaTime)
{
    Super::NativeTick(MyGeometry, InDeltaTime);
    UpdateCapturePosition();
    RefreshMarkers();
    UpdateCompass();
}

// ─────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────

void UInsimulMinimap::InitializeMinimap()
{
    // Create render target if not assigned
    if (!MinimapRenderTarget)
    {
        MinimapRenderTarget = NewObject<UTextureRenderTarget2D>(this);
        MinimapRenderTarget->InitAutoFormat(512, 512);
        MinimapRenderTarget->UpdateResourceImmediate(true);
    }

    CreateSceneCapture();

    // Bind render target to the minimap image widget
    if (MinimapImage && MinimapRenderTarget)
    {
        FSlateBrush Brush;
        Brush.SetResourceObject(MinimapRenderTarget);
        Brush.ImageSize = FVector2D(MinimapSize, MinimapSize);
        MinimapImage->SetBrush(Brush);
    }
}

void UInsimulMinimap::CreateSceneCapture()
{
    UWorld* World = GetWorld();
    if (!World) return;

    // Spawn a helper actor to hold the scene capture component
    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
    CaptureActor = World->SpawnActor<AActor>(AActor::StaticClass(), FVector::ZeroVector, FRotator::ZeroRotator, Params);
    if (!CaptureActor) return;

    USceneComponent* Root = NewObject<USceneComponent>(CaptureActor, TEXT("Root"));
    CaptureActor->SetRootComponent(Root);
    Root->RegisterComponent();

    USceneCaptureComponent2D* Capture = NewObject<USceneCaptureComponent2D>(CaptureActor, TEXT("MinimapCapture"));
    Capture->SetupAttachment(Root);
    Capture->RegisterComponent();

    // Orthographic top-down
    Capture->ProjectionType = ECameraProjectionMode::Orthographic;
    Capture->OrthoWidth = ZoomLevels.IsValidIndex(CurrentZoomIndex) ? ZoomLevels[CurrentZoomIndex] : 10000.f;
    Capture->SetRelativeRotation(FRotator(-90.f, 0.f, 0.f)); // Look straight down
    Capture->TextureTarget = MinimapRenderTarget;
    Capture->CaptureSource = ESceneCaptureSource::SCS_FinalColorLDR;
    Capture->bCaptureEveryFrame = true;
    Capture->bCaptureOnMovement = false;

    // Hide player pawn from minimap capture
    APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(World, 0);
    if (PlayerPawn)
    {
        Capture->HiddenActors.Add(PlayerPawn);
    }
}

// ─────────────────────────────────────────────
// Per-tick updates
// ─────────────────────────────────────────────

void UInsimulMinimap::UpdateCapturePosition()
{
    if (!CaptureActor) return;

    APawn* Pawn = UGameplayStatics::GetPlayerPawn(GetWorld(), 0);
    if (!Pawn) return;

    FVector Pos = Pawn->GetActorLocation();
    float Height = ZoomLevels.IsValidIndex(CurrentZoomIndex) ? ZoomLevels[CurrentZoomIndex] : 10000.f;
    CaptureActor->SetActorLocation(FVector(Pos.X, Pos.Y, Pos.Z + Height));
}

void UInsimulMinimap::RefreshMarkers()
{
    if (!MarkerCanvas) return;

    // Clear existing dynamic marker widgets
    MarkerCanvas->ClearChildren();

    // Re-add player arrow
    if (PlayerArrow)
    {
        MarkerCanvas->AddChild(PlayerArrow);
        UCanvasPanelSlot* ArrowSlot = Cast<UCanvasPanelSlot>(PlayerArrow->Slot);
        if (ArrowSlot)
        {
            ArrowSlot->SetPosition(FVector2D(MinimapSize * 0.5f, MinimapSize * 0.5f));
            ArrowSlot->SetAlignment(FVector2D(0.5f, 0.5f));
        }

        // Rotate player arrow with camera yaw
        APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
        if (PC)
        {
            float Yaw = PC->GetControlRotation().Yaw;
            PlayerArrow->SetRenderTransformAngle(Yaw);
        }
    }

    // Place each marker
    for (const FMinimapMarker& Marker : Markers)
    {
        FVector2D ScreenPos = WorldToMinimap(Marker.WorldPosition);

        // Skip markers outside the minimap circle
        FVector2D Center(MinimapSize * 0.5f, MinimapSize * 0.5f);
        float Dist = FVector2D::Distance(ScreenPos, Center);
        if (Dist > MinimapSize * 0.45f) continue;

        UImage* Dot = NewObject<UImage>(this);
        Dot->SetColorAndOpacity(GetMarkerColor(Marker.Type));

        // Pulsing quest markers get a larger size
        float DotSize = Marker.Type == EMinimapMarkerType::Quest ? 10.f : 6.f;

        FSlateBrush DotBrush;
        DotBrush.ImageSize = FVector2D(DotSize, DotSize);
        DotBrush.TintColor = FSlateColor(GetMarkerColor(Marker.Type));
        Dot->SetBrush(DotBrush);

        MarkerCanvas->AddChild(Dot);
        UCanvasPanelSlot* DotSlot = Cast<UCanvasPanelSlot>(Dot->Slot);
        if (DotSlot)
        {
            DotSlot->SetPosition(ScreenPos);
            DotSlot->SetSize(FVector2D(DotSize, DotSize));
            DotSlot->SetAlignment(FVector2D(0.5f, 0.5f));
        }
    }
}

void UInsimulMinimap::UpdateCompass()
{
    if (!CompassOverlay) return;

    APlayerController* PC = UGameplayStatics::GetPlayerController(GetWorld(), 0);
    if (!PC) return;

    float Yaw = PC->GetControlRotation().Yaw;
    CompassOverlay->SetRenderTransformAngle(-Yaw);
}

// ─────────────────────────────────────────────
// Marker management
// ─────────────────────────────────────────────

void UInsimulMinimap::AddMarker(const FString& Id, EMinimapMarkerType Type, FVector WorldPos, const FString& Label)
{
    // Update existing marker if Id matches
    for (FMinimapMarker& M : Markers)
    {
        if (M.Id == Id)
        {
            M.Type = Type;
            M.WorldPosition = WorldPos;
            M.Label = Label;
            return;
        }
    }

    FMinimapMarker NewMarker;
    NewMarker.Id = Id;
    NewMarker.Type = Type;
    NewMarker.WorldPosition = WorldPos;
    NewMarker.Label = Label;
    Markers.Add(NewMarker);
}

void UInsimulMinimap::RemoveMarker(const FString& Id)
{
    Markers.RemoveAll([&Id](const FMinimapMarker& M) { return M.Id == Id; });
}

// ─────────────────────────────────────────────
// Zoom
// ─────────────────────────────────────────────

void UInsimulMinimap::ZoomIn()
{
    if (CurrentZoomIndex > 0)
    {
        CurrentZoomIndex--;
    }
}

void UInsimulMinimap::ZoomOut()
{
    if (CurrentZoomIndex < ZoomLevels.Num() - 1)
    {
        CurrentZoomIndex++;
    }
}

void UInsimulMinimap::SetVisible(bool bVisible)
{
    SetVisibility(bVisible ? ESlateVisibility::HitTestInvisible : ESlateVisibility::Collapsed);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

FVector2D UInsimulMinimap::WorldToMinimap(FVector WorldPos) const
{
    APawn* Pawn = UGameplayStatics::GetPlayerPawn(GetWorld(), 0);
    if (!Pawn) return FVector2D(MinimapSize * 0.5f, MinimapSize * 0.5f);

    FVector PlayerPos = Pawn->GetActorLocation();
    float ZoomRange = ZoomLevels.IsValidIndex(CurrentZoomIndex) ? ZoomLevels[CurrentZoomIndex] : 10000.f;

    // Offset in world space
    float DX = WorldPos.X - PlayerPos.X;
    float DY = WorldPos.Y - PlayerPos.Y;

    // Map to minimap pixel coordinates (centered)
    float HalfSize = MinimapSize * 0.5f;
    float Scale = MinimapSize / ZoomRange;

    return FVector2D(
        HalfSize + DX * Scale,
        HalfSize - DY * Scale  // Y is inverted in screen space
    );
}

FLinearColor UInsimulMinimap::GetMarkerColor(EMinimapMarkerType Type) const
{
    switch (Type)
    {
    case EMinimapMarkerType::Player:       return FLinearColor::White;
    case EMinimapMarkerType::NPC_Friendly: return FLinearColor::Green;
    case EMinimapMarkerType::NPC_Hostile:  return FLinearColor::Red;
    case EMinimapMarkerType::Quest:        return FLinearColor(1.f, 0.9f, 0.f, 1.f); // Yellow
    case EMinimapMarkerType::Building:     return FLinearColor(0.5f, 0.5f, 0.5f, 1.f); // Gray
    default:                               return FLinearColor::White;
    }
}
