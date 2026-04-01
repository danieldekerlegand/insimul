// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulWorldExport.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulWorldExport() {}

// ********** Begin Cross Module References ********************************************************
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulDialogueContext();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulDialogueTruth();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulExportedCharacter();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulExportedWorld();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin ScriptStruct FInsimulDialogueTruth *********************************************
struct Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulDialogueTruth); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulDialogueTruth); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Dialogue truth \xe2\x80\x94 a piece of world knowledge a character has.\n * Matches the export system's FInsimulDialogueTruth.\n */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Dialogue truth \xe2\x80\x94 a piece of world knowledge a character has.\nMatches the export system's FInsimulDialogueTruth." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Title_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Content_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulDialogueTruth constinit property declarations *************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Title;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Content;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulDialogueTruth constinit property declarations ***************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulDialogueTruth>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth;
class UScriptStruct* FInsimulDialogueTruth::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulDialogueTruth, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulDialogueTruth"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulDialogueTruth Property Definitions ************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::NewProp_Title = { "Title", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueTruth, Title), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Title_MetaData), NewProp_Title_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::NewProp_Content = { "Content", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueTruth, Content), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Content_MetaData), NewProp_Content_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::NewProp_Title,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::NewProp_Content,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulDialogueTruth Property Definitions **************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulDialogueTruth",
	Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::PropPointers),
	sizeof(FInsimulDialogueTruth),
	alignof(FInsimulDialogueTruth),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulDialogueTruth()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth.InnerSingleton, Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth.InnerSingleton);
}
// ********** End ScriptStruct FInsimulDialogueTruth ***********************************************

// ********** Begin ScriptStruct FInsimulDialogueContext *******************************************
struct Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulDialogueContext); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulDialogueContext); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Dialogue context for a single character.\n * Matches the export system's FInsimulDialogueContext.\n * Contains the pre-built system prompt, greeting, voice, and knowledge base.\n */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Dialogue context for a single character.\nMatches the export system's FInsimulDialogueContext.\nContains the pre-built system prompt, greeting, voice, and knowledge base." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterId_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterName_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SystemPrompt_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Pre-built system prompt with personality, relationships, and truths */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Pre-built system prompt with personality, relationships, and truths" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Greeting_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Voice_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Voice name for TTS (e.g., \"Kore\", \"Charon\", or a Piper model speaker) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Voice name for TTS (e.g., \"Kore\", \"Charon\", or a Piper model speaker)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Truths_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulDialogueContext constinit property declarations ***********
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterId;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterName;
	static const UECodeGen_Private::FStrPropertyParams NewProp_SystemPrompt;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Greeting;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Voice;
	static const UECodeGen_Private::FStructPropertyParams NewProp_Truths_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_Truths;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulDialogueContext constinit property declarations *************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulDialogueContext>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulDialogueContext;
class UScriptStruct* FInsimulDialogueContext::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulDialogueContext.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulDialogueContext.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulDialogueContext, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulDialogueContext"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulDialogueContext.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulDialogueContext Property Definitions **********************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_CharacterId = { "CharacterId", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueContext, CharacterId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterId_MetaData), NewProp_CharacterId_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_CharacterName = { "CharacterName", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueContext, CharacterName), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterName_MetaData), NewProp_CharacterName_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_SystemPrompt = { "SystemPrompt", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueContext, SystemPrompt), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SystemPrompt_MetaData), NewProp_SystemPrompt_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Greeting = { "Greeting", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueContext, Greeting), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Greeting_MetaData), NewProp_Greeting_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Voice = { "Voice", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueContext, Voice), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Voice_MetaData), NewProp_Voice_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Truths_Inner = { "Truths", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulDialogueTruth, METADATA_PARAMS(0, nullptr) }; // 1461654990
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Truths = { "Truths", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulDialogueContext, Truths), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Truths_MetaData), NewProp_Truths_MetaData) }; // 1461654990
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_CharacterId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_CharacterName,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_SystemPrompt,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Greeting,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Voice,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Truths_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewProp_Truths,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulDialogueContext Property Definitions ************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulDialogueContext",
	Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::PropPointers),
	sizeof(FInsimulDialogueContext),
	alignof(FInsimulDialogueContext),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulDialogueContext()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulDialogueContext.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulDialogueContext.InnerSingleton, Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulDialogueContext.InnerSingleton);
}
// ********** End ScriptStruct FInsimulDialogueContext *********************************************

