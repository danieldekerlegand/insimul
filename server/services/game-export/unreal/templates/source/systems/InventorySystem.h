#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "InventorySystem.generated.h"

/**
 * Player inventory with item stacks
 * Ported from Insimul's Babylon.js InventorySystem to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API UInventorySystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|InventorySystem")
    void LoadFromIR(const FString& JsonString);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Inventory")
    int32 MaxSlots = 20;

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool AddItem(const FString& ItemId, int32 Count);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool RemoveItem(const FString& ItemId, int32 Count);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    int32 GetItemCount(const FString& ItemId);
};
