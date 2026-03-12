// Copyright Insimul. All Rights Reserved.

#include "InsimulSubsystem.h"
#include "InsimulHttpClient.h"
#include "Misc/Guid.h"

void UInsimulSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);

    // Try loading config from DefaultGame.ini [/Script/Insimul.InsimulSubsystem]
    if (GConfig)
    {
        FString Value;
        if (GConfig->GetString(TEXT("/Script/Insimul.InsimulSubsystem"), TEXT("ServerUrl"), Value, GGameIni))
        {
            Config.ServerUrl = Value;
        }
        if (GConfig->GetString(TEXT("/Script/Insimul.InsimulSubsystem"), TEXT("ApiKey"), Value, GGameIni))
        {
            Config.ApiKey = Value;
        }
        if (GConfig->GetString(TEXT("/Script/Insimul.InsimulSubsystem"), TEXT("WorldId"), Value, GGameIni))
        {
            Config.WorldId = Value;
        }
        if (GConfig->GetString(TEXT("/Script/Insimul.InsimulSubsystem"), TEXT("LanguageCode"), Value, GGameIni))
        {
            Config.LanguageCode = Value;
        }
    }
}

void UInsimulSubsystem::Deinitialize()
{
    if (HttpClient)
    {
        HttpClient->CancelActiveRequest();
        HttpClient = nullptr;
    }

    Super::Deinitialize();
}

void UInsimulSubsystem::SetConfig(const FInsimulConfig& InConfig)
{
    Config = InConfig;

    // Re-initialize HTTP client with new config
    if (HttpClient)
    {
        HttpClient->Initialize(Config);
    }
}

FString UInsimulSubsystem::CreateSessionId()
{
    return FString::Printf(TEXT("ue_%s_%d"), *FGuid::NewGuid().ToString(EGuidFormats::Short), ++SessionCounter);
}

UInsimulHttpClient* UInsimulSubsystem::GetHttpClient()
{
    if (!HttpClient)
    {
        HttpClient = NewObject<UInsimulHttpClient>(this);
        HttpClient->Initialize(Config);
    }
    return HttpClient;
}
