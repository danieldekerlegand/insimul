// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulTypes.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulTypes() {}

// ********** Begin Cross Module References ********************************************************
INSIMULRUNTIME_API UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding();
INSIMULRUNTIME_API UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulActionTrigger();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulAudioChunk();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulFacialData();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulViseme();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Enum EInsimulAudioEncoding *****************************************************
static FEnumRegistrationInfo Z_Registration_Info_UEnum_EInsimulAudioEncoding;
static UEnum* EInsimulAudioEncoding_StaticEnum()
{
	if (!Z_Registration_Info_UEnum_EInsimulAudioEncoding.OuterSingleton)
	{
		Z_Registration_Info_UEnum_EInsimulAudioEncoding.OuterSingleton = GetStaticEnum(Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("EInsimulAudioEncoding"));
	}
	return Z_Registration_Info_UEnum_EInsimulAudioEncoding.OuterSingleton;
}
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulAudioEncoding>()
{
	return EInsimulAudioEncoding_StaticEnum();
}
struct Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Enum_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Audio encoding format for streaming audio data. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
		{ "MP3.Name", "EInsimulAudioEncoding::MP3" },
		{ "OPUS.Name", "EInsimulAudioEncoding::OPUS" },
		{ "PCM.Name", "EInsimulAudioEncoding::PCM" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Audio encoding format for streaming audio data." },
#endif
		{ "Unspecified.Name", "EInsimulAudioEncoding::Unspecified" },
	};
#endif // WITH_METADATA
	static constexpr UECodeGen_Private::FEnumeratorParam Enumerators[] = {
		{ "EInsimulAudioEncoding::Unspecified", (int64)EInsimulAudioEncoding::Unspecified },
		{ "EInsimulAudioEncoding::PCM", (int64)EInsimulAudioEncoding::PCM },
		{ "EInsimulAudioEncoding::OPUS", (int64)EInsimulAudioEncoding::OPUS },
		{ "EInsimulAudioEncoding::MP3", (int64)EInsimulAudioEncoding::MP3 },
	};
	static const UECodeGen_Private::FEnumParams EnumParams;
}; // struct Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics 
const UECodeGen_Private::FEnumParams Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics::EnumParams = {
	(UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	"EInsimulAudioEncoding",
	"EInsimulAudioEncoding",
	Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics::Enumerators,
	RF_Public|RF_Transient|RF_MarkAsNative,
	UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics::Enumerators),
	EEnumFlags::None,
	(uint8)UEnum::ECppForm::EnumClass,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics::Enum_MetaDataParams), Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics::Enum_MetaDataParams)
};
UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding()
{
	if (!Z_Registration_Info_UEnum_EInsimulAudioEncoding.InnerSingleton)
	{
		UECodeGen_Private::ConstructUEnum(Z_Registration_Info_UEnum_EInsimulAudioEncoding.InnerSingleton, Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding_Statics::EnumParams);
	}
	return Z_Registration_Info_UEnum_EInsimulAudioEncoding.InnerSingleton;
}
// ********** End Enum EInsimulAudioEncoding *******************************************************

// ********** Begin Enum EInsimulConversationState *************************************************
static FEnumRegistrationInfo Z_Registration_Info_UEnum_EInsimulConversationState;
static UEnum* EInsimulConversationState_StaticEnum()
{
	if (!Z_Registration_Info_UEnum_EInsimulConversationState.OuterSingleton)
	{
		Z_Registration_Info_UEnum_EInsimulConversationState.OuterSingleton = GetStaticEnum(Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("EInsimulConversationState"));
	}
	return Z_Registration_Info_UEnum_EInsimulConversationState.OuterSingleton;
}
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulConversationState>()
{
	return EInsimulConversationState_StaticEnum();
}
struct Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Enum_MetaDataParams[] = {
		{ "Active.Name", "EInsimulConversationState::Active" },
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Conversation state. */" },
#endif
		{ "Ended.Name", "EInsimulConversationState::Ended" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
		{ "Paused.Name", "EInsimulConversationState::Paused" },
		{ "Started.Name", "EInsimulConversationState::Started" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Conversation state." },
#endif
		{ "Unspecified.Name", "EInsimulConversationState::Unspecified" },
	};
#endif // WITH_METADATA
	static constexpr UECodeGen_Private::FEnumeratorParam Enumerators[] = {
		{ "EInsimulConversationState::Unspecified", (int64)EInsimulConversationState::Unspecified },
		{ "EInsimulConversationState::Started", (int64)EInsimulConversationState::Started },
		{ "EInsimulConversationState::Active", (int64)EInsimulConversationState::Active },
		{ "EInsimulConversationState::Paused", (int64)EInsimulConversationState::Paused },
		{ "EInsimulConversationState::Ended", (int64)EInsimulConversationState::Ended },
	};
	static const UECodeGen_Private::FEnumParams EnumParams;
}; // struct Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics 
const UECodeGen_Private::FEnumParams Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics::EnumParams = {
	(UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	"EInsimulConversationState",
	"EInsimulConversationState",
	Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics::Enumerators,
	RF_Public|RF_Transient|RF_MarkAsNative,
	UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics::Enumerators),
	EEnumFlags::None,
	(uint8)UEnum::ECppForm::EnumClass,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics::Enum_MetaDataParams), Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics::Enum_MetaDataParams)
};
UEnum* Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState()
{
	if (!Z_Registration_Info_UEnum_EInsimulConversationState.InnerSingleton)
	{
		UECodeGen_Private::ConstructUEnum(Z_Registration_Info_UEnum_EInsimulConversationState.InnerSingleton, Z_Construct_UEnum_InsimulRuntime_EInsimulConversationState_Statics::EnumParams);
	}
	return Z_Registration_Info_UEnum_EInsimulConversationState.InnerSingleton;
}
// ********** End Enum EInsimulConversationState ***************************************************

