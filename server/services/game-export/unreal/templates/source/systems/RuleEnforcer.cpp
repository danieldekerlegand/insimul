#include "RuleEnforcer.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void URuleEnforcer::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] RuleEnforcer initialized"));
}

void URuleEnforcer::Deinitialize()
{
    Super::Deinitialize();
}

void URuleEnforcer::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    const TSharedPtr<FJsonObject>* SystemsObj;
    if (Root->TryGetObjectField(TEXT("systems"), SystemsObj))
    {
        const TArray<TSharedPtr<FJsonValue>>* RulesArr;
        if ((*SystemsObj)->TryGetArrayField(TEXT("rules"), RulesArr))
        {
            RuleCount = RulesArr->Num();
        }
        const TArray<TSharedPtr<FJsonValue>>* BaseArr;
        if ((*SystemsObj)->TryGetArrayField(TEXT("baseRules"), BaseArr))
        {
            RuleCount += BaseArr->Num();
        }
        UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d rules"), RuleCount);
    }
}

TArray<FString> URuleEnforcer::EvaluateRules(const FString& Context)
{
    // TODO: Evaluate loaded rules against the given context
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EvaluateRules: %s"), *Context);
    return TArray<FString>();
}
