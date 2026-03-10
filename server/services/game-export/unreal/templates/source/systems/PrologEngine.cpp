#include "PrologEngine.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UPrologEngine::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] PrologEngine initialized (stub — no native Prolog runtime)"));
}

void UPrologEngine::Deinitialize()
{
    KnowledgeBase.Empty();
    Facts.Empty();
    Rules.Empty();
    ActiveQuestIds.Empty();
    bInitialized = false;
    FactCount = 0;
    RuleCount = 0;
    Super::Deinitialize();
}

void UPrologEngine::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    // Load pre-generated Prolog content if available
    FString PrologContent;
    const TSharedPtr<FJsonObject>* SystemsObj;
    if (Root->TryGetObjectField(TEXT("systems"), SystemsObj))
    {
        (*SystemsObj)->TryGetStringField(TEXT("prologContent"), PrologContent);
    }

    if (!PrologContent.IsEmpty())
    {
        KnowledgeBase = PrologContent;
    }

    // Assert character facts from IR
    const TArray<TSharedPtr<FJsonValue>>* CharactersArr;
    if (Root->TryGetArrayField(TEXT("characters"), CharactersArr))
    {
        for (const TSharedPtr<FJsonValue>& CharVal : *CharactersArr)
        {
            const TSharedPtr<FJsonObject>* CharObj;
            if (!CharVal->TryGetObject(CharObj)) continue;

            FString FirstName, LastName, Id;
            (*CharObj)->TryGetStringField(TEXT("firstName"), FirstName);
            (*CharObj)->TryGetStringField(TEXT("lastName"), LastName);
            (*CharObj)->TryGetStringField(TEXT("id"), Id);

            FString CharId = Sanitize(FirstName + TEXT("_") + LastName + TEXT("_") + Id);
            AssertFact(FString::Printf(TEXT("person(%s)"), *CharId));

            if (!FirstName.IsEmpty())
            {
                FString FullName = FirstName + TEXT(" ") + LastName;
                AssertFact(FString::Printf(TEXT("name(%s, '%s')"), *CharId, *EscapeProlog(FullName)));
            }

            int32 Age = 0;
            if ((*CharObj)->TryGetNumberField(TEXT("age"), Age))
            {
                AssertFact(FString::Printf(TEXT("age(%s, %d)"), *CharId, Age));
            }

            FString Occupation;
            if ((*CharObj)->TryGetStringField(TEXT("occupation"), Occupation))
            {
                AssertFact(FString::Printf(TEXT("occupation(%s, %s)"), *CharId, *Sanitize(Occupation)));
            }

            FString Gender;
            if ((*CharObj)->TryGetStringField(TEXT("gender"), Gender))
            {
                AssertFact(FString::Printf(TEXT("gender(%s, %s)"), *CharId, *Sanitize(Gender)));
            }
        }
    }

    // Assert settlement facts from IR
    const TArray<TSharedPtr<FJsonValue>>* SettlementsArr;
    if (Root->TryGetArrayField(TEXT("settlements"), SettlementsArr))
    {
        for (const TSharedPtr<FJsonValue>& SettVal : *SettlementsArr)
        {
            const TSharedPtr<FJsonObject>* SettObj;
            if (!SettVal->TryGetObject(SettObj)) continue;

            FString SettName, SettId, SettType;
            (*SettObj)->TryGetStringField(TEXT("name"), SettName);
            (*SettObj)->TryGetStringField(TEXT("id"), SettId);
            FString SId = Sanitize(!SettName.IsEmpty() ? SettName : SettId);
            AssertFact(FString::Printf(TEXT("settlement(%s)"), *SId));

            if ((*SettObj)->TryGetStringField(TEXT("type"), SettType))
            {
                AssertFact(FString::Printf(TEXT("settlement_type(%s, %s)"), *SId, *Sanitize(SettType)));
            }
        }
    }

    // Load Prolog content from rules, actions, quests
    if (SystemsObj)
    {
        auto LoadContentArray = [this](const TSharedPtr<FJsonObject>& Obj, const FString& FieldName)
        {
            const TArray<TSharedPtr<FJsonValue>>* Arr;
            if (Obj->TryGetArrayField(FieldName, Arr))
            {
                for (const TSharedPtr<FJsonValue>& Val : *Arr)
                {
                    const TSharedPtr<FJsonObject>* ItemObj;
                    if (!Val->TryGetObject(ItemObj)) continue;
                    FString Content;
                    if ((*ItemObj)->TryGetStringField(TEXT("content"), Content) && !Content.IsEmpty())
                    {
                        KnowledgeBase += TEXT("\n") + Content;
                    }
                }
            }
        };

        LoadContentArray(*SystemsObj, TEXT("rules"));
        LoadContentArray(*SystemsObj, TEXT("baseRules"));
        LoadContentArray(*SystemsObj, TEXT("actions"));
        LoadContentArray(*SystemsObj, TEXT("quests"));

        // Track active quest IDs
        const TArray<TSharedPtr<FJsonValue>>* QuestsArr;
        if ((*SystemsObj)->TryGetArrayField(TEXT("quests"), QuestsArr))
        {
            for (const TSharedPtr<FJsonValue>& QVal : *QuestsArr)
            {
                const TSharedPtr<FJsonObject>* QObj;
                if (!QVal->TryGetObject(QObj)) continue;
                FString QId;
                if ((*QObj)->TryGetStringField(TEXT("id"), QId))
                {
                    ActiveQuestIds.Add(QId);
                }
            }
        }
    }

    // Parse the accumulated KB into facts and rules
    ParseKnowledgeBase();

    bInitialized = true;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] PrologEngine loaded: %d facts, %d rules"), FactCount, RuleCount);
}