// ********** Begin ScriptStruct FInsimulViseme ****************************************************
struct Z_Construct_UScriptStruct_FInsimulViseme_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulViseme); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulViseme); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** A single viseme for lip sync. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "A single viseme for lip sync." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Phoneme_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Phoneme name (e.g., \"aa\", \"oh\", \"sil\") */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Phoneme name (e.g., \"aa\", \"oh\", \"sil\")" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Weight_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Blend weight 0..1 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Blend weight 0..1" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DurationMs_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Duration in milliseconds */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Duration in milliseconds" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulViseme constinit property declarations ********************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Phoneme;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_Weight;
	static const UECodeGen_Private::FIntPropertyParams NewProp_DurationMs;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulViseme constinit property declarations **********************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulViseme>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulViseme_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulViseme;
class UScriptStruct* FInsimulViseme::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulViseme.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulViseme.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulViseme, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulViseme"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulViseme.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulViseme Property Definitions *******************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulViseme_Statics::NewProp_Phoneme = { "Phoneme", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulViseme, Phoneme), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Phoneme_MetaData), NewProp_Phoneme_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulViseme_Statics::NewProp_Weight = { "Weight", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulViseme, Weight), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Weight_MetaData), NewProp_Weight_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UScriptStruct_FInsimulViseme_Statics::NewProp_DurationMs = { "DurationMs", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulViseme, DurationMs), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DurationMs_MetaData), NewProp_DurationMs_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulViseme_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulViseme_Statics::NewProp_Phoneme,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulViseme_Statics::NewProp_Weight,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulViseme_Statics::NewProp_DurationMs,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulViseme_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulViseme Property Definitions *********************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulViseme_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulViseme",
	Z_Construct_UScriptStruct_FInsimulViseme_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulViseme_Statics::PropPointers),
	sizeof(FInsimulViseme),
	alignof(FInsimulViseme),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000201),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulViseme_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulViseme_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulViseme()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulViseme.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulViseme.InnerSingleton, Z_Construct_UScriptStruct_FInsimulViseme_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulViseme.InnerSingleton);
}
// ********** End ScriptStruct FInsimulViseme ******************************************************

// ********** Begin ScriptStruct FInsimulFacialData ************************************************
struct Z_Construct_UScriptStruct_FInsimulFacialData_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulFacialData); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulFacialData); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Facial/viseme data for a single response chunk. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Facial/viseme data for a single response chunk." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Visemes_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulFacialData constinit property declarations ****************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Visemes_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_Visemes;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulFacialData constinit property declarations ******************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulFacialData>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulFacialData_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulFacialData;
class UScriptStruct* FInsimulFacialData::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulFacialData.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulFacialData.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulFacialData, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulFacialData"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulFacialData.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulFacialData Property Definitions ***************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UScriptStruct_FInsimulFacialData_Statics::NewProp_Visemes_Inner = { "Visemes", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulViseme, METADATA_PARAMS(0, nullptr) }; // 2521093059
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UScriptStruct_FInsimulFacialData_Statics::NewProp_Visemes = { "Visemes", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulFacialData, Visemes), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Visemes_MetaData), NewProp_Visemes_MetaData) }; // 2521093059
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulFacialData_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulFacialData_Statics::NewProp_Visemes_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulFacialData_Statics::NewProp_Visemes,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulFacialData_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulFacialData Property Definitions *****************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulFacialData_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulFacialData",
	Z_Construct_UScriptStruct_FInsimulFacialData_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulFacialData_Statics::PropPointers),
	sizeof(FInsimulFacialData),
	alignof(FInsimulFacialData),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000201),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulFacialData_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulFacialData_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulFacialData()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulFacialData.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulFacialData.InnerSingleton, Z_Construct_UScriptStruct_FInsimulFacialData_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulFacialData.InnerSingleton);
}
// ********** End ScriptStruct FInsimulFacialData **************************************************

