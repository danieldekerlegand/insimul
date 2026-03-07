#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "DialogueSystem.generated.h"

/**
 * NPC dialogue and conversation management
 * Ported from Insimul's Babylon.js DialogueSystem to Unreal subsystem.
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

    UFUNCTION(BlueprintCallable, Category = "Dialogue")
    void StartDialogue(const FString& NPCCharacterId);

    UFUNCTION(BlueprintCallable, Category = "Dialogue")
    void EndDialogue();

    UPROPERTY(BlueprintReadOnly, Category = "Dialogue")
    bool bIsInDialogue = false;

    UPROPERTY(BlueprintReadOnly, Category = "Dialogue")
    FString CurrentNPCId;
};
