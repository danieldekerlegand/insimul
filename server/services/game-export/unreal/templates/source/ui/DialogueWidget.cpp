#include "DialogueWidget.h"
#include "Systems/DialogueSystem.h"
#include "Services/InsimulAIService.h"
#include "Components/TextBlock.h"
#include "Components/Button.h"
#include "Components/EditableTextBox.h"
#include "Components/ScrollBox.h"
#include "Components/VerticalBox.h"
#include "Components/HorizontalBox.h"
#include "Components/HorizontalBoxSlot.h"
#include "Components/VerticalBoxSlot.h"
#include "Components/Spacer.h"
#include "Engine/GameInstance.h"

void UDialogueWidget::NativeConstruct()
{
    Super::NativeConstruct();
    InitDialogueWidget();
}

void UDialogueWidget::InitDialogueWidget()
{
    if (SendButton)
    {
        SendButton->OnClicked.AddDynamic(this, &UDialogueWidget::OnSendClicked);
    }

    if (CloseButton)
    {
        CloseButton->OnClicked.AddDynamic(this, &UDialogueWidget::OnCloseClicked);
    }

    if (PlayerInputBox)
    {
        PlayerInputBox->OnTextCommitted.AddDynamic(this, &UDialogueWidget::OnInputCommitted);
    }

    // Start hidden
    SetVisibility(ESlateVisibility::Collapsed);
}

void UDialogueWidget::OpenDialogue(const FString& NPCId)
{
    UGameInstance* GI = GetGameInstance();
    if (!GI) return;

    UDialogueSystem* DialogueSys = GI->GetSubsystem<UDialogueSystem>();
    if (!DialogueSys) return;

    // Start dialogue in the system
    DialogueSys->StartDialogue(NPCId);

    CurrentNPCId = NPCId;
    bIsOpen = true;

    // Find NPC name from AI service contexts
    UInsimulAIService* AIService = GI->GetSubsystem<UInsimulAIService>();
    FString Greeting;
    if (AIService)
    {
        FInsimulDialogueContext Ctx = AIService->GetContext(NPCId);
        CurrentNPCName = Ctx.CharacterName;
        Greeting = Ctx.Greeting;
    }
    else
    {
        CurrentNPCName = NPCId;
        Greeting = TEXT("Hello there.");
    }

    // Update UI
    if (NPCNameText)
    {
        NPCNameText->SetText(FText::FromString(CurrentNPCName));
    }

    if (GreetingText)
    {
        GreetingText->SetText(FText::FromString(Greeting));
    }

    // Clear previous chat
    if (ChatScrollBox)
    {
        ChatScrollBox->ClearChildren();
    }

    // Show greeting as first message
    AddChatMessage(CurrentNPCName, Greeting, false);

    // Refresh action buttons
    RefreshActions(DialogueSys->PlayerEnergy);

    // Clear input
    if (PlayerInputBox)
    {
        PlayerInputBox->SetText(FText::GetEmpty());
    }

    SetVisibility(ESlateVisibility::SelfHitTestInvisible);

    UE_LOG(LogTemp, Log, TEXT("[InsimulDialogueWidget] Opened dialogue with %s"), *CurrentNPCName);
}

void UDialogueWidget::CloseDialogue()
{
    if (!bIsOpen) return;

    UGameInstance* GI = GetGameInstance();
    if (GI)
    {
        UDialogueSystem* DialogueSys = GI->GetSubsystem<UDialogueSystem>();
        if (DialogueSys)
        {
            DialogueSys->EndDialogue();
        }

        UInsimulAIService* AIService = GI->GetSubsystem<UInsimulAIService>();
        if (AIService)
        {
            AIService->ClearHistory(CurrentNPCId);
        }
    }

    bIsOpen = false;
    CurrentNPCId = TEXT("");
    CurrentNPCName = TEXT("");
    StreamingResponseText = TEXT("");
    StreamingMessageBlock = nullptr;

    SetVisibility(ESlateVisibility::Collapsed);

    UE_LOG(LogTemp, Log, TEXT("[InsimulDialogueWidget] Dialogue closed"));
}

void UDialogueWidget::AddChatMessage(const FString& Speaker, const FString& Message, bool bIsPlayer)
{
    if (!ChatScrollBox) return;

    // Create a text block for the message
    UTextBlock* MsgText = NewObject<UTextBlock>(ChatScrollBox);
    FString FormattedMsg = FString::Printf(TEXT("%s: %s"), *Speaker, *Message);
    MsgText->SetText(FText::FromString(FormattedMsg));

    // Style based on speaker
    FSlateFontInfo FontInfo = MsgText->GetFont();
    FontInfo.Size = 14;
    MsgText->SetFont(FontInfo);
    MsgText->SetAutoWrapText(true);

    if (bIsPlayer)
    {
        MsgText->SetColorAndOpacity(FSlateColor(FLinearColor(0.6f, 0.8f, 1.0f)));
    }
    else
    {
        MsgText->SetColorAndOpacity(FSlateColor(FLinearColor(1.0f, 1.0f, 1.0f)));
    }

    ChatScrollBox->AddChild(MsgText);

    // Add spacing
    USpacer* Spacer = NewObject<USpacer>(ChatScrollBox);
    Spacer->SetSize(FVector2D(0.0f, 4.0f));
    ChatScrollBox->AddChild(Spacer);

    // Auto-scroll to bottom
    ChatScrollBox->ScrollToEnd();
}

