// Copyright Insimul. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "InsimulTypes.h"
#include "InsimulChatbotComponent.generated.h"

class UInsimulHttpClient;

/**
 * UInsimulChatbotComponent — Attach to any NPC Actor to enable
 * AI-powered conversation via the Insimul service.
 *
 * Handles session lifecycle, streams text/audio/viseme responses,
 * and exposes all events as BlueprintAssignable delegates.
 */
UCLASS(ClassGroup = (Insimul), meta = (BlueprintSpawnableComponent))
class INSIMUL_API UInsimulChatbotComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UInsimulChatbotComponent();

    // ── Configuration ─────────────────────────────────────────────────────

    /** Insimul character ID that this NPC maps to */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Character")
    FString CharacterId;

    /** Language code override (empty = use subsystem default) */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Character")
    FString LanguageCode;

    // ── Conversation Lifecycle ────────────────────────────────────────────

    /** Start a new conversation (or resume with optional SessionId) */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    FString StartConversation(const FString& ResumeSessionId = TEXT(""));

    /** Send text to the NPC — responses stream back via delegates */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    void SendText(const FString& Text);

    /** Send recorded audio to the NPC */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    void SendAudio(const TArray<uint8>& AudioData);

    /** End the current conversation */
    UFUNCTION(BlueprintCallable, Category = "Insimul")
    void EndConversation();

    /** Check if a conversation is active */
    UFUNCTION(BlueprintPure, Category = "Insimul")
    bool IsConversationActive() const { return State == EInsimulConversationState::Active || State == EInsimulConversationState::Started; }

    /** Get current session ID */
    UFUNCTION(BlueprintPure, Category = "Insimul")
    FString GetSessionId() const { return SessionId; }

    /** Get current conversation state */
    UFUNCTION(BlueprintPure, Category = "Insimul")
    EInsimulConversationState GetConversationState() const { return State; }

    // ── Blueprint Events ──────────────────────────────────────────────────

    /** Fired for each streamed text token */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Events")
    FOnInsimulTextChunk OnTextChunk;

    /** Fired for each audio chunk from TTS */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Events")
    FOnInsimulAudioChunk OnAudioChunk;

    /** Fired when facial/viseme data arrives */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Events")
    FOnInsimulFacialData OnFacialData;

    /** Fired when the server triggers a game action */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Events")
    FOnInsimulActionTrigger OnActionTrigger;

    /** Fired when STT transcription is available */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Events")
    FOnInsimulTranscript OnTranscript;

    /** Fired on conversation state change */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Events")
    FOnInsimulStateChange OnStateChange;

    /** Fired on error */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Events")
    FOnInsimulError OnError;

protected:
    virtual void BeginPlay() override;
    virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

private:
    FString SessionId;
    EInsimulConversationState State = EInsimulConversationState::Unspecified;

    UPROPERTY()
    TObjectPtr<UInsimulHttpClient> HttpClient;

    void SetState(EInsimulConversationState NewState);
    void BindHttpClientDelegates();
    void UnbindHttpClientDelegates();

    // Forwarding UFUNCTIONs for delegate binding
    UFUNCTION()
    void HandleTextChunk(const FInsimulTextChunk& Chunk);
    UFUNCTION()
    void HandleAudioChunk(const FInsimulAudioChunk& Chunk);
    UFUNCTION()
    void HandleFacialData(const FInsimulFacialData& Data);
    UFUNCTION()
    void HandleActionTrigger(const FInsimulActionTrigger& Action);
    UFUNCTION()
    void HandleTranscript(const FString& TranscribedText);
    UFUNCTION()
    void HandleError(const FString& ErrorMessage);
};
