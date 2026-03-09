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

bool URuleEnforcer::CanPerformAction(const FString& ActionId, const FString& ActionType, const FString& Context)
{
    // If Prolog KB is attached, it would be consulted first for rules with prologContent.
    // Falls through to standard rule evaluation.
    if (bHasPrologKB)
    {
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Consulting Prolog KB for action %s"), *ActionId);
        // TODO: Integrate Prolog evaluation (e.g. via embedded SWI-Prolog or external query)
    }

    // Standard rule check — evaluate all active rules against action context
    TArray<FString> Violations = EvaluateRules(Context);
    return Violations.Num() == 0;
}

void URuleEnforcer::SetPrologKnowledgeBase(const FString& PrologContent)
{
    bHasPrologKB = !PrologContent.IsEmpty();
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Prolog KB %s (%d chars)"),
        bHasPrologKB ? TEXT("attached") : TEXT("cleared"), PrologContent.Len());
    // TODO: Parse and store Prolog clauses for rule_applies/3 queries
}
