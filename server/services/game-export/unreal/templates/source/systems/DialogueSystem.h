#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Data/DialogueContextData.h"
#include "DialogueSystem.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDialogueStarted, const FString&, NPCId);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnDialogueEnded);

/**
 * NPC dialogue and conversation management with AI-powered chat.
 */
UCLASS()
class INSIMULEXPORT_API UDialogueSystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    virtual void Deinitialize() override;

    /** Load data from WorldIR JSON */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DialogueSystem")
    void LoadFromIR(const FString& JsonString);

    /** Load dialogue contexts and AI config from JSON files */
    UFUNCTION(BlueprintCallable, Category = "Insimul|DialogueSystem")
    void LoadDialogueData();

    UFUNCTION(BlueprintCallable, Category = "Dialogue")
    void StartDialogue(const FString& NPCCharacterId);

    UFUNCTION(BlueprintCallable, Category = "Dialogue")
    void EndDialogue();

    UPROPERTY(BlueprintReadOnly, Category = "Dialogue")
    bool bIsInDialogue = false;

    UPROPERTY(BlueprintReadOnly, Category = "Dialogue")
    FString CurrentNPCId;

    UPROPERTY(BlueprintAssignable, Category = "Dialogue")
    FOnDialogueStarted OnDialogueStarted;

    UPROPERTY(BlueprintAssignable, Category = "Dialogue")
    FOnDialogueEnded OnDialogueEnded;

private:
    FInsimulAIConfig AIConfig;
    TArray<FInsimulDialogueContext> DialogueContexts;
};
