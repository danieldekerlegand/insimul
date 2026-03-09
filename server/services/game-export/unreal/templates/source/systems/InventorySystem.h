#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "InventorySystem.generated.h"

/**
 * Item types matching Insimul's shared ItemType enum.
 */
UENUM(BlueprintType)
enum class EInsimulItemType : uint8
{
    Quest        UMETA(DisplayName = "Quest"),
    Collectible  UMETA(DisplayName = "Collectible"),
    Key          UMETA(DisplayName = "Key"),
    Consumable   UMETA(DisplayName = "Consumable"),
    Weapon       UMETA(DisplayName = "Weapon"),
    Armor        UMETA(DisplayName = "Armor"),
    Food         UMETA(DisplayName = "Food"),
    Drink        UMETA(DisplayName = "Drink"),
    Material     UMETA(DisplayName = "Material"),
    Tool         UMETA(DisplayName = "Tool")
};

/**
 * Equipment slot types.
 */
UENUM(BlueprintType)
enum class EInsimulEquipSlot : uint8
{
    None      UMETA(DisplayName = "None"),
    Weapon    UMETA(DisplayName = "Weapon"),
    Armor     UMETA(DisplayName = "Armor"),
    Accessory UMETA(DisplayName = "Accessory")
};

/**
 * A single inventory item with value/trade metadata and equipment support.
 */
USTRUCT(BlueprintType)
struct FInsimulInventoryItem
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Description;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulItemType Type = EInsimulItemType::Collectible;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 1;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Value = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 SellValue = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float Weight = 0.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bTradeable = true;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bEquipped = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulEquipSlot EquipSlot = EInsimulEquipSlot::None;

    /** Effects map: keys like "attackPower", "defense", "health", "energy" */
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TMap<FString, float> Effects;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnItemChanged, const FString&, ItemId, int32, Count);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGoldChanged, int32, NewGold);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnItemDropped, const FInsimulInventoryItem&, Item);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnItemUsed, const FInsimulInventoryItem&, Item);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnItemEquipped, const FInsimulInventoryItem&, Item, EInsimulEquipSlot, Slot);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnItemUnequipped, const FInsimulInventoryItem&, Item, EInsimulEquipSlot, Slot);

/**
 * Player inventory with item stacks, gold, equipment slots, and mercantile support.
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

    // --- Item Management ---

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool AddItem(const FInsimulInventoryItem& Item);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool AddItemById(const FString& ItemId, int32 Count);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool RemoveItem(const FString& ItemId, int32 Count);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool DropItem(const FString& ItemId);

    UFUNCTION(BlueprintCallable, Category = "Inventory")
    bool UseItem(const FString& ItemId);

    UFUNCTION(BlueprintPure, Category = "Inventory")
    int32 GetItemCount(const FString& ItemId) const;

    UFUNCTION(BlueprintPure, Category = "Inventory")
    bool HasItem(const FString& ItemId) const;

    UFUNCTION(BlueprintPure, Category = "Inventory")
    TArray<FInsimulInventoryItem> GetAllItems() const;

    // --- Equipment Management ---

    UFUNCTION(BlueprintCallable, Category = "Inventory|Equipment")
    bool EquipItem(const FString& ItemId);

    UFUNCTION(BlueprintCallable, Category = "Inventory|Equipment")
    bool UnequipSlot(EInsimulEquipSlot Slot);

    UFUNCTION(BlueprintPure, Category = "Inventory|Equipment")
    FInsimulInventoryItem GetEquippedItem(EInsimulEquipSlot Slot) const;

    UFUNCTION(BlueprintPure, Category = "Inventory|Equipment")
    bool HasEquippedInSlot(EInsimulEquipSlot Slot) const;

    // --- Gold Management ---

    UFUNCTION(BlueprintPure, Category = "Inventory|Gold")
    int32 GetGold() const { return PlayerGold; }

    UFUNCTION(BlueprintCallable, Category = "Inventory|Gold")
    void SetGold(int32 Amount);

    UFUNCTION(BlueprintCallable, Category = "Inventory|Gold")
    void AddGold(int32 Amount);

    UFUNCTION(BlueprintCallable, Category = "Inventory|Gold")
    bool RemoveGold(int32 Amount);

    // --- Delegates ---

    UPROPERTY(BlueprintAssignable, Category = "Inventory")
    FOnItemChanged OnItemAdded;

    UPROPERTY(BlueprintAssignable, Category = "Inventory")
    FOnItemChanged OnItemRemoved;

    UPROPERTY(BlueprintAssignable, Category = "Inventory")
    FOnGoldChanged OnGoldChanged;

    UPROPERTY(BlueprintAssignable, Category = "Inventory")
    FOnItemDropped OnItemDropped;

    UPROPERTY(BlueprintAssignable, Category = "Inventory")
    FOnItemUsed OnItemUsed;

    UPROPERTY(BlueprintAssignable, Category = "Inventory|Equipment")
    FOnItemEquipped OnItemEquipped;

    UPROPERTY(BlueprintAssignable, Category = "Inventory|Equipment")
    FOnItemUnequipped OnItemUnequipped;

private:
    UPROPERTY()
    TArray<FInsimulInventoryItem> Items;

    UPROPERTY()
    int32 PlayerGold = 100;

    /** Equipped items by slot */
    UPROPERTY()
    TMap<EInsimulEquipSlot, FString> EquippedSlots;

    FInsimulInventoryItem* FindItem(const FString& ItemId);
    const FInsimulInventoryItem* FindItem(const FString& ItemId) const;
    EInsimulEquipSlot GetSlotForType(EInsimulItemType Type) const;
};
