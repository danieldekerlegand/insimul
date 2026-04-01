// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulSettings.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulSettings() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UClass* Z_Construct_UClass_UObject();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulSettings();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulSettings_NoRegister();
INSIMULRUNTIME_API UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider();
INSIMULRUNTIME_API UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider();
INSIMULRUNTIME_API UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Enum EInsimulChatProvider ******************************************************
static FEnumRegistrationInfo Z_Registration_Info_UEnum_EInsimulChatProvider;
static UEnum* EInsimulChatProvider_StaticEnum()
{
	if (!Z_Registration_Info_UEnum_EInsimulChatProvider.OuterSingleton)
	{
		Z_Registration_Info_UEnum_EInsimulChatProvider.OuterSingleton = GetStaticEnum(Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("EInsimulChatProvider"));
	}
	return Z_Registration_Info_UEnum_EInsimulChatProvider.OuterSingleton;
}
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulChatProvider>()
{
	return EInsimulChatProvider_StaticEnum();
}
struct Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Enum_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Chat provider: where LLM inference runs. */" },
#endif
		{ "Local.Comment", "/** Local LLM server (Ollama / llama.cpp) with exported world data */" },
		{ "Local.DisplayName", "Local LLM" },
		{ "Local.Name", "EInsimulChatProvider::Local" },
		{ "Local.ToolTip", "Local LLM server (Ollama / llama.cpp) with exported world data" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
		{ "Server.Comment", "/** Insimul server via WebSocket/REST (Gemini LLM, server-side TTS) */" },
		{ "Server.DisplayName", "Server" },
		{ "Server.Name", "EInsimulChatProvider::Server" },
		{ "Server.ToolTip", "Insimul server via WebSocket/REST (Gemini LLM, server-side TTS)" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Chat provider: where LLM inference runs." },
#endif
	};
#endif // WITH_METADATA
	static constexpr UECodeGen_Private::FEnumeratorParam Enumerators[] = {
		{ "EInsimulChatProvider::Server", (int64)EInsimulChatProvider::Server },
		{ "EInsimulChatProvider::Local", (int64)EInsimulChatProvider::Local },
	};
	static const UECodeGen_Private::FEnumParams EnumParams;
}; // struct Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics 
const UECodeGen_Private::FEnumParams Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics::EnumParams = {
	(UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	"EInsimulChatProvider",
	"EInsimulChatProvider",
	Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics::Enumerators,
	RF_Public|RF_Transient|RF_MarkAsNative,
	UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics::Enumerators),
	EEnumFlags::None,
	(uint8)UEnum::ECppForm::EnumClass,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics::Enum_MetaDataParams), Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics::Enum_MetaDataParams)
};
UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider()
{
	if (!Z_Registration_Info_UEnum_EInsimulChatProvider.InnerSingleton)
	{
		UECodeGen_Private::ConstructUEnum(Z_Registration_Info_UEnum_EInsimulChatProvider.InnerSingleton, Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider_Statics::EnumParams);
	}
	return Z_Registration_Info_UEnum_EInsimulChatProvider.InnerSingleton;
}
// ********** End Enum EInsimulChatProvider ********************************************************

