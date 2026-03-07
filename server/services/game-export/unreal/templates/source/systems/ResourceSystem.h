#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ResourceSystem.generated.h"

/**
 * Resource gathering and node management
 * Ported from Insimul's Babylon.js ResourceSystem to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API UResourceSystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|ResourceSystem")
    void LoadFromIR(const FString& JsonString);

    UPROPERTY(BlueprintReadOnly, Category = "Resources")
    int32 ResourceTypeCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Resources")
    bool GatherResource(const FString& NodeId);
};