void UPrologEngine::InitializeInventory(const TArray<FInsimulPrologItem>& Items)
{
    if (!bInitialized) return;

    for (const FInsimulPrologItem& Item : Items)
    {
        FString Name = Sanitize(Item.Name);
        AssertFact(FString::Printf(TEXT("has(player, %s)"), *Name));

        if (!Item.Type.IsEmpty())
        {
            AssertFact(FString::Printf(TEXT("item_type(%s, %s)"), *Name, *Sanitize(Item.Type)));
        }
        if (Item.Value > 0)
        {
            AssertFact(FString::Printf(TEXT("item_value(%s, %d)"), *Name, Item.Value));
        }
    }

    UE_LOG(LogTemp, Log, TEXT("[Insimul] PrologEngine initialized %d inventory items as facts"), Items.Num());
}

void UPrologEngine::UpdateGameState(const FInsimulGameState& State)
{
    if (!bInitialized) return;

    FString PlayerId = Sanitize(State.PlayerCharacterId);

    // Retract old dynamic state
    RetractPattern(TEXT("energy"), PlayerId);
    RetractPattern(TEXT("at_location"), PlayerId);
    RetractPattern(TEXT("nearby_npc"), PlayerId);

    // Assert current state
    AssertFact(FString::Printf(TEXT("energy(%s, %d)"), *PlayerId, FMath::RoundToInt(State.PlayerEnergy)));

    if (!State.CurrentSettlement.IsEmpty())
    {
        AssertFact(FString::Printf(TEXT("at_location(%s, %s)"), *PlayerId, *Sanitize(State.CurrentSettlement)));
    }

    for (const FString& NPCId : State.NearbyNPCs)
    {
        AssertFact(FString::Printf(TEXT("nearby_npc(%s, %s)"), *PlayerId, *Sanitize(NPCId)));
    }

    CurrentGameState = State;
}

// ── Action & Quest Queries ──────────────────────────────────────────────────

