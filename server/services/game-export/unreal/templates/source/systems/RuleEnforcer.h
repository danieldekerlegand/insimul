#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "InventorySystem.h"
#include "RuleEnforcer.generated.h"

/**
 * Rule condition types matching Insimul's shared RuleCondition.type enum.
 */
UENUM(BlueprintType)
enum class EInsimulConditionType : uint8
{
    Location    UMETA(DisplayName = "Location"),
    Zone        UMETA(DisplayName = "Zone"),
    Action      UMETA(DisplayName = "Action"),
    Energy      UMETA(DisplayName = "Energy"),
    Proximity   UMETA(DisplayName = "Proximity"),
    Tag         UMETA(DisplayName = "Tag"),
    HasItem     UMETA(DisplayName = "Has Item"),
    ItemCount   UMETA(DisplayName = "Item Count"),
    ItemType    UMETA(DisplayName = "Item Type")
};

/**
 * A single rule condition.
 */
USTRUCT(BlueprintType)
struct FInsimulRuleCondition
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulConditionType Type = EInsimulConditionType::Action;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Location;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Zone;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Action;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Operator;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Value = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 1;
};

/**
 * A single rule effect.
 */
USTRUCT(BlueprintType)
struct FInsimulRuleEffect
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Type;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Action;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Message;
};

/**
 * A game rule with conditions and effects.
 */
USTRUCT(BlueprintType)
struct FInsimulRule
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString RuleType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Category;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Priority = 5;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bIsActive = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FInsimulRuleCondition> Conditions;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FInsimulRuleEffect> Effects;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PrologContent;
};

/**
 * Game context for rule evaluation.
 */
USTRUCT(BlueprintType)
struct FInsimulGameContext
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PlayerId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ActionId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ActionType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector PlayerPosition = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float PlayerEnergy = -1.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bInSettlement = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bNearNPC = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString TargetNPCId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FInsimulInventoryItem> PlayerInventory;
};

/**
 * Evaluates and enforces game rules with item condition support.
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
    TArray<FString> EvaluateRules(const FInsimulGameContext& Context);

    /** Check if an action is allowed, consulting Prolog KB when available */
    UFUNCTION(BlueprintCallable, Category = "Rules")
    bool CanPerformAction(const FString& ActionId, const FString& ActionType, const FInsimulGameContext& Context);

    /** Attach a Prolog knowledge base string for logic-based rule evaluation */
    UFUNCTION(BlueprintCallable, Category = "Rules")
    void SetPrologKnowledgeBase(const FString& PrologContent);

private:
    UPROPERTY()
    TArray<FInsimulRule> Rules;

    bool CheckRuleConditions(const FInsimulRule& Rule, const FInsimulGameContext& Context) const;
    bool EvaluateCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    bool CheckLocationCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    bool CheckZoneCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    bool CheckActionCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    bool CheckEnergyCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    bool CheckHasItemCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    bool CheckItemCountCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    bool CheckItemTypeCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const;
    const FInsimulRuleEffect* FindRestriction(const FInsimulRule& Rule, const FString& ActionType) const;
    bool CompareValue(float Actual, float Expected, const FString& Operator) const;
};
