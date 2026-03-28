// Copyright Insimul. All Rights Reserved.

#include "InsimulHttpClient.h"
#include "HttpModule.h"
#include "Interfaces/IHttpResponse.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Dom/JsonObject.h"
#include "Misc/Base64.h"

void UInsimulHttpClient::Initialize(const FInsimulConfig& InConfig)
{
    Config = InConfig;
}

void UInsimulHttpClient::SendText(
    const FString& SessionId,
    const FString& CharacterId,
    const FString& Text,
    const FString& LanguageCode)
{
    CancelActiveRequest();

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(Config.ServerUrl / TEXT("api/conversation/stream"));
    Request->SetVerb(TEXT("POST"));
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
    SetAuthHeaders(Request);

    // Build JSON body
    TSharedRef<FJsonObject> Body = MakeShared<FJsonObject>();
    Body->SetStringField(TEXT("sessionId"), SessionId);
    Body->SetStringField(TEXT("characterId"), CharacterId);
    Body->SetStringField(TEXT("worldId"), Config.WorldId);
    Body->SetStringField(TEXT("text"), Text);
    Body->SetStringField(TEXT("languageCode"), LanguageCode.IsEmpty() ? Config.LanguageCode : LanguageCode);

    FString BodyString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&BodyString);
    FJsonSerializer::Serialize(Body, Writer);
    Request->SetContentAsString(BodyString);

    // Use lambda to handle completion
    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr Req, FHttpResponsePtr Resp, bool bSuccess)
        {
            ActiveRequest.Reset();
            if (!bSuccess || !Resp.IsValid())
            {
                OnError.Broadcast(TEXT("HTTP request failed"));
                return;
            }
            if (Resp->GetResponseCode() != 200)
            {
                OnError.Broadcast(FString::Printf(TEXT("Server returned %d"), Resp->GetResponseCode()));
                return;
            }
            ParseSSEResponse(Resp->GetContentAsString());
        });

    ActiveRequest = Request;
    Request->ProcessRequest();
}

void UInsimulHttpClient::SendAudio(
    const FString& SessionId,
    const FString& CharacterId,
    const TArray<uint8>& AudioData,
    const FString& LanguageCode)
{
    CancelActiveRequest();

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(Config.ServerUrl / TEXT("api/conversation/stream-audio"));
    Request->SetVerb(TEXT("POST"));
    SetAuthHeaders(Request);

    // Build multipart form body
    const FString Boundary = FGuid::NewGuid().ToString();
    Request->SetHeader(TEXT("Content-Type"), FString::Printf(TEXT("multipart/form-data; boundary=%s"), *Boundary));

    TArray<uint8> Payload;
    auto AppendString = [&Payload](const FString& Str)
    {
        FTCHARToUTF8 Converter(*Str);
        Payload.Append(reinterpret_cast<const uint8*>(Converter.Get()), Converter.Length());
    };

    // Audio file part
    AppendString(FString::Printf(TEXT("--%s\r\nContent-Disposition: form-data; name=\"audio\"; filename=\"recording.webm\"\r\nContent-Type: application/octet-stream\r\n\r\n"), *Boundary));
    Payload.Append(AudioData);
    AppendString(TEXT("\r\n"));

    // Text fields
    auto AppendField = [&](const FString& Name, const FString& Value)
    {
        AppendString(FString::Printf(TEXT("--%s\r\nContent-Disposition: form-data; name=\"%s\"\r\n\r\n%s\r\n"), *Boundary, *Name, *Value));
    };
    AppendField(TEXT("sessionId"), SessionId);
    AppendField(TEXT("characterId"), CharacterId);
    AppendField(TEXT("worldId"), Config.WorldId);
    AppendField(TEXT("languageCode"), LanguageCode.IsEmpty() ? Config.LanguageCode : LanguageCode);

    AppendString(FString::Printf(TEXT("--%s--\r\n"), *Boundary));

    Request->SetContent(Payload);

    Request->OnProcessRequestComplete().BindLambda(
        [this](FHttpRequestPtr Req, FHttpResponsePtr Resp, bool bSuccess)
        {
            ActiveRequest.Reset();
            if (!bSuccess || !Resp.IsValid())
            {
                OnError.Broadcast(TEXT("Audio HTTP request failed"));
                return;
            }
            if (Resp->GetResponseCode() != 200)
            {
                OnError.Broadcast(FString::Printf(TEXT("Server returned %d"), Resp->GetResponseCode()));
                return;
            }
            ParseSSEResponse(Resp->GetContentAsString());
        });

    ActiveRequest = Request;
    Request->ProcessRequest();
}

