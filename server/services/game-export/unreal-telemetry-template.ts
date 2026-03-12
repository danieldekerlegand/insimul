/**
 * US-6.06 — Unreal Telemetry Template
 *
 * Generates C++ header + source for a UGameInstanceSubsystem that batches
 * telemetry events and sends them via FHttpModule.  Includes SaveGame-based
 * offline persistence, timer-driven flush, and FPS tracking.
 */

// ── Config type ─────────────────────────────────────────────────────────────

export interface UnrealTelemetryConfig {
  /** Telemetry ingest endpoint, e.g. "https://insimul.example.com" */
  apiEndpoint: string;
  /** API key for authentication */
  apiKey: string;
  /** Max events per HTTP batch */
  batchSize: number;
  /** How often (ms) the queue is flushed */
  flushIntervalMs: number;
}

export interface UnrealTelemetryOutput {
  header: string;
  source: string;
}

// ── Generator ───────────────────────────────────────────────────────────────

/**
 * Returns a header (.h) and source (.cpp) pair for `UTelemetrySubsystem`.
 *
 * Features:
 * - UGameInstanceSubsystem (auto-created with game instance)
 * - FHttpModule for HTTP POST requests
 * - TArray batch queue with timer-based flush
 * - USaveGame subclass for offline persistence
 * - FPS tracking via FApp::GetDeltaTime()
 * - Configurable via UGameplayStatics / project settings
 */
