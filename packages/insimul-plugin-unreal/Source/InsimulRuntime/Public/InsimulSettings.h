// Copyright 2024 Insimul. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "InsimulSettings.generated.h"

/**
 * Global settings for the Insimul plugin.
 * Configure in Project Settings > Plugins > Insimul.
 */
UCLASS(config = Game, defaultconfig, meta = (DisplayName = "Insimul"))
class INSIMULRUNTIME_API UInsimulSettings : public UObject
{
	GENERATED_BODY()

public:
	// ── Online Mode (Insimul Server) ─────────────────────────────────

	/** Base URL of the Insimul server (e.g., "http://localhost:8080") */
	UPROPERTY(Config, EditAnywhere, Category = "Online")
	FString ServerURL = TEXT("http://localhost:8080");

	/** Default world ID for conversations */
	UPROPERTY(Config, EditAnywhere, Category = "Online")
	FString DefaultWorldID = TEXT("default-world");

	/** Optional API key for authentication */
	UPROPERTY(Config, EditAnywhere, Category = "Online")
	FString APIKey;

	/** Prefer WebSocket streaming over REST (recommended for low latency) */
	UPROPERTY(Config, EditAnywhere, Category = "Online")
	bool bPreferWebSocket = true;

	// ── Offline Mode ─────────────────────────────────────────────────

	/** Enable offline mode — uses local LLM + TTS instead of the Insimul server.
	 *  Requires a local llama.cpp or Ollama server and exported world data. */
	UPROPERTY(Config, EditAnywhere, Category = "Offline")
	bool bOfflineMode = false;

	/** URL of the local LLM server (llama.cpp or Ollama).
	 *  llama.cpp default: http://localhost:8081/completion
	 *  Ollama default: http://localhost:11434/api/generate */
	UPROPERTY(Config, EditAnywhere, Category = "Offline", meta = (EditCondition = "bOfflineMode"))
	FString OfflineLLMServerURL = TEXT("http://localhost:11434/api/generate");

	/** LLM model name (used by Ollama; ignored by llama.cpp which loads its own model) */
	UPROPERTY(Config, EditAnywhere, Category = "Offline", meta = (EditCondition = "bOfflineMode"))
	FString OfflineLLMModel = TEXT("mistral");

	/** Path to the exported Insimul world data JSON file.
	 *  Use the Insimul server's export endpoint or the editor export tool.
	 *  Can be absolute or relative to the project's Content directory. */
	UPROPERTY(Config, EditAnywhere, Category = "Offline", meta = (EditCondition = "bOfflineMode"))
	FString OfflineWorldDataPath = TEXT("InsimulData/world_export.json");

	/** Voice model name for offline TTS (requires Runtime Text To Speech plugin).
	 *  Examples: "en_US-amy-medium", "en_GB-alba-medium", "en_US-libritts_r-medium" */
	UPROPERTY(Config, EditAnywhere, Category = "Offline", meta = (EditCondition = "bOfflineMode"))
	FString OfflineVoiceModel = TEXT("en_US-amy-medium");

	/** Speaker index within the voice model (for multi-speaker models like libritts) */
	UPROPERTY(Config, EditAnywhere, Category = "Offline", meta = (EditCondition = "bOfflineMode"))
	int32 OfflineSpeakerIndex = 0;

	/** Maximum tokens for LLM response generation */
	UPROPERTY(Config, EditAnywhere, Category = "Offline", meta = (EditCondition = "bOfflineMode", ClampMin = "32", ClampMax = "2048"))
	int32 OfflineMaxTokens = 256;

	/** LLM temperature (0.0 = deterministic, 1.0+ = creative) */
	UPROPERTY(Config, EditAnywhere, Category = "Offline", meta = (EditCondition = "bOfflineMode", ClampMin = "0.0", ClampMax = "2.0"))
	float OfflineTemperature = 0.7f;

	/** Get the singleton settings instance */
	static const UInsimulSettings* Get()
	{
		return GetDefault<UInsimulSettings>();
	}
};
