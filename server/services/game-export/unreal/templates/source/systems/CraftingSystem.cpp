#include "CraftingSystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UCraftingSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] CraftingSystem initialized"));
}

void UCraftingSystem::Deinitialize()
{
    Super::Deinitialize();
}

void UCraftingSystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    UE_LOG(LogTemp, Log, TEXT("[Insimul] CraftingSystem loaded from IR"));
}

bool UCraftingSystem::CanCraft(const FString& RecipeId)
{
    // TODO: Check if player has required materials
    return false;
}

bool UCraftingSystem::Craft(const FString& RecipeId)
{
    // TODO: Consume materials and produce item
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Craft: %s"), *RecipeId);
    return false;
}
