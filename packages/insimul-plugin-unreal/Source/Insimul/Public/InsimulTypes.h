// Copyright Insimul. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "InsimulTypes.generated.h"

/**
 * Audio encoding format for streaming audio data.
 */
UENUM(BlueprintType)
enum class EInsimulAudioEncoding : uint8
{
    Unspecified = 0,
    PCM = 1,
    OPUS = 2,
    MP3 = 3
};

/**
 * Conversation state.
 */
UENUM(BlueprintType)
enum class EInsimulConversationState : uint8
{
    Unspecified = 0,
    Started = 1,
    Active = 2,
    Paused = 3,
    Ended = 4
};

/**
 * A single viseme for lip sync.
 */
USTRUCT(BlueprintType)
struct INSIMUL_API FInsimulViseme
{
    GENERATED_BODY()

    /** Phoneme name (e.g., "aa", "oh", "sil") */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString Phoneme;

    /** Blend weight 0..1 */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    float Weight = 0.0f;

    /** Duration in milliseconds */
    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    int32 DurationMs = 0;
};

/**
 * Facial/viseme data for a single response chunk.
 */
USTRUCT(BlueprintType)
struct INSIMUL_API FInsimulFacialData
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    TArray<FInsimulViseme> Visemes;
};

/**
 * A text chunk from the conversation stream.
 */
USTRUCT(BlueprintType)
struct INSIMUL_API FInsimulTextChunk
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString Text;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    bool bIsFinal = false;
};

/**
 * An audio chunk from the TTS stream.
 */
USTRUCT(BlueprintType)
struct INSIMUL_API FInsimulAudioChunk
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    TArray<uint8> Data;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    EInsimulAudioEncoding Encoding = EInsimulAudioEncoding::Unspecified;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    int32 SampleRate = 16000;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    int32 DurationMs = 0;
};

/**
 * A server-triggered game action.
 */
USTRUCT(BlueprintType)
struct INSIMUL_API FInsimulActionTrigger
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString ActionType;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    FString TargetId;

    UPROPERTY(BlueprintReadOnly, Category = "Insimul")
    TMap<FString, FString> Parameters;
};

/**
 * Configuration for connecting to the Insimul service.
 */
USTRUCT(BlueprintType)
struct INSIMUL_API FInsimulConfig
{
    GENERATED_BODY()

    /** Base URL of the Insimul server (e.g., "https://api.insimul.com") */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul")
    FString ServerUrl = TEXT("http://localhost:3000");

    /** API key for authentication */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul")
    FString ApiKey;

    /** World ID to scope all conversations */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul")
    FString WorldId;

    /** Default language code */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul")
    FString LanguageCode = TEXT("en");
};

// ── Delegate declarations ──────────────────────────────────────────────────

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInsimulTextChunk, const FInsimulTextChunk&, Chunk);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInsimulAudioChunk, const FInsimulAudioChunk&, Chunk);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInsimulFacialData, const FInsimulFacialData&, Data);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInsimulActionTrigger, const FInsimulActionTrigger&, Action);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInsimulStateChange, EInsimulConversationState, NewState);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInsimulError, const FString&, ErrorMessage);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnInsimulTranscript, const FString&, TranscribedText);
