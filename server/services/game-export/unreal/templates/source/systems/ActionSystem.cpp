#include "ActionSystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UActionSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ActionSystem initialized"));
}

void UActionSystem::Deinitialize()
{
    Super::Deinitialize();
}

void UActionSystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    const TSharedPtr<FJsonObject>* SystemsObj;
    if (!Root->TryGetObjectField(TEXT("systems"), SystemsObj)) return;

    const TArray<TSharedPtr<FJsonValue>>* ActionsArr;
    if ((*SystemsObj)->TryGetArrayField(TEXT("actions"), ActionsArr))
    {
        for (const auto& Val : *ActionsArr)
        {
            if (Val.IsValid() && Val->Type == EJson::Object)
                ParsedActions.Add(Val->AsObject());
        }
    }

    const TArray<TSharedPtr<FJsonValue>>* BaseArr;
    if ((*SystemsObj)->TryGetArrayField(TEXT("baseActions"), BaseArr))
    {
        for (const auto& Val : *BaseArr)
        {
            if (Val.IsValid() && Val->Type == EJson::Object)
                ParsedActions.Add(Val->AsObject());
        }
    }

    ActionCount = ParsedActions.Num();
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d actions"), ActionCount);
}

TArray<FString> UActionSystem::GetActionsByCategory(const FString& Category)
{
    TArray<FString> Result;
    for (const auto& ActionObj : ParsedActions)
    {
        FString ActionType;
        if (ActionObj->TryGetStringField(TEXT("actionType"), ActionType) && ActionType == Category)
        {
            FString Id;
            ActionObj->TryGetStringField(TEXT("id"), Id);
            Result.Add(Id);
        }
    }
    return Result;
}

TArray<FString> UActionSystem::GetContextualActions(float PlayerEnergy, bool bHasTarget)
{
    TArray<FString> Result;
    for (const auto& ActionObj : ParsedActions)
    {
        FString Id;
        ActionObj->TryGetStringField(TEXT("id"), Id);

        bool bIsActive = ActionObj->GetBoolField(TEXT("isActive"));
        if (!bIsActive && ActionObj->HasField(TEXT("isActive"))) continue;

        // Check cooldown
        if (const FInsimulActionState* State = ActionStates.Find(Id))
        {
            if (State->CooldownRemaining > 0.f) continue;
        }

        // Check energy
        double EnergyCost = ActionObj->GetNumberField(TEXT("energyCost"));
        if (EnergyCost > 0 && EnergyCost > PlayerEnergy) continue;

        // Check target requirement
        bool bRequiresTarget = ActionObj->GetBoolField(TEXT("requiresTarget"));
        if (bRequiresTarget && !bHasTarget) continue;

        Result.Add(Id);
    }
    return Result;
}

bool UActionSystem::CanPerformAction(const FString& ActionId, float PlayerEnergy, bool bHasTarget, FString& Reason)
{
    const TSharedPtr<FJsonObject>* FoundAction = nullptr;
    for (const auto& ActionObj : ParsedActions)
    {
        FString Id;
        ActionObj->TryGetStringField(TEXT("id"), Id);
        if (Id == ActionId)
        {
            FoundAction = &ActionObj;
            break;
        }
    }

    if (!FoundAction)
    {
        Reason = TEXT("Action not found");
        return false;
    }

    const auto& ActionObj = *FoundAction;

    if (ActionObj->HasField(TEXT("isActive")) && !ActionObj->GetBoolField(TEXT("isActive")))
    {
        Reason = TEXT("Action not available");
        return false;
    }

    if (const FInsimulActionState* State = ActionStates.Find(ActionId))
    {
        if (State->CooldownRemaining > 0.f)
        {
            Reason = FString::Printf(TEXT("On cooldown (%.1fs remaining)"), State->CooldownRemaining);
            return false;
        }
    }

    double EnergyCost = ActionObj->GetNumberField(TEXT("energyCost"));
    if (EnergyCost > 0 && EnergyCost > PlayerEnergy)
    {
        Reason = FString::Printf(TEXT("Not enough energy (need %d)"), static_cast<int32>(EnergyCost));
        return false;
    }

    bool bRequiresTarget = ActionObj->GetBoolField(TEXT("requiresTarget"));
    if (bRequiresTarget && !bHasTarget)
    {
        Reason = TEXT("Requires a target");
        return false;
    }

    Reason = TEXT("");
    return true;
}

void UActionSystem::UpdateCooldowns(float DeltaTime)
{
    for (auto& Pair : ActionStates)
    {
        if (Pair.Value.CooldownRemaining > 0.f)
        {
            Pair.Value.CooldownRemaining = FMath::Max(0.f, Pair.Value.CooldownRemaining - DeltaTime);
        }
    }
}

