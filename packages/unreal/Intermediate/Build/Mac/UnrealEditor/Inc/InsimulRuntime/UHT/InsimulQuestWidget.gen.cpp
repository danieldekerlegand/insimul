// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulQuestWidget.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulQuestWidget() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UScriptStruct* Z_Construct_UScriptStruct_FLinearColor();
ENGINE_API UClass* Z_Construct_UClass_UBlueprintFunctionLibrary();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestBlueprintLibrary();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestBlueprintLibrary_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestWidget();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestWidget_NoRegister();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulQuest();
UMG_API UClass* Z_Construct_UClass_UUserWidget();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin ScriptStruct FInsimulQuest *****************************************************
struct Z_Construct_UScriptStruct_FInsimulQuest_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulQuest); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulQuest); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Structure representing an Insimul quest\n */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Structure representing an Insimul quest" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Id_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Title_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Description_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_QuestType_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Difficulty_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Status_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_TargetLanguage_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_AssignedBy_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ExperienceReward_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_AssignedAt_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CompletedAt_MetaData[] = {
		{ "Category", "Quest" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulQuest constinit property declarations *********************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Id;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Title;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Description;
	static const UECodeGen_Private::FStrPropertyParams NewProp_QuestType;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Difficulty;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Status;
	static const UECodeGen_Private::FStrPropertyParams NewProp_TargetLanguage;
	static const UECodeGen_Private::FStrPropertyParams NewProp_AssignedBy;
	static const UECodeGen_Private::FIntPropertyParams NewProp_ExperienceReward;
	static const UECodeGen_Private::FStrPropertyParams NewProp_AssignedAt;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CompletedAt;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulQuest constinit property declarations ***********************
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulQuest>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulQuest_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulQuest;
class UScriptStruct* FInsimulQuest::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulQuest.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulQuest.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulQuest, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulQuest"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulQuest.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulQuest Property Definitions ********************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Id = { "Id", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, Id), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Id_MetaData), NewProp_Id_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Title = { "Title", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, Title), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Title_MetaData), NewProp_Title_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Description = { "Description", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, Description), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Description_MetaData), NewProp_Description_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_QuestType = { "QuestType", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, QuestType), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_QuestType_MetaData), NewProp_QuestType_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Difficulty = { "Difficulty", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, Difficulty), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Difficulty_MetaData), NewProp_Difficulty_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Status = { "Status", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, Status), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Status_MetaData), NewProp_Status_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_TargetLanguage = { "TargetLanguage", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, TargetLanguage), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_TargetLanguage_MetaData), NewProp_TargetLanguage_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_AssignedBy = { "AssignedBy", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, AssignedBy), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_AssignedBy_MetaData), NewProp_AssignedBy_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_ExperienceReward = { "ExperienceReward", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, ExperienceReward), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ExperienceReward_MetaData), NewProp_ExperienceReward_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_AssignedAt = { "AssignedAt", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, AssignedAt), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_AssignedAt_MetaData), NewProp_AssignedAt_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_CompletedAt = { "CompletedAt", nullptr, (EPropertyFlags)0x0010000000000014, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulQuest, CompletedAt), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CompletedAt_MetaData), NewProp_CompletedAt_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulQuest_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Id,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Title,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Description,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_QuestType,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Difficulty,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_Status,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_TargetLanguage,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_AssignedBy,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_ExperienceReward,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_AssignedAt,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewProp_CompletedAt,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulQuest_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulQuest Property Definitions **********************************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulQuest_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulQuest",
	Z_Construct_UScriptStruct_FInsimulQuest_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulQuest_Statics::PropPointers),
	sizeof(FInsimulQuest),
	alignof(FInsimulQuest),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulQuest_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulQuest_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulQuest()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulQuest.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulQuest.InnerSingleton, Z_Construct_UScriptStruct_FInsimulQuest_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulQuest.InnerSingleton);
}
// ********** End ScriptStruct FInsimulQuest *******************************************************

