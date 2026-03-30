#include "InsimulChatPanel.h"
#include "Components/TextBlock.h"
#include "Components/ScrollBox.h"
#include "Components/EditableTextBox.h"
#include "Components/Image.h"
#include "Components/Button.h"
#include "Components/VerticalBox.h"
#include "Components/Spacer.h"
#include "Components/HorizontalBox.h"
#include "Components/HorizontalBoxSlot.h"
#include "TimerManager.h"

void UInsimulChatPanel::NativeConstruct()
{
    Super::NativeConstruct();

    if (SendButton)
    {
        SendButton->OnClicked.AddDynamic(this, &UInsimulChatPanel::OnSendClicked);
    }

    if (MessageInputBox)
    {
        MessageInputBox->OnTextCommitted.AddDynamic(this, &UInsimulChatPanel::OnInputCommitted);
    }

    if (AskAboutQuestButton)
    {
        AskAboutQuestButton->OnClicked.AddDynamic(this, &UInsimulChatPanel::OnAskAboutQuestClicked);
    }

    if (TradeButton)
    {
        TradeButton->OnClicked.AddDynamic(this, &UInsimulChatPanel::OnTradeClicked);
    }

    if (RequestHelpButton)
    {
        RequestHelpButton->OnClicked.AddDynamic(this, &UInsimulChatPanel::OnRequestHelpClicked);
    }

    if (SayGoodbyeButton)
    {
        SayGoodbyeButton->OnClicked.AddDynamic(this, &UInsimulChatPanel::OnSayGoodbyeClicked);
    }

    // Start hidden
    SetVisibility(ESlateVisibility::Collapsed);
    HideTypingIndicator();
}

void UInsimulChatPanel::AddMessage(const FString& Speaker, const FString& Text, bool bIsPlayer)
{
    FDialogueMessage NewMessage;
    NewMessage.Speaker = Speaker;
    NewMessage.Text = Text;
    NewMessage.bIsPlayer = bIsPlayer;
    NewMessage.Timestamp = FDateTime::Now();

    MessageHistory.Add(NewMessage);

    if (ConversationScrollBox)
    {
        UWidget* MessageWidget = CreateMessageWidget(NewMessage);
        if (MessageWidget)
        {
            ConversationScrollBox->AddChild(MessageWidget);

            // Add spacing between messages
            USpacer* Spacer = NewObject<USpacer>(ConversationScrollBox);
            Spacer->SetSize(FVector2D(0.0f, 4.0f));
            ConversationScrollBox->AddChild(Spacer);

            // Auto-scroll to bottom
            ConversationScrollBox->ScrollToEnd();
        }
    }
}

void UInsimulChatPanel::ClearHistory()
{
    MessageHistory.Empty();

    if (ConversationScrollBox)
    {
        ConversationScrollBox->ClearChildren();
    }
}

void UInsimulChatPanel::SetNPCInfo(const FString& Name, UTexture2D* Portrait)
{
    if (NPCNameText)
    {
        NPCNameText->SetText(FText::FromString(Name));
    }

    if (NPCPortraitImage && Portrait)
    {
        NPCPortraitImage->SetBrushFromTexture(Portrait);
        NPCPortraitImage->SetVisibility(ESlateVisibility::SelfHitTestInvisible);
    }
    else if (NPCPortraitImage)
    {
        NPCPortraitImage->SetVisibility(ESlateVisibility::Collapsed);
    }
}

void UInsimulChatPanel::ShowTypingIndicator()
{
    bTypingIndicatorVisible = true;
    TypingDotCount = 0;

    if (TypingIndicatorText)
    {
        TypingIndicatorText->SetVisibility(ESlateVisibility::SelfHitTestInvisible);
        TypingIndicatorText->SetText(FText::FromString(TEXT("...")));
    }

    // Start animation timer
    if (UWorld* World = GetWorld())
    {
        World->GetTimerManager().SetTimer(
            TypingAnimTimerHandle,
            FTimerDelegate::CreateUObject(this, &UInsimulChatPanel::AnimateTypingDots),
            0.4f,
            true
        );
    }
}

void UInsimulChatPanel::HideTypingIndicator()
{
    bTypingIndicatorVisible = false;

    if (TypingIndicatorText)
    {
        TypingIndicatorText->SetVisibility(ESlateVisibility::Collapsed);
    }

    if (UWorld* World = GetWorld())
    {
        World->GetTimerManager().ClearTimer(TypingAnimTimerHandle);
    }
}

