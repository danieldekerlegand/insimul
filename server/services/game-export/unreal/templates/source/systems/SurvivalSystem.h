#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "../data/GameTypes.h"
#include "SurvivalSystem.generated.h"

/**
 * Survival needs (hunger, thirst, temperature, stamina, sleep)
 * Ported from Insimul's Babylon.js SurvivalSystem to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API USurvivalSystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|SurvivalSystem")
    void LoadFromIR(const FString& JsonString);

    UPROPERTY(BlueprintReadOnly, Category = "Survival")
    int32 NeedCount = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Survival")
    FInsimulSurvivalDamageConfig DamageConfig;

    UPROPERTY(BlueprintReadOnly, Category = "Survival")
    FInsimulTemperatureConfig TemperatureConfig;

    UPROPERTY(BlueprintReadOnly, Category = "Survival")
    FInsimulStaminaConfig StaminaConfig;

    UPROPERTY(BlueprintReadOnly, Category = "Survival")
    TArray<FInsimulSurvivalModifierPreset> ModifierPresets;

    UFUNCTION(BlueprintCallable, Category = "Survival")
    float GetNeedValue(const FString& NeedId);

    UFUNCTION(BlueprintCallable, Category = "Survival")
    void ModifyNeed(const FString& NeedId, float Delta);
};