FInsimulPrologActionResult UPrologEngine::CanPerformAction(const FString& ActionId, const FString& ActorId, const FString& TargetId)
{
    FInsimulPrologActionResult Result;

    if (!bInitialized)
    {
        Result.bAllowed = true;
        return Result;
    }

    FString ActionAtom = Sanitize(ActionId);
    FString ActorAtom = Sanitize(ActorId);

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::CanPerformAction(%s, %s, %s) — stub query"),
        *ActionId, *ActorId, *TargetId);

    // Stub: check if there's a can_perform fact in the KB
    FString Query2 = FString::Printf(TEXT("can_perform(%s, %s)"), *ActorAtom, *ActionAtom);
    FString Query3 = TargetId.IsEmpty() ? TEXT("")
        : FString::Printf(TEXT("can_perform(%s, %s, %s)"), *ActorAtom, *ActionAtom, *Sanitize(TargetId));

    // Check for explicit blocks first
    FString BlockQuery = FString::Printf(TEXT("cannot_perform(%s, %s)"), *ActorAtom, *ActionAtom);
    if (HasFact(BlockQuery))
    {
        Result.bAllowed = false;
        Result.Reason = FString::Printf(TEXT("Prerequisites not met for action: %s"), *ActionId);
        return Result;
    }

    // If KB has can_perform rules, check for a matching fact
    // Otherwise, allow by default (graceful degradation like the TypeScript source)
    bool bHasCanPerformRules = FindFacts(TEXT("can_perform(")).Num() > 0;
    if (bHasCanPerformRules)
    {
        bool bFound = HasFact(Query2) || (!Query3.IsEmpty() && HasFact(Query3));
        if (!bFound)
        {
            Result.bAllowed = false;
            Result.Reason = FString::Printf(TEXT("Prerequisites not met for action: %s"), *ActionId);
            return Result;
        }
    }

    Result.bAllowed = true;
    return Result;
}

bool UPrologEngine::IsQuestAvailable(const FString& QuestId, const FString& PlayerId)
{
    if (!bInitialized) return true;

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::IsQuestAvailable(%s, %s) — stub query"),
        *QuestId, *PlayerId);

    // Check for quest_available fact
    FString Pattern = FString::Printf(TEXT("quest_available(%s, %s)"), *Sanitize(PlayerId), *Sanitize(QuestId));
    if (HasFact(Pattern)) return true;

    // If no quest_available rules exist, default to available
    bool bHasQuestAvailableRules = FindFacts(TEXT("quest_available(")).Num() > 0;
    return !bHasQuestAvailableRules;
}

bool UPrologEngine::IsQuestComplete(const FString& QuestId, const FString& PlayerId)
{
    if (!bInitialized) return false;

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::IsQuestComplete(%s, %s) — stub query"),
        *QuestId, *PlayerId);

    FString Pattern = FString::Printf(TEXT("quest_complete(%s, %s)"), *Sanitize(PlayerId), *Sanitize(QuestId));
    return HasFact(Pattern);
}

bool UPrologEngine::IsStageComplete(const FString& QuestId, const FString& StageId, const FString& PlayerId)
{
    if (!bInitialized) return false;

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::IsStageComplete(%s, %s, %s) — stub query"),
        *QuestId, *StageId, *PlayerId);

    FString Pattern = FString::Printf(TEXT("stage_complete(%s, %s, %s)"),
        *Sanitize(PlayerId), *Sanitize(QuestId), *Sanitize(StageId));
    return HasFact(Pattern);
}

TArray<FString> UPrologEngine::GetApplicableRules(const FString& ActorId)
{
    if (!bInitialized) return {};

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::GetApplicableRules(%s) — stub query"), *ActorId);

    // Look for rule_applies(RuleName, ActorId, _) facts
    FString Prefix = FString::Printf(TEXT("rule_applies("), *Sanitize(ActorId));
    TArray<FString> MatchingFacts = FindFacts(TEXT("rule_applies("));

    TArray<FString> RuleNames;
    FString ActorAtom = Sanitize(ActorId);

    for (const FString& Fact : MatchingFacts)
    {
        // Parse rule_applies(RuleName, ActorId, ...) — extract RuleName if ActorId matches
        if (Fact.Contains(ActorAtom))
        {
            // Extract first argument: everything between first ( and first ,
            int32 OpenParen = INDEX_NONE;
            int32 FirstComma = INDEX_NONE;
            Fact.FindChar(TEXT('('), OpenParen);
            Fact.FindChar(TEXT(','), FirstComma);
            if (OpenParen != INDEX_NONE && FirstComma != INDEX_NONE && FirstComma > OpenParen + 1)
            {
                FString RuleName = Fact.Mid(OpenParen + 1, FirstComma - OpenParen - 1).TrimStartAndEnd();
                RuleNames.AddUnique(RuleName);
            }
        }
    }

    return RuleNames;
}