// ********** Begin Class UInsimulQuestWidget Function GetActiveQuests *****************************
struct Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics
{
	struct InsimulQuestWidget_eventGetActiveQuests_Parms
	{
		TArray<FInsimulQuest> ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get active quests only\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get active quests only" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetActiveQuests constinit property declarations ***********************
	static const UECodeGen_Private::FStructPropertyParams NewProp_ReturnValue_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetActiveQuests constinit property declarations *************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetActiveQuests Property Definitions **********************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::NewProp_ReturnValue_Inner = { "ReturnValue", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulQuest, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventGetActiveQuests_Parms, ReturnValue), EArrayPropertyFlags::None, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::NewProp_ReturnValue_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::PropPointers) < 2048);
// ********** End Function GetActiveQuests Property Definitions ************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "GetActiveQuests", 	Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::InsimulQuestWidget_eventGetActiveQuests_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::InsimulQuestWidget_eventGetActiveQuests_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestWidget::execGetActiveQuests)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(TArray<FInsimulQuest>*)Z_Param__Result=P_THIS->GetActiveQuests();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestWidget Function GetActiveQuests *******************************

// ********** Begin Class UInsimulQuestWidget Function GetCompletedQuests **************************
struct Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics
{
	struct InsimulQuestWidget_eventGetCompletedQuests_Parms
	{
		TArray<FInsimulQuest> ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get completed quests only\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get completed quests only" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetCompletedQuests constinit property declarations ********************
	static const UECodeGen_Private::FStructPropertyParams NewProp_ReturnValue_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetCompletedQuests constinit property declarations **********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetCompletedQuests Property Definitions *******************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::NewProp_ReturnValue_Inner = { "ReturnValue", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulQuest, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventGetCompletedQuests_Parms, ReturnValue), EArrayPropertyFlags::None, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::NewProp_ReturnValue_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::PropPointers) < 2048);
// ********** End Function GetCompletedQuests Property Definitions *********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "GetCompletedQuests", 	Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::InsimulQuestWidget_eventGetCompletedQuests_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::InsimulQuestWidget_eventGetCompletedQuests_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestWidget::execGetCompletedQuests)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(TArray<FInsimulQuest>*)Z_Param__Result=P_THIS->GetCompletedQuests();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestWidget Function GetCompletedQuests ****************************

// ********** Begin Class UInsimulQuestWidget Function GetQuests ***********************************
struct Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics
{
	struct InsimulQuestWidget_eventGetQuests_Parms
	{
		TArray<FInsimulQuest> ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get all loaded quests\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get all loaded quests" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetQuests constinit property declarations *****************************
	static const UECodeGen_Private::FStructPropertyParams NewProp_ReturnValue_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetQuests constinit property declarations *******************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetQuests Property Definitions ****************************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::NewProp_ReturnValue_Inner = { "ReturnValue", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulQuest, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventGetQuests_Parms, ReturnValue), EArrayPropertyFlags::None, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::NewProp_ReturnValue_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::PropPointers) < 2048);
// ********** End Function GetQuests Property Definitions ******************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "GetQuests", 	Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::InsimulQuestWidget_eventGetQuests_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::InsimulQuestWidget_eventGetQuests_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_GetQuests()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_GetQuests_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestWidget::execGetQuests)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(TArray<FInsimulQuest>*)Z_Param__Result=P_THIS->GetQuests();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestWidget Function GetQuests *************************************

