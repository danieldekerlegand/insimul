#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "Components/ScrollBox.h"
#include "Components/EditableTextBox.h"
#include "Components/TextBlock.h"
#include "Components/Image.h"
#include "Components/Button.h"
#include "Components/VerticalBox.h"
#include "InsimulChatPanel.generated.h"

/**
 * A single dialogue message entry in the chat panel.
 */
USTRUCT(BlueprintType)
struct FDialogueMessage
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadWrite, Category = "Insimul|Chat")
    FString Speaker;

    UPROPERTY(BlueprintReadWrite, Category = "Insimul|Chat")
    FString Text;

    UPROPERTY(BlueprintReadWrite, Category = "Insimul|Chat")
    bool bIsPlayer = false;

    UPROPERTY(BlueprintReadWrite, Category = "Insimul|Chat")
    FDateTime Timestamp;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPlayerMessageSent, const FString&, Message);

/**
 * Chat panel widget for NPC dialogue interactions.
 *
 * Provides a scrollable conversation history, text input for the player,
 * NPC portrait and name display, typing indicator, and contextual action
 * buttons (quest, trade, help, goodbye). Matches BabylonChatPanel.ts.
 */
UCLASS()
class INSIMULEXPORT_API UInsimulChatPanel : public UUserWidget
{
    GENERATED_BODY()

public:
    /** Add a message to the conversation history */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Chat")
    void AddMessage(const FString& Speaker, const FString& Text, bool bIsPlayer);

    /** Clear all messages from the conversation history */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Chat")
    void ClearHistory();

    /** Set the NPC name and portrait texture */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Chat")
    void SetNPCInfo(const FString& Name, UTexture2D* Portrait);

    /** Show the typing indicator with animated dots */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Chat")
    void ShowTypingIndicator();

    /** Hide the typing indicator */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Chat")
    void HideTypingIndicator();

    /** Show the chat panel with fade-in animation */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Chat")
    void ShowPanel();

    /** Hide the chat panel with fade-out animation */
    UFUNCTION(BlueprintCallable, Category = "Insimul|Chat")
    void HidePanel();

    /** Whether the panel is currently visible */
    UFUNCTION(BlueprintPure, Category = "Insimul|Chat")
    bool IsPanelVisible() const { return bPanelVisible; }

    /** Get the full message history */
    UFUNCTION(BlueprintPure, Category = "Insimul|Chat")
    const TArray<FDialogueMessage>& GetMessageHistory() const { return MessageHistory; }

    /** Fired when the player sends a message */
    UPROPERTY(BlueprintAssignable, Category = "Insimul|Chat")
    FOnPlayerMessageSent OnPlayerMessageSent;

protected:
    virtual void NativeConstruct() override;

    // --- UI components (bound from UMG or created in C++) ---

    /** Scrollable conversation history */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UScrollBox> ConversationScrollBox;

    /** Player text input field */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UEditableTextBox> MessageInputBox;

    /** Send button */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UButton> SendButton;

    /** NPC name display */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UTextBlock> NPCNameText;

    /** NPC portrait image */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UImage> NPCPortraitImage;

    /** Typing indicator text (animated dots) */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UTextBlock> TypingIndicatorText;

    /** Container for action buttons */
    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UVerticalBox> ActionButtonsContainer;

    // --- Action buttons ---

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UButton> AskAboutQuestButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UButton> TradeButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UButton> RequestHelpButton;

    UPROPERTY(BlueprintReadOnly, meta = (BindWidgetOptional), Category = "Insimul|Chat")
    TObjectPtr<UButton> SayGoodbyeButton;

private:
    UPROPERTY()
    TArray<FDialogueMessage> MessageHistory;

    UPROPERTY()
    bool bPanelVisible = false;

    UPROPERTY()
    bool bTypingIndicatorVisible = false;

    /** Timer handle for typing indicator animation */
    FTimerHandle TypingAnimTimerHandle;

    /** Current dot count for typing animation */
    int32 TypingDotCount = 0;

    UFUNCTION()
    void OnSendClicked();

    UFUNCTION()
    void OnInputCommitted(const FText& Text, ETextCommit::Type CommitMethod);

    UFUNCTION()
    void OnAskAboutQuestClicked();

    UFUNCTION()
    void OnTradeClicked();

    UFUNCTION()
    void OnRequestHelpClicked();

    UFUNCTION()
    void OnSayGoodbyeClicked();

    /** Send the current input text as a player message */
    void SendCurrentMessage();

    /** Animate the typing indicator dots */
    void AnimateTypingDots();

    /** Create a widget entry for a message in the scroll box */
    UWidget* CreateMessageWidget(const FDialogueMessage& Message);
};