// ********** Begin ScriptStruct FInsimulExportedCharacter *****************************************
struct Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulExportedCharacter); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulExportedCharacter); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Exported character data. Matches the export system's FInsimulCharacterData.\n */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Exported character data. Matches the export system's FInsimulCharacterData." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterId_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_FirstName_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LastName_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Gender_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Occupation_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_BirthYear_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bIsAlive_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Openness_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "// Big Five personality traits (0.0 to 1.0)\n" },
#endif
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Big Five personality traits (0.0 to 1.0)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Conscientiousness_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Extroversion_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Agreeableness_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Neuroticism_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulExportedCharacter constinit property declarations *********
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterId;
	static const UECodeGen_Private::FStrPropertyParams NewProp_FirstName;
	static const UECodeGen_Private::FStrPropertyParams NewProp_LastName;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Gender;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Occupation;
	static const UECodeGen_Private::FIntPropertyParams NewProp_BirthYear;
	static void NewProp_bIsAlive_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bIsAlive;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_Openness;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_Conscientiousness;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_Extroversion;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_Agreeableness;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_Neuroticism;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulExportedCharacter constinit property declarations ***********
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulExportedCharacter>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter;
class UScriptStruct* FInsimulExportedCharacter::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulExportedCharacter, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulExportedCharacter"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulExportedCharacter Property Definitions ********************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_CharacterId = { "CharacterId", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, CharacterId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterId_MetaData), NewProp_CharacterId_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_FirstName = { "FirstName", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, FirstName), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_FirstName_MetaData), NewProp_FirstName_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_LastName = { "LastName", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, LastName), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LastName_MetaData), NewProp_LastName_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Gender = { "Gender", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, Gender), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Gender_MetaData), NewProp_Gender_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Occupation = { "Occupation", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, Occupation), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Occupation_MetaData), NewProp_Occupation_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_BirthYear = { "BirthYear", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, BirthYear), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_BirthYear_MetaData), NewProp_BirthYear_MetaData) };
void Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_bIsAlive_SetBit(void* Obj)
{
	((FInsimulExportedCharacter*)Obj)->bIsAlive = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_bIsAlive = { "bIsAlive", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(FInsimulExportedCharacter), &Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_bIsAlive_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bIsAlive_MetaData), NewProp_bIsAlive_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Openness = { "Openness", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, Openness), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Openness_MetaData), NewProp_Openness_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Conscientiousness = { "Conscientiousness", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, Conscientiousness), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Conscientiousness_MetaData), NewProp_Conscientiousness_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Extroversion = { "Extroversion", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, Extroversion), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Extroversion_MetaData), NewProp_Extroversion_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Agreeableness = { "Agreeableness", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, Agreeableness), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Agreeableness_MetaData), NewProp_Agreeableness_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Neuroticism = { "Neuroticism", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedCharacter, Neuroticism), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Neuroticism_MetaData), NewProp_Neuroticism_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_CharacterId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_FirstName,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_LastName,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Gender,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Occupation,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_BirthYear,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_bIsAlive,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Openness,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Conscientiousness,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Extroversion,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Agreeableness,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewProp_Neuroticism,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulExportedCharacter Property Definitions **********************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulExportedCharacter",
	Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::PropPointers),
	sizeof(FInsimulExportedCharacter),
	alignof(FInsimulExportedCharacter),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulExportedCharacter()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter.InnerSingleton, Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter.InnerSingleton);
}
// ********** End ScriptStruct FInsimulExportedCharacter *******************************************