// ********** Begin Class UInsimulQuestWidget Function LoadQuestsForCharacter **********************
struct Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics
{
	struct InsimulQuestWidget_eventLoadQuestsForCharacter_Parms
	{
		FString CharacterId;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Load quests for a specific player character\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Load quests for a specific player character" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterId_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function LoadQuestsForCharacter constinit property declarations ****************
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function LoadQuestsForCharacter constinit property declarations ******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function LoadQuestsForCharacter Property Definitions ***************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::NewProp_CharacterId = { "CharacterId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventLoadQuestsForCharacter_Parms, CharacterId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterId_MetaData), NewProp_CharacterId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::NewProp_CharacterId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::PropPointers) < 2048);
// ********** End Function LoadQuestsForCharacter Property Definitions *****************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "LoadQuestsForCharacter", 	Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::InsimulQuestWidget_eventLoadQuestsForCharacter_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::InsimulQuestWidget_eventLoadQuestsForCharacter_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestWidget::execLoadQuestsForCharacter)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_CharacterId);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->LoadQuestsForCharacter(Z_Param_CharacterId);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestWidget Function LoadQuestsForCharacter ************************

// ********** Begin Class UInsimulQuestWidget Function LoadQuestsForPlayer *************************
struct Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics
{
	struct InsimulQuestWidget_eventLoadQuestsForPlayer_Parms
	{
		FString PlayerName;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Load quests for a player by name\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Load quests for a player by name" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_PlayerName_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function LoadQuestsForPlayer constinit property declarations *******************
	static const UECodeGen_Private::FStrPropertyParams NewProp_PlayerName;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function LoadQuestsForPlayer constinit property declarations *********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function LoadQuestsForPlayer Property Definitions ******************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::NewProp_PlayerName = { "PlayerName", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventLoadQuestsForPlayer_Parms, PlayerName), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_PlayerName_MetaData), NewProp_PlayerName_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::NewProp_PlayerName,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::PropPointers) < 2048);
// ********** End Function LoadQuestsForPlayer Property Definitions ********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "LoadQuestsForPlayer", 	Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::InsimulQuestWidget_eventLoadQuestsForPlayer_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::InsimulQuestWidget_eventLoadQuestsForPlayer_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestWidget::execLoadQuestsForPlayer)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_PlayerName);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->LoadQuestsForPlayer(Z_Param_PlayerName);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestWidget Function LoadQuestsForPlayer ***************************

// ********** Begin Class UInsimulQuestWidget Function OnQuestLoadFailed ***************************
struct InsimulQuestWidget_eventOnQuestLoadFailed_Parms
{
	FString ErrorMessage;
};
static FName NAME_UInsimulQuestWidget_OnQuestLoadFailed = FName(TEXT("OnQuestLoadFailed"));
void UInsimulQuestWidget::OnQuestLoadFailed(const FString& ErrorMessage)
{
	InsimulQuestWidget_eventOnQuestLoadFailed_Parms Parms;
	Parms.ErrorMessage=ErrorMessage;
	UFunction* Func = FindFunctionChecked(NAME_UInsimulQuestWidget_OnQuestLoadFailed);
	ProcessEvent(Func,&Parms);
}
struct Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Called when quest loading fails\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called when quest loading fails" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ErrorMessage_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnQuestLoadFailed constinit property declarations *********************
	static const UECodeGen_Private::FStrPropertyParams NewProp_ErrorMessage;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnQuestLoadFailed constinit property declarations ***********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnQuestLoadFailed Property Definitions ********************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::NewProp_ErrorMessage = { "ErrorMessage", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventOnQuestLoadFailed_Parms, ErrorMessage), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ErrorMessage_MetaData), NewProp_ErrorMessage_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::NewProp_ErrorMessage,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::PropPointers) < 2048);
// ********** End Function OnQuestLoadFailed Property Definitions **********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "OnQuestLoadFailed", 	Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::PropPointers), 
sizeof(InsimulQuestWidget_eventOnQuestLoadFailed_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x08020800, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(InsimulQuestWidget_eventOnQuestLoadFailed_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed_Statics::FuncParams);
	}
	return ReturnFunction;
}
// ********** End Class UInsimulQuestWidget Function OnQuestLoadFailed *****************************

// ********** Begin Class UInsimulQuestWidget Function OnQuestsLoaded ******************************
struct InsimulQuestWidget_eventOnQuestsLoaded_Parms
{
	TArray<FInsimulQuest> Quests;
};
static FName NAME_UInsimulQuestWidget_OnQuestsLoaded = FName(TEXT("OnQuestsLoaded"));
void UInsimulQuestWidget::OnQuestsLoaded(TArray<FInsimulQuest> const& Quests)
{
	InsimulQuestWidget_eventOnQuestsLoaded_Parms Parms;
	Parms.Quests=Quests;
	UFunction* Func = FindFunctionChecked(NAME_UInsimulQuestWidget_OnQuestsLoaded);
	ProcessEvent(Func,&Parms);
}
struct Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Called when quests are loaded successfully\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called when quests are loaded successfully" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Quests_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnQuestsLoaded constinit property declarations ************************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Quests_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_Quests;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnQuestsLoaded constinit property declarations **************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnQuestsLoaded Property Definitions ***********************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::NewProp_Quests_Inner = { "Quests", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulQuest, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::NewProp_Quests = { "Quests", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventOnQuestsLoaded_Parms, Quests), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Quests_MetaData), NewProp_Quests_MetaData) }; // 2796004158
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::NewProp_Quests_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::NewProp_Quests,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::PropPointers) < 2048);
// ********** End Function OnQuestsLoaded Property Definitions *************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "OnQuestsLoaded", 	Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::PropPointers), 
sizeof(InsimulQuestWidget_eventOnQuestsLoaded_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x08420800, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(InsimulQuestWidget_eventOnQuestsLoaded_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded_Statics::FuncParams);
	}
	return ReturnFunction;
}
// ********** End Class UInsimulQuestWidget Function OnQuestsLoaded ********************************

