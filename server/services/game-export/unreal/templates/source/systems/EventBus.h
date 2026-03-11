#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "EventBus.generated.h"

/**
 * Game event types matching GameEventBus.ts discriminated union.
 */
UENUM(BlueprintType)
enum class EInsimulEventType : uint8
{
    ItemCollected       UMETA(DisplayName = "Item Collected"),
    EnemyDefeated       UMETA(DisplayName = "Enemy Defeated"),
    LocationVisited     UMETA(DisplayName = "Location Visited"),
    NPCTalked           UMETA(DisplayName = "NPC Talked"),
    ItemDelivered       UMETA(DisplayName = "Item Delivered"),
    VocabularyUsed      UMETA(DisplayName = "Vocabulary Used"),
    ConversationTurn    UMETA(DisplayName = "Conversation Turn"),
    QuestAccepted       UMETA(DisplayName = "Quest Accepted"),
    QuestCompleted      UMETA(DisplayName = "Quest Completed"),
    CombatAction        UMETA(DisplayName = "Combat Action"),
    ReputationChanged   UMETA(DisplayName = "Reputation Changed"),
    ItemCrafted         UMETA(DisplayName = "Item Crafted"),
    LocationDiscovered  UMETA(DisplayName = "Location Discovered"),
    SettlementEntered   UMETA(DisplayName = "Settlement Entered"),
    PuzzleSolved        UMETA(DisplayName = "Puzzle Solved"),
    ItemRemoved         UMETA(DisplayName = "Item Removed"),
    ItemUsed            UMETA(DisplayName = "Item Used"),
    ItemDropped         UMETA(DisplayName = "Item Dropped"),
    ItemEquipped        UMETA(DisplayName = "Item Equipped"),
    ItemUnequipped      UMETA(DisplayName = "Item Unequipped")
};

/**
 * Optional taxonomy fields carried on item events for Prolog assertion.
 * Mirrors ItemTaxonomy from GameEventBus.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulItemTaxonomy
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Category;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Material;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString BaseType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Rarity;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemType;
};

/**
 * Unified game event payload.
 *
 * Since C++ cannot use TypeScript-style discriminated unions, this struct
 * carries all possible fields across every event type. Only fields relevant
 * to the given EventType are populated; the rest use defaults. This mirrors
 * the 20-variant GameEvent union in GameEventBus.ts.
 */
USTRUCT(BlueprintType)
struct FInsimulGameEvent
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite) EInsimulEventType EventType = EInsimulEventType::ItemCollected;

    // ── Common fields ─────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ItemName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Quantity = 0;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FInsimulItemTaxonomy Taxonomy;

    // ── Entity / location fields ──────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString EntityId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString EnemyType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LocationId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString LocationName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NPCId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString NPCName;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 TurnCount = 0;

    // ── Dialogue / vocabulary ─────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Word;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) bool bCorrect = false;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) TArray<FString> Keywords;

    // ── Quest fields ──────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString QuestTitle;

    // ── Combat fields ─────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString ActionType;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString TargetId;

    // ── Reputation fields ─────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString FactionId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) int32 Delta = 0;

    // ── Settlement fields ─────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementId;
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString SettlementName;

    // ── Puzzle fields ─────────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString PuzzleId;

    // ── Equipment fields ──────────────────────────────────────────────
    UPROPERTY(EditAnywhere, BlueprintReadWrite) FString Slot;
};

// ── Delegates ────────────────────────────────────────────────────────────────

/** Delegate for type-specific event subscription. */
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnGameEvent, const FInsimulGameEvent&, Event);

/**
 * Centralized typed event system that bridges player actions to quest tracking
 * and Prolog fact assertion. All game actions (combat, items, dialogue, etc.)
 * emit events through this bus, which subscribers (PrologEngine, QuestSystem)
 * consume to update state.
 *
 * Ported from Insimul's Babylon.js GameEventBus to Unreal subsystem.
 */
UCLASS()
class INSIMULEXPORT_API UEventBus : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /**
     * Emit an event to all registered handlers.
     * Type-specific handlers and the global handler are both invoked.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    void Emit(const FInsimulGameEvent& Event);

    /**
     * Subscribe to a specific event type via delegate.
     * Returns an integer handle that can be passed to Unsubscribe().
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    int32 Subscribe(EInsimulEventType EventType, const FOnGameEvent& Handler);

    /**
     * Unsubscribe a previously registered handler by handle.
     */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    void Unsubscribe(int32 Handle);

    /**
     * Global event delegate — fires for every event regardless of type.
     * Bind in Blueprint or C++ to receive all events.
     */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|EventBus")
    FOnGameEvent OnAnyEvent;

    /** Remove all handlers. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|EventBus")
    void Dispose();

private:
    /** Per-type handler storage. */
    struct FTypedHandler
    {
        int32 Handle;
        EInsimulEventType EventType;
        FOnGameEvent Delegate;
    };

    TArray<FTypedHandler> TypedHandlers;
    int32 NextHandle = 1;
};
