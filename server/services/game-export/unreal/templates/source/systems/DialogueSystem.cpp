#include "DialogueSystem.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

void UDialogueSystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] DialogueSystem initialized"));
}

void UDialogueSystem::Deinitialize()
{
    Super::Deinitialize();
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
    bIsInDialogue = true;
    CurrentNPCId = NPCCharacterId;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] StartDialogue with NPC: %s"), *NPCCharacterId);
}

void UDialogueSystem::EndDialogue()
{
    bIsInDialogue = false;
    CurrentNPCId = TEXT("");
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EndDialogue"));
}