// ********** Begin Class UInsimulQuestWidget Function OnQuestUpdated ******************************
struct InsimulQuestWidget_eventOnQuestUpdated_Parms
{
	FInsimulQuest Quest;
};
static FName NAME_UInsimulQuestWidget_OnQuestUpdated = FName(TEXT("OnQuestUpdated"));
void UInsimulQuestWidget::OnQuestUpdated(FInsimulQuest const& Quest)
{
	InsimulQuestWidget_eventOnQuestUpdated_Parms Parms;
	Parms.Quest=Quest;
	UFunction* Func = FindFunctionChecked(NAME_UInsimulQuestWidget_OnQuestUpdated);
	ProcessEvent(Func,&Parms);
}
struct Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Called when a quest is updated\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called when a quest is updated" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Quest_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnQuestUpdated constinit property declarations ************************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Quest;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnQuestUpdated constinit property declarations **************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnQuestUpdated Property Definitions ***********************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::NewProp_Quest = { "Quest", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventOnQuestUpdated_Parms, Quest), Z_Construct_UScriptStruct_FInsimulQuest, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Quest_MetaData), NewProp_Quest_MetaData) }; // 2796004158
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::NewProp_Quest,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::PropPointers) < 2048);
// ********** End Function OnQuestUpdated Property Definitions *************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "OnQuestUpdated", 	Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::PropPointers), 
sizeof(InsimulQuestWidget_eventOnQuestUpdated_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x08420800, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(InsimulQuestWidget_eventOnQuestUpdated_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated_Statics::FuncParams);
	}
	return ReturnFunction;
}
// ********** End Class UInsimulQuestWidget Function OnQuestUpdated ********************************

// ********** Begin Class UInsimulQuestWidget Function RefreshQuests *******************************
struct Z_Construct_UFunction_UInsimulQuestWidget_RefreshQuests_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Refresh the quest list\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Refresh the quest list" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function RefreshQuests constinit property declarations *************************
// ********** End Function RefreshQuests constinit property declarations ***************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_RefreshQuests_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "RefreshQuests", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_RefreshQuests_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_RefreshQuests_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_RefreshQuests()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_RefreshQuests_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestWidget::execRefreshQuests)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->RefreshQuests();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestWidget Function RefreshQuests *********************************

// ********** Begin Class UInsimulQuestWidget Function SetServerURL ********************************
struct Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics
{
	struct InsimulQuestWidget_eventSetServerURL_Parms
	{
		FString URL;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Set the Insimul server URL\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Set the Insimul server URL" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_URL_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function SetServerURL constinit property declarations **************************
	static const UECodeGen_Private::FStrPropertyParams NewProp_URL;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SetServerURL constinit property declarations ****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SetServerURL Property Definitions *************************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::NewProp_URL = { "URL", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestWidget_eventSetServerURL_Parms, URL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_URL_MetaData), NewProp_URL_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::NewProp_URL,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::PropPointers) < 2048);
// ********** End Function SetServerURL Property Definitions ***************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestWidget, nullptr, "SetServerURL", 	Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::InsimulQuestWidget_eventSetServerURL_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::InsimulQuestWidget_eventSetServerURL_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestWidget::execSetServerURL)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_URL);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SetServerURL(Z_Param_URL);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestWidget Function SetServerURL **********************************

