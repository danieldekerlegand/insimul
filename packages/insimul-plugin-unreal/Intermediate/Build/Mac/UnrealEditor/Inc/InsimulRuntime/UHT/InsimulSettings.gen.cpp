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
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

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
		{ "Comment", "/**\n * Global settings for the Insimul plugin.\n * Configure in Project Settings > Plugins > Insimul.\n */" },
#endif
		{ "DisplayName", "Insimul" },
		{ "IncludePath", "InsimulSettings.h" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Global settings for the Insimul plugin.\nConfigure in Project Settings > Plugins > Insimul." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ServerURL_MetaData[] = {
		{ "Category", "Online" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Base URL of the Insimul server (e.g., \"http://localhost:8080\") */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Base URL of the Insimul server (e.g., \"http://localhost:8080\")" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DefaultWorldID_MetaData[] = {
		{ "Category", "Online" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Default world ID for conversations */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Default world ID for conversations" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_APIKey_MetaData[] = {
		{ "Category", "Online" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Optional API key for authentication */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Optional API key for authentication" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bPreferWebSocket_MetaData[] = {
		{ "Category", "Online" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Prefer WebSocket streaming over REST (recommended for low latency) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Prefer WebSocket streaming over REST (recommended for low latency)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bOfflineMode_MetaData[] = {
		{ "Category", "Offline" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Enable offline mode \xe2\x80\x94 uses local LLM + TTS instead of the Insimul server.\n\x09 *  Requires a local llama.cpp or Ollama server and exported world data. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Enable offline mode \xe2\x80\x94 uses local LLM + TTS instead of the Insimul server.\nRequires a local llama.cpp or Ollama server and exported world data." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OfflineLLMServerURL_MetaData[] = {
		{ "Category", "Offline" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** URL of the local LLM server (llama.cpp or Ollama).\n\x09 *  llama.cpp default: http://localhost:8081/completion\n\x09 *  Ollama default: http://localhost:11434/api/generate */" },
#endif
		{ "EditCondition", "bOfflineMode" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "URL of the local LLM server (llama.cpp or Ollama).\nllama.cpp default: http://localhost:8081/completion\nOllama default: http://localhost:11434/api/generate" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OfflineLLMModel_MetaData[] = {
		{ "Category", "Offline" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** LLM model name (used by Ollama; ignored by llama.cpp which loads its own model) */" },
#endif
		{ "EditCondition", "bOfflineMode" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "LLM model name (used by Ollama; ignored by llama.cpp which loads its own model)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OfflineWorldDataPath_MetaData[] = {
		{ "Category", "Offline" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Path to the exported Insimul world data JSON file.\n\x09 *  Use the Insimul server's export endpoint or the editor export tool.\n\x09 *  Can be absolute or relative to the project's Content directory. */" },
#endif
		{ "EditCondition", "bOfflineMode" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Path to the exported Insimul world data JSON file.\nUse the Insimul server's export endpoint or the editor export tool.\nCan be absolute or relative to the project's Content directory." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OfflineVoiceModel_MetaData[] = {
		{ "Category", "Offline" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Voice model name for offline TTS (requires Runtime Text To Speech plugin).\n\x09 *  Examples: \"en_US-amy-medium\", \"en_GB-alba-medium\", \"en_US-libritts_r-medium\" */" },
#endif
		{ "EditCondition", "bOfflineMode" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Voice model name for offline TTS (requires Runtime Text To Speech plugin).\nExamples: \"en_US-amy-medium\", \"en_GB-alba-medium\", \"en_US-libritts_r-medium\"" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OfflineSpeakerIndex_MetaData[] = {
		{ "Category", "Offline" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Speaker index within the voice model (for multi-speaker models like libritts) */" },
#endif
		{ "EditCondition", "bOfflineMode" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Speaker index within the voice model (for multi-speaker models like libritts)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OfflineMaxTokens_MetaData[] = {
		{ "Category", "Offline" },
		{ "ClampMax", "2048" },
		{ "ClampMin", "32" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Maximum tokens for LLM response generation */" },
#endif
		{ "EditCondition", "bOfflineMode" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Maximum tokens for LLM response generation" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OfflineTemperature_MetaData[] = {
		{ "Category", "Offline" },
		{ "ClampMax", "2.0" },
		{ "ClampMin", "0.0" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** LLM temperature (0.0 = deterministic, 1.0+ = creative) */" },
#endif
		{ "EditCondition", "bOfflineMode" },
		{ "ModuleRelativePath", "Public/InsimulSettings.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "LLM temperature (0.0 = deterministic, 1.0+ = creative)" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulSettings constinit property declarations *************************
	static const UECodeGen_Private::FStrPropertyParams NewProp_ServerURL;
	static const UECodeGen_Private::FStrPropertyParams NewProp_DefaultWorldID;
	static const UECodeGen_Private::FStrPropertyParams NewProp_APIKey;
	static void NewProp_bPreferWebSocket_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bPreferWebSocket;
	static void NewProp_bOfflineMode_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bOfflineMode;
	static const UECodeGen_Private::FStrPropertyParams NewProp_OfflineLLMServerURL;
	static const UECodeGen_Private::FStrPropertyParams NewProp_OfflineLLMModel;
	static const UECodeGen_Private::FStrPropertyParams NewProp_OfflineWorldDataPath;
	static const UECodeGen_Private::FStrPropertyParams NewProp_OfflineVoiceModel;
	static const UECodeGen_Private::FIntPropertyParams NewProp_OfflineSpeakerIndex;
	static const UECodeGen_Private::FIntPropertyParams NewProp_OfflineMaxTokens;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_OfflineTemperature;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulSettings constinit property declarations ***************************
	static UObject* (*const DependentSingletons[])();
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulSettings>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulSettings_Statics

// ********** Begin Class UInsimulSettings Property Definitions ************************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ServerURL = { "ServerURL", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, ServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ServerURL_MetaData), NewProp_ServerURL_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_DefaultWorldID = { "DefaultWorldID", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, DefaultWorldID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DefaultWorldID_MetaData), NewProp_DefaultWorldID_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_APIKey = { "APIKey", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, APIKey), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_APIKey_MetaData), NewProp_APIKey_MetaData) };
void Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket_SetBit(void* Obj)
{
	((UInsimulSettings*)Obj)->bPreferWebSocket = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket = { "bPreferWebSocket", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulSettings), &Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bPreferWebSocket_MetaData), NewProp_bPreferWebSocket_MetaData) };
void Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bOfflineMode_SetBit(void* Obj)
{
	((UInsimulSettings*)Obj)->bOfflineMode = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bOfflineMode = { "bOfflineMode", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulSettings), &Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bOfflineMode_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bOfflineMode_MetaData), NewProp_bOfflineMode_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineLLMServerURL = { "OfflineLLMServerURL", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, OfflineLLMServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OfflineLLMServerURL_MetaData), NewProp_OfflineLLMServerURL_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineLLMModel = { "OfflineLLMModel", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, OfflineLLMModel), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OfflineLLMModel_MetaData), NewProp_OfflineLLMModel_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineWorldDataPath = { "OfflineWorldDataPath", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, OfflineWorldDataPath), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OfflineWorldDataPath_MetaData), NewProp_OfflineWorldDataPath_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineVoiceModel = { "OfflineVoiceModel", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, OfflineVoiceModel), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OfflineVoiceModel_MetaData), NewProp_OfflineVoiceModel_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineSpeakerIndex = { "OfflineSpeakerIndex", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, OfflineSpeakerIndex), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OfflineSpeakerIndex_MetaData), NewProp_OfflineSpeakerIndex_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineMaxTokens = { "OfflineMaxTokens", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, OfflineMaxTokens), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OfflineMaxTokens_MetaData), NewProp_OfflineMaxTokens_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineTemperature = { "OfflineTemperature", nullptr, (EPropertyFlags)0x0010000000004001, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulSettings, OfflineTemperature), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OfflineTemperature_MetaData), NewProp_OfflineTemperature_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulSettings_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_ServerURL,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_DefaultWorldID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_APIKey,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bPreferWebSocket,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_bOfflineMode,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineLLMServerURL,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineLLMModel,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineWorldDataPath,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineVoiceModel,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineSpeakerIndex,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineMaxTokens,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulSettings_Statics::NewProp_OfflineTemperature,
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
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulSettings, UInsimulSettings::StaticClass, TEXT("UInsimulSettings"), &Z_Registration_Info_UClass_UInsimulSettings, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulSettings), 2067452502U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_2420233665{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
