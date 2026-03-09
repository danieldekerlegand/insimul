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
    Rules.Empty();
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

TArray<FString> URuleEnforcer::EvaluateRules(const FInsimulGameContext& Context)
{
    TArray<FString> Violations;

    for (const FInsimulRule& Rule : Rules)
    {
        if (!Rule.bIsActive) continue;
        if (Rule.RuleType != TEXT("trigger") && Rule.RuleType != TEXT("volition")) continue;

        if (CheckRuleConditions(Rule, Context))
        {
            const FInsimulRuleEffect* Restriction = FindRestriction(Rule, Context.ActionType);
            if (Restriction)
            {
                FString Msg = Restriction->Message.IsEmpty()
                    ? FString::Printf(TEXT("Action violates rule: %s"), *Rule.Name)
                    : Restriction->Message;
                Violations.Add(Msg);
            }
        }
    }

    return Violations;
}

bool URuleEnforcer::CanPerformAction(const FString& ActionId, const FString& ActionType, const FInsimulGameContext& Context)
{
    if (bHasPrologKB)
    {
        UE_LOG(LogTemp, Verbose, TEXT("[Insimul] Consulting Prolog KB for action %s"), *ActionId);
    }

    FInsimulGameContext Ctx = Context;
    Ctx.ActionId = ActionId;
    Ctx.ActionType = ActionType;

    TArray<FString> Violations = EvaluateRules(Ctx);
    return Violations.Num() == 0;
}

void URuleEnforcer::SetPrologKnowledgeBase(const FString& PrologContent)
{
    bHasPrologKB = !PrologContent.IsEmpty();
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Prolog KB %s (%d chars)"),
        bHasPrologKB ? TEXT("attached") : TEXT("cleared"), PrologContent.Len());
}

// --- Condition evaluation ---

bool URuleEnforcer::CheckRuleConditions(const FInsimulRule& Rule, const FInsimulGameContext& Context) const
{
    if (Rule.Conditions.Num() == 0) return true;

    for (const FInsimulRuleCondition& Cond : Rule.Conditions)
    {
        if (!EvaluateCondition(Cond, Context)) return false;
    }
    return true;
}

bool URuleEnforcer::EvaluateCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    switch (Condition.Type)
    {
        case EInsimulConditionType::Location: return CheckLocationCondition(Condition, Context);
        case EInsimulConditionType::Zone:     return CheckZoneCondition(Condition, Context);
        case EInsimulConditionType::Action:   return CheckActionCondition(Condition, Context);
        case EInsimulConditionType::Energy:   return CheckEnergyCondition(Condition, Context);
        case EInsimulConditionType::Proximity: return Context.bNearNPC;
        case EInsimulConditionType::Tag:      return true;
        case EInsimulConditionType::HasItem:   return CheckHasItemCondition(Condition, Context);
        case EInsimulConditionType::ItemCount: return CheckItemCountCondition(Condition, Context);
        case EInsimulConditionType::ItemType:  return CheckItemTypeCondition(Condition, Context);
        default: return true;
    }
}

bool URuleEnforcer::CheckLocationCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    if (Condition.Location == TEXT("settlement")) return Context.bInSettlement;
    if (Condition.Location == TEXT("wilderness")) return !Context.bInSettlement;
    return true;
}

bool URuleEnforcer::CheckZoneCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    if (Condition.Zone == TEXT("safe") || Condition.Zone == TEXT("settlement")) return Context.bInSettlement;
    if (Condition.Zone == TEXT("combat") || Condition.Zone == TEXT("wilderness")) return !Context.bInSettlement;
    return true;
}

bool URuleEnforcer::CheckActionCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    if (!Condition.Action.IsEmpty())
    {
        return Context.ActionType == Condition.Action || Context.ActionId == Condition.Action;
    }
    return true;
}

bool URuleEnforcer::CheckEnergyCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    if (Context.PlayerEnergy < 0.f) return true;
    return CompareValue(Context.PlayerEnergy, Condition.Value, Condition.Operator.IsEmpty() ? TEXT(">=") : Condition.Operator);
}

bool URuleEnforcer::CheckHasItemCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    if (Context.PlayerInventory.Num() == 0) return false;

    for (const FInsimulInventoryItem& Item : Context.PlayerInventory)
    {
        if (!Condition.ItemId.IsEmpty() && Item.ItemId == Condition.ItemId) return true;
        if (!Condition.ItemName.IsEmpty() && Item.Name.ToLower() == Condition.ItemName.ToLower()) return true;
    }
    return false;
}

bool URuleEnforcer::CheckItemCountCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    if (Context.PlayerInventory.Num() == 0) return false;

    int32 Qty = 0;
    for (const FInsimulInventoryItem& Item : Context.PlayerInventory)
    {
        if ((!Condition.ItemId.IsEmpty() && Item.ItemId == Condition.ItemId) ||
            (!Condition.ItemName.IsEmpty() && Item.Name.ToLower() == Condition.ItemName.ToLower()))
        {
            Qty = Item.Quantity;
            break;
        }
    }

    float Required = (float)Condition.Quantity;
    return CompareValue((float)Qty, Required, Condition.Operator.IsEmpty() ? TEXT(">=") : Condition.Operator);
}

bool URuleEnforcer::CheckItemTypeCondition(const FInsimulRuleCondition& Condition, const FInsimulGameContext& Context) const
{
    if (Context.PlayerInventory.Num() == 0 || Condition.ItemType.IsEmpty()) return false;

    // Map string type name to enum
    static const TMap<FString, EInsimulItemType> TypeMap = {
        {TEXT("quest"), EInsimulItemType::Quest},
        {TEXT("collectible"), EInsimulItemType::Collectible},
        {TEXT("key"), EInsimulItemType::Key},
        {TEXT("consumable"), EInsimulItemType::Consumable},
        {TEXT("weapon"), EInsimulItemType::Weapon},
        {TEXT("armor"), EInsimulItemType::Armor},
        {TEXT("food"), EInsimulItemType::Food},
        {TEXT("drink"), EInsimulItemType::Drink},
        {TEXT("material"), EInsimulItemType::Material},
        {TEXT("tool"), EInsimulItemType::Tool},
    };

    const EInsimulItemType* TargetType = TypeMap.Find(Condition.ItemType.ToLower());
    if (!TargetType) return false;

    for (const FInsimulInventoryItem& Item : Context.PlayerInventory)
    {
        if (Item.Type == *TargetType) return true;
    }
    return false;
}

bool URuleEnforcer::CompareValue(float Actual, float Expected, const FString& Operator) const
{
    if (Operator == TEXT(">"))  return Actual > Expected;
    if (Operator == TEXT(">=")) return Actual >= Expected;
    if (Operator == TEXT("<"))  return Actual < Expected;
    if (Operator == TEXT("<=")) return Actual <= Expected;
    if (Operator == TEXT("==")) return FMath::IsNearlyEqual(Actual, Expected);
    return Actual >= Expected;
}

const FInsimulRuleEffect* URuleEnforcer::FindRestriction(const FInsimulRule& Rule, const FString& ActionType) const
{
    for (const FInsimulRuleEffect& Effect : Rule.Effects)
    {
        if (Effect.Type == TEXT("restrict") || Effect.Type == TEXT("prevent") || Effect.Type == TEXT("block"))
        {
            if (Effect.Action.IsEmpty() || Effect.Action == ActionType || Effect.Action == TEXT("all"))
            {
                return &Effect;
            }
        }
    }
    return nullptr;
}
