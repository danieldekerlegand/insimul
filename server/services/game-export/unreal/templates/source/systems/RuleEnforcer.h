#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "RuleEnforcer.generated.h"

/**
 * Evaluates and enforces game rules
 * Ported from Insimul's Babylon.js RuleEnforcer to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API URuleEnforcer : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|RuleEnforcer")
    void LoadFromIR(const FString& JsonString);

    UPROPERTY(BlueprintReadOnly, Category = "Rules")
    int32 RuleCount = 0;

    UFUNCTION(BlueprintCallable, Category = "Rules")
    TArray<FString> EvaluateRules(const FString& Context);
};