// ********** Begin Class UInsimulQuestWidget ******************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulQuestWidget;
UClass* UInsimulQuestWidget::GetPrivateStaticClass()
{
	using TClass = UInsimulQuestWidget;
	if (!Z_Registration_Info_UClass_UInsimulQuestWidget.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulQuestWidget"),
			Z_Registration_Info_UClass_UInsimulQuestWidget.InnerSingleton,
			StaticRegisterNativesUInsimulQuestWidget,
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
	return Z_Registration_Info_UClass_UInsimulQuestWidget.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulQuestWidget_NoRegister()
{
	return UInsimulQuestWidget::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulQuestWidget_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Widget for displaying Insimul quest list\n * Similar to the chat box, shows quests and their completion status\n */" },
#endif
		{ "IncludePath", "InsimulQuestWidget.h" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Widget for displaying Insimul quest list\nSimilar to the chat box, shows quests and their completion status" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bAutoRefresh_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Enable auto-refresh\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Enable auto-refresh" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_RefreshInterval_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Auto-refresh interval in seconds\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Auto-refresh interval in seconds" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_LoadedQuests_MetaData[] = {
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulQuestWidget constinit property declarations **********************
	static void NewProp_bAutoRefresh_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bAutoRefresh;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_RefreshInterval;
	static const UECodeGen_Private::FStructPropertyParams NewProp_LoadedQuests_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_LoadedQuests;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulQuestWidget constinit property declarations ************************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("GetActiveQuests"), .Pointer = &UInsimulQuestWidget::execGetActiveQuests },
		{ .NameUTF8 = UTF8TEXT("GetCompletedQuests"), .Pointer = &UInsimulQuestWidget::execGetCompletedQuests },
		{ .NameUTF8 = UTF8TEXT("GetQuests"), .Pointer = &UInsimulQuestWidget::execGetQuests },
		{ .NameUTF8 = UTF8TEXT("LoadQuestsForCharacter"), .Pointer = &UInsimulQuestWidget::execLoadQuestsForCharacter },
		{ .NameUTF8 = UTF8TEXT("LoadQuestsForPlayer"), .Pointer = &UInsimulQuestWidget::execLoadQuestsForPlayer },
		{ .NameUTF8 = UTF8TEXT("RefreshQuests"), .Pointer = &UInsimulQuestWidget::execRefreshQuests },
		{ .NameUTF8 = UTF8TEXT("SetServerURL"), .Pointer = &UInsimulQuestWidget::execSetServerURL },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulQuestWidget_GetActiveQuests, "GetActiveQuests" }, // 1087347517
		{ &Z_Construct_UFunction_UInsimulQuestWidget_GetCompletedQuests, "GetCompletedQuests" }, // 3671580811
		{ &Z_Construct_UFunction_UInsimulQuestWidget_GetQuests, "GetQuests" }, // 1340621582
		{ &Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForCharacter, "LoadQuestsForCharacter" }, // 2048935898
		{ &Z_Construct_UFunction_UInsimulQuestWidget_LoadQuestsForPlayer, "LoadQuestsForPlayer" }, // 2096751318
		{ &Z_Construct_UFunction_UInsimulQuestWidget_OnQuestLoadFailed, "OnQuestLoadFailed" }, // 563439327
		{ &Z_Construct_UFunction_UInsimulQuestWidget_OnQuestsLoaded, "OnQuestsLoaded" }, // 1557069914
		{ &Z_Construct_UFunction_UInsimulQuestWidget_OnQuestUpdated, "OnQuestUpdated" }, // 2439152473
		{ &Z_Construct_UFunction_UInsimulQuestWidget_RefreshQuests, "RefreshQuests" }, // 1121060578
		{ &Z_Construct_UFunction_UInsimulQuestWidget_SetServerURL, "SetServerURL" }, // 1536521245
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulQuestWidget>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulQuestWidget_Statics

// ********** Begin Class UInsimulQuestWidget Property Definitions *********************************
void Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_bAutoRefresh_SetBit(void* Obj)
{
	((UInsimulQuestWidget*)Obj)->bAutoRefresh = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_bAutoRefresh = { "bAutoRefresh", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulQuestWidget), &Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_bAutoRefresh_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bAutoRefresh_MetaData), NewProp_bAutoRefresh_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_RefreshInterval = { "RefreshInterval", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestWidget, RefreshInterval), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_RefreshInterval_MetaData), NewProp_RefreshInterval_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_LoadedQuests_Inner = { "LoadedQuests", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulQuest, METADATA_PARAMS(0, nullptr) }; // 2796004158
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_LoadedQuests = { "LoadedQuests", nullptr, (EPropertyFlags)0x0040000000000000, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestWidget, LoadedQuests), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_LoadedQuests_MetaData), NewProp_LoadedQuests_MetaData) }; // 2796004158
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulQuestWidget_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_bAutoRefresh,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_RefreshInterval,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_LoadedQuests_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestWidget_Statics::NewProp_LoadedQuests,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestWidget_Statics::PropPointers) < 2048);
// ********** End Class UInsimulQuestWidget Property Definitions ***********************************
UObject* (*const Z_Construct_UClass_UInsimulQuestWidget_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UUserWidget,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestWidget_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulQuestWidget_Statics::ClassParams = {
	&UInsimulQuestWidget::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulQuestWidget_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestWidget_Statics::PropPointers),
	0,
	0x00B010A0u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestWidget_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulQuestWidget_Statics::Class_MetaDataParams)
};
void UInsimulQuestWidget::StaticRegisterNativesUInsimulQuestWidget()
{
	UClass* Class = UInsimulQuestWidget::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulQuestWidget_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulQuestWidget()
{
	if (!Z_Registration_Info_UClass_UInsimulQuestWidget.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulQuestWidget.OuterSingleton, Z_Construct_UClass_UInsimulQuestWidget_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulQuestWidget.OuterSingleton;
}
UInsimulQuestWidget::UInsimulQuestWidget(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer) {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulQuestWidget);
UInsimulQuestWidget::~UInsimulQuestWidget() {}
// ********** End Class UInsimulQuestWidget ********************************************************

// ********** Begin Class UInsimulQuestBlueprintLibrary Function FormatQuestDescription ************
struct Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics
{
	struct InsimulQuestBlueprintLibrary_eventFormatQuestDescription_Parms
	{
		FString Description;
		int32 MaxLength;
		FString ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Format quest description for display (truncate if too long)\n\x09 */" },
#endif
		{ "CPP_Default_MaxLength", "100" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Format quest description for display (truncate if too long)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Description_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function FormatQuestDescription constinit property declarations ****************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Description;
	static const UECodeGen_Private::FIntPropertyParams NewProp_MaxLength;
	static const UECodeGen_Private::FStrPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function FormatQuestDescription constinit property declarations ******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function FormatQuestDescription Property Definitions ***************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::NewProp_Description = { "Description", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventFormatQuestDescription_Parms, Description), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Description_MetaData), NewProp_Description_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::NewProp_MaxLength = { "MaxLength", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventFormatQuestDescription_Parms, MaxLength), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventFormatQuestDescription_Parms, ReturnValue), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::NewProp_Description,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::NewProp_MaxLength,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::PropPointers) < 2048);
// ********** End Function FormatQuestDescription Property Definitions *****************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestBlueprintLibrary, nullptr, "FormatQuestDescription", 	Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::InsimulQuestBlueprintLibrary_eventFormatQuestDescription_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x14022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::InsimulQuestBlueprintLibrary_eventFormatQuestDescription_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestBlueprintLibrary::execFormatQuestDescription)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_Description);
	P_GET_PROPERTY(FIntProperty,Z_Param_MaxLength);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(FString*)Z_Param__Result=UInsimulQuestBlueprintLibrary::FormatQuestDescription(Z_Param_Description,Z_Param_MaxLength);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestBlueprintLibrary Function FormatQuestDescription **************

// ********** Begin Class UInsimulQuestBlueprintLibrary Function GetQuestDifficultyColor ***********
struct Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics
{
	struct InsimulQuestBlueprintLibrary_eventGetQuestDifficultyColor_Parms
	{
		FString Difficulty;
		FLinearColor ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get quest difficulty color for UI\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get quest difficulty color for UI" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Difficulty_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function GetQuestDifficultyColor constinit property declarations ***************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Difficulty;
	static const UECodeGen_Private::FStructPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetQuestDifficultyColor constinit property declarations *****************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetQuestDifficultyColor Property Definitions **************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::NewProp_Difficulty = { "Difficulty", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventGetQuestDifficultyColor_Parms, Difficulty), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Difficulty_MetaData), NewProp_Difficulty_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventGetQuestDifficultyColor_Parms, ReturnValue), Z_Construct_UScriptStruct_FLinearColor, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::NewProp_Difficulty,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::PropPointers) < 2048);
