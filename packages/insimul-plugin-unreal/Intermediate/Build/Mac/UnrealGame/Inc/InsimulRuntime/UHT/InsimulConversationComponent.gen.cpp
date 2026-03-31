// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulConversationComponent.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulConversationComponent() {}

// ********** Begin Cross Module References ********************************************************
ENGINE_API UClass* Z_Construct_UClass_UActorComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulConversationComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulConversationComponent_NoRegister();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulConversation();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulConversationConfig();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulUtterance();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin ScriptStruct FInsimulConversationConfig ****************************************
struct Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulConversationConfig); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulConversationConfig); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_APIBaseUrl_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** The URL of the Insimul API server */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "The URL of the Insimul API server" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldID_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** The world ID to use for conversations */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "The world ID to use for conversations" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterID_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** The character ID to use for this NPC */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "The character ID to use for this NPC" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ConversationCheckInterval_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** How often to check for nearby conversations (in seconds) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "How often to check for nearby conversations (in seconds)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ConversationRadius_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Maximum distance to start a conversation */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Maximum distance to start a conversation" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_PlayerCharacterID_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Character ID representing the player in the Insimul world */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Character ID representing the player in the Insimul world" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulConversationConfig constinit property declarations ********
	static const UECodeGen_Private::FStrPropertyParams NewProp_APIBaseUrl;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldID;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterID;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_ConversationCheckInterval;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_ConversationRadius;
	static const UECodeGen_Private::FStrPropertyParams NewProp_PlayerCharacterID;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulConversationConfig constinit property declarations **********
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulConversationConfig>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulConversationConfig;
class UScriptStruct* FInsimulConversationConfig::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulConversationConfig.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulConversationConfig.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulConversationConfig, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulConversationConfig"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulConversationConfig.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulConversationConfig Property Definitions *******************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_APIBaseUrl = { "APIBaseUrl", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversationConfig, APIBaseUrl), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_APIBaseUrl_MetaData), NewProp_APIBaseUrl_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_WorldID = { "WorldID", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversationConfig, WorldID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldID_MetaData), NewProp_WorldID_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_CharacterID = { "CharacterID", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversationConfig, CharacterID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterID_MetaData), NewProp_CharacterID_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_ConversationCheckInterval = { "ConversationCheckInterval", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversationConfig, ConversationCheckInterval), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ConversationCheckInterval_MetaData), NewProp_ConversationCheckInterval_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_ConversationRadius = { "ConversationRadius", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversationConfig, ConversationRadius), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ConversationRadius_MetaData), NewProp_ConversationRadius_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_PlayerCharacterID = { "PlayerCharacterID", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversationConfig, PlayerCharacterID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_PlayerCharacterID_MetaData), NewProp_PlayerCharacterID_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_APIBaseUrl,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_WorldID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_CharacterID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_ConversationCheckInterval,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_ConversationRadius,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewProp_PlayerCharacterID,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulConversationConfig Property Definitions *********************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulConversationConfig",
	Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::PropPointers),
	sizeof(FInsimulConversationConfig),
	alignof(FInsimulConversationConfig),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulConversationConfig()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulConversationConfig.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulConversationConfig.InnerSingleton, Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulConversationConfig.InnerSingleton);
}
// ********** End ScriptStruct FInsimulConversationConfig ******************************************