// ********** Begin ScriptStruct FInsimulExportedWorld *********************************************
struct Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulExportedWorld); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulExportedWorld); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Complete exported world data \xe2\x80\x94 loaded from the Insimul export JSON.\n * Contains character data and pre-built dialogue contexts for offline mode.\n */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Complete exported world data \xe2\x80\x94 loaded from the Insimul export JSON.\nContains character data and pre-built dialogue contexts for offline mode." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldName_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldId_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Characters_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DialogueContexts_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulWorldExport.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulExportedWorld constinit property declarations *************
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldName;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldId;
	static const UECodeGen_Private::FStructPropertyParams NewProp_Characters_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_Characters;
	static const UECodeGen_Private::FStructPropertyParams NewProp_DialogueContexts_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_DialogueContexts;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulExportedWorld constinit property declarations ***************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulExportedWorld>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulExportedWorld;
class UScriptStruct* FInsimulExportedWorld::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulExportedWorld.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulExportedWorld.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulExportedWorld, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulExportedWorld"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulExportedWorld.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulExportedWorld Property Definitions ************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_WorldName = { "WorldName", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedWorld, WorldName), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldName_MetaData), NewProp_WorldName_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_WorldId = { "WorldId", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedWorld, WorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldId_MetaData), NewProp_WorldId_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_Characters_Inner = { "Characters", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulExportedCharacter, METADATA_PARAMS(0, nullptr) }; // 1254852946
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_Characters = { "Characters", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedWorld, Characters), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Characters_MetaData), NewProp_Characters_MetaData) }; // 1254852946
const UECodeGen_Private::FStructPropertyParams Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_DialogueContexts_Inner = { "DialogueContexts", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulDialogueContext, METADATA_PARAMS(0, nullptr) }; // 963487741
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_DialogueContexts = { "DialogueContexts", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulExportedWorld, DialogueContexts), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DialogueContexts_MetaData), NewProp_DialogueContexts_MetaData) }; // 963487741
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_WorldName,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_WorldId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_Characters_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_Characters,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_DialogueContexts_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewProp_DialogueContexts,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulExportedWorld Property Definitions **************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulExportedWorld",
	Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::PropPointers),
	sizeof(FInsimulExportedWorld),
	alignof(FInsimulExportedWorld),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulExportedWorld()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulExportedWorld.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulExportedWorld.InnerSingleton, Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulExportedWorld.InnerSingleton);
}
// ********** End ScriptStruct FInsimulExportedWorld ***********************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulWorldExport_h__Script_InsimulRuntime_Statics
{
	static constexpr FStructRegisterCompiledInInfo ScriptStructInfo[] = {
		{ FInsimulDialogueTruth::StaticStruct, Z_Construct_UScriptStruct_FInsimulDialogueTruth_Statics::NewStructOps, TEXT("InsimulDialogueTruth"),&Z_Registration_Info_UScriptStruct_FInsimulDialogueTruth, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulDialogueTruth), 1461654990U) },
		{ FInsimulDialogueContext::StaticStruct, Z_Construct_UScriptStruct_FInsimulDialogueContext_Statics::NewStructOps, TEXT("InsimulDialogueContext"),&Z_Registration_Info_UScriptStruct_FInsimulDialogueContext, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulDialogueContext), 963487741U) },
		{ FInsimulExportedCharacter::StaticStruct, Z_Construct_UScriptStruct_FInsimulExportedCharacter_Statics::NewStructOps, TEXT("InsimulExportedCharacter"),&Z_Registration_Info_UScriptStruct_FInsimulExportedCharacter, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulExportedCharacter), 1254852946U) },
		{ FInsimulExportedWorld::StaticStruct, Z_Construct_UScriptStruct_FInsimulExportedWorld_Statics::NewStructOps, TEXT("InsimulExportedWorld"),&Z_Registration_Info_UScriptStruct_FInsimulExportedWorld, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulExportedWorld), 608784012U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulWorldExport_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulWorldExport_h__Script_InsimulRuntime_3076812658{
	TEXT("/Script/InsimulRuntime"),
	nullptr, 0,
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulWorldExport_h__Script_InsimulRuntime_Statics::ScriptStructInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulWorldExport_h__Script_InsimulRuntime_Statics::ScriptStructInfo),
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