// ********** Begin ScriptStruct FInsimulActionTrigger *********************************************
struct Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulActionTrigger); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulActionTrigger); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** A server-triggered game action (animation, spawn, state change, etc.). */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "A server-triggered game action (animation, spawn, state change, etc.)." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ActionType_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_TargetId_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Parameters_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulActionTrigger constinit property declarations *************
	static const UECodeGen_Private::FStrPropertyParams NewProp_ActionType;
	static const UECodeGen_Private::FStrPropertyParams NewProp_TargetId;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Parameters_ValueProp;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Parameters_Key_KeyProp;
	static const UECodeGen_Private::FMapPropertyParams NewProp_Parameters;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulActionTrigger constinit property declarations ***************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulActionTrigger>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulActionTrigger;
class UScriptStruct* FInsimulActionTrigger::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulActionTrigger.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulActionTrigger.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulActionTrigger, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulActionTrigger"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulActionTrigger.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulActionTrigger Property Definitions ************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_ActionType = { "ActionType", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulActionTrigger, ActionType), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ActionType_MetaData), NewProp_ActionType_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_TargetId = { "TargetId", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulActionTrigger, TargetId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_TargetId_MetaData), NewProp_TargetId_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_Parameters_ValueProp = { "Parameters", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 1, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_Parameters_Key_KeyProp = { "Parameters_Key", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FMapPropertyParams Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_Parameters = { "Parameters", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Map, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulActionTrigger, Parameters), EMapPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Parameters_MetaData), NewProp_Parameters_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_ActionType,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_TargetId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_Parameters_ValueProp,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_Parameters_Key_KeyProp,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewProp_Parameters,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulActionTrigger Property Definitions **************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulActionTrigger",
	Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::PropPointers),
	sizeof(FInsimulActionTrigger),
	alignof(FInsimulActionTrigger),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000201),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulActionTrigger()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulActionTrigger.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulActionTrigger.InnerSingleton, Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulActionTrigger.InnerSingleton);
}
// ********** End ScriptStruct FInsimulActionTrigger ***********************************************

// ********** Begin ScriptStruct FInsimulAudioChunk ************************************************
struct Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulAudioChunk); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulAudioChunk); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** An audio chunk from the TTS stream (with encoding metadata). */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "An audio chunk from the TTS stream (with encoding metadata)." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Data_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Encoding_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SampleRate_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DurationMs_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulAudioChunk constinit property declarations ****************
	static const UECodeGen_Private::FBytePropertyParams NewProp_Data_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_Data;
	static const UECodeGen_Private::FBytePropertyParams NewProp_Encoding_Underlying;
	static const UECodeGen_Private::FEnumPropertyParams NewProp_Encoding;
	static const UECodeGen_Private::FIntPropertyParams NewProp_SampleRate;
	static const UECodeGen_Private::FIntPropertyParams NewProp_DurationMs;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulAudioChunk constinit property declarations ******************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulAudioChunk>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulAudioChunk;
class UScriptStruct* FInsimulAudioChunk::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulAudioChunk.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulAudioChunk.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulAudioChunk, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulAudioChunk"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulAudioChunk.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulAudioChunk Property Definitions ***************************
const UECodeGen_Private::FBytePropertyParams Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Data_Inner = { "Data", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Data = { "Data", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulAudioChunk, Data), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Data_MetaData), NewProp_Data_MetaData) };
const UECodeGen_Private::FBytePropertyParams Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Encoding_Underlying = { "UnderlyingType", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FEnumPropertyParams Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Encoding = { "Encoding", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Enum, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulAudioChunk, Encoding), Z_Construct_UEnum_InsimulRuntime_EInsimulAudioEncoding, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Encoding_MetaData), NewProp_Encoding_MetaData) }; // 1082517619
const UECodeGen_Private::FIntPropertyParams Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_SampleRate = { "SampleRate", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulAudioChunk, SampleRate), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SampleRate_MetaData), NewProp_SampleRate_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_DurationMs = { "DurationMs", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulAudioChunk, DurationMs), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DurationMs_MetaData), NewProp_DurationMs_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Data_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Data,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Encoding_Underlying,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_Encoding,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_SampleRate,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewProp_DurationMs,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulAudioChunk Property Definitions *****************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulAudioChunk",
	Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::PropPointers),
	sizeof(FInsimulAudioChunk),
	alignof(FInsimulAudioChunk),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000201),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulAudioChunk()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulAudioChunk.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulAudioChunk.InnerSingleton, Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulAudioChunk.InnerSingleton);
}
// ********** End ScriptStruct FInsimulAudioChunk **************************************************

