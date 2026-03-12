// Copyright Insimul. All Rights Reserved.

#include "InsimulChatbotComponent.h"
#include "InsimulSubsystem.h"
#include "InsimulHttpClient.h"
#include "Engine/GameInstance.h"

UInsimulChatbotComponent::UInsimulChatbotComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void UInsimulChatbotComponent::BeginPlay()
{
    Super::BeginPlay();
}

void UInsimulChatbotComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
    if (IsConversationActive())
    {
        EndConversation();
    }
    Super::EndPlay(EndPlayReason);
}

FString UInsimulChatbotComponent::StartConversation(const FString& ResumeSessionId)
{
    // End any existing conversation
    if (IsConversationActive())
    {
        EndConversation();
    }

    // Get subsystem
    UGameInstance* GI = GetOwner()->GetGameInstance();
    if (!GI)
    {
        OnError.Broadcast(TEXT("No GameInstance available"));
        return FString();
    }

    UInsimulSubsystem* Subsystem = GI->GetSubsystem<UInsimulSubsystem>();
    if (!Subsystem)
    {
        OnError.Broadcast(TEXT("InsimulSubsystem not found"));
        return FString();
    }

    // Get or create HTTP client
    HttpClient = Subsystem->GetHttpClient();
    BindHttpClientDelegates();

    // Create or reuse session ID
    SessionId = ResumeSessionId.IsEmpty() ? Subsystem->CreateSessionId() : ResumeSessionId;
    SetState(EInsimulConversationState::Started);

    return SessionId;
}

void UInsimulChatbotComponent::SendText(const FString& Text)
{
    if (!IsConversationActive())
    {
        OnError.Broadcast(TEXT("No active conversation. Call StartConversation() first."));
        return;
    }
    if (!HttpClient)
    {
        OnError.Broadcast(TEXT("HTTP client not initialized"));
        return;
    }

    SetState(EInsimulConversationState::Active);
    HttpClient->SendText(SessionId, CharacterId, Text, LanguageCode);
}

void UInsimulChatbotComponent::SendAudio(const TArray<uint8>& AudioData)
{
    if (!IsConversationActive())
    {
        OnError.Broadcast(TEXT("No active conversation. Call StartConversation() first."));
        return;
    }
    if (!HttpClient)
    {
        OnError.Broadcast(TEXT("HTTP client not initialized"));
        return;
    }

    SetState(EInsimulConversationState::Active);
    HttpClient->SendAudio(SessionId, CharacterId, AudioData, LanguageCode);
}

void UInsimulChatbotComponent::EndConversation()
{
    if (HttpClient && !SessionId.IsEmpty())
    {
        HttpClient->CancelActiveRequest();
        HttpClient->EndSession(SessionId);
        UnbindHttpClientDelegates();
    }

    SetState(EInsimulConversationState::Ended);
    SessionId.Empty();
    HttpClient = nullptr;
}

void UInsimulChatbotComponent::SetState(EInsimulConversationState NewState)
{
    if (State != NewState)
    {
        State = NewState;
        OnStateChange.Broadcast(NewState);
    }
}

void UInsimulChatbotComponent::BindHttpClientDelegates()
{
    if (!HttpClient) return;

    HttpClient->OnTextChunk.AddDynamic(this, &UInsimulChatbotComponent::HandleTextChunk);
    HttpClient->OnAudioChunk.AddDynamic(this, &UInsimulChatbotComponent::HandleAudioChunk);
    HttpClient->OnFacialData.AddDynamic(this, &UInsimulChatbotComponent::HandleFacialData);
    HttpClient->OnActionTrigger.AddDynamic(this, &UInsimulChatbotComponent::HandleActionTrigger);
    HttpClient->OnTranscript.AddDynamic(this, &UInsimulChatbotComponent::HandleTranscript);
    HttpClient->OnError.AddDynamic(this, &UInsimulChatbotComponent::HandleError);
}

void UInsimulChatbotComponent::UnbindHttpClientDelegates()
{
    if (!HttpClient) return;

    HttpClient->OnTextChunk.RemoveDynamic(this, &UInsimulChatbotComponent::HandleTextChunk);
    HttpClient->OnAudioChunk.RemoveDynamic(this, &UInsimulChatbotComponent::HandleAudioChunk);
    HttpClient->OnFacialData.RemoveDynamic(this, &UInsimulChatbotComponent::HandleFacialData);
    HttpClient->OnActionTrigger.RemoveDynamic(this, &UInsimulChatbotComponent::HandleActionTrigger);
    HttpClient->OnTranscript.RemoveDynamic(this, &UInsimulChatbotComponent::HandleTranscript);
    HttpClient->OnError.RemoveDynamic(this, &UInsimulChatbotComponent::HandleError);
}

void UInsimulChatbotComponent::HandleTextChunk(const FInsimulTextChunk& Chunk)
{
    OnTextChunk.Broadcast(Chunk);
}

void UInsimulChatbotComponent::HandleAudioChunk(const FInsimulAudioChunk& Chunk)
{
    OnAudioChunk.Broadcast(Chunk);
}

void UInsimulChatbotComponent::HandleFacialData(const FInsimulFacialData& Data)
{
    OnFacialData.Broadcast(Data);
}

void UInsimulChatbotComponent::HandleActionTrigger(const FInsimulActionTrigger& Action)
{
    OnActionTrigger.Broadcast(Action);
}

void UInsimulChatbotComponent::HandleTranscript(const FString& TranscribedText)
{
    OnTranscript.Broadcast(TranscribedText);
}

void UInsimulChatbotComponent::HandleError(const FString& ErrorMessage)
{
    OnError.Broadcast(ErrorMessage);
}