// ********** Begin Enum EInsimulTTSProvider *******************************************************
static FEnumRegistrationInfo Z_Registration_Info_UEnum_EInsimulTTSProvider;
static UEnum* EInsimulTTSProvider_StaticEnum()
{
	if (!Z_Registration_Info_UEnum_EInsimulTTSProvider.OuterSingleton)
	{
		Z_Registration_Info_UEnum_EInsimulTTSProvider.OuterSingleton = GetStaticEnum(Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("EInsimulTTSProvider"));
	}
	return Z_Registration_Info_UEnum_EInsimulTTSProvider.OuterSingleton;
}
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulTTSProvider>()
{
	return EInsimulTTSProvider_StaticEnum();
}
struct Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Enum_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** TTS provider: where text-to-speech runs. */" },
#endif
		{ "Local.Comment", "/** Local TTS via Runtime Text To Speech plugin (Piper/Kokoro ONNX) */" },
		{ "Local.DisplayName", "Local (Runtime TTS Plugin)" },
		{ "Local.Name", "EInsimulTTSProvider::Local" },
		{ "Local.ToolTip", "Local TTS via Runtime Text To Speech plugin (Piper/Kokoro ONNX)" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
		{ "None.Comment", "/** TTS disabled */" },
		{ "None.DisplayName", "None" },
		{ "None.Name", "EInsimulTTSProvider::None" },
		{ "None.ToolTip", "TTS disabled" },
		{ "Server.Comment", "/** Server-side TTS (audio streams inline with chat response) */" },
		{ "Server.DisplayName", "Server" },
		{ "Server.Name", "EInsimulTTSProvider::Server" },
		{ "Server.ToolTip", "Server-side TTS (audio streams inline with chat response)" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "TTS provider: where text-to-speech runs." },
#endif
	};
#endif // WITH_METADATA
	static constexpr UECodeGen_Private::FEnumeratorParam Enumerators[] = {
		{ "EInsimulTTSProvider::Server", (int64)EInsimulTTSProvider::Server },
		{ "EInsimulTTSProvider::Local", (int64)EInsimulTTSProvider::Local },
		{ "EInsimulTTSProvider::None", (int64)EInsimulTTSProvider::None },
	};
	static const UECodeGen_Private::FEnumParams EnumParams;
}; // struct Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics 
const UECodeGen_Private::FEnumParams Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics::EnumParams = {
	(UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	"EInsimulTTSProvider",
	"EInsimulTTSProvider",
	Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics::Enumerators,
	RF_Public|RF_Transient|RF_MarkAsNative,
	UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics::Enumerators),
	EEnumFlags::None,
	(uint8)UEnum::ECppForm::EnumClass,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics::Enum_MetaDataParams), Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics::Enum_MetaDataParams)
};
UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider()
{
	if (!Z_Registration_Info_UEnum_EInsimulTTSProvider.InnerSingleton)
	{
		UECodeGen_Private::ConstructUEnum(Z_Registration_Info_UEnum_EInsimulTTSProvider.InnerSingleton, Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider_Statics::EnumParams);
	}
	return Z_Registration_Info_UEnum_EInsimulTTSProvider.InnerSingleton;
}
// ********** End Enum EInsimulTTSProvider *********************************************************

// ********** Begin Enum EInsimulSTTProvider *******************************************************
static FEnumRegistrationInfo Z_Registration_Info_UEnum_EInsimulSTTProvider;
static UEnum* EInsimulSTTProvider_StaticEnum()
{
	if (!Z_Registration_Info_UEnum_EInsimulSTTProvider.OuterSingleton)
	{
		Z_Registration_Info_UEnum_EInsimulSTTProvider.OuterSingleton = GetStaticEnum(Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("EInsimulSTTProvider"));
	}
	return Z_Registration_Info_UEnum_EInsimulSTTProvider.OuterSingleton;
}
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulSTTProvider>()
{
	return EInsimulSTTProvider_StaticEnum();
}
struct Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Enum_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** STT provider: where speech-to-text runs. */" },
#endif
		{ "Local.Comment", "/** Local STT (not yet implemented) */" },
		{ "Local.DisplayName", "Local" },
		{ "Local.Name", "EInsimulSTTProvider::Local" },
		{ "Local.ToolTip", "Local STT (not yet implemented)" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
		{ "None.Comment", "/** STT disabled */" },
		{ "None.DisplayName", "None" },
		{ "None.Name", "EInsimulSTTProvider::None" },
		{ "None.ToolTip", "STT disabled" },
		{ "Server.Comment", "/** Server-side STT */" },
		{ "Server.DisplayName", "Server" },
		{ "Server.Name", "EInsimulSTTProvider::Server" },
		{ "Server.ToolTip", "Server-side STT" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "STT provider: where speech-to-text runs." },
#endif
	};