bool UPrologEngine::EvaluateCondition(const FString& PrologGoal)
{
    if (!bInitialized) return true;

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::EvaluateCondition(%s) — stub query"), *PrologGoal);

    // Simple stub: check if the goal matches an asserted fact
    FString CleanGoal = PrologGoal.TrimStartAndEnd();
    CleanGoal.RemoveFromEnd(TEXT("."));
    return HasFact(CleanGoal);
}

// ── Fact Management ─────────────────────────────────────────────────────────

void UPrologEngine::AssertFact(const FString& Fact)
{
    FString CleanFact = Fact.TrimStartAndEnd();
    CleanFact.RemoveFromEnd(TEXT("."));

    // Don't add duplicates
    if (!Facts.Contains(CleanFact))
    {
        Facts.Add(CleanFact);
        FactCount = Facts.Num();

        // Also append to raw KB for export
        KnowledgeBase += FString::Printf(TEXT("\n%s."), *CleanFact);
    }
}

void UPrologEngine::RetractFact(const FString& Fact)
{
    FString CleanFact = Fact.TrimStartAndEnd();
    CleanFact.RemoveFromEnd(TEXT("."));

    int32 Removed = Facts.RemoveAll([&CleanFact](const FString& F) {
        return F == CleanFact;
    });

    if (Removed > 0)
    {
        FactCount = Facts.Num();
    }
}

TArray<FString> UPrologEngine::Query(const FString& Goal)
{
    UE_LOG(LogTemp, Log, TEXT("[Insimul] PrologEngine::Query(%s) — stub, no native Prolog runtime. "
        "Integrate SWI-Prolog C++ bindings for full query support."), *Goal);

    // Return matching facts as a basic stub
    FString CleanGoal = Goal.TrimStartAndEnd();
    CleanGoal.RemoveFromEnd(TEXT("."));

    // Extract predicate name for prefix matching
    int32 ParenIdx = INDEX_NONE;
    CleanGoal.FindChar(TEXT('('), ParenIdx);
    if (ParenIdx != INDEX_NONE)
    {
        FString Prefix = CleanGoal.Left(ParenIdx + 1);
        return FindFacts(Prefix);
    }

    return {};
}

FString UPrologEngine::ExportKnowledgeBase() const
{
    return KnowledgeBase;
}

// ── NPC Intelligence Queries ────────────────────────────────────────────────

TArray<FString> UPrologEngine::WhoShouldTalkTo(const FString& NPCId)
{
    if (!bInitialized) return {};

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::WhoShouldTalkTo(%s) — stub query"), *NPCId);

    // Look for should_talk_to(NPCId, Y) facts
    FString Prefix = FString::Printf(TEXT("should_talk_to(%s,"), *Sanitize(NPCId));
    TArray<FString> MatchingFacts = FindFacts(Prefix);

    TArray<FString> Targets;
    for (const FString& Fact : MatchingFacts)
    {
        // Extract second argument
        int32 CommaIdx = INDEX_NONE;
        int32 CloseParenIdx = INDEX_NONE;
        Fact.FindChar(TEXT(','), CommaIdx);
        Fact.FindLastChar(TEXT(')'), CloseParenIdx);
        if (CommaIdx != INDEX_NONE && CloseParenIdx != INDEX_NONE && CloseParenIdx > CommaIdx + 1)
        {
            FString Target = Fact.Mid(CommaIdx + 1, CloseParenIdx - CommaIdx - 1).TrimStartAndEnd();
            if (!Target.IsEmpty())
            {
                Targets.AddUnique(Target);
            }
        }
    }

    return Targets;
}

