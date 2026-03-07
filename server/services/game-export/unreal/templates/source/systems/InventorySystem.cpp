#include "InventorySystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UInventorySystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    PlayerGold = 100;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] InventorySystem initialized (gold: %d)"), PlayerGold);
}

void UInventorySystem::Deinitialize()
{
    Items.Empty();
    Super::Deinitialize();
}

void UInventorySystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    UE_LOG(LogTemp, Log, TEXT("[Insimul] InventorySystem loaded from IR"));
}

// --- Item helpers ---

FInsimulInventoryItem* UInventorySystem::FindItem(const FString& ItemId)
{
    return Items.FindByPredicate([&](const FInsimulInventoryItem& I) { return I.ItemId == ItemId; });
}

const FInsimulInventoryItem* UInventorySystem::FindItem(const FString& ItemId) const
{
    return Items.FindByPredicate([&](const FInsimulInventoryItem& I) { return I.ItemId == ItemId; });
}

// --- Item Management ---

bool UInventorySystem::AddItem(const FInsimulInventoryItem& Item)
{
    if (FInsimulInventoryItem* Existing = FindItem(Item.ItemId))
    {
        Existing->Quantity += Item.Quantity;
    }
    else
    {
        if (Items.Num() >= MaxSlots) return false;
        Items.Add(Item);
    }
    OnItemAdded.Broadcast(Item.ItemId, Item.Quantity);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] AddItem: %s x%d (value: %d)"), *Item.ItemId, Item.Quantity, Item.Value);
    return true;
}

bool UInventorySystem::AddItemById(const FString& ItemId, int32 Count)
{
    FInsimulInventoryItem NewItem;
    NewItem.ItemId = ItemId;
    NewItem.Name = ItemId;
    NewItem.Quantity = Count;
    return AddItem(NewItem);
}

bool UInventorySystem::RemoveItem(const FString& ItemId, int32 Count)
{
    FInsimulInventoryItem* Existing = FindItem(ItemId);
    if (!Existing || Existing->Quantity < Count) return false;
    Existing->Quantity -= Count;
    if (Existing->Quantity <= 0)
    {
        Items.RemoveAll([&](const FInsimulInventoryItem& I) { return I.ItemId == ItemId; });
    }
    OnItemRemoved.Broadcast(ItemId, Count);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] RemoveItem: %s x%d"), *ItemId, Count);
    return true;
}

bool UInventorySystem::DropItem(const FString& ItemId)
{
    const FInsimulInventoryItem* Existing = FindItem(ItemId);
    if (!Existing) return false;
    if (Existing->Type == EInsimulItemType::Quest) return false; // Cannot drop quest items

    FInsimulInventoryItem Copy = *Existing;
    RemoveItem(ItemId, 1);
    OnItemDropped.Broadcast(Copy);
    return true;
}

bool UInventorySystem::UseItem(const FString& ItemId)
{
    const FInsimulInventoryItem* Existing = FindItem(ItemId);
    if (!Existing) return false;
    if (Existing->Type != EInsimulItemType::Consumable) return false;

    FInsimulInventoryItem Copy = *Existing;
    RemoveItem(ItemId, 1);
    OnItemUsed.Broadcast(Copy);
    return true;
}

int32 UInventorySystem::GetItemCount(const FString& ItemId) const
{
    const FInsimulInventoryItem* Existing = FindItem(ItemId);
    return Existing ? Existing->Quantity : 0;
}

bool UInventorySystem::HasItem(const FString& ItemId) const
{
    return FindItem(ItemId) != nullptr;
}

TArray<FInsimulInventoryItem> UInventorySystem::GetAllItems() const
{
    return Items;
}

// --- Gold Management ---

void UInventorySystem::SetGold(int32 Amount)
{
    PlayerGold = FMath::Max(0, Amount);
    OnGoldChanged.Broadcast(PlayerGold);
}

void UInventorySystem::AddGold(int32 Amount)
{
    PlayerGold += Amount;
    OnGoldChanged.Broadcast(PlayerGold);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] AddGold: +%d (total: %d)"), Amount, PlayerGold);
}

bool UInventorySystem::RemoveGold(int32 Amount)
{
    if (PlayerGold < Amount) return false;
    PlayerGold -= Amount;
    OnGoldChanged.Broadcast(PlayerGold);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] RemoveGold: -%d (total: %d)"), Amount, PlayerGold);
    return true;
}
