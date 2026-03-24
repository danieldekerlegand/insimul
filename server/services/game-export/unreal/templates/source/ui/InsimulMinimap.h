#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/Image.h"
#include "Components/CanvasPanel.h"
#include "Components/Overlay.h"
#include "Engine/TextureRenderTarget2D.h"
#include "InsimulMinimap.generated.h"

/** Marker type for minimap icons. */
UENUM(BlueprintType)
enum class EMinimapMarkerType : uint8
{
    Player       UMETA(DisplayName = "Player"),
    NPC_Friendly UMETA(DisplayName = "Friendly NPC"),
    NPC_Hostile  UMETA(DisplayName = "Hostile NPC"),
    Quest        UMETA(DisplayName = "Quest"),
    Building     UMETA(DisplayName = "Building"),
};

/** A single marker on the minimap. */
USTRUCT(BlueprintType)
struct FMinimapMarker
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadWrite) FString Id;
    UPROPERTY(BlueprintReadWrite) EMinimapMarkerType Type = EMinimapMarkerType::Building;
    UPROPERTY(BlueprintReadWrite) FVector WorldPosition = FVector::ZeroVector;
    UPROPERTY(BlueprintReadWrite) FString Label;
};

/**
 * UMG minimap widget.
 *
 * Uses a SceneCaptureComponent2D (owned by a helper actor) to render a
 * top-down view into a RenderTarget, displayed inside a circular mask.
 * Overlay markers track actors and POIs each tick.
 */
UCLASS()
class INSIMULEXPORT_API UInsimulMinimap : public UUserWidget
{
    GENERATED_BODY()

public:
    // ── Configuration ──────────────────────────────────────────────

    /** Render target that receives the top-down capture. */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
    UTextureRenderTarget2D* MinimapRenderTarget;

    /** Minimap widget size in pixels. */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
    float MinimapSize = {{MINIMAP_SIZE}};

    /** Available zoom distances (world units from camera to ground). */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Minimap")
    TArray<float> ZoomLevels;

    /** Index into ZoomLevels. */
    UPROPERTY(BlueprintReadOnly, Category = "Minimap")
    int32 CurrentZoomIndex = 1;

    // ── Markers ────────────────────────────────────────────────────

    /** Active markers rendered on the overlay. */
    UPROPERTY(BlueprintReadOnly, Category = "Minimap")
    TArray<FMinimapMarker> Markers;

    // ── Blueprint-bindable widgets (set via BindWidget) ────────────

    UPROPERTY(meta = (BindWidget)) UImage* MinimapImage;
    UPROPERTY(meta = (BindWidget)) UCanvasPanel* MarkerCanvas;
    UPROPERTY(meta = (BindWidget)) UImage* PlayerArrow;
    UPROPERTY(meta = (BindWidget)) UOverlay* CompassOverlay;

    // ── Public API ─────────────────────────────────────────────────

    UFUNCTION(BlueprintCallable, Category = "Minimap")
    void InitializeMinimap();

    UFUNCTION(BlueprintCallable, Category = "Minimap")
    void AddMarker(const FString& Id, EMinimapMarkerType Type, FVector WorldPos, const FString& Label);

    UFUNCTION(BlueprintCallable, Category = "Minimap")
    void RemoveMarker(const FString& Id);

    UFUNCTION(BlueprintCallable, Category = "Minimap")
    void ZoomIn();

    UFUNCTION(BlueprintCallable, Category = "Minimap")
    void ZoomOut();

    UFUNCTION(BlueprintCallable, Category = "Minimap")
    void SetVisible(bool bVisible);

protected:
    virtual void NativeConstruct() override;
    virtual void NativeTick(const FGeometry& MyGeometry, float InDeltaTime) override;

private:
    /** Spawned scene-capture actor (orthographic, top-down). */
    UPROPERTY() AActor* CaptureActor = nullptr;

    void CreateSceneCapture();
    void UpdateCapturePosition();
    void RefreshMarkers();
    void UpdateCompass();
    FVector2D WorldToMinimap(FVector WorldPos) const;
    FLinearColor GetMarkerColor(EMinimapMarkerType Type) const;
};