TArray<FString> UPrologEngine::GetPreferredTopics(const FString& NPCId)
{
    if (!bInitialized) return {};

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::GetPreferredTopics(%s) — stub query"), *NPCId);

    FString Prefix = FString::Printf(TEXT("prefers_topic(%s,"), *Sanitize(NPCId));
    TArray<FString> MatchingFacts = FindFacts(Prefix);

    TArray<FString> Topics;
    for (const FString& Fact : MatchingFacts)
    {
        int32 CommaIdx = INDEX_NONE;
        int32 CloseParenIdx = INDEX_NONE;
        Fact.FindChar(TEXT(','), CommaIdx);
        Fact.FindLastChar(TEXT(')'), CloseParenIdx);
        if (CommaIdx != INDEX_NONE && CloseParenIdx != INDEX_NONE && CloseParenIdx > CommaIdx + 1)
        {
            FString Topic = Fact.Mid(CommaIdx + 1, CloseParenIdx - CommaIdx - 1).TrimStartAndEnd();
            if (!Topic.IsEmpty())
            {
                Topics.AddUnique(Topic);
            }
        }
    }

    return Topics;
}

bool UPrologEngine::WantsToSocialize(const FString& NPCId)
{
    if (!bInitialized) return false;

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::WantsToSocialize(%s) — stub query"), *NPCId);

    FString Pattern = FString::Printf(TEXT("wants_to_socialize(%s)"), *Sanitize(NPCId));
    return HasFact(Pattern);
}

bool UPrologEngine::IsFirstMeeting(const FString& NPCId, const FString& PlayerId)
{
    if (!bInitialized) return true;

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::IsFirstMeeting(%s, %s) — stub query"),
        *NPCId, *PlayerId);

    // First meeting if no has_mental_model fact exists (negation-as-absence)
    FString Pattern = FString::Printf(TEXT("has_mental_model(%s, %s)"), *Sanitize(NPCId), *Sanitize(PlayerId));
    return !HasFact(Pattern);
}

TArray<FString> UPrologEngine::WhoToAvoid(const FString& NPCId)
{
    if (!bInitialized) return {};

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::WhoToAvoid(%s) — stub query"), *NPCId);

    FString Prefix = FString::Printf(TEXT("should_avoid(%s,"), *Sanitize(NPCId));
    TArray<FString> MatchingFacts = FindFacts(Prefix);

    TArray<FString> Targets;
    for (const FString& Fact : MatchingFacts)
    {
        int32 CommaIdx = INDEX_NONE;
        int32 CloseParenIdx = INDEX_NONE;
        Fact.FindChar(TEXT(','), CommaIdx);
        Fact.FindLastChar(TEXT(')'), CloseParenIdx);
        if (CommaIdx != INDEX_NONE && CloseParenIdx != INDEX_NONE && CloseParenIdx > CommaIdx + 1)
        {
            FString Target = Fact.Mid(CommaIdx + 1, CloseParenIdx - CommaIdx - 1).TrimStartAndEnd();
            if (!Target.IsEmpty())
            {
                Targets.AddUnique(Target);
            }
        }
    }

    return Targets;
}

bool UPrologEngine::IsWillingToShare(const FString& NPCId, const FString& TargetId)
{
    if (!bInitialized) return true;

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] PrologEngine::IsWillingToShare(%s, %s) — stub query"),
        *NPCId, *TargetId);

    // If no willing_to_share facts exist, default to true (graceful degradation)
    FString Pattern = FString::Printf(TEXT("willing_to_share(%s, %s)"), *Sanitize(NPCId), *Sanitize(TargetId));
    bool bHasWillingRules = FindFacts(TEXT("willing_to_share(")).Num() > 0;
    if (!bHasWillingRules) return true;
    return HasFact(Pattern);
}

