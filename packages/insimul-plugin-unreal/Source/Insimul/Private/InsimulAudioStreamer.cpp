// Copyright Insimul. All Rights Reserved.

#include "InsimulAudioStreamer.h"
#include "Components/AudioComponent.h"
#include "Sound/SoundWaveProcedural.h"
#include "GameFramework/Actor.h"

UInsimulAudioStreamer::UInsimulAudioStreamer()
{
    PrimaryComponentTick.bCanEverTick = true;
    PrimaryComponentTick.bStartWithTickEnabled = false;
}

void UInsimulAudioStreamer::BeginPlay()
{
    Super::BeginPlay();
    EnsureAudioComponent();
}

void UInsimulAudioStreamer::TickComponent(
    float DeltaTime,
    ELevelTick TickType,
    FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    if (!bIsPlaying)
    {
        return;
    }

    // Track playback time for current chunk
    CurrentChunkTimeRemaining -= DeltaTime;
    if (CurrentChunkTimeRemaining <= 0.0f)
    {
        OnChunkPlayed.Broadcast();

        if (ChunkQueue.Num() > 0)
        {
            StartNextChunk();
        }
        else
        {
            // All chunks played
            bIsPlaying = false;
            bIsBuffering = true;
            SetComponentTickEnabled(false);
            OnPlaybackComplete.Broadcast();
        }
    }
}

void UInsimulAudioStreamer::EnqueueChunk(const FInsimulAudioChunk& Chunk)
{
    ChunkQueue.Add(Chunk);

    // Start playback once we have enough buffered chunks
    if (bIsBuffering && ChunkQueue.Num() >= PreBufferChunks)
    {
        bIsBuffering = false;
        bIsPlaying = true;
        SetComponentTickEnabled(true);
        OnPlaybackStarted.Broadcast();
        StartNextChunk();
    }
}

void UInsimulAudioStreamer::StopPlayback()
{
    ChunkQueue.Empty();
    bIsPlaying = false;
    bIsBuffering = true;
    CurrentChunkTimeRemaining = 0.0f;
    SetComponentTickEnabled(false);

    if (AudioComp && AudioComp->IsPlaying())
    {
        AudioComp->Stop();
    }
}

void UInsimulAudioStreamer::StartNextChunk()
{
    if (ChunkQueue.Num() == 0)
    {
        return;
    }

    FInsimulAudioChunk Chunk = ChunkQueue[0];
    ChunkQueue.RemoveAt(0);

    CurrentChunkTimeRemaining = static_cast<float>(Chunk.DurationMs) / 1000.0f;

    // In production, create a USoundWaveProcedural, queue PCM data, and play.
    // The audio data would be decoded from the chunk encoding and fed to
    // the procedural sound wave's QueueAudio() method.
    EnsureAudioComponent();
    if (AudioComp && Chunk.Data.Num() > 0)
    {
        // Create procedural sound wave for this chunk
        USoundWaveProcedural* SoundWave = NewObject<USoundWaveProcedural>(this);
        SoundWave->SetSampleRate(Chunk.SampleRate);
        SoundWave->NumChannels = 1;
        SoundWave->Duration = CurrentChunkTimeRemaining;
        SoundWave->SoundGroup = SOUNDGROUP_Voice;
        SoundWave->bLooping = false;

        // Queue raw PCM audio data
        SoundWave->QueueAudio(Chunk.Data.GetData(), Chunk.Data.Num());

        AudioComp->SetSound(SoundWave);
        AudioComp->SetVolumeMultiplier(VolumeMultiplier);
        AudioComp->Play();
    }
}

void UInsimulAudioStreamer::EnsureAudioComponent()
{
    if (AudioComp)
    {
        return;
    }

    AActor* Owner = GetOwner();
    if (!Owner)
    {
        return;
    }

    // Find existing or create new AudioComponent
    AudioComp = Owner->FindComponentByClass<UAudioComponent>();
    if (!AudioComp)
    {
        AudioComp = NewObject<UAudioComponent>(Owner);
        AudioComp->SetupAttachment(Owner->GetRootComponent());
        AudioComp->RegisterComponent();
    }

    if (bSpatialAudio)
    {
        AudioComp->bOverrideAttenuation = true;
        AudioComp->AttenuationOverrides.bAttenuate = true;
        AudioComp->AttenuationOverrides.FalloffDistance = MaxAudibleDistance;
    }
}