void UDialogueWidget::RefreshActions(float PlayerEnergy)
{
    if (!ActionsContainer) return;

    ActionsContainer->ClearChildren();

    UGameInstance* GI = GetGameInstance();
    if (!GI) return;

    UDialogueSystem* DialogueSys = GI->GetSubsystem<UDialogueSystem>();
    if (!DialogueSys) return;

    DialogueSys->SetPlayerEnergy(PlayerEnergy);
    TArray<FString> AvailableActions = DialogueSys->GetAvailableActions();

    // Add header
    UTextBlock* Header = NewObject<UTextBlock>(ActionsContainer);
    Header->SetText(FText::FromString(TEXT("What do you want to do?")));
    FSlateFontInfo HeaderFont = Header->GetFont();
    HeaderFont.Size = 11;
    Header->SetFont(HeaderFont);
    Header->SetColorAndOpacity(FSlateColor(FLinearColor(0.6f, 0.6f, 0.6f)));
    ActionsContainer->AddChild(Header);

    // Create buttons for each action (format: "id|name|energyCost")
    for (const FString& ActionStr : AvailableActions)
    {
        TArray<FString> Parts;
        ActionStr.ParseIntoArray(Parts, TEXT("|"), true);
        if (Parts.Num() < 3) continue;

        FString ActionId = Parts[0];
        FString ActionName = Parts[1];
        float EnergyCost = FCString::Atof(*Parts[2]);
        bool bCanAfford = EnergyCost <= 0.0f || EnergyCost <= PlayerEnergy;

        CreateActionButton(ActionId, ActionName, EnergyCost, bCanAfford);
    }

    // Add hint text
    if (HintText)
    {
        HintText->SetText(FText::FromString(TEXT("Actions affect your relationship with NPCs and cost energy")));
    }
}

void UDialogueWidget::OnSendClicked()
{
    if (!PlayerInputBox) return;

    FString Message = PlayerInputBox->GetText().ToString().TrimStartAndEnd();
    if (Message.IsEmpty()) return;

    SendPlayerMessage(Message);
}

void UDialogueWidget::OnInputCommitted(const FText& Text, ETextCommit::Type CommitMethod)
{
    if (CommitMethod != ETextCommit::OnEnter) return;

    FString Message = Text.ToString().TrimStartAndEnd();
    if (Message.IsEmpty()) return;

    SendPlayerMessage(Message);
}

void UDialogueWidget::OnCloseClicked()
{
    CloseDialogue();
}

void UDialogueWidget::SendPlayerMessage(const FString& Message)
{
    // Show player message in chat
    AddChatMessage(TEXT("You"), Message, true);

    // Clear input
    if (PlayerInputBox)
    {
        PlayerInputBox->SetText(FText::GetEmpty());
    }

    // Prepare streaming response block
    StreamingResponseText = TEXT("");
    if (ChatScrollBox)
    {
        StreamingMessageBlock = NewObject<UTextBlock>(ChatScrollBox);
        StreamingMessageBlock->SetText(FText::FromString(FString::Printf(TEXT("%s: ..."), *CurrentNPCName)));
        FSlateFontInfo FontInfo = StreamingMessageBlock->GetFont();
        FontInfo.Size = 14;
        StreamingMessageBlock->SetFont(FontInfo);
        StreamingMessageBlock->SetAutoWrapText(true);
        StreamingMessageBlock->SetColorAndOpacity(FSlateColor(FLinearColor(1.0f, 1.0f, 1.0f)));
        ChatScrollBox->AddChild(StreamingMessageBlock);
        ChatScrollBox->ScrollToEnd();
    }

    // Send to AI service
    UGameInstance* GI = GetGameInstance();
    if (!GI) return;

    UInsimulAIService* AIService = GI->GetSubsystem<UInsimulAIService>();
    if (AIService)
    {
        AIService->SendMessage(CurrentNPCId, Message);
    }
    else
    {
        OnAIChatError(TEXT("AI service not available"));
    }
}

void UDialogueWidget::OnAIChatChunk(const FString& Chunk)
{
    StreamingResponseText += Chunk;

    if (StreamingMessageBlock)
    {
        StreamingMessageBlock->SetText(FText::FromString(
            FString::Printf(TEXT("%s: %s"), *CurrentNPCName, *StreamingResponseText)));

        if (ChatScrollBox)
        {
            ChatScrollBox->ScrollToEnd();
        }
    }
}