// ********** End Function GetQuestDifficultyColor Property Definitions ****************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestBlueprintLibrary, nullptr, "GetQuestDifficultyColor", 	Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::InsimulQuestBlueprintLibrary_eventGetQuestDifficultyColor_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x14822401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::InsimulQuestBlueprintLibrary_eventGetQuestDifficultyColor_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestBlueprintLibrary::execGetQuestDifficultyColor)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_Difficulty);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(FLinearColor*)Z_Param__Result=UInsimulQuestBlueprintLibrary::GetQuestDifficultyColor(Z_Param_Difficulty);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestBlueprintLibrary Function GetQuestDifficultyColor *************

// ********** Begin Class UInsimulQuestBlueprintLibrary Function GetQuestStatusColor ***************
struct Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics
{
	struct InsimulQuestBlueprintLibrary_eventGetQuestStatusColor_Parms
	{
		FString Status;
		FLinearColor ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get quest status color for UI\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get quest status color for UI" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Status_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function GetQuestStatusColor constinit property declarations *******************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Status;
	static const UECodeGen_Private::FStructPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetQuestStatusColor constinit property declarations *********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetQuestStatusColor Property Definitions ******************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::NewProp_Status = { "Status", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventGetQuestStatusColor_Parms, Status), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Status_MetaData), NewProp_Status_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventGetQuestStatusColor_Parms, ReturnValue), Z_Construct_UScriptStruct_FLinearColor, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::NewProp_Status,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::PropPointers) < 2048);
