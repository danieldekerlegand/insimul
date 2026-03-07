#include "ResourceSystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UResourceSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ResourceSystem initialized"));
}

void UResourceSystem::Deinitialize()
{
    Super::Deinitialize();
}

void UResourceSystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    const TSharedPtr<FJsonObject>* ResObj;
    if (Root->TryGetObjectField(TEXT("resources"), ResObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* DefsArr;
        if ((*ResObj)->TryGetArrayField(TEXT("definitions"), DefsArr))
        {
            ResourceTypeCount = DefsArr->Num();
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d resource types"), ResourceTypeCount);
        }
    }
}

bool UResourceSystem::GatherResource(const FString& NodeId)
{
    // TODO: Deplete resource node and add to inventory
    UE_LOG(LogTemp, Log, TEXT("[Insimul] GatherResource: %s"), *NodeId);
    return true;
}