float UActionSystem::GetCooldown(const FString& ActionId)
{
    if (const FInsimulActionState* State = ActionStates.Find(ActionId))
    {
        return State->CooldownRemaining;
    }
    return 0.f;
}

FString UActionSystem::GenerateNarrativeText(const TSharedPtr<FJsonObject>& ActionObj, const FString& ActorName, const FString& TargetName)
{
    const TArray<TSharedPtr<FJsonValue>>* Templates;
    if (ActionObj->TryGetArrayField(TEXT("narrativeTemplates"), Templates) && Templates->Num() > 0)
    {
        int32 Idx = FMath::RandRange(0, Templates->Num() - 1);
        FString Text = (*Templates)[Idx]->AsString();
        Text = Text.Replace(TEXT("{actor}"), *ActorName);
        Text = Text.Replace(TEXT("{target}"), *TargetName);
        return Text;
    }

    // Fallback
    FString Name;
    ActionObj->TryGetStringField(TEXT("name"), Name);
    FString VerbPast;
    if (!ActionObj->TryGetStringField(TEXT("verbPast"), VerbPast))
        VerbPast = Name.ToLower();
    return FString::Printf(TEXT("You %s."), *VerbPast);
}

FInsimulActionResult UActionSystem::ExecuteAction(const FString& ActionId, AActor* Source, AActor* Target)
{
    FInsimulActionResult Result;

    // Find action definition
    TSharedPtr<FJsonObject> ActionObj;
    for (const auto& A : ParsedActions)
    {
        FString Id;
        A->TryGetStringField(TEXT("id"), Id);
        if (Id == ActionId) { ActionObj = A; break; }
    }

    if (!ActionObj.IsValid())
    {
        Result.bSuccess = false;
        Result.Message = TEXT("Action not found");
        return Result;
    }

    // Validate via CanPerformAction
    FString Reason;
    float PlayerEnergy = 100.f; // Default; caller should set properly
    if (!CanPerformAction(ActionId, PlayerEnergy, Target != nullptr, Reason))
    {
        Result.bSuccess = false;
        Result.Message = Reason;
        return Result;
    }

    FString ActionName;
    ActionObj->TryGetStringField(TEXT("name"), ActionName);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] ExecuteAction: %s"), *ActionName);

    // Process effects from action definition
    const TArray<TSharedPtr<FJsonValue>>* EffectsArr;
    if (ActionObj->TryGetArrayField(TEXT("effects"), EffectsArr))
    {
        for (const auto& EffVal : *EffectsArr)
        {
            auto EffObj = EffVal->AsObject();
            if (!EffObj.IsValid()) continue;

            FString Category;
            EffObj->TryGetStringField(TEXT("category"), Category);

            FInsimulActionEffect Effect;
            Effect.Type = Category;
            Effect.Value = static_cast<float>(EffObj->GetNumberField(TEXT("value")));

            FString First;
            EffObj->TryGetStringField(TEXT("first"), First);
            Effect.Target = (First == TEXT("initiator")) ? TEXT("player") : (Target ? Target->GetName() : TEXT(""));

            FString EffType;
            EffObj->TryGetStringField(TEXT("type"), EffType);
            Effect.Description = FString::Printf(TEXT("%s %s %.0f"), *EffType, *EffObj->GetStringField(TEXT("operator")), Effect.Value);

            if (Category == TEXT("item"))
            {
                Effect.ItemId = EffType;
                Effect.Quantity = static_cast<int32>(Effect.Value);
                OnItemEffect.Broadcast(Effect.ItemId, Effect.Quantity);
            }
            else if (Category == TEXT("gold"))
            {
                OnGoldEffect.Broadcast(static_cast<int32>(Effect.Value));
            }

            Result.Effects.Add(Effect);
        }
    }

    // Generate narrative text
    FString TargetName = Target ? Target->GetName() : TEXT("someone");
    Result.NarrativeText = GenerateNarrativeText(ActionObj, TEXT("You"), TargetName);

    // Start cooldown
    double Cooldown = ActionObj->GetNumberField(TEXT("cooldown"));
    FInsimulActionState& State = ActionStates.FindOrAdd(ActionId);
    State.ActionId = ActionId;
    State.LastUsed = GetWorld() ? GetWorld()->GetTimeSeconds() : 0.f;
    State.TimesUsed += 1;
    if (Cooldown > 0)
    {
        State.CooldownRemaining = static_cast<float>(Cooldown);
    }

    Result.bSuccess = true;
    Result.Message = FString::Printf(TEXT("%s performed successfully"), *ActionName);
    Result.EnergyUsed = static_cast<int32>(ActionObj->GetNumberField(TEXT("energyCost")));
    return Result;
}