// ── Private Helpers ─────────────────────────────────────────────────────────

void UPrologEngine::ParseKnowledgeBase()
{
    Facts.Empty();
    Rules.Empty();

    if (KnowledgeBase.IsEmpty())
    {
        FactCount = 0;
        RuleCount = 0;
        return;
    }

    // Split KB into lines and classify each as fact or rule
    TArray<FString> Lines;
    KnowledgeBase.ParseIntoArrayLines(Lines);

    for (const FString& RawLine : Lines)
    {
        FString Line = RawLine.TrimStartAndEnd();

        // Skip empty lines and comments
        if (Line.IsEmpty()) continue;
        if (Line.StartsWith(TEXT("%"))) continue;
        if (Line.StartsWith(TEXT("/*"))) continue;

        // Remove trailing period for storage
        FString CleanLine = Line;
        CleanLine.RemoveFromEnd(TEXT("."));
        CleanLine = CleanLine.TrimEnd();

        if (CleanLine.IsEmpty()) continue;

        if (Line.Contains(TEXT(":-")))
        {
            // This is a rule/clause
            Rules.AddUnique(CleanLine);
        }
        else
        {
            // This is a fact
            Facts.AddUnique(CleanLine);
        }
    }

    FactCount = Facts.Num();
    RuleCount = Rules.Num();
}

bool UPrologEngine::HasFact(const FString& Pattern) const
{
    FString CleanPattern = Pattern.TrimStartAndEnd();
    CleanPattern.RemoveFromEnd(TEXT("."));

    for (const FString& Fact : Facts)
    {
        if (Fact == CleanPattern) return true;
    }
    return false;
}

TArray<FString> UPrologEngine::FindFacts(const FString& Prefix) const
{
    TArray<FString> Results;
    for (const FString& Fact : Facts)
    {
        if (Fact.StartsWith(Prefix))
        {
            Results.Add(Fact);
        }
    }
    return Results;
}

void UPrologEngine::RetractPattern(const FString& Predicate, const FString& FirstArg, const FString& SecondArg)
{
    FString Prefix;
    if (SecondArg.IsEmpty())
    {
        Prefix = FString::Printf(TEXT("%s(%s"), *Predicate, *FirstArg);
    }
    else
    {
        Prefix = FString::Printf(TEXT("%s(%s, %s"), *Predicate, *FirstArg, *SecondArg);
    }

    Facts.RemoveAll([&Prefix](const FString& F) {
        return F.StartsWith(Prefix);
    });

    FactCount = Facts.Num();
}

FString UPrologEngine::Sanitize(const FString& Str)
{
    FString Result = Str.ToLower();

    // Replace non-alphanumeric/underscore characters with underscore
    FString Sanitized;
    Sanitized.Reserve(Result.Len());
    for (int32 i = 0; i < Result.Len(); ++i)
    {
        TCHAR Ch = Result[i];
        if (FChar::IsAlpha(Ch) || FChar::IsDigit(Ch) || Ch == TEXT('_'))
        {
            Sanitized.AppendChar(Ch);
        }
        else
        {
            Sanitized.AppendChar(TEXT('_'));
        }
    }

    // Prefix leading digits with underscore
    if (Sanitized.Len() > 0 && FChar::IsDigit(Sanitized[0]))
    {
        Sanitized = TEXT("_") + Sanitized;
    }

    // Collapse multiple underscores
    while (Sanitized.Contains(TEXT("__")))
    {
        Sanitized = Sanitized.Replace(TEXT("__"), TEXT("_"));
    }

    // Remove trailing underscore
    Sanitized.RemoveFromEnd(TEXT("_"));

    return Sanitized;
}

FString UPrologEngine::EscapeProlog(const FString& Str)
{
    FString Result = Str;
    Result = Result.Replace(TEXT("\\"), TEXT("\\\\"));
    Result = Result.Replace(TEXT("'"), TEXT("\\'"));
    return Result;
}
