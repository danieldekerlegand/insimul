#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "PrologEngine.generated.h"

/**
 * Dynamic game state for Prolog knowledge base updates.
 * Mirrors GamePrologEngine.GameState from the Babylon.js source.
 */
USTRUCT(BlueprintType)
struct FInsimulGameState
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PlayerCharacterId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PlayerName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) float PlayerEnergy = 100.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FVector PlayerPosition = FVector::ZeroVector;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString CurrentSettlement;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> NearbyNPCs;
};

/**
 * Inventory item for Prolog fact assertion.
 */
USTRUCT(BlueprintType)
struct FInsimulPrologItem
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Id;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Name;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Type;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Value = 0;
};

/**
 * Result of a Prolog action check.
 */
USTRUCT(BlueprintType)
struct FInsimulPrologActionResult
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly) bool bAllowed = true;
    UPROPERTY(BlueprintReadOnly) FString Reason;
};

/**
 * Prolog engine stub for Unreal Engine exports.
 *
 * Since Unreal has no native Prolog runtime, this subsystem stores the
 * Prolog knowledge base as text and provides stub implementations that:
 *   - Parse the KB string to extract basic facts
 *   - Support simple fact assertion/retraction via string matching
 *   - Log when Prolog queries are attempted
 *   - Return sensible defaults (allow actions, quests available, etc.)
 *
 * Ported from Insimul's Babylon.js GamePrologEngine to Unreal subsystem.
 * A full Prolog interpreter (e.g., SWI-Prolog C++ bindings) can replace
 * the stub logic for production use.
 */
UCLASS()
class INSIMULEXPORT_API UPrologEngine : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load Prolog knowledge base and game data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    void LoadFromIR(const FString& JsonString);

    /** Initialize inventory items as Prolog facts */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    void InitializeInventory(const TArray<FInsimulPrologItem>& Items);

    /** Update dynamic game state facts (call on state change) */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    void UpdateGameState(const FInsimulGameState& State);

    // ── Action & Quest Queries ────────────────────────────────────────────

    /** Check if an action can be performed (stub: true unless KB blocks it) */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    FInsimulPrologActionResult CanPerformAction(const FString& ActionId, const FString& ActorId, const FString& TargetId = TEXT(""));

    /** Check if a quest is available to the player */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    bool IsQuestAvailable(const FString& QuestId, const FString& PlayerId);

    /** Check if a quest is complete for the player */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    bool IsQuestComplete(const FString& QuestId, const FString& PlayerId);

    /** Check if a specific quest stage is complete */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    bool IsStageComplete(const FString& QuestId, const FString& StageId, const FString& PlayerId);

    /** Find all applicable rules for an actor */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    TArray<FString> GetApplicableRules(const FString& ActorId);

    /** Evaluate an arbitrary Prolog goal (stub: returns true if fact exists) */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    bool EvaluateCondition(const FString& PrologGoal);

    // ── Fact Management ──────────────────────────────────────────────────

    /** Assert a new fact into the knowledge base */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    void AssertFact(const FString& Fact);

    /** Retract a fact from the knowledge base */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    void RetractFact(const FString& Fact);

    /** Run an arbitrary Prolog query (stub: logs and returns empty) */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    TArray<FString> Query(const FString& Goal);

    /** Export the current knowledge base as Prolog text */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    FString ExportKnowledgeBase() const;

    // ── NPC Intelligence Queries ─────────────────────────────────────────

    /** Determine who an NPC should talk to */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    TArray<FString> WhoShouldTalkTo(const FString& NPCId);

    /** Get preferred dialogue topics for an NPC */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    TArray<FString> GetPreferredTopics(const FString& NPCId);

    /** Check if an NPC wants to socialize */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    bool WantsToSocialize(const FString& NPCId);

    /** Check if this is a first meeting between two characters */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    bool IsFirstMeeting(const FString& NPCId, const FString& PlayerId);

    /** Get NPCs that should be avoided by a given NPC */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    TArray<FString> WhoToAvoid(const FString& NPCId);

    /** Check if an NPC is willing to share knowledge with another */
    UFUNCTION(BlueprintCallable, Category = "Insimul|PrologEngine")
    bool IsWillingToShare(const FString& NPCId, const FString& TargetId);

    // ── State ────────────────────────────────────────────────────────────

    /** Whether the engine has been initialized with data */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul|PrologEngine")
    bool bInitialized = false;

    /** Number of parsed facts in the knowledge base */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul|PrologEngine")
    int32 FactCount = 0;

    /** Number of parsed rules in the knowledge base */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul|PrologEngine")
    int32 RuleCount = 0;

private:
    /** The raw Prolog knowledge base text */
    FString KnowledgeBase;

    /** Parsed facts extracted from the knowledge base (e.g., "person(alice)") */
    TArray<FString> Facts;

    /** Parsed rules/clauses (lines containing ":-") */
    TArray<FString> Rules;

    /** Current game state */
    FInsimulGameState CurrentGameState;

    /** Active quest IDs for re-evaluation */
    TArray<FString> ActiveQuestIds;

    /** Parse the knowledge base string into Facts and Rules arrays */
    void ParseKnowledgeBase();

    /** Check if a fact pattern exists in the KB (simple string prefix match) */
    bool HasFact(const FString& Pattern) const;

    /** Find all facts matching a prefix pattern */
    TArray<FString> FindFacts(const FString& Prefix) const;

    /** Retract all facts matching a predicate/first-arg pattern */
    void RetractPattern(const FString& Predicate, const FString& FirstArg, const FString& SecondArg = TEXT(""));

    /** Sanitize a string to a valid Prolog atom */
    static FString Sanitize(const FString& Str);

    /** Escape single quotes in a Prolog string */
    static FString EscapeProlog(const FString& Str);
};
