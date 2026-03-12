// Copyright Insimul. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "InsimulTypes.h"
#include "Http.h"
#include "InsimulHttpClient.generated.h"

/**
 * HTTP/SSE client for communicating with the Insimul conversation service.
 * Uses UE's HTTP module with async processing — never blocks the game thread.
 */
UCLASS()
class INSIMUL_API UInsimulHttpClient : public UObject
{
    GENERATED_BODY()

public:
    /** Initialize with server configuration */
    void Initialize(const FInsimulConfig& InConfig);

    /**
     * Send a text message and stream the response via SSE.
     * Callbacks fire on the game thread.
     */
    void SendText(
        const FString& SessionId,
        const FString& CharacterId,
        const FString& Text,
        const FString& LanguageCode
    );

    /**
     * Send recorded audio and stream the response via SSE.
     */
    void SendAudio(
        const FString& SessionId,
        const FString& CharacterId,
        const TArray<uint8>& AudioData,
        const FString& LanguageCode
    );

    /** End a conversation session (best-effort POST) */
    void EndSession(const FString& SessionId);

    /** Cancel any in-flight request */
    void CancelActiveRequest();

    // ── Delegates ──────────────────────────────────────────────────────────

    FOnInsimulTextChunk OnTextChunk;
    FOnInsimulAudioChunk OnAudioChunk;
    FOnInsimulFacialData OnFacialData;
    FOnInsimulActionTrigger OnActionTrigger;
    FOnInsimulTranscript OnTranscript;
    FOnInsimulError OnError;

private:
    FInsimulConfig Config;

    /** Handle to current in-flight HTTP request */
    TSharedPtr<IHttpRequest, ESPMode::ThreadSafe> ActiveRequest;

    /** Build common HTTP headers */
    void SetAuthHeaders(TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request) const;

    /** Parse SSE response body and dispatch events */
    void ParseSSEResponse(const FString& ResponseBody);

    /** Parse a single SSE JSON event */
    void DispatchSSEEvent(const TSharedPtr<FJsonObject>& JsonEvent);
};