#endif // WITH_METADATA
	static constexpr UECodeGen_Private::FEnumeratorParam Enumerators[] = {
		{ "EInsimulSTTProvider::Server", (int64)EInsimulSTTProvider::Server },
		{ "EInsimulSTTProvider::Local", (int64)EInsimulSTTProvider::Local },
		{ "EInsimulSTTProvider::None", (int64)EInsimulSTTProvider::None },
	};
	static const UECodeGen_Private::FEnumParams EnumParams;
}; // struct Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics 
const UECodeGen_Private::FEnumParams Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics::EnumParams = {
	(UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	"EInsimulSTTProvider",
	"EInsimulSTTProvider",
	Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics::Enumerators,
	RF_Public|RF_Transient|RF_MarkAsNative,
	UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics::Enumerators),
	EEnumFlags::None,
	(uint8)UEnum::ECppForm::EnumClass,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics::Enum_MetaDataParams), Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics::Enum_MetaDataParams)
};
UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider()
{
	if (!Z_Registration_Info_UEnum_EInsimulSTTProvider.InnerSingleton)
	{
		UECodeGen_Private::ConstructUEnum(Z_Registration_Info_UEnum_EInsimulSTTProvider.InnerSingleton, Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider_Statics::EnumParams);
	}
	return Z_Registration_Info_UEnum_EInsimulSTTProvider.InnerSingleton;
}
// ********** End Enum EInsimulSTTProvider *********************************************************