// ********** Begin ScriptStruct FInsimulUtterance *************************************************
struct Z_Construct_UScriptStruct_FInsimulUtterance_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulUtterance); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulUtterance); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SpeakerID_MetaData[] = {
		{ "Category", "InsimulUtterance" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Text_MetaData[] = {
		{ "Category", "InsimulUtterance" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Tone_MetaData[] = {
		{ "Category", "InsimulUtterance" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Timestamp_MetaData[] = {
		{ "Category", "InsimulUtterance" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulUtterance constinit property declarations *****************
	static const UECodeGen_Private::FStrPropertyParams NewProp_SpeakerID;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Text;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Tone;
	static const UECodeGen_Private::FIntPropertyParams NewProp_Timestamp;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulUtterance constinit property declarations *******************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulUtterance>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulUtterance_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulUtterance;
class UScriptStruct* FInsimulUtterance::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulUtterance.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulUtterance.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulUtterance, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulUtterance"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulUtterance.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulUtterance Property Definitions ****************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_SpeakerID = { "SpeakerID", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulUtterance, SpeakerID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SpeakerID_MetaData), NewProp_SpeakerID_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_Text = { "Text", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulUtterance, Text), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Text_MetaData), NewProp_Text_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_Tone = { "Tone", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulUtterance, Tone), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Tone_MetaData), NewProp_Tone_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_Timestamp = { "Timestamp", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulUtterance, Timestamp), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Timestamp_MetaData), NewProp_Timestamp_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulUtterance_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_SpeakerID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_Text,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_Tone,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewProp_Timestamp,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulUtterance_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulUtterance Property Definitions ******************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulUtterance_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulUtterance",
	Z_Construct_UScriptStruct_FInsimulUtterance_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulUtterance_Statics::PropPointers),
	sizeof(FInsimulUtterance),
	alignof(FInsimulUtterance),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulUtterance_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulUtterance_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulUtterance()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulUtterance.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulUtterance.InnerSingleton, Z_Construct_UScriptStruct_FInsimulUtterance_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulUtterance.InnerSingleton);
}
// ********** End ScriptStruct FInsimulUtterance ***************************************************

// ********** Begin ScriptStruct FInsimulConversation **********************************************
struct Z_Construct_UScriptStruct_FInsimulConversation_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulConversation); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulConversation); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ConversationID_MetaData[] = {
		{ "Category", "InsimulConversation" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Participants_MetaData[] = {
		{ "Category", "InsimulConversation" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Utterances_MetaData[] = {
		{ "Category", "InsimulConversation" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bIsComplete_MetaData[] = {
		{ "Category", "InsimulConversation" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulConversation constinit property declarations **************
	static const UECodeGen_Private::FStrPropertyParams NewProp_ConversationID;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Participants_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_Participants;
	static const UECodeGen_Private::FStructPropertyParams NewProp_Utterances_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_Utterances;
	static void NewProp_bIsComplete_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bIsComplete;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulConversation constinit property declarations ****************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulConversation>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulConversation_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulConversation;
class UScriptStruct* FInsimulConversation::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulConversation.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulConversation.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulConversation, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulConversation"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulConversation.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulConversation Property Definitions *************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_ConversationID = { "ConversationID", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversation, ConversationID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ConversationID_MetaData), NewProp_ConversationID_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Participants_Inner = { "Participants", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Participants = { "Participants", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversation, Participants), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Participants_MetaData), NewProp_Participants_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Utterances_Inner = { "Utterances", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulUtterance, METADATA_PARAMS(0, nullptr) }; // 3489850768
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Utterances = { "Utterances", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulConversation, Utterances), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Utterances_MetaData), NewProp_Utterances_MetaData) }; // 3489850768
void Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_bIsComplete_SetBit(void* Obj)
{
	((FInsimulConversation*)Obj)->bIsComplete = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_bIsComplete = { "bIsComplete", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(FInsimulConversation), &Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_bIsComplete_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bIsComplete_MetaData), NewProp_bIsComplete_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulConversation_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_ConversationID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Participants_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Participants,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Utterances_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_Utterances,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewProp_bIsComplete,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulConversation_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulConversation Property Definitions ***************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulConversation_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulConversation",
	Z_Construct_UScriptStruct_FInsimulConversation_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulConversation_Statics::PropPointers),
	sizeof(FInsimulConversation),
	alignof(FInsimulConversation),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulConversation_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulConversation_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulConversation()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulConversation.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulConversation.InnerSingleton, Z_Construct_UScriptStruct_FInsimulConversation_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulConversation.InnerSingleton);
}
// ********** End ScriptStruct FInsimulConversation ************************************************

// ********** Begin Delegate FOnInsimulConversationStarted *****************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulConversationStarted_Parms
	{
		FInsimulConversation Conversation;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Conversation_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulConversationStarted constinit property declarations *********
	static const UECodeGen_Private::FStructPropertyParams NewProp_Conversation;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulConversationStarted constinit property declarations ***********
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulConversationStarted Property Definitions ********************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::NewProp_Conversation = { "Conversation", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulConversationStarted_Parms, Conversation), Z_Construct_UScriptStruct_FInsimulConversation, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Conversation_MetaData), NewProp_Conversation_MetaData) }; // 3744489045
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::NewProp_Conversation,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulConversationStarted Property Definitions **********************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulConversationStarted__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulConversationStarted_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00530000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulConversationStarted_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulConversationStarted_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulConversationStarted, FInsimulConversation const& Conversation)
{
	struct _Script_InsimulRuntime_eventOnInsimulConversationStarted_Parms
	{
		FInsimulConversation Conversation;
	};
	_Script_InsimulRuntime_eventOnInsimulConversationStarted_Parms Parms;
	Parms.Conversation=Conversation;
	OnInsimulConversationStarted.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulConversationStarted *******************************************

// ********** Begin Delegate FOnInsimulUtteranceReceived *******************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulUtteranceReceived_Parms
	{
		FInsimulUtterance Utterance;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Utterance_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulUtteranceReceived constinit property declarations ***********
	static const UECodeGen_Private::FStructPropertyParams NewProp_Utterance;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulUtteranceReceived constinit property declarations *************
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulUtteranceReceived Property Definitions **********************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::NewProp_Utterance = { "Utterance", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulUtteranceReceived_Parms, Utterance), Z_Construct_UScriptStruct_FInsimulUtterance, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Utterance_MetaData), NewProp_Utterance_MetaData) }; // 3489850768
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::NewProp_Utterance,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulUtteranceReceived Property Definitions ************************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulUtteranceReceived__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulUtteranceReceived_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00530000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulUtteranceReceived_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulUtteranceReceived_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulUtteranceReceived, FInsimulUtterance const& Utterance)
{
	struct _Script_InsimulRuntime_eventOnInsimulUtteranceReceived_Parms
	{
		FInsimulUtterance Utterance;
	};
	_Script_InsimulRuntime_eventOnInsimulUtteranceReceived_Parms Parms;
	Parms.Utterance=Utterance;
	OnInsimulUtteranceReceived.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulUtteranceReceived *********************************************

// ********** Begin Delegate FOnInsimulConversationEnded *******************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulConversationEnded_Parms
	{
		FInsimulConversation Conversation;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Conversation_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulConversationEnded constinit property declarations ***********
	static const UECodeGen_Private::FStructPropertyParams NewProp_Conversation;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulConversationEnded constinit property declarations *************
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulConversationEnded Property Definitions **********************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::NewProp_Conversation = { "Conversation", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulConversationEnded_Parms, Conversation), Z_Construct_UScriptStruct_FInsimulConversation, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Conversation_MetaData), NewProp_Conversation_MetaData) }; // 3744489045
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::NewProp_Conversation,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulConversationEnded Property Definitions ************************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulConversationEnded__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulConversationEnded_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00530000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulConversationEnded_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulConversationEnded_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulConversationEnded, FInsimulConversation const& Conversation)
{
	struct _Script_InsimulRuntime_eventOnInsimulConversationEnded_Parms
	{
		FInsimulConversation Conversation;
	};
	_Script_InsimulRuntime_eventOnInsimulConversationEnded_Parms Parms;
	Parms.Conversation=Conversation;
	OnInsimulConversationEnded.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulConversationEnded *********************************************

// ********** Begin Delegate FOnInsimulAudioChunkReceived ******************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulAudioChunkReceived_Parms
	{
		TArray<uint8> AudioData;
		int32 DurationMs;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Fired for each streaming audio chunk (TTS). AudioData is raw PCM/MP3, DurationMs is the chunk duration. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Fired for each streaming audio chunk (TTS). AudioData is raw PCM/MP3, DurationMs is the chunk duration." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_AudioData_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulAudioChunkReceived constinit property declarations **********
	static const UECodeGen_Private::FBytePropertyParams NewProp_AudioData_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_AudioData;
	static const UECodeGen_Private::FIntPropertyParams NewProp_DurationMs;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulAudioChunkReceived constinit property declarations ************
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulAudioChunkReceived Property Definitions *********************
const UECodeGen_Private::FBytePropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::NewProp_AudioData_Inner = { "AudioData", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::NewProp_AudioData = { "AudioData", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulAudioChunkReceived_Parms, AudioData), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_AudioData_MetaData), NewProp_AudioData_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::NewProp_DurationMs = { "DurationMs", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulAudioChunkReceived_Parms, DurationMs), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::NewProp_AudioData_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::NewProp_AudioData,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::NewProp_DurationMs,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulAudioChunkReceived Property Definitions ***********************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulAudioChunkReceived__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulAudioChunkReceived_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00530000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulAudioChunkReceived_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulAudioChunkReceived_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulAudioChunkReceived, TArray<uint8> const& AudioData, int32 DurationMs)
{
	struct _Script_InsimulRuntime_eventOnInsimulAudioChunkReceived_Parms
	{
		TArray<uint8> AudioData;
		int32 DurationMs;
	};
	_Script_InsimulRuntime_eventOnInsimulAudioChunkReceived_Parms Parms;
	Parms.AudioData=AudioData;
	Parms.DurationMs=DurationMs;
	OnInsimulAudioChunkReceived.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulAudioChunkReceived ********************************************

// ********** Begin Class UInsimulConversationComponent Function EndConversation *******************
struct Z_Construct_UFunction_UInsimulConversationComponent_EndConversation_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** End the current conversation */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "End the current conversation" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function EndConversation constinit property declarations ***********************
// ********** End Function EndConversation constinit property declarations *************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulConversationComponent_EndConversation_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulConversationComponent, nullptr, "EndConversation", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_EndConversation_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulConversationComponent_EndConversation_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulConversationComponent_EndConversation()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulConversationComponent_EndConversation_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulConversationComponent::execEndConversation)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->EndConversation();
	P_NATIVE_END;
}
// ********** End Class UInsimulConversationComponent Function EndConversation *********************

// ********** Begin Class UInsimulConversationComponent Function InitializeInsimul *****************
struct Z_Construct_UFunction_UInsimulConversationComponent_InitializeInsimul_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Initialize the component with the current Config. Call this after setting CharacterID and WorldID. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Initialize the component with the current Config. Call this after setting CharacterID and WorldID." },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function InitializeInsimul constinit property declarations *********************
// ********** End Function InitializeInsimul constinit property declarations ***********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulConversationComponent_InitializeInsimul_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulConversationComponent, nullptr, "InitializeInsimul", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_InitializeInsimul_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulConversationComponent_InitializeInsimul_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulConversationComponent_InitializeInsimul()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulConversationComponent_InitializeInsimul_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulConversationComponent::execInitializeInsimul)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->InitializeInsimul();
	P_NATIVE_END;
}
// ********** End Class UInsimulConversationComponent Function InitializeInsimul *******************

