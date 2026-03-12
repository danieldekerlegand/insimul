// Copyright Insimul. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "InsimulTypes.h"
#include "InsimulAudioStreamer.generated.h"

/**
 * UInsimulAudioStreamer — Streaming TTS playback via UAudioComponent.
 *
 * Receives audio chunks from the Insimul conversation service and plays
 * them back seamlessly through the owning Actor's AudioComponent.
 * Pre-buffers chunks to prevent stuttering.
 */
UCLASS(ClassGroup = (Insimul), meta = (BlueprintSpawnableComponent))
class INSIMUL_API UInsimulAudioStreamer : public UActorComponent
{
    GENERATED_BODY()

public:
    UInsimulAudioStreamer();

    // ── Configuration ─────────────────────────────────────────────────────

    /** Number of chunks to buffer before starting playback */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Audio", meta = (ClampMin = "1", ClampMax = "10"))
    int32 PreBufferChunks = 3;

    /** Volume multiplier for NPC speech */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Audio", meta = (ClampMin = "0.0", ClampMax = "2.0"))
    float VolumeMultiplier = 1.0f;

    /** Enable spatial (3D) audio — voice attenuates with distance */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Audio")
    bool bSpatialAudio = true;

    /** Max distance in world units at which NPC voice is audible */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Insimul|Audio", meta = (ClampMin = "100.0", EditCondition = "bSpatialAudio"))
    float MaxAudibleDistance = 3000.0f;

    // ── Playback Control ──────────────────────────────────────────────────

    /** Enqueue an audio chunk for playback */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Audio")
    void EnqueueChunk(const FInsimulAudioChunk& Chunk);

    /** Stop playback and clear all queued chunks */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Audio")
    void StopPlayback();

    /** Check if audio is currently playing or buffered */
    UFUNCTION(BlueprintPure, Category = "Insimul|Audio")
    bool IsPlaying() const { return bIsPlaying; }

    /** Get the number of chunks currently queued */
    UFUNCTION(BlueprintPure, Category = "Insimul|Audio")
    int32 GetQueuedChunkCount() const { return ChunkQueue.Num(); }

    // ── Events ────────────────────────────────────────────────────────────

    /** Fired when playback starts */
    DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPlaybackStarted);
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Audio|Events")
    FOnPlaybackStarted OnPlaybackStarted;

    /** Fired when a chunk finishes playing */
    DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnChunkPlayed);
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Audio|Events")
    FOnChunkPlayed OnChunkPlayed;

    /** Fired when all queued chunks have been played */
    DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnPlaybackComplete);
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Audio|Events")
    FOnPlaybackComplete OnPlaybackComplete;

protected:
    virtual void BeginPlay() override;
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    TArray<FInsimulAudioChunk> ChunkQueue;
    bool bIsPlaying = false;
    bool bIsBuffering = true;
    float CurrentChunkTimeRemaining = 0.0f;

    UPROPERTY()
    TObjectPtr<class UAudioComponent> AudioComp;

    void StartNextChunk();
    void EnsureAudioComponent();
};
