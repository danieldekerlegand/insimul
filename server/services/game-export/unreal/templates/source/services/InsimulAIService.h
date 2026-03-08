#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "Http.h"
#include "Data/DialogueContextData.h"
#include "InsimulAIService.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnChatChunk, const FString&, NPCId, const FString&, Text);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnChatComplete, const FString&, NPCId, const FString&, FullText);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnChatError, const FString&, NPCId, const FString&, Error);

/**
 * AI service for NPC dialogue — supports Insimul API and direct Gemini modes.
 */
UCLASS()
class INSIMULEXPORT_API UInsimulAIService : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;

    UFUNCTION(BlueprintCallable, Category = "Insimul|AI")
    void InitializeService(const FInsimulAIConfig& InConfig, const TArray<FInsimulDialogueContext>& InContexts);

    UFUNCTION(BlueprintCallable, Category = "Insimul|AI")
    FInsimulDialogueContext GetContext(const FString& CharacterId) const;

    UFUNCTION(BlueprintCallable, Category = "Insimul|AI")
    void SendMessage(const FString& CharacterId, const FString& UserMessage);

    UFUNCTION(BlueprintCallable, Category = "Insimul|AI")
    void ClearHistory(const FString& CharacterId);

    UPROPERTY(BlueprintAssignable, Category = "Insimul|AI")
    FOnChatChunk OnChatChunk;

    UPROPERTY(BlueprintAssignable, Category = "Insimul|AI")
    FOnChatComplete OnChatComplete;

    UPROPERTY(BlueprintAssignable, Category = "Insimul|AI")
    FOnChatError OnChatError;

private:
    FInsimulAIConfig Config;
    TMap<FString, FInsimulDialogueContext> Contexts;
    TMap<FString, TArray<FChatMessage>> Histories;
    FString InsimulBaseUrl;

    void SendInsimulRequest(const FString& CharacterId, const FInsimulDialogueContext& Context);
    void SendGeminiRequest(const FString& CharacterId, const FInsimulDialogueContext& Context);

    void HandleResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bSuccess, FString CharacterId);

    FString BuildGeminiRequestBody(const FString& SystemPrompt, const TArray<FChatMessage>& History) const;
    FString ExtractTextFromSSE(const FString& ResponseBody) const;
    FString ExtractTextFromGemini(const FString& ResponseBody) const;
};
