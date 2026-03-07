#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "CraftingSystem.generated.h"

/**
 * Recipe-based crafting
 * Ported from Insimul's Babylon.js CraftingSystem to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API UCraftingSystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|CraftingSystem")
    void LoadFromIR(const FString& JsonString);

    UFUNCTION(BlueprintCallable, Category = "Crafting")
    bool CanCraft(const FString& RecipeId);

    UFUNCTION(BlueprintCallable, Category = "Crafting")
    bool Craft(const FString& RecipeId);
};