void UInsimulHttpClient::EndSession(const FString& SessionId)
{
    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(Config.ServerUrl / TEXT("api/conversation/end"));
    Request->SetVerb(TEXT("POST"));
    Request->SetHeader(TEXT("Content-Type"), TEXT("application/json"));
    SetAuthHeaders(Request);

    TSharedRef<FJsonObject> Body = MakeShared<FJsonObject>();
    Body->SetStringField(TEXT("sessionId"), SessionId);

    FString BodyString;
    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&BodyString);
    FJsonSerializer::Serialize(Body, Writer);
    Request->SetContentAsString(BodyString);

    // Fire-and-forget
    Request->ProcessRequest();
}

void UInsimulHttpClient::CancelActiveRequest()
{
    if (ActiveRequest.IsValid())
    {
        ActiveRequest->CancelRequest();
        ActiveRequest.Reset();
    }
}

void UInsimulHttpClient::SetAuthHeaders(TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request) const
{
    if (!Config.ApiKey.IsEmpty())
    {
        Request->SetHeader(TEXT("Authorization"), FString::Printf(TEXT("Bearer %s"), *Config.ApiKey));
    }
}

void UInsimulHttpClient::ParseSSEResponse(const FString& ResponseBody)
{
    TArray<FString> Lines;
    ResponseBody.ParseIntoArrayLines(Lines);

    for (const FString& Line : Lines)
    {
        FString Trimmed = Line.TrimStartAndEnd();
        if (Trimmed.IsEmpty() || !Trimmed.StartsWith(TEXT("data: ")))
        {
            continue;
        }

        FString Data = Trimmed.Mid(6); // Remove "data: "
        if (Data == TEXT("[DONE]"))
        {
            return;
        }

        TSharedPtr<FJsonObject> JsonObject;
        TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Data);
        if (FJsonSerializer::Deserialize(Reader, JsonObject) && JsonObject.IsValid())
        {
            DispatchSSEEvent(JsonObject);
        }
    }
}

void UInsimulHttpClient::DispatchSSEEvent(const TSharedPtr<FJsonObject>& JsonEvent)
{
    FString EventType;
    if (!JsonEvent->TryGetStringField(TEXT("type"), EventType))
    {
        return;
    }

    if (EventType == TEXT("text"))
    {
        FInsimulTextChunk Chunk;
        Chunk.Text = JsonEvent->GetStringField(TEXT("text"));
        Chunk.bIsFinal = JsonEvent->GetBoolField(TEXT("isFinal"));
        OnTextChunk.Broadcast(Chunk);
    }
    else if (EventType == TEXT("audio"))
    {
        FInsimulAudioChunk Chunk;
        FString Base64Data = JsonEvent->GetStringField(TEXT("data"));
        FBase64::Decode(Base64Data, Chunk.Data);
        Chunk.Encoding = static_cast<EInsimulAudioEncoding>(
            JsonEvent->GetIntegerField(TEXT("encoding")));
        Chunk.SampleRate = JsonEvent->GetIntegerField(TEXT("sampleRate"));
        Chunk.DurationMs = JsonEvent->GetIntegerField(TEXT("durationMs"));
        OnAudioChunk.Broadcast(Chunk);
    }
    else if (EventType == TEXT("facial"))
    {
        FInsimulFacialData FacialData;
        const TArray<TSharedPtr<FJsonValue>>* VisemeArray;
        if (JsonEvent->TryGetArrayField(TEXT("visemes"), VisemeArray))
        {
            for (const TSharedPtr<FJsonValue>& Val : *VisemeArray)
            {
                const TSharedPtr<FJsonObject>& Obj = Val->AsObject();
                if (Obj.IsValid())
                {
                    FInsimulViseme Viseme;
                    Viseme.Phoneme = Obj->GetStringField(TEXT("phoneme"));
                    Viseme.Weight = static_cast<float>(Obj->GetNumberField(TEXT("weight")));
                    Viseme.DurationMs = Obj->GetIntegerField(TEXT("durationMs"));
                    FacialData.Visemes.Add(Viseme);
                }
            }
        }
        OnFacialData.Broadcast(FacialData);
    }
    else if (EventType == TEXT("transcript"))
    {
        FString TranscribedText = JsonEvent->GetStringField(TEXT("text"));
        OnTranscript.Broadcast(TranscribedText);
    }
    else if (EventType == TEXT("error"))
    {
        FString ErrorMsg = JsonEvent->GetStringField(TEXT("message"));
        OnError.Broadcast(ErrorMsg);
    }
}