// ********** End Function GetQuestStatusColor Property Definitions ********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestBlueprintLibrary, nullptr, "GetQuestStatusColor", 	Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::InsimulQuestBlueprintLibrary_eventGetQuestStatusColor_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x14822401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::InsimulQuestBlueprintLibrary_eventGetQuestStatusColor_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestBlueprintLibrary::execGetQuestStatusColor)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_Status);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(FLinearColor*)Z_Param__Result=UInsimulQuestBlueprintLibrary::GetQuestStatusColor(Z_Param_Status);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestBlueprintLibrary Function GetQuestStatusColor *****************

// ********** Begin Class UInsimulQuestBlueprintLibrary Function GetQuestTypeIcon ******************
struct Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics
{
	struct InsimulQuestBlueprintLibrary_eventGetQuestTypeIcon_Parms
	{
		FString QuestType;
		FString ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get quest type icon name\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get quest type icon name" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_QuestType_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function GetQuestTypeIcon constinit property declarations **********************
	static const UECodeGen_Private::FStrPropertyParams NewProp_QuestType;
	static const UECodeGen_Private::FStrPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetQuestTypeIcon constinit property declarations ************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetQuestTypeIcon Property Definitions *********************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::NewProp_QuestType = { "QuestType", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventGetQuestTypeIcon_Parms, QuestType), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_QuestType_MetaData), NewProp_QuestType_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestBlueprintLibrary_eventGetQuestTypeIcon_Parms, ReturnValue), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::NewProp_QuestType,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::PropPointers) < 2048);
// ********** End Function GetQuestTypeIcon Property Definitions ***********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestBlueprintLibrary, nullptr, "GetQuestTypeIcon", 	Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::InsimulQuestBlueprintLibrary_eventGetQuestTypeIcon_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x14022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::InsimulQuestBlueprintLibrary_eventGetQuestTypeIcon_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestBlueprintLibrary::execGetQuestTypeIcon)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_QuestType);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(FString*)Z_Param__Result=UInsimulQuestBlueprintLibrary::GetQuestTypeIcon(Z_Param_QuestType);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestBlueprintLibrary Function GetQuestTypeIcon ********************