void UInsimulChatPanel::ShowPanel()
{
    bPanelVisible = true;
    SetVisibility(ESlateVisibility::SelfHitTestInvisible);

    // Play fade-in animation if available
    if (UWidgetAnimation* FadeIn = nullptr; false)
    {
        PlayAnimation(FadeIn);
    }
    else
    {
        SetRenderOpacity(1.0f);
    }

    UE_LOG(LogTemp, Log, TEXT("[InsimulChatPanel] Panel shown"));
}

void UInsimulChatPanel::HidePanel()
{
    bPanelVisible = false;

    // Play fade-out then collapse
    SetRenderOpacity(0.0f);
    SetVisibility(ESlateVisibility::Collapsed);

    HideTypingIndicator();

    UE_LOG(LogTemp, Log, TEXT("[InsimulChatPanel] Panel hidden"));
}

void UInsimulChatPanel::OnSendClicked()
{
    SendCurrentMessage();
}

void UInsimulChatPanel::OnInputCommitted(const FText& Text, ETextCommit::Type CommitMethod)
{
    if (CommitMethod != ETextCommit::OnEnter) return;
    SendCurrentMessage();
}

void UInsimulChatPanel::OnAskAboutQuestClicked()
{
    OnPlayerMessageSent.Broadcast(TEXT("/ask_quest"));
}

void UInsimulChatPanel::OnTradeClicked()
{
    OnPlayerMessageSent.Broadcast(TEXT("/trade"));
}

void UInsimulChatPanel::OnRequestHelpClicked()
{
    OnPlayerMessageSent.Broadcast(TEXT("/request_help"));
}

void UInsimulChatPanel::OnSayGoodbyeClicked()
{
    OnPlayerMessageSent.Broadcast(TEXT("/goodbye"));
    HidePanel();
}

void UInsimulChatPanel::SendCurrentMessage()
{
    if (!MessageInputBox) return;

    FString Message = MessageInputBox->GetText().ToString().TrimStartAndEnd();
    if (Message.IsEmpty()) return;

    // Add player message to history
    AddMessage(TEXT("You"), Message, true);

    // Broadcast the message
    OnPlayerMessageSent.Broadcast(Message);

    // Clear input field
    MessageInputBox->SetText(FText::GetEmpty());
}

void UInsimulChatPanel::AnimateTypingDots()
{
    if (!bTypingIndicatorVisible || !TypingIndicatorText) return;

    TypingDotCount = (TypingDotCount % 3) + 1;

    FString Dots;
    for (int32 i = 0; i < TypingDotCount; ++i)
    {
        Dots += TEXT(".");
    }

    TypingIndicatorText->SetText(FText::FromString(Dots));
}

UWidget* UInsimulChatPanel::CreateMessageWidget(const FDialogueMessage& Message)
{
    if (!ConversationScrollBox) return nullptr;

    UHorizontalBox* Row = NewObject<UHorizontalBox>(ConversationScrollBox);

    // Speaker label
    UTextBlock* SpeakerText = NewObject<UTextBlock>(Row);
    SpeakerText->SetText(FText::FromString(FString::Printf(TEXT("%s: "), *Message.Speaker)));
    FSlateFontInfo SpeakerFont = SpeakerText->GetFont();
    SpeakerFont.Size = 13;
    SpeakerText->SetFont(SpeakerFont);

    if (Message.bIsPlayer)
    {
        SpeakerText->SetColorAndOpacity(FSlateColor(FLinearColor(0.6f, 0.8f, 1.0f)));
    }
    else
    {
        SpeakerText->SetColorAndOpacity(FSlateColor(FLinearColor(1.0f, 0.85f, 0.4f)));
    }

    UHorizontalBoxSlot* SpeakerSlot = Row->AddChildToHorizontalBox(SpeakerText);
    SpeakerSlot->SetVerticalAlignment(VAlign_Top);
    SpeakerSlot->SetAutoSize(true);

    // Message text
    UTextBlock* MsgText = NewObject<UTextBlock>(Row);
    MsgText->SetText(FText::FromString(Message.Text));
    FSlateFontInfo MsgFont = MsgText->GetFont();
    MsgFont.Size = 13;
    MsgText->SetFont(MsgFont);
    MsgText->SetAutoWrapText(true);
    MsgText->SetColorAndOpacity(FSlateColor(FLinearColor::White));

    UHorizontalBoxSlot* MsgSlot = Row->AddChildToHorizontalBox(MsgText);
    MsgSlot->SetVerticalAlignment(VAlign_Top);
    MsgSlot->SetSize(FSlateChildSize(ESlateSizeRule::Fill));

    return Row;
}