// ********** Begin Class UInsimulConversationComponent Function IsInConversation ******************
struct Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics
{
	struct InsimulConversationComponent_eventIsInConversation_Parms
	{
		bool ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Check if currently in a conversation */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Check if currently in a conversation" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function IsInConversation constinit property declarations **********************
	static void NewProp_ReturnValue_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function IsInConversation constinit property declarations ************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function IsInConversation Property Definitions *********************************
void Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::NewProp_ReturnValue_SetBit(void* Obj)
{
	((InsimulConversationComponent_eventIsInConversation_Parms*)Obj)->ReturnValue = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulConversationComponent_eventIsInConversation_Parms), &Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::NewProp_ReturnValue_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::PropPointers) < 2048);
// ********** End Function IsInConversation Property Definitions ***********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulConversationComponent, nullptr, "IsInConversation", 	Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::InsimulConversationComponent_eventIsInConversation_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::InsimulConversationComponent_eventIsInConversation_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulConversationComponent::execIsInConversation)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(bool*)Z_Param__Result=P_THIS->IsInConversation();
	P_NATIVE_END;
}
// ********** End Class UInsimulConversationComponent Function IsInConversation ********************

// ********** Begin Class UInsimulConversationComponent Function SendMessage ***********************
struct Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics
{
	struct InsimulConversationComponent_eventSendMessage_Parms
	{
		FString Message;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Send a message in the current conversation (uses WebSocket streaming when available) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Send a message in the current conversation (uses WebSocket streaming when available)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Message_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function SendMessage constinit property declarations ***************************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Message;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SendMessage constinit property declarations *****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SendMessage Property Definitions **************************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::NewProp_Message = { "Message", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulConversationComponent_eventSendMessage_Parms, Message), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Message_MetaData), NewProp_Message_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::NewProp_Message,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::PropPointers) < 2048);