// ********** Begin Class UInsimulQuestBlueprintLibrary ********************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary;
UClass* UInsimulQuestBlueprintLibrary::GetPrivateStaticClass()
{
	using TClass = UInsimulQuestBlueprintLibrary;
	if (!Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulQuestBlueprintLibrary"),
			Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary.InnerSingleton,
			StaticRegisterNativesUInsimulQuestBlueprintLibrary,
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
	return Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulQuestBlueprintLibrary_NoRegister()
{
	return UInsimulQuestBlueprintLibrary::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Blueprint function library for quest utilities\n */" },
#endif
		{ "IncludePath", "InsimulQuestWidget.h" },
		{ "ModuleRelativePath", "Public/InsimulQuestWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Blueprint function library for quest utilities" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulQuestBlueprintLibrary constinit property declarations ************
// ********** End Class UInsimulQuestBlueprintLibrary constinit property declarations **************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("FormatQuestDescription"), .Pointer = &UInsimulQuestBlueprintLibrary::execFormatQuestDescription },
		{ .NameUTF8 = UTF8TEXT("GetQuestDifficultyColor"), .Pointer = &UInsimulQuestBlueprintLibrary::execGetQuestDifficultyColor },
		{ .NameUTF8 = UTF8TEXT("GetQuestStatusColor"), .Pointer = &UInsimulQuestBlueprintLibrary::execGetQuestStatusColor },
		{ .NameUTF8 = UTF8TEXT("GetQuestTypeIcon"), .Pointer = &UInsimulQuestBlueprintLibrary::execGetQuestTypeIcon },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_FormatQuestDescription, "FormatQuestDescription" }, // 1519078928
		{ &Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestDifficultyColor, "GetQuestDifficultyColor" }, // 359346757
		{ &Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestStatusColor, "GetQuestStatusColor" }, // 3688161703
		{ &Z_Construct_UFunction_UInsimulQuestBlueprintLibrary_GetQuestTypeIcon, "GetQuestTypeIcon" }, // 2149913509
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulQuestBlueprintLibrary>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics
UObject* (*const Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UBlueprintFunctionLibrary,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics::ClassParams = {
	&UInsimulQuestBlueprintLibrary::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	nullptr,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	0,
	0,
	0x001000A0u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics::Class_MetaDataParams)
};
void UInsimulQuestBlueprintLibrary::StaticRegisterNativesUInsimulQuestBlueprintLibrary()
{
	UClass* Class = UInsimulQuestBlueprintLibrary::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulQuestBlueprintLibrary()
{
	if (!Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary.OuterSingleton, Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary.OuterSingleton;
}
UInsimulQuestBlueprintLibrary::UInsimulQuestBlueprintLibrary(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer) {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulQuestBlueprintLibrary);
UInsimulQuestBlueprintLibrary::~UInsimulQuestBlueprintLibrary() {}
// ********** End Class UInsimulQuestBlueprintLibrary **********************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h__Script_InsimulRuntime_Statics
{
	static constexpr FStructRegisterCompiledInInfo ScriptStructInfo[] = {
		{ FInsimulQuest::StaticStruct, Z_Construct_UScriptStruct_FInsimulQuest_Statics::NewStructOps, TEXT("InsimulQuest"),&Z_Registration_Info_UScriptStruct_FInsimulQuest, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulQuest), 2796004158U) },
	};
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulQuestWidget, UInsimulQuestWidget::StaticClass, TEXT("UInsimulQuestWidget"), &Z_Registration_Info_UClass_UInsimulQuestWidget, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulQuestWidget), 4167202649U) },
		{ Z_Construct_UClass_UInsimulQuestBlueprintLibrary, UInsimulQuestBlueprintLibrary::StaticClass, TEXT("UInsimulQuestBlueprintLibrary"), &Z_Registration_Info_UClass_UInsimulQuestBlueprintLibrary, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulQuestBlueprintLibrary), 1926445615U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h__Script_InsimulRuntime_1250463774{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h__Script_InsimulRuntime_Statics::ClassInfo),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h__Script_InsimulRuntime_Statics::ScriptStructInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h__Script_InsimulRuntime_Statics::ScriptStructInfo),
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