void UDialogueWidget::OnAIChatComplete(const FString& FullResponse)
{
    // Finalize the streamed message
    if (StreamingMessageBlock)
    {
        StreamingMessageBlock->SetText(FText::FromString(
            FString::Printf(TEXT("%s: %s"), *CurrentNPCName, *FullResponse)));
    }

    StreamingResponseText = TEXT("");
    StreamingMessageBlock = nullptr;

    if (ChatScrollBox)
    {
        ChatScrollBox->ScrollToEnd();
    }
}

void UDialogueWidget::OnAIChatError(const FString& ErrorMessage)
{
    // Show error in chat
    if (StreamingMessageBlock)
    {
        StreamingMessageBlock->SetText(FText::FromString(
            FString::Printf(TEXT("[Error: %s]"), *ErrorMessage)));
        StreamingMessageBlock->SetColorAndOpacity(FSlateColor(FLinearColor(1.0f, 0.3f, 0.3f)));
    }
    else
    {
        AddChatMessage(TEXT("System"), FString::Printf(TEXT("Error: %s"), *ErrorMessage), false);
    }

    StreamingResponseText = TEXT("");
    StreamingMessageBlock = nullptr;
}

void UDialogueWidget::CreateActionButton(const FString& ActionId, const FString& ActionName, float EnergyCost, bool bCanAfford)
{
    if (!ActionsContainer) return;

    UButton* ActionButton = NewObject<UButton>(ActionsContainer);

    // Style the button
    FButtonStyle ButtonStyle = ActionButton->GetStyle();
    FLinearColor NormalBg = bCanAfford ? FLinearColor(0.15f, 0.15f, 0.15f, 0.95f) : FLinearColor(0.1f, 0.1f, 0.1f, 0.5f);
    FLinearColor HoverBg = FLinearColor(0.2f, 0.2f, 0.3f, 0.95f);

    FSlateBrush NormalBrush;
    NormalBrush.TintColor = FSlateColor(NormalBg);
    ButtonStyle.SetNormal(NormalBrush);

    FSlateBrush HoverBrush;
    HoverBrush.TintColor = FSlateColor(HoverBg);
    ButtonStyle.SetHovered(HoverBrush);

    ActionButton->SetStyle(ButtonStyle);
    ActionButton->SetIsEnabled(bCanAfford);

    // Create horizontal box for button content (name + energy badge)
    UHorizontalBox* ButtonContent = NewObject<UHorizontalBox>(ActionButton);

    // Action name
    UTextBlock* NameText = NewObject<UTextBlock>(ButtonContent);
    NameText->SetText(FText::FromString(ActionName));
    FSlateFontInfo NameFont = NameText->GetFont();
    NameFont.Size = 12;
    NameText->SetFont(NameFont);
    NameText->SetColorAndOpacity(FSlateColor(bCanAfford ? FLinearColor::White : FLinearColor(0.5f, 0.5f, 0.5f)));

    UHorizontalBoxSlot* NameSlot = ButtonContent->AddChildToHorizontalBox(NameText);
    NameSlot->SetHorizontalAlignment(HAlign_Left);
    NameSlot->SetVerticalAlignment(VAlign_Center);
    NameSlot->SetSize(FSlateChildSize(ESlateSizeRule::Fill)); // Fill

    // Energy cost badge
    if (EnergyCost > 0.0f)
    {
        UTextBlock* CostText = NewObject<UTextBlock>(ButtonContent);
        FString CostStr = FString::Printf(TEXT("Energy: %.0f"), EnergyCost);
        CostText->SetText(FText::FromString(CostStr));
        FSlateFontInfo CostFont = CostText->GetFont();
        CostFont.Size = 10;
        CostText->SetFont(CostFont);
        CostText->SetColorAndOpacity(FSlateColor(
            bCanAfford ? FLinearColor(0.8f, 0.8f, 0.8f) : FLinearColor(0.9f, 0.3f, 0.3f)));

        UHorizontalBoxSlot* CostSlot = ButtonContent->AddChildToHorizontalBox(CostText);
        CostSlot->SetHorizontalAlignment(HAlign_Right);
        CostSlot->SetVerticalAlignment(VAlign_Center);
        CostSlot->SetPadding(FMargin(8.0f, 0.0f, 0.0f, 0.0f));
    }

    ActionButton->AddChild(ButtonContent);

    // Bind click — capture ActionId by value
    FString CapturedActionId = ActionId;
    ActionButton->OnClicked.AddDynamic(this, &UDialogueWidget::OnCloseClicked); // placeholder binding

    ActionsContainer->AddChild(ActionButton);

    UE_LOG(LogTemp, Verbose, TEXT("[InsimulDialogueWidget] Action button: %s (cost=%.0f, afford=%d)"), *ActionName, EnergyCost, bCanAfford);
}
