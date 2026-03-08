#include "DialogueSystem.h"
#include "Services/InsimulAIService.h"
#include "Dom/JsonObject.h"
#include "Dom/JsonValue.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"

void UDialogueSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    LoadDialogueData();
    UE_LOG(LogTemp, Log, TEXT("[Insimul] DialogueSystem initialized"));
}

void UDialogueSystem::Deinitialize()
{
    Super::Deinitialize();
}

void UDialogueSystem::LoadDialogueData()
{
    // Load AI Config
    FString ConfigPath = FPaths::ProjectContentDir() / TEXT("Data/AIConfig.json");
    FString ConfigJson;
    if (FFileHelper::LoadFileToString(ConfigJson, *ConfigPath))
    {
        TSharedPtr<FJsonObject> ConfigObj;
        TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(ConfigJson);
        if (FJsonSerializer::Deserialize(Reader, ConfigObj) && ConfigObj.IsValid())
        {
            AIConfig.ApiMode = ConfigObj->GetStringField(TEXT("apiMode"));
            AIConfig.InsimulEndpoint = ConfigObj->GetStringField(TEXT("insimulEndpoint"));
            AIConfig.GeminiModel = ConfigObj->GetStringField(TEXT("geminiModel"));
            AIConfig.GeminiApiKey = ConfigObj->GetStringField(TEXT("geminiApiKeyPlaceholder"));
            AIConfig.bVoiceEnabled = ConfigObj->GetBoolField(TEXT("voiceEnabled"));
            AIConfig.DefaultVoice = ConfigObj->GetStringField(TEXT("defaultVoice"));
            UE_LOG(LogTemp, Log, TEXT("[Insimul] AI config loaded: mode=%s"), *AIConfig.ApiMode);
        }
    }
    else
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] AIConfig.json not found, using defaults"));
    }

    // Load Dialogue Contexts
    FString ContextsPath = FPaths::ProjectContentDir() / TEXT("Data/DT_DialogueContexts.json");
    FString ContextsJson;
    if (FFileHelper::LoadFileToString(ContextsJson, *ContextsPath))
    {
        TArray<TSharedPtr<FJsonValue>> ContextsArray;
        TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(ContextsJson);
        if (FJsonSerializer::Deserialize(Reader, ContextsArray))
        {
            for (const auto& Val : ContextsArray)
            {
                auto Obj = Val->AsObject();
                if (!Obj) continue;

                FInsimulDialogueContext Ctx;
                Ctx.CharacterId = Obj->GetStringField(TEXT("characterId"));
                Ctx.CharacterName = Obj->GetStringField(TEXT("characterName"));
                Ctx.SystemPrompt = Obj->GetStringField(TEXT("systemPrompt"));
                Ctx.Greeting = Obj->GetStringField(TEXT("greeting"));
                Ctx.Voice = Obj->GetStringField(TEXT("voice"));

                const TArray<TSharedPtr<FJsonValue>>* TruthsArr;
                if (Obj->TryGetArrayField(TEXT("truths"), TruthsArr))
                {
                    for (const auto& TruthVal : *TruthsArr)
                    {
                        auto TruthObj = TruthVal->AsObject();
                        if (!TruthObj) continue;
                        FInsimulDialogueTruth Truth;
                        Truth.Title = TruthObj->GetStringField(TEXT("title"));
                        Truth.Content = TruthObj->GetStringField(TEXT("content"));
                        Ctx.Truths.Add(Truth);
                    }
                }

                DialogueContexts.Add(Ctx);
            }
            UE_LOG(LogTemp, Log, TEXT("[Insimul] Loaded %d dialogue contexts"), DialogueContexts.Num());
        }
    }
    else
    {
        UE_LOG(LogTemp, Warning, TEXT("[Insimul] DT_DialogueContexts.json not found"));
    }

    // Initialize AI Service
    UInsimulAIService* AIService = GetGameInstance()->GetSubsystem<UInsimulAIService>();
    if (AIService)
    {
        AIService->InitializeService(AIConfig, DialogueContexts);
    }
}

void UDialogueSystem::LoadFromIR(const FString& JsonString)
{
    TSharedPtr<FJsonObject> Root;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    if (!FJsonSerializer::Deserialize(Reader, Root) || !Root.IsValid()) return;

    UE_LOG(LogTemp, Log, TEXT("[Insimul] DialogueSystem loaded from IR"));
}

void UDialogueSystem::StartDialogue(const FString& NPCCharacterId)
{
    if (bIsInDialogue)
    {
        EndDialogue();
    }

    bIsInDialogue = true;
    CurrentNPCId = NPCCharacterId;
    OnDialogueStarted.Broadcast(NPCCharacterId);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] StartDialogue with NPC: %s"), *NPCCharacterId);
}

void UDialogueSystem::EndDialogue()
{
    FString PrevNPCId = CurrentNPCId;
    bIsInDialogue = false;
    CurrentNPCId = TEXT("");
    OnDialogueEnded.Broadcast();
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EndDialogue with NPC: %s"), *PrevNPCId);
}
