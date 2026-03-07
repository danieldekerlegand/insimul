#include "InventorySystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UInventorySystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] InventorySystem initialized"));
}

void UInventorySystem::Deinitialize()
{
    Super::Deinitialize();
}

void UInventorySystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    UE_LOG(LogTemp, Log, TEXT("[Insimul] InventorySystem loaded from IR"));
}

bool UInventorySystem::AddItem(const FString& ItemId, int32 Count)
{
    // TODO: Add item stacks to inventory, respect MaxSlots
    UE_LOG(LogTemp, Log, TEXT("[Insimul] AddItem: %s x%d"), *ItemId, Count);
    return true;
}

bool UInventorySystem::RemoveItem(const FString& ItemId, int32 Count)
{
    // TODO: Remove item stacks from inventory
    UE_LOG(LogTemp, Log, TEXT("[Insimul] RemoveItem: %s x%d"), *ItemId, Count);
    return true;
}

int32 UInventorySystem::GetItemCount(const FString& ItemId)
{
    // TODO: Return count of ItemId in inventory
    return 0;
}
