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

    /** Whether a Prolog knowledge base is attached for enhanced rule evaluation */
    UPROPERTY(BlueprintReadOnly, Category = "Rules")
    bool bHasPrologKB = false;

    UFUNCTION(BlueprintCallable, Category = "Rules")
    TArray<FString> EvaluateRules(const FString& Context);

    /** Check if an action is allowed, consulting Prolog KB when available */
    UFUNCTION(BlueprintCallable, Category = "Rules")
    bool CanPerformAction(const FString& ActionId, const FString& ActionType, const FString& Context);

    /** Attach a Prolog knowledge base string for logic-based rule evaluation */
    UFUNCTION(BlueprintCallable, Category = "Rules")
    void SetPrologKnowledgeBase(const FString& PrologContent);
};