// ********** End Function SendMessage Property Definitions ****************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulConversationComponent, nullptr, "SendMessage", 	Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::InsimulConversationComponent_eventSendMessage_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::InsimulConversationComponent_eventSendMessage_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulConversationComponent_SendMessage()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulConversationComponent_SendMessage_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulConversationComponent::execSendMessage)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_Message);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SendMessage(Z_Param_Message);
	P_NATIVE_END;
}
// ********** End Class UInsimulConversationComponent Function SendMessage *************************

// ********** Begin Class UInsimulConversationComponent Function StartConversationWithCharacter ****
struct Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics
{
	struct InsimulConversationComponent_eventStartConversationWithCharacter_Parms
	{
		FString TargetCharacterID;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Start a conversation with another character */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Start a conversation with another character" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_TargetCharacterID_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function StartConversationWithCharacter constinit property declarations ********
	static const UECodeGen_Private::FStrPropertyParams NewProp_TargetCharacterID;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function StartConversationWithCharacter constinit property declarations **********
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function StartConversationWithCharacter Property Definitions *******************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::NewProp_TargetCharacterID = { "TargetCharacterID", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulConversationComponent_eventStartConversationWithCharacter_Parms, TargetCharacterID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_TargetCharacterID_MetaData), NewProp_TargetCharacterID_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::NewProp_TargetCharacterID,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::PropPointers) < 2048);
// ********** End Function StartConversationWithCharacter Property Definitions *********************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulConversationComponent, nullptr, "StartConversationWithCharacter", 	Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::InsimulConversationComponent_eventStartConversationWithCharacter_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::InsimulConversationComponent_eventStartConversationWithCharacter_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulConversationComponent::execStartConversationWithCharacter)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_TargetCharacterID);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->StartConversationWithCharacter(Z_Param_TargetCharacterID);
	P_NATIVE_END;
}
// ********** End Class UInsimulConversationComponent Function StartConversationWithCharacter ******