export function generateUnrealTelemetryTemplate(
  config: UnrealTelemetryConfig,
): UnrealTelemetryOutput {
  const flushIntervalSec = (config.flushIntervalMs / 1000).toFixed(1);

  const header = `// Insimul Telemetry Subsystem — Unreal Engine (auto-generated)
#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "GameFramework/SaveGame.h"
#include "TelemetrySubsystem.generated.h"

// ── Telemetry Event Struct ──────────────────────────────────────────────────

USTRUCT(BlueprintType)
struct FTelemetryEvent
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadWrite)
    FString EventType;

    UPROPERTY(BlueprintReadWrite)
    FString Data; // JSON string

    UPROPERTY(BlueprintReadWrite)
    FString Timestamp;

    UPROPERTY(BlueprintReadWrite)
    FString SessionId;

    UPROPERTY(BlueprintReadWrite)
    FString PlayerId;

    UPROPERTY(BlueprintReadWrite)
    FString WorldId;
};

// ── SaveGame for Offline Persistence ────────────────────────────────────────

UCLASS()
class UTelemetrySaveGame : public USaveGame
{
    GENERATED_BODY()

public:
    UPROPERTY()
    TArray<FTelemetryEvent> PendingEvents;

    UPROPERTY()
    FString PlayerId;
};

// ── Telemetry Subsystem ─────────────────────────────────────────────────────

UCLASS()
class UTelemetrySubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    // USubsystem interface
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Telemetry connection status. */
    UENUM(BlueprintType)
    enum class ETelemetryStatus : uint8
    {
        Connected,
        Queued,
        Offline
    };

    /** Set the world ID for all subsequent events. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Telemetry")
    void Configure(const FString& InWorldId);

    /** Track a telemetry event. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Telemetry")
    void Track(const FString& EventType, const FString& JsonData = TEXT("{}"));

    /** Force-flush the event queue. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Telemetry")
    void Flush();

    /** Get the current number of queued events. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Insimul|Telemetry")
    int32 GetQueueSize() const;

    /** Grant telemetry consent. Call from your consent UI. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Telemetry")
    void GrantConsent();

    /** Revoke telemetry consent. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Telemetry")
    void RevokeConsent();

    /** Whether the user has granted consent. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Insimul|Telemetry")
    bool HasConsent() const;

    /** Get the current connection status. */
    UFUNCTION(BlueprintCallable, BlueprintPure, Category = "Insimul|Telemetry")
    ETelemetryStatus GetStatus() const;

    /** Track language learning progress. */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Telemetry")
    void TrackLanguageProgress(const FString& ProgressJsonData);

private:
    // Configuration
    static constexpr int32 BatchSize = ${config.batchSize};
    static constexpr float FlushIntervalSec = ${flushIntervalSec}f;
    static constexpr float FpsSampleIntervalSec = 5.0f;
    static constexpr int32 MaxRetries = 3;
    static constexpr int32 MaxQueueSize = 10000;

    // State
    TArray<FTelemetryEvent> Queue;
    FString SessionId;
    FString PlayerId;
    FString WorldId;
    bool bIsFlushing = false;
    bool bConsentGiven = false;
    ETelemetryStatus CurrentStatus = ETelemetryStatus::Offline;
    FTimerHandle FlushTimerHandle;
    FTimerHandle FpsTimerHandle;

    // Internal
    void OnFlushTimer();
    void OnFpsSampleTimer();
    void SendBatch(TArray<FTelemetryEvent> Batch, int32 RetryCount = 0);
    void PersistQueue();
    void LoadPersistedQueue();
    void ClearPersistedQueue();
    FString LoadOrCreatePlayerId();
    FString GenerateSessionId();
    static FString EventArrayToJson(const TArray<FTelemetryEvent>& Events);
    static FString EventToJson(const FTelemetryEvent& Event);
    static FString EscapeJsonString(const FString& Input);

    static const FString SaveSlotName;
};
`;

  const source = `// Insimul Telemetry Subsystem — Unreal Engine (auto-generated)

#include "TelemetrySubsystem.h"
#include "Http.h"
#include "Misc/App.h"
#include "Misc/DateTime.h"
#include "Kismet/GameplayStatics.h"
#include "TimerManager.h"
#include "Engine/GameInstance.h"

const FString UTelemetrySubsystem::SaveSlotName = TEXT("InsimulTelemetry");

// ── Configuration ───────────────────────────────────────────────────────────

static const FString TelemetryEndpoint = TEXT("${config.apiEndpoint}/api/external/telemetry/batch");
static const FString TelemetryApiKey = TEXT("${config.apiKey}");

// ── Lifecycle ───────────────────────────────────────────────────────────────

void UTelemetrySubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);

    SessionId = GenerateSessionId();
    PlayerId = LoadOrCreatePlayerId();

    // First-launch consent check via SaveGame
    UTelemetrySaveGame* ConsentSave = Cast<UTelemetrySaveGame>(
        UGameplayStatics::LoadGameFromSlot(SaveSlotName, 0));
    bConsentGiven = ConsentSave && ConsentSave->PlayerId.Len() > 0;
    // NOTE: Consent is stored alongside PlayerId — if PlayerId exists, consent was given.

    if (!bConsentGiven)
    {
        CurrentStatus = ETelemetryStatus::Offline;
        return;
    }

    LoadPersistedQueue();
    CurrentStatus = Queue.Num() > 0 ? ETelemetryStatus::Queued : ETelemetryStatus::Connected;

    Track(TEXT("session_start"), FString::Printf(
        TEXT("{\\"platform\\":\\"%s\\",\\"buildConfig\\":\\"%s\\"}"),
        *UGameplayStatics::GetPlatformName(),
#if UE_BUILD_SHIPPING
        TEXT("Shipping")
#elif UE_BUILD_DEVELOPMENT
        TEXT("Development")
#else
        TEXT("Debug")
#endif
    ));

    // Set up recurring timers
    if (UWorld* World = GetGameInstance()->GetWorld())
    {
        World->GetTimerManager().SetTimer(
            FlushTimerHandle, this, &UTelemetrySubsystem::OnFlushTimer,
            FlushIntervalSec, true);

        World->GetTimerManager().SetTimer(
            FpsTimerHandle, this, &UTelemetrySubsystem::OnFpsSampleTimer,
            FpsSampleIntervalSec, true);
    }
}

void UTelemetrySubsystem::Deinitialize()
{
    Track(TEXT("session_end"), TEXT("{}"));

    // Clear timers
    if (UWorld* World = GetGameInstance()->GetWorld())
    {
        World->GetTimerManager().ClearTimer(FlushTimerHandle);
        World->GetTimerManager().ClearTimer(FpsTimerHandle);
    }

    // Persist remaining events
    PersistQueue();

    Super::Deinitialize();
}

// ── Public API ──────────────────────────────────────────────────────────────

void UTelemetrySubsystem::Configure(const FString& InWorldId)
{
    WorldId = InWorldId;
}

void UTelemetrySubsystem::GrantConsent()
{
    bConsentGiven = true;
    CurrentStatus = ETelemetryStatus::Connected;

    // Re-initialize if we haven't yet
    if (SessionId.IsEmpty())
    {
        SessionId = GenerateSessionId();
        PlayerId = LoadOrCreatePlayerId();
    }

    // Persist consent by saving PlayerId
    UTelemetrySaveGame* Save = Cast<UTelemetrySaveGame>(
        UGameplayStatics::CreateSaveGameObject(UTelemetrySaveGame::StaticClass()));
    if (Save)
    {
        Save->PlayerId = PlayerId;
        UGameplayStatics::SaveGameToSlot(Save, SaveSlotName, 0);
    }
}

void UTelemetrySubsystem::RevokeConsent()
{
    bConsentGiven = false;
    CurrentStatus = ETelemetryStatus::Offline;
}

bool UTelemetrySubsystem::HasConsent() const
{
    return bConsentGiven;
}

UTelemetrySubsystem::ETelemetryStatus UTelemetrySubsystem::GetStatus() const
{
    return CurrentStatus;
}

void UTelemetrySubsystem::TrackLanguageProgress(const FString& ProgressJsonData)
{
    Track(TEXT("language_progress"), ProgressJsonData);
}

void UTelemetrySubsystem::Track(const FString& EventType, const FString& JsonData)
{
    if (!bConsentGiven) return;

    FTelemetryEvent Event;
    Event.EventType = EventType;
    Event.Data = JsonData;
    Event.Timestamp = FDateTime::UtcNow().ToIso8601();
    Event.SessionId = SessionId;
    Event.PlayerId = PlayerId;
    Event.WorldId = WorldId;

    Queue.Add(Event);

    // Drop oldest if over capacity
    if (Queue.Num() > MaxQueueSize)
    {
        Queue.RemoveAt(0, Queue.Num() - MaxQueueSize);
    }
}

void UTelemetrySubsystem::Flush()
{
    if (bIsFlushing || Queue.Num() == 0)
    {
        return;
    }

    int32 Count = FMath::Min(BatchSize, Queue.Num());
    TArray<FTelemetryEvent> Batch;
    Batch.Reserve(Count);
    for (int32 i = 0; i < Count; ++i)
    {
        Batch.Add(Queue[i]);
    }
    Queue.RemoveAt(0, Count);

    SendBatch(MoveTemp(Batch));
}

int32 UTelemetrySubsystem::GetQueueSize() const
{
    return Queue.Num();
}

// ── Timers ──────────────────────────────────────────────────────────────────

void UTelemetrySubsystem::OnFlushTimer()
{
    Flush();
}

void UTelemetrySubsystem::OnFpsSampleTimer()
{
    float DeltaTime = FApp::GetDeltaTime();
    float Fps = (DeltaTime > 0.0f) ? 1.0f / DeltaTime : 0.0f;

    Track(TEXT("fps_sample"), FString::Printf(
        TEXT("{\\"fps\\":%d,\\"deltaTimeMs\\":%.2f}"),
        FMath::RoundToInt(Fps),
        DeltaTime * 1000.0f));
}

// ── Networking ──────────────────────────────────────────────────────────────

void UTelemetrySubsystem::SendBatch(TArray<FTelemetryEvent> Batch, int32 RetryCount)
{
    bIsFlushing = true;

    FString JsonBody = EventArrayToJson(Batch);

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(TelemetryEndpoint);
    Request->SetVerb(TEXT("POST"));
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
    Request->SetHeader(TEXT("X-API-Key"), TelemetryApiKey);
    Request->SetContentAsString(JsonBody);

    // Prevent garbage collection of captured data
    TWeakObjectPtr<UTelemetrySubsystem> WeakThis(this);

    Request->OnProcessRequestComplete().BindLambda(
        [WeakThis, Batch = MoveTemp(Batch), RetryCount]
        (FHttpRequestPtr Req, FHttpResponsePtr Response, bool bConnectedSuccessfully) mutable
        {
            UTelemetrySubsystem* Self = WeakThis.Get();
            if (!Self)
            {
                return;
            }

            if (bConnectedSuccessfully && Response.IsValid())
            {
                int32 Code = Response->GetResponseCode();

                if (Code >= 200 && Code < 300)
                {
                    // Success
                    Self->bIsFlushing = false;
                    Self->CurrentStatus = ETelemetryStatus::Connected;
                    if (Self->Queue.Num() == 0)
                    {
                        Self->ClearPersistedQueue();
                    }
                    else
                    {
                        Self->CurrentStatus = ETelemetryStatus::Queued;
                        Self->PersistQueue();
                    }
                    return;
                }

                // Client error — drop the batch
                if (Code >= 400 && Code < 500)
                {
                    UE_LOG(LogTemp, Warning,
                        TEXT("Telemetry batch rejected (%d), dropping events"), Code);
                    Self->bIsFlushing = false;
                    return;
                }
            }

            // Retry with exponential backoff
            if (RetryCount < MaxRetries - 1)
            {
                float Delay = FMath::Pow(2.0f, static_cast<float>(RetryCount));
                if (UWorld* World = Self->GetGameInstance()->GetWorld())
                {
                    FTimerHandle RetryHandle;
                    World->GetTimerManager().SetTimer(RetryHandle,
                        [WeakThis, Batch = MoveTemp(Batch), RetryCount]() mutable
                        {
                            if (UTelemetrySubsystem* S = WeakThis.Get())
                            {
                                S->SendBatch(MoveTemp(Batch), RetryCount + 1);
                            }
                        },
                        Delay, false);
                }
                return;
            }

            // All retries exhausted — re-enqueue and persist
            UE_LOG(LogTemp, Warning,
                TEXT("Telemetry flush failed after %d retries, persisted locally"), MaxRetries);
            Self->Queue.Insert(Batch, 0);
            Self->bIsFlushing = false;
            Self->CurrentStatus = ETelemetryStatus::Offline;
            Self->PersistQueue();
        });

    Request->ProcessRequest();
}

// ── Persistence ─────────────────────────────────────────────────────────────

void UTelemetrySubsystem::PersistQueue()
{
    UTelemetrySaveGame* SaveGame = Cast<UTelemetrySaveGame>(
        UGameplayStatics::CreateSaveGameObject(UTelemetrySaveGame::StaticClass()));
    if (SaveGame)
    {
        SaveGame->PendingEvents = Queue;
        SaveGame->PlayerId = PlayerId;
        UGameplayStatics::SaveGameToSlot(SaveGame, SaveSlotName, 0);
    }
}

void UTelemetrySubsystem::LoadPersistedQueue()
{
    UTelemetrySaveGame* SaveGame = Cast<UTelemetrySaveGame>(
        UGameplayStatics::LoadGameFromSlot(SaveSlotName, 0));
    if (SaveGame && SaveGame->PendingEvents.Num() > 0)
    {
        Queue.Append(SaveGame->PendingEvents);
    }
}

void UTelemetrySubsystem::ClearPersistedQueue()
{
    UGameplayStatics::DeleteGameInSlot(SaveSlotName, 0);
}

FString UTelemetrySubsystem::LoadOrCreatePlayerId()
{
    UTelemetrySaveGame* SaveGame = Cast<UTelemetrySaveGame>(
        UGameplayStatics::LoadGameFromSlot(SaveSlotName, 0));
    if (SaveGame && !SaveGame->PlayerId.IsEmpty())
    {
        return SaveGame->PlayerId;
    }

    FString NewId = FString::Printf(TEXT("player_%llx_%04x"),
        FDateTime::UtcNow().ToUnixTimestamp(),
        FMath::RandRange(0, 0xFFFF));

    // Persist immediately
    UTelemetrySaveGame* NewSave = Cast<UTelemetrySaveGame>(
        UGameplayStatics::CreateSaveGameObject(UTelemetrySaveGame::StaticClass()));
    if (NewSave)
    {
        NewSave->PlayerId = NewId;
        UGameplayStatics::SaveGameToSlot(NewSave, SaveSlotName, 0);
    }

    return NewId;
}

FString UTelemetrySubsystem::GenerateSessionId()
{
    return FString::Printf(TEXT("sess_%llx_%04x"),
        FDateTime::UtcNow().ToUnixTimestamp(),
        FMath::RandRange(0, 0xFFFF));
}

// ── JSON Helpers ────────────────────────────────────────────────────────────

FString UTelemetrySubsystem::EventArrayToJson(const TArray<FTelemetryEvent>& Events)
{
    FString Result = TEXT("{\\"events\\":[");
    for (int32 i = 0; i < Events.Num(); ++i)
    {
        if (i > 0) Result += TEXT(",");
        Result += EventToJson(Events[i]);
    }
    Result += TEXT("]}");
    return Result;
}

FString UTelemetrySubsystem::EventToJson(const FTelemetryEvent& Event)
{
    return FString::Printf(
        TEXT("{\\"eventType\\":\\"%s\\",\\"data\\":%s,\\"timestamp\\":\\"%s\\","
             "\\"sessionId\\":\\"%s\\",\\"playerId\\":\\"%s\\",\\"worldId\\":\\"%s\\"}"),
        *EscapeJsonString(Event.EventType),
        *Event.Data,
        *EscapeJsonString(Event.Timestamp),
        *EscapeJsonString(Event.SessionId),
        *EscapeJsonString(Event.PlayerId),
        *EscapeJsonString(Event.WorldId));
}

FString UTelemetrySubsystem::EscapeJsonString(const FString& Input)
{
    FString Output = Input;
    Output.ReplaceInline(TEXT("\\\\"), TEXT("\\\\\\\\"));
    Output.ReplaceInline(TEXT("\\""), TEXT("\\\\\\""));
    Output.ReplaceInline(TEXT("\\n"), TEXT("\\\\n"));
    Output.ReplaceInline(TEXT("\\r"), TEXT("\\\\r"));
    Output.ReplaceInline(TEXT("\\t"), TEXT("\\\\t"));
    return Output;
}
`;

  return { header, source };
}
