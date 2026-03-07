#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "ActionSystem.generated.h"

/**
 * Effect produced by an action execution.
 */
USTRUCT(BlueprintType)
struct FInsimulActionEffect
{
    GENERATED_BODY()

    /** Effect type: relationship, attribute, status, event, item, knowledge, gold */
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Type;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Target;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Value = 0.f;
    /** For item effects: the item identifier */
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    /** For item effects: quantity to give/take */
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 0;
};

/**
 * Result of executing an action.
 */
USTRUCT(BlueprintType)
struct FInsimulActionResult
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly) bool bSuccess = false;
    UPROPERTY(BlueprintReadOnly) FString Message;
    UPROPERTY(BlueprintReadOnly) int32 EnergyUsed = 0;
    UPROPERTY(BlueprintReadOnly) TArray<FInsimulActionEffect> Effects;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGoldEffectApplied, int32, Amount);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnItemEffectApplied, const FString&, ItemId, int32, Quantity);

/**
 * Manages available actions and their execution.
 * Ported from Insimul's Babylon.js ActionManager to Unreal subsystem.
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
    FInsimulActionResult ExecuteAction(const FString& ActionId, AActor* Source, AActor* Target);

    /** Fired when an action produces a gold effect the game should apply. */
    UPROPERTY(BlueprintAssignable, Category = "Actions")
    FOnGoldEffectApplied OnGoldEffect;

    /** Fired when an action produces an item effect the game should apply. */
    UPROPERTY(BlueprintAssignable, Category = "Actions")
    FOnItemEffectApplied OnItemEffect;
};
