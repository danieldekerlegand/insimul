#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ActionSystem.generated.h"

/**
 * Manages available actions and their execution
 * Ported from Insimul's Babylon.js ActionSystem to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API UActionSystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|ActionSystem")
    void LoadFromIR(const FString& JsonString);

    UPROPERTY(BlueprintReadOnly, Category = "Actions")
    int32 ActionCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Actions")
    bool ExecuteAction(const FString& ActionId, AActor* Source, AActor* Target);
};
