#include "SurvivalSystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void USurvivalSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] SurvivalSystem initialized"));
}

void USurvivalSystem::Deinitialize()
{
    Super::Deinitialize();
}

void USurvivalSystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    const TSharedPtr<FJsonObject>* SurvObj;
    if (Root->TryGetObjectField(TEXT("survival"), SurvObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* NeedsArr;
        if ((*SurvObj)->TryGetArrayField(TEXT("needs"), NeedsArr))
        {
            NeedCount = NeedsArr->Num();
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d survival needs"), NeedCount);
        }
    }
}

float USurvivalSystem::GetNeedValue(const FString& NeedId)
{
    // TODO: Return current value for the given need
    return 100.f;
}

void USurvivalSystem::ModifyNeed(const FString& NeedId, float Delta)
{
    // TODO: Adjust need value and clamp
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ModifyNeed: %s by %.1f"), *NeedId, Delta);
}