// ********** Begin Class UInsimulConversationComponent Function StartPlayerInitiatedConversation **
struct Z_Construct_UFunction_UInsimulConversationComponent_StartPlayerInitiatedConversation_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Start a conversation where the player is the initiator and this NPC is the target. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Start a conversation where the player is the initiator and this NPC is the target." },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function StartPlayerInitiatedConversation constinit property declarations ******
// ********** End Function StartPlayerInitiatedConversation constinit property declarations ********
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulConversationComponent_StartPlayerInitiatedConversation_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulConversationComponent, nullptr, "StartPlayerInitiatedConversation", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulConversationComponent_StartPlayerInitiatedConversation_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulConversationComponent_StartPlayerInitiatedConversation_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulConversationComponent_StartPlayerInitiatedConversation()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulConversationComponent_StartPlayerInitiatedConversation_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulConversationComponent::execStartPlayerInitiatedConversation)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->StartPlayerInitiatedConversation();
	P_NATIVE_END;
}
// ********** End Class UInsimulConversationComponent Function StartPlayerInitiatedConversation ****

// ********** Begin Class UInsimulConversationComponent ********************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulConversationComponent;
UClass* UInsimulConversationComponent::GetPrivateStaticClass()
{
	using TClass = UInsimulConversationComponent;
	if (!Z_Registration_Info_UClass_UInsimulConversationComponent.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulConversationComponent"),
			Z_Registration_Info_UClass_UInsimulConversationComponent.InnerSingleton,
			StaticRegisterNativesUInsimulConversationComponent,
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
	return Z_Registration_Info_UClass_UInsimulConversationComponent.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulConversationComponent_NoRegister()
{
	return UInsimulConversationComponent::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulConversationComponent_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintSpawnableComponent", "" },
		{ "ClassGroupNames", "Custom" },
		{ "IncludePath", "InsimulConversationComponent.h" },
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Config_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Configuration for the Insimul conversation system */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Configuration for the Insimul conversation system" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OnConversationStarted_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Called when a conversation starts */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called when a conversation starts" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OnUtteranceReceived_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Called when an utterance is received */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called when an utterance is received" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OnConversationEnded_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Called when a conversation ends */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called when a conversation ends" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OnAudioChunkReceived_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Called when a streaming audio chunk arrives from TTS */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulConversationComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called when a streaming audio chunk arrives from TTS" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulConversationComponent constinit property declarations ************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Config;
	static const UECodeGen_Private::FMulticastDelegatePropertyParams NewProp_OnConversationStarted;
	static const UECodeGen_Private::FMulticastDelegatePropertyParams NewProp_OnUtteranceReceived;
	static const UECodeGen_Private::FMulticastDelegatePropertyParams NewProp_OnConversationEnded;
	static const UECodeGen_Private::FMulticastDelegatePropertyParams NewProp_OnAudioChunkReceived;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulConversationComponent constinit property declarations **************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("EndConversation"), .Pointer = &UInsimulConversationComponent::execEndConversation },
		{ .NameUTF8 = UTF8TEXT("InitializeInsimul"), .Pointer = &UInsimulConversationComponent::execInitializeInsimul },
		{ .NameUTF8 = UTF8TEXT("IsInConversation"), .Pointer = &UInsimulConversationComponent::execIsInConversation },
		{ .NameUTF8 = UTF8TEXT("SendMessage"), .Pointer = &UInsimulConversationComponent::execSendMessage },
		{ .NameUTF8 = UTF8TEXT("StartConversationWithCharacter"), .Pointer = &UInsimulConversationComponent::execStartConversationWithCharacter },
		{ .NameUTF8 = UTF8TEXT("StartPlayerInitiatedConversation"), .Pointer = &UInsimulConversationComponent::execStartPlayerInitiatedConversation },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulConversationComponent_EndConversation, "EndConversation" }, // 3719352778
		{ &Z_Construct_UFunction_UInsimulConversationComponent_InitializeInsimul, "InitializeInsimul" }, // 1289966075
		{ &Z_Construct_UFunction_UInsimulConversationComponent_IsInConversation, "IsInConversation" }, // 2896982585
		{ &Z_Construct_UFunction_UInsimulConversationComponent_SendMessage, "SendMessage" }, // 932702581
		{ &Z_Construct_UFunction_UInsimulConversationComponent_StartConversationWithCharacter, "StartConversationWithCharacter" }, // 205993747
		{ &Z_Construct_UFunction_UInsimulConversationComponent_StartPlayerInitiatedConversation, "StartPlayerInitiatedConversation" }, // 1203821136
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulConversationComponent>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulConversationComponent_Statics

// ********** Begin Class UInsimulConversationComponent Property Definitions ***********************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_Config = { "Config", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulConversationComponent, Config), Z_Construct_UScriptStruct_FInsimulConversationConfig, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Config_MetaData), NewProp_Config_MetaData) }; // 1518281918
const UECodeGen_Private::FMulticastDelegatePropertyParams Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnConversationStarted = { "OnConversationStarted", nullptr, (EPropertyFlags)0x0010000010080000, UECodeGen_Private::EPropertyGenFlags::InlineMulticastDelegate, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulConversationComponent, OnConversationStarted), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OnConversationStarted_MetaData), NewProp_OnConversationStarted_MetaData) }; // 193634222
const UECodeGen_Private::FMulticastDelegatePropertyParams Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnUtteranceReceived = { "OnUtteranceReceived", nullptr, (EPropertyFlags)0x0010000010080000, UECodeGen_Private::EPropertyGenFlags::InlineMulticastDelegate, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulConversationComponent, OnUtteranceReceived), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OnUtteranceReceived_MetaData), NewProp_OnUtteranceReceived_MetaData) }; // 901167719
const UECodeGen_Private::FMulticastDelegatePropertyParams Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnConversationEnded = { "OnConversationEnded", nullptr, (EPropertyFlags)0x0010000010080000, UECodeGen_Private::EPropertyGenFlags::InlineMulticastDelegate, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulConversationComponent, OnConversationEnded), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OnConversationEnded_MetaData), NewProp_OnConversationEnded_MetaData) }; // 3653985056
const UECodeGen_Private::FMulticastDelegatePropertyParams Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnAudioChunkReceived = { "OnAudioChunkReceived", nullptr, (EPropertyFlags)0x0010000010080000, UECodeGen_Private::EPropertyGenFlags::InlineMulticastDelegate, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulConversationComponent, OnAudioChunkReceived), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OnAudioChunkReceived_MetaData), NewProp_OnAudioChunkReceived_MetaData) }; // 4115878902
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulConversationComponent_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_Config,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnConversationStarted,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnUtteranceReceived,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnConversationEnded,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulConversationComponent_Statics::NewProp_OnAudioChunkReceived,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulConversationComponent_Statics::PropPointers) < 2048);
// ********** End Class UInsimulConversationComponent Property Definitions *************************
UObject* (*const Z_Construct_UClass_UInsimulConversationComponent_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UActorComponent,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulConversationComponent_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulConversationComponent_Statics::ClassParams = {
	&UInsimulConversationComponent::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulConversationComponent_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulConversationComponent_Statics::PropPointers),
	0,
	0x00B000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulConversationComponent_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulConversationComponent_Statics::Class_MetaDataParams)
};
void UInsimulConversationComponent::StaticRegisterNativesUInsimulConversationComponent()
{
	UClass* Class = UInsimulConversationComponent::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulConversationComponent_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulConversationComponent()
{
	if (!Z_Registration_Info_UClass_UInsimulConversationComponent.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulConversationComponent.OuterSingleton, Z_Construct_UClass_UInsimulConversationComponent_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulConversationComponent.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulConversationComponent);
UInsimulConversationComponent::~UInsimulConversationComponent() {}
// ********** End Class UInsimulConversationComponent **********************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h__Script_InsimulRuntime_Statics
{
	static constexpr FStructRegisterCompiledInInfo ScriptStructInfo[] = {
		{ FInsimulConversationConfig::StaticStruct, Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics::NewStructOps, TEXT("InsimulConversationConfig"),&Z_Registration_Info_UScriptStruct_FInsimulConversationConfig, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulConversationConfig), 1518281918U) },
		{ FInsimulUtterance::StaticStruct, Z_Construct_UScriptStruct_FInsimulUtterance_Statics::NewStructOps, TEXT("InsimulUtterance"),&Z_Registration_Info_UScriptStruct_FInsimulUtterance, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulUtterance), 3489850768U) },
		{ FInsimulConversation::StaticStruct, Z_Construct_UScriptStruct_FInsimulConversation_Statics::NewStructOps, TEXT("InsimulConversation"),&Z_Registration_Info_UScriptStruct_FInsimulConversation, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulConversation), 3744489045U) },
	};
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulConversationComponent, UInsimulConversationComponent::StaticClass, TEXT("UInsimulConversationComponent"), &Z_Registration_Info_UClass_UInsimulConversationComponent, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulConversationComponent), 2439235049U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h__Script_InsimulRuntime_3078664859{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h__Script_InsimulRuntime_Statics::ClassInfo),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h__Script_InsimulRuntime_Statics::ScriptStructInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h__Script_InsimulRuntime_Statics::ScriptStructInfo),
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