// ********** Begin Class UInsimulSettings *********************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulSettings;
UClass* UInsimulSettings::GetPrivateStaticClass()
{
	using TClass = UInsimulSettings;
	if (!Z_Registration_Info_UClass_UInsimulSettings.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulSettings"),
			Z_Registration_Info_UClass_UInsimulSettings.InnerSingleton,
			StaticRegisterNativesUInsimulSettings,
			sizeof(TClass),
			alignof(TClass),
			TClass::StaticClassFlags,
			TClass::StaticClassCastFlags(),
			TClass::StaticConfigName(),
			(UClass::ClassConstructorType)InternalConstructor<TClass>,
			(UClass::ClassVTableHelperCtorCallerType)InternalVTableHelperCtorCaller<TClass>,
			UOBJECT_CPPCLASS_STATICFUNCTIONS_FORCLASS(TClass),
			&TClass::Super::StaticClass,
			&TClass::WithinClass::StaticClass
		);
	}
	return Z_Registration_Info_UClass_UInsimulSettings.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulSettings_NoRegister()
{
	return UInsimulSettings::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulSettings_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Global settings for the Insimul plugin.\n * Configure in Project Settings > Plugins > Insimul.\n *\n * The provider model matches the JavaScript SDK (@insimul/sdk):\n * pick a provider for Chat (LLM), TTS, and STT independently.\n */" },
#endif
		{ "DisplayName", "Insimul" },
		{ "IncludePath", "InsimulSettings.h" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Global settings for the Insimul plugin.\nConfigure in Project Settings > Plugins > Insimul.\n\nThe provider model matches the JavaScript SDK (@insimul/sdk):\npick a provider for Chat (LLM), TTS, and STT independently." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ChatProvider_MetaData[] = {
		{ "Category", "Providers" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Chat (LLM) provider \xe2\x80\x94 where NPC dialogue is generated. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Chat (LLM) provider \xe2\x80\x94 where NPC dialogue is generated." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_TTSProvider_MetaData[] = {
		{ "Category", "Providers" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** TTS provider \xe2\x80\x94 where NPC speech audio is synthesized. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "TTS provider \xe2\x80\x94 where NPC speech audio is synthesized." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_STTProvider_MetaData[] = {
		{ "Category", "Providers" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** STT provider \xe2\x80\x94 where player voice input is transcribed. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "STT provider \xe2\x80\x94 where player voice input is transcribed." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ServerURL_MetaData[] = {
		{ "Category", "Server" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Base URL of the Insimul server */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Server" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Base URL of the Insimul server" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DefaultWorldID_MetaData[] = {
		{ "Category", "Server" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Default world ID for conversations */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Default world ID for conversations" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_APIKey_MetaData[] = {
		{ "Category", "Server" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Optional API key for authentication */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Server" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Optional API key for authentication" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bPreferWebSocket_MetaData[] = {
		{ "Category", "Server" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Prefer WebSocket streaming over REST (recommended for low latency) */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Server" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Prefer WebSocket streaming over REST (recommended for low latency)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LocalModelPath_MetaData[] = {
		{ "Category", "Local LLM" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Path to a local GGUF model file for in-process inference (relative to Content/).\n\x09 *  When set, the plugin spawns llama.cpp as a subprocess \xe2\x80\x94 no external server needed.\n\x09 *  Leave empty to use LocalLLMServerURL instead (requires running Ollama/llama.cpp separately).\n\x09 *  Example: \"InsimulModels/mistral-7b-instruct.Q4_K_M.gguf\" */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Path to a local GGUF model file for in-process inference (relative to Content/).\nWhen set, the plugin spawns llama.cpp as a subprocess \xe2\x80\x94 no external server needed.\nLeave empty to use LocalLLMServerURL instead (requires running Ollama/llama.cpp separately).\nExample: \"InsimulModels/mistral-7b-instruct.Q4_K_M.gguf\"" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LocalLLMServerURL_MetaData[] = {
		{ "Category", "Local LLM" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** URL of an external LLM server (used when LocalModelPath is empty).\n\x09 *  Ollama: http://localhost:11434/api/generate\n\x09 *  llama.cpp: http://localhost:8081/completion */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "URL of an external LLM server (used when LocalModelPath is empty).\nOllama: http://localhost:11434/api/generate\nllama.cpp: http://localhost:8081/completion" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LocalLLMModel_MetaData[] = {
		{ "Category", "Local LLM" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** LLM model name (used by Ollama; ignored when using LocalModelPath) */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "LLM model name (used by Ollama; ignored when using LocalModelPath)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldDataPath_MetaData[] = {
		{ "Category", "Local LLM" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Path to the exported Insimul world data JSON file (relative to Content/) */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Path to the exported Insimul world data JSON file (relative to Content/)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_MaxTokens_MetaData[] = {
		{ "Category", "Local LLM" },
		{ "ClampMax", "2048" },
		{ "ClampMin", "32" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Maximum tokens for LLM response generation */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Maximum tokens for LLM response generation" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Temperature_MetaData[] = {
		{ "Category", "Local LLM" },
		{ "ClampMax", "2.0" },
		{ "ClampMin", "0.0" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** LLM temperature (0.0 = deterministic, 1.0+ = creative) */" },
#endif
		{ "EditCondition", "ChatProvider == EInsimulChatProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "LLM temperature (0.0 = deterministic, 1.0+ = creative)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LocalVoiceModel_MetaData[] = {
		{ "Category", "Local TTS" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Voice model name for Runtime Text To Speech plugin.\n\x09 *  Piper examples: \"en_US-amy-medium\", \"en_GB-alba-medium\"\n\x09 *  Kokoro examples: \"en_US-libritts_r-medium\" */" },
#endif
		{ "EditCondition", "TTSProvider == EInsimulTTSProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Voice model name for Runtime Text To Speech plugin.\nPiper examples: \"en_US-amy-medium\", \"en_GB-alba-medium\"\nKokoro examples: \"en_US-libritts_r-medium\"" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LocalSpeakerIndex_MetaData[] = {
		{ "Category", "Local TTS" },
		{ "ClampMin", "0" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Speaker index within the voice model (for multi-speaker models) */" },
#endif
		{ "EditCondition", "TTSProvider == EInsimulTTSProvider::Local" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Speaker index within the voice model (for multi-speaker models)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LanguageCode_MetaData[] = {
		{ "Category", "Common" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Default language code for conversations (BCP47, e.g., \"en\", \"fr-FR\", \"ja\") */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Default language code for conversations (BCP47, e.g., \"en\", \"fr-FR\", \"ja\")" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulSettings constinit property declarations *************************
	static const UECodeGen_Private::FBytePropertyParams NewProp_ChatProvider_Underlying;
	static const UECodeGen_Private::FEnumPropertyParams NewProp_ChatProvider;
	static const UECodeGen_Private::FBytePropertyParams NewProp_TTSProvider_Underlying;
	static const UECodeGen_Private::FEnumPropertyParams NewProp_TTSProvider;
	static const UECodeGen_Private::FBytePropertyParams NewProp_STTProvider_Underlying;
	static const UECodeGen_Private::FEnumPropertyParams NewProp_STTProvider;
	static const UECodeGen_Private::FStrPropertyParams NewProp_ServerURL;
	static const UECodeGen_Private::FStrPropertyParams NewProp_DefaultWorldID;
	static const UECodeGen_Private::FStrPropertyParams NewProp_APIKey;
	static void NewProp_bPreferWebSocket_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bPreferWebSocket;
	static const UECodeGen_Private::FStrPropertyParams NewProp_LocalModelPath;
	static const UECodeGen_Private::FStrPropertyParams NewProp_LocalLLMServerURL;
	static const UECodeGen_Private::FStrPropertyParams NewProp_LocalLLMModel;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldDataPath;
	static const UECodeGen_Private::FIntPropertyParams NewProp_MaxTokens;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_Temperature;
	static const UECodeGen_Private::FStrPropertyParams NewProp_LocalVoiceModel;
	static const UECodeGen_Private::FIntPropertyParams NewProp_LocalSpeakerIndex;
	static const UECodeGen_Private::FStrPropertyParams NewProp_LanguageCode;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulSettings constinit property declarations ***************************
	static UObject* (*const DependentSingletons[])();
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulSettings>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulSettings_Statics

// ********** Begin Class UInsimulSettings Property Definitions ************************************
const UECodeGen_Private::FBytePropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ChatProvider_Underlying = { "UnderlyingType", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FEnumPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ChatProvider = { "ChatProvider", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Enum, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, ChatProvider), Z_Construct_UEnum_InsimulRuntime_EInsimulChatProvider, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ChatProvider_MetaData), NewProp_ChatProvider_MetaData) }; // 869908196
const UECodeGen_Private::FBytePropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_TTSProvider_Underlying = { "UnderlyingType", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FEnumPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_TTSProvider = { "TTSProvider", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Enum, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, TTSProvider), Z_Construct_UEnum_InsimulRuntime_EInsimulTTSProvider, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_TTSProvider_MetaData), NewProp_TTSProvider_MetaData) }; // 1733677192
const UECodeGen_Private::FBytePropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_STTProvider_Underlying = { "UnderlyingType", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FEnumPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_STTProvider = { "STTProvider", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Enum, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, STTProvider), Z_Construct_UEnum_InsimulRuntime_EInsimulSTTProvider, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_STTProvider_MetaData), NewProp_STTProvider_MetaData) }; // 532121810
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ServerURL = { "ServerURL", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, ServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ServerURL_MetaData), NewProp_ServerURL_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_DefaultWorldID = { "DefaultWorldID", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, DefaultWorldID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DefaultWorldID_MetaData), NewProp_DefaultWorldID_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_APIKey = { "APIKey", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, APIKey), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_APIKey_MetaData), NewProp_APIKey_MetaData) };
void Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket_SetBit(void* Obj)
{
	((UInsimulSettings*)Obj)->bPreferWebSocket = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket = { "bPreferWebSocket", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulSettings), &Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bPreferWebSocket_MetaData), NewProp_bPreferWebSocket_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalModelPath = { "LocalModelPath", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, LocalModelPath), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LocalModelPath_MetaData), NewProp_LocalModelPath_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalLLMServerURL = { "LocalLLMServerURL", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, LocalLLMServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LocalLLMServerURL_MetaData), NewProp_LocalLLMServerURL_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalLLMModel = { "LocalLLMModel", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, LocalLLMModel), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LocalLLMModel_MetaData), NewProp_LocalLLMModel_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_WorldDataPath = { "WorldDataPath", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, WorldDataPath), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldDataPath_MetaData), NewProp_WorldDataPath_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_MaxTokens = { "MaxTokens", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, MaxTokens), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_MaxTokens_MetaData), NewProp_MaxTokens_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_Temperature = { "Temperature", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, Temperature), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Temperature_MetaData), NewProp_Temperature_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalVoiceModel = { "LocalVoiceModel", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, LocalVoiceModel), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LocalVoiceModel_MetaData), NewProp_LocalVoiceModel_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalSpeakerIndex = { "LocalSpeakerIndex", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, LocalSpeakerIndex), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LocalSpeakerIndex_MetaData), NewProp_LocalSpeakerIndex_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LanguageCode = { "LanguageCode", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, LanguageCode), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LanguageCode_MetaData), NewProp_LanguageCode_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulSettings_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ChatProvider_Underlying,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ChatProvider,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_TTSProvider_Underlying,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_TTSProvider,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_STTProvider_Underlying,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_STTProvider,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ServerURL,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_DefaultWorldID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_APIKey,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalModelPath,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalLLMServerURL,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalLLMModel,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_WorldDataPath,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_MaxTokens,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_Temperature,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalVoiceModel,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LocalSpeakerIndex,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_LanguageCode,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulSettings_Statics::PropPointers) < 2048);
// ********** End Class UInsimulSettings Property Definitions **************************************
UObject* (*const Z_Construct_UClass_UInsimulSettings_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UObject,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulSettings_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulSettings_Statics::ClassParams = {
	&UInsimulSettings::StaticClass,
	"Game",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	nullptr,
	Z_Construct_UClass_UInsimulSettings_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	0,
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulSettings_Statics::PropPointers),
	0,
	0x001000A6u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulSettings_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulSettings_Statics::Class_MetaDataParams)
};
void UInsimulSettings::StaticRegisterNativesUInsimulSettings()
{
}
UClass* Z_Construct_UClass_UInsimulSettings()
{
	if (!Z_Registration_Info_UClass_UInsimulSettings.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulSettings.OuterSingleton, Z_Construct_UClass_UInsimulSettings_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulSettings.OuterSingleton;
}
UInsimulSettings::UInsimulSettings(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer) {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulSettings);
UInsimulSettings::~UInsimulSettings() {}
// ********** End Class UInsimulSettings ***********************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics
{
	static constexpr FEnumRegisterCompiledInInfo EnumInfo[] = {
		{ EInsimulChatProvider_StaticEnum, TEXT("EInsimulChatProvider"), &Z_Registration_Info_UEnum_EInsimulChatProvider, CONSTRUCT_RELOAD_VERSION_INFO(FEnumReloadVersionInfo, 869908196U) },
		{ EInsimulTTSProvider_StaticEnum, TEXT("EInsimulTTSProvider"), &Z_Registration_Info_UEnum_EInsimulTTSProvider, CONSTRUCT_RELOAD_VERSION_INFO(FEnumReloadVersionInfo, 1733677192U) },
		{ EInsimulSTTProvider_StaticEnum, TEXT("EInsimulSTTProvider"), &Z_Registration_Info_UEnum_EInsimulSTTProvider, CONSTRUCT_RELOAD_VERSION_INFO(FEnumReloadVersionInfo, 532121810U) },
	};
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulSettings, UInsimulSettings::StaticClass, TEXT("UInsimulSettings"), &Z_Registration_Info_UClass_UInsimulSettings, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulSettings), 4119263182U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_2482302732{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics::EnumInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics::EnumInfo),
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
