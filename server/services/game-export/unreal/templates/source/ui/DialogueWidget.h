#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/VerticalBox.h"
#include "Components/ScrollBox.h"
#include "Components/EditableTextBox.h"
#include "Components/TextBlock.h"
#include "Components/Button.h"
#include "Data/DialogueContextData.h"
#include "DialogueWidget.generated.h"

/**
 * Dialogue UI widget for NPC conversations.
 *
 * Displays NPC name, chat message history, a text input for the player,
 * and social action buttons with energy cost badges.
 * Integrates with UDialogueSystem and UInsimulAIService.
 */
UCLASS()
class INSIMULEXPORT_API UDialogueWidget : public UUserWidget
{
    GENERATED_BODY()

public:
    /** Initialize the widget and bind to DialogueSystem delegates */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Dialogue")
    void InitDialogueWidget();

    /** Open dialogue with a specific NPC */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Dialogue")
    void OpenDialogue(const FString& NPCId);

    /** Close dialogue and hide the widget */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Dialogue")
    void CloseDialogue();

    /** Add a chat message to the history */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Dialogue")
    void AddChatMessage(const FString& Speaker, const FString& Message, bool bIsPlayer);

    /** Refresh the action buttons based on current energy */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Dialogue")
    void RefreshActions(float PlayerEnergy);

    /** Get the NPC name currently in dialogue */
    UFUNCTION(BlueprintPure, Category = "Insimul|Dialogue")
    FString GetCurrentNPCName() const { return CurrentNPCName; }

    /** Whether the widget is currently showing dialogue */
    UFUNCTION(BlueprintPure, Category = "Insimul|Dialogue")
    bool IsDialogueOpen() const { return bIsOpen; }

protected:
    virtual void NativeConstruct() override;

    // --- UI components (bound from UMG or created in C++) ---

    /** Root container for the entire dialogue panel */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UVerticalBox> DialogueRoot;

    /** NPC name display */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UTextBlock> NPCNameText;

    /** NPC greeting / status text */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UTextBlock> GreetingText;

    /** Scrollable chat history */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UScrollBox> ChatScrollBox;

    /** Player text input field */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UEditableTextBox> PlayerInputBox;

    /** Send button for player messages */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UButton> SendButton;

    /** Close button */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UButton> CloseButton;

    /** Container for action buttons */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UVerticalBox> ActionsContainer;

    /** Hint text at the bottom */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Dialogue")
    TObjectPtr<UTextBlock> HintText;

private:
    UPROPERTY()
    bool bIsOpen = false;

    UPROPERTY()
    FString CurrentNPCId;

    UPROPERTY()
    FString CurrentNPCName;

    /** Handle player sending a chat message */
    UFUNCTION()
    void OnSendClicked();

    /** Handle player pressing Enter in the input box */
    UFUNCTION()
    void OnInputCommitted(const FText& Text, ETextCommit::Type CommitMethod);

    /** Handle close button click */
    UFUNCTION()
    void OnCloseClicked();

    /** Handle AI chat response chunk (streaming) */
    void OnAIChatChunk(const FString& Chunk);

    /** Handle AI chat response complete */
    void OnAIChatComplete(const FString& FullResponse);

    /** Handle AI chat error */
    void OnAIChatError(const FString& ErrorMessage);

    /** Send player message text to the AI service */
    void SendPlayerMessage(const FString& Message);

    /** Create a single action button and add to ActionsContainer */
    void CreateActionButton(const FString& ActionId, const FString& ActionName, float EnergyCost, bool bCanAfford);

    /** Accumulated streaming response text */
    FString StreamingResponseText;

    /** The text block currently being streamed into (for AI responses) */
    UPROPERTY()
    TObjectPtr<UTextBlock> StreamingMessageBlock;
};