// ********** Begin Delegate FOnInsimulFacialData **************************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulFacialData_Parms
	{
		FInsimulFacialData Data;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "// \xe2\x94\x80\xe2\x94\x80 Delegate declarations \xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\n" },
#endif
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "\xe2\x94\x80\xe2\x94\x80 Delegate declarations \xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80\xe2\x94\x80" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Data_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulFacialData constinit property declarations ******************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Data;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulFacialData constinit property declarations ********************
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulFacialData Property Definitions *****************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::NewProp_Data = { "Data", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulFacialData_Parms, Data), Z_Construct_UScriptStruct_FInsimulFacialData, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Data_MetaData), NewProp_Data_MetaData) }; // 939453812
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::NewProp_Data,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulFacialData Property Definitions *******************************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulFacialData__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulFacialData_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00530000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulFacialData_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulFacialData_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulFacialData, FInsimulFacialData const& Data)
{
	struct _Script_InsimulRuntime_eventOnInsimulFacialData_Parms
	{
		FInsimulFacialData Data;
	};
	_Script_InsimulRuntime_eventOnInsimulFacialData_Parms Parms;
	Parms.Data=Data;
	OnInsimulFacialData.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulFacialData ****************************************************

// ********** Begin Delegate FOnInsimulActionTrigger ***********************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulActionTrigger_Parms
	{
		FInsimulActionTrigger Action;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "ModuleRelativePath", "Public/InsimulTypes.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Action_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulActionTrigger constinit property declarations ***************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Action;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulActionTrigger constinit property declarations *****************
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulActionTrigger Property Definitions **************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::NewProp_Action = { "Action", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulActionTrigger_Parms, Action), Z_Construct_UScriptStruct_FInsimulActionTrigger, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Action_MetaData), NewProp_Action_MetaData) }; // 659734279
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::NewProp_Action,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulActionTrigger Property Definitions ****************************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulActionTrigger__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulActionTrigger_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00530000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulActionTrigger_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulActionTrigger_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulActionTrigger, FInsimulActionTrigger const& Action)
{
	struct _Script_InsimulRuntime_eventOnInsimulActionTrigger_Parms
	{
		FInsimulActionTrigger Action;
	};
	_Script_InsimulRuntime_eventOnInsimulActionTrigger_Parms Parms;
	Parms.Action=Action;
	OnInsimulActionTrigger.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulActionTrigger *************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h__Script_InsimulRuntime_Statics
{
	static constexpr FEnumRegisterCompiledInInfo EnumInfo[] = {
		{ EInsimulAudioEncoding_StaticEnum, TEXT("EInsimulAudioEncoding"), &Z_Registration_Info_UEnum_EInsimulAudioEncoding, CONSTRUCT_RELOAD_VERSION_INFO(FEnumReloadVersionInfo, 1082517619U) },
		{ EInsimulConversationState_StaticEnum, TEXT("EInsimulConversationState"), &Z_Registration_Info_UEnum_EInsimulConversationState, CONSTRUCT_RELOAD_VERSION_INFO(FEnumReloadVersionInfo, 2766495096U) },
	};
	static constexpr FStructRegisterCompiledInInfo ScriptStructInfo[] = {
		{ FInsimulViseme::StaticStruct, Z_Construct_UScriptStruct_FInsimulViseme_Statics::NewStructOps, TEXT("InsimulViseme"),&Z_Registration_Info_UScriptStruct_FInsimulViseme, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulViseme), 2521093059U) },
		{ FInsimulFacialData::StaticStruct, Z_Construct_UScriptStruct_FInsimulFacialData_Statics::NewStructOps, TEXT("InsimulFacialData"),&Z_Registration_Info_UScriptStruct_FInsimulFacialData, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulFacialData), 939453812U) },
		{ FInsimulActionTrigger::StaticStruct, Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics::NewStructOps, TEXT("InsimulActionTrigger"),&Z_Registration_Info_UScriptStruct_FInsimulActionTrigger, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulActionTrigger), 659734279U) },
		{ FInsimulAudioChunk::StaticStruct, Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics::NewStructOps, TEXT("InsimulAudioChunk"),&Z_Registration_Info_UScriptStruct_FInsimulAudioChunk, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulAudioChunk), 531608883U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h__Script_InsimulRuntime_4106007126{
	TEXT("/Script/InsimulRuntime"),
	nullptr, 0,
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h__Script_InsimulRuntime_Statics::ScriptStructInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h__Script_InsimulRuntime_Statics::ScriptStructInfo),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h__Script_InsimulRuntime_Statics::EnumInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h__Script_InsimulRuntime_Statics::EnumInfo),
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
