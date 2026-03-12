// Copyright Insimul. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "InsimulTypes.h"
#include "InsimulFaceSync.generated.h"

/**
 * UInsimulFaceSync — Applies viseme data from the Insimul conversation
 * service to morph targets on a SkeletalMeshComponent for lip sync.
 *
 * Supports Oculus OVR 15-viseme format and smooth interpolation.
 */
UCLASS(ClassGroup = (Insimul), meta = (BlueprintSpawnableComponent))
class INSIMUL_API UInsimulFaceSync : public UActorComponent
{
    GENERATED_BODY()

public:
    UInsimulFaceSync();

    // ── Configuration ─────────────────────────────────────────────────────

    /** Interpolation speed for viseme blending (higher = snappier) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|FaceSync", meta = (ClampMin = "1.0", ClampMax = "30.0"))
    float BlendSpeed = 12.0f;

    /** Name of the skeletal mesh component to target (empty = auto-find first SkeletalMeshComponent) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|FaceSync")
    FName TargetMeshComponentName;

    // ── Viseme Morph Target Mapping ───────────────────────────────────────

    /**
     * Maps Oculus OVR viseme names to morph target names on the skeletal mesh.
     * Default names follow common conventions; override per-character as needed.
     *
     * Standard 15 OVR visemes: sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|FaceSync")
    TMap<FString, FName> VisemeToMorphTarget;

    // ── Control ───────────────────────────────────────────────────────────

    /** Apply a set of visemes (called by InsimulChatbotComponent when facial data arrives) */
    UFUNCTION(BlueprintCallable, Category = "Insimul|FaceSync")
    void ApplyVisemes(const FInsimulFacialData& FacialData);

    /** Reset all viseme morph targets to zero */
    UFUNCTION(BlueprintCallable, Category = "Insimul|FaceSync")
    void ResetVisemes();

    /** Check if lip sync is currently active */
    UFUNCTION(BlueprintPure, Category = "Insimul|FaceSync")
    bool IsActive() const { return bIsActive; }

protected:
    virtual void BeginPlay() override;
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    bool bIsActive = false;

    /** Current viseme weights (interpolated) */
    TMap<FName, float> CurrentWeights;

    /** Target viseme weights (from latest facial data) */
    TMap<FName, float> TargetWeights;

    /** Time remaining on current viseme set */
    float VisemeTimeRemaining = 0.0f;

    /** Cached reference to the target skeletal mesh */
    UPROPERTY()
    TObjectPtr<class USkeletalMeshComponent> TargetMesh;

    void FindTargetMesh();
    void InitializeDefaultMorphTargetMapping();
    void InterpolateWeights(float DeltaTime);
    void ApplyWeightsToMesh();
};
