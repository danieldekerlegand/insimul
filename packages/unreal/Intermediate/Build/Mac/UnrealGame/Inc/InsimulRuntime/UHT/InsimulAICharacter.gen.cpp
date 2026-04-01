// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulAICharacter.h"
#include "Engine/HitResult.h"
#include "InsimulConversationComponent.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulAICharacter() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UClass* Z_Construct_UClass_UClass_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_AActor_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_ACharacter();
ENGINE_API UClass* Z_Construct_UClass_APawn_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_UAudioComponent_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_UPrimitiveComponent_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_USphereComponent_NoRegister();
ENGINE_API UScriptStruct* Z_Construct_UScriptStruct_FHitResult();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulAICharacter();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulAICharacter_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulConversationComponent_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulDialogueWidget_NoRegister();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulConversation();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulUtterance();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Delegate FOnInsimulNPCInteract *************************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulNPCInteract_Parms
	{
		AInsimulAICharacter* NPC;
		APawn* InteractingPawn;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulNPCInteract constinit property declarations *****************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_NPC;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_InteractingPawn;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulNPCInteract constinit property declarations *******************
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulNPCInteract Property Definitions ****************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::NewProp_NPC = { "NPC", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulNPCInteract_Parms, NPC), Z_Construct_UClass_AInsimulAICharacter_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::NewProp_InteractingPawn = { "InteractingPawn", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulNPCInteract_Parms, InteractingPawn), Z_Construct_UClass_APawn_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::NewProp_NPC,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::NewProp_InteractingPawn,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulNPCInteract Property Definitions ******************************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulNPCInteract__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulNPCInteract_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00130000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulNPCInteract_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulNPCInteract_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulNPCInteract, AInsimulAICharacter* NPC, APawn* InteractingPawn)
{
	struct _Script_InsimulRuntime_eventOnInsimulNPCInteract_Parms
	{
		AInsimulAICharacter* NPC;
		APawn* InteractingPawn;
	};
	_Script_InsimulRuntime_eventOnInsimulNPCInteract_Parms Parms;
	Parms.NPC=NPC;
	Parms.InteractingPawn=InteractingPawn;
	OnInsimulNPCInteract.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulNPCInteract ***************************************************

// ********** Begin Class AInsimulAICharacter Function HandlePlayerInteract ************************
struct Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics
{
	struct InsimulAICharacter_eventHandlePlayerInteract_Parms
	{
		APawn* InteractingPawn;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Call this to manually trigger the interaction (e.g., from your game's interaction system).\n\x09 * Opens the dialogue widget and starts a player-initiated conversation.\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Call this to manually trigger the interaction (e.g., from your game's interaction system).\nOpens the dialogue widget and starts a player-initiated conversation." },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function HandlePlayerInteract constinit property declarations ******************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_InteractingPawn;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function HandlePlayerInteract constinit property declarations ********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function HandlePlayerInteract Property Definitions *****************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::NewProp_InteractingPawn = { "InteractingPawn", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventHandlePlayerInteract_Parms, InteractingPawn), Z_Construct_UClass_APawn_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::NewProp_InteractingPawn,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::PropPointers) < 2048);
// ********** End Function HandlePlayerInteract Property Definitions *******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulAICharacter, nullptr, "HandlePlayerInteract", 	Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::InsimulAICharacter_eventHandlePlayerInteract_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::InsimulAICharacter_eventHandlePlayerInteract_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulAICharacter::execHandlePlayerInteract)
{
	P_GET_OBJECT(APawn,Z_Param_InteractingPawn);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->HandlePlayerInteract(Z_Param_InteractingPawn);
	P_NATIVE_END;
}
// ********** End Class AInsimulAICharacter Function HandlePlayerInteract **************************

// ********** Begin Class AInsimulAICharacter Function OnAudioChunkReceived ************************
struct Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics
{
	struct InsimulAICharacter_eventOnAudioChunkReceived_Parms
	{
		TArray<uint8> AudioData;
		int32 DurationMs;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Handle streaming audio chunk from TTS */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Handle streaming audio chunk from TTS" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_AudioData_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnAudioChunkReceived constinit property declarations ******************
	static const UECodeGen_Private::FBytePropertyParams NewProp_AudioData_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_AudioData;
	static const UECodeGen_Private::FIntPropertyParams NewProp_DurationMs;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnAudioChunkReceived constinit property declarations ********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnAudioChunkReceived Property Definitions *****************************
const UECodeGen_Private::FBytePropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::NewProp_AudioData_Inner = { "AudioData", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::NewProp_AudioData = { "AudioData", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnAudioChunkReceived_Parms, AudioData), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_AudioData_MetaData), NewProp_AudioData_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::NewProp_DurationMs = { "DurationMs", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnAudioChunkReceived_Parms, DurationMs), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::NewProp_AudioData_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::NewProp_AudioData,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::NewProp_DurationMs,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::PropPointers) < 2048);
// ********** End Function OnAudioChunkReceived Property Definitions *******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulAICharacter, nullptr, "OnAudioChunkReceived", 	Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::InsimulAICharacter_eventOnAudioChunkReceived_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00420401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::InsimulAICharacter_eventOnAudioChunkReceived_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulAICharacter::execOnAudioChunkReceived)
{
	P_GET_TARRAY_REF(uint8,Z_Param_Out_AudioData);
	P_GET_PROPERTY(FIntProperty,Z_Param_DurationMs);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->OnAudioChunkReceived(Z_Param_Out_AudioData,Z_Param_DurationMs);
	P_NATIVE_END;
}
// ********** End Class AInsimulAICharacter Function OnAudioChunkReceived **************************

// ********** Begin Class AInsimulAICharacter Function OnConversationEnded *************************
struct Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics
{
	struct InsimulAICharacter_eventOnConversationEnded_Parms
	{
		FInsimulConversation Conversation;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Handle when conversation ends */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Handle when conversation ends" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Conversation_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnConversationEnded constinit property declarations *******************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Conversation;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnConversationEnded constinit property declarations *********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnConversationEnded Property Definitions ******************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::NewProp_Conversation = { "Conversation", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnConversationEnded_Parms, Conversation), Z_Construct_UScriptStruct_FInsimulConversation, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Conversation_MetaData), NewProp_Conversation_MetaData) }; // 3744489045
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::NewProp_Conversation,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::PropPointers) < 2048);
// ********** End Function OnConversationEnded Property Definitions ********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulAICharacter, nullptr, "OnConversationEnded", 	Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::InsimulAICharacter_eventOnConversationEnded_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00420401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::InsimulAICharacter_eventOnConversationEnded_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulAICharacter::execOnConversationEnded)
{
	P_GET_STRUCT_REF(FInsimulConversation,Z_Param_Out_Conversation);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->OnConversationEnded(Z_Param_Out_Conversation);
	P_NATIVE_END;
}
// ********** End Class AInsimulAICharacter Function OnConversationEnded ***************************

// ********** Begin Class AInsimulAICharacter Function OnConversationStarted ***********************
struct Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics
{
	struct InsimulAICharacter_eventOnConversationStarted_Parms
	{
		FInsimulConversation Conversation;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Handle when conversation starts */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Handle when conversation starts" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Conversation_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnConversationStarted constinit property declarations *****************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Conversation;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnConversationStarted constinit property declarations *******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnConversationStarted Property Definitions ****************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::NewProp_Conversation = { "Conversation", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnConversationStarted_Parms, Conversation), Z_Construct_UScriptStruct_FInsimulConversation, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Conversation_MetaData), NewProp_Conversation_MetaData) }; // 3744489045
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::NewProp_Conversation,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::PropPointers) < 2048);
// ********** End Function OnConversationStarted Property Definitions ******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulAICharacter, nullptr, "OnConversationStarted", 	Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::InsimulAICharacter_eventOnConversationStarted_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00420401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::InsimulAICharacter_eventOnConversationStarted_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulAICharacter::execOnConversationStarted)
{
	P_GET_STRUCT_REF(FInsimulConversation,Z_Param_Out_Conversation);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->OnConversationStarted(Z_Param_Out_Conversation);
	P_NATIVE_END;
}
// ********** End Class AInsimulAICharacter Function OnConversationStarted *************************

// ********** Begin Class AInsimulAICharacter Function OnInteractionSphereBeginOverlap *************
struct Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics
{
	struct InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms
	{
		UPrimitiveComponent* OverlappedComponent;
		AActor* OtherActor;
		UPrimitiveComponent* OtherComp;
		int32 OtherBodyIndex;
		bool bFromSweep;
		FHitResult SweepResult;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Overlap handler for the interaction sphere */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Overlap handler for the interaction sphere" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OverlappedComponent_MetaData[] = {
		{ "EditInline", "true" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OtherComp_MetaData[] = {
		{ "EditInline", "true" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SweepResult_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnInteractionSphereBeginOverlap constinit property declarations *******
	static const UECodeGen_Private::FObjectPropertyParams NewProp_OverlappedComponent;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_OtherActor;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_OtherComp;
	static const UECodeGen_Private::FIntPropertyParams NewProp_OtherBodyIndex;
	static void NewProp_bFromSweep_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bFromSweep;
	static const UECodeGen_Private::FStructPropertyParams NewProp_SweepResult;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnInteractionSphereBeginOverlap constinit property declarations *********
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnInteractionSphereBeginOverlap Property Definitions ******************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OverlappedComponent = { "OverlappedComponent", nullptr, (EPropertyFlags)0x0010000000080080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms, OverlappedComponent), Z_Construct_UClass_UPrimitiveComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OverlappedComponent_MetaData), NewProp_OverlappedComponent_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OtherActor = { "OtherActor", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms, OtherActor), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OtherComp = { "OtherComp", nullptr, (EPropertyFlags)0x0010000000080080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms, OtherComp), Z_Construct_UClass_UPrimitiveComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OtherComp_MetaData), NewProp_OtherComp_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OtherBodyIndex = { "OtherBodyIndex", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms, OtherBodyIndex), METADATA_PARAMS(0, nullptr) };
void Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_bFromSweep_SetBit(void* Obj)
{
	((InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms*)Obj)->bFromSweep = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_bFromSweep = { "bFromSweep", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms), &Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_bFromSweep_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_SweepResult = { "SweepResult", nullptr, (EPropertyFlags)0x0010008008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms, SweepResult), Z_Construct_UScriptStruct_FHitResult, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SweepResult_MetaData), NewProp_SweepResult_MetaData) }; // 222120718
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OverlappedComponent,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OtherActor,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OtherComp,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_OtherBodyIndex,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_bFromSweep,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::NewProp_SweepResult,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::PropPointers) < 2048);
// ********** End Function OnInteractionSphereBeginOverlap Property Definitions ********************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulAICharacter, nullptr, "OnInteractionSphereBeginOverlap", 	Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00440401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::InsimulAICharacter_eventOnInteractionSphereBeginOverlap_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulAICharacter::execOnInteractionSphereBeginOverlap)
{
	P_GET_OBJECT(UPrimitiveComponent,Z_Param_OverlappedComponent);
	P_GET_OBJECT(AActor,Z_Param_OtherActor);
	P_GET_OBJECT(UPrimitiveComponent,Z_Param_OtherComp);
	P_GET_PROPERTY(FIntProperty,Z_Param_OtherBodyIndex);
	P_GET_UBOOL(Z_Param_bFromSweep);
	P_GET_STRUCT_REF(FHitResult,Z_Param_Out_SweepResult);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->OnInteractionSphereBeginOverlap(Z_Param_OverlappedComponent,Z_Param_OtherActor,Z_Param_OtherComp,Z_Param_OtherBodyIndex,Z_Param_bFromSweep,Z_Param_Out_SweepResult);
	P_NATIVE_END;
}
// ********** End Class AInsimulAICharacter Function OnInteractionSphereBeginOverlap ***************

// ********** Begin Class AInsimulAICharacter Function OnUtteranceReceived *************************
struct Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics
{
	struct InsimulAICharacter_eventOnUtteranceReceived_Parms
	{
		FInsimulUtterance Utterance;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Handle when an utterance is received */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Handle when an utterance is received" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Utterance_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function OnUtteranceReceived constinit property declarations *******************
	static const UECodeGen_Private::FStructPropertyParams NewProp_Utterance;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function OnUtteranceReceived constinit property declarations *********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function OnUtteranceReceived Property Definitions ******************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::NewProp_Utterance = { "Utterance", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAICharacter_eventOnUtteranceReceived_Parms, Utterance), Z_Construct_UScriptStruct_FInsimulUtterance, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Utterance_MetaData), NewProp_Utterance_MetaData) }; // 3489850768
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::NewProp_Utterance,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::PropPointers) < 2048);
// ********** End Function OnUtteranceReceived Property Definitions ********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulAICharacter, nullptr, "OnUtteranceReceived", 	Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::InsimulAICharacter_eventOnUtteranceReceived_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00420401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::InsimulAICharacter_eventOnUtteranceReceived_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulAICharacter::execOnUtteranceReceived)
{
	P_GET_STRUCT_REF(FInsimulUtterance,Z_Param_Out_Utterance);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->OnUtteranceReceived(Z_Param_Out_Utterance);
	P_NATIVE_END;
}
// ********** End Class AInsimulAICharacter Function OnUtteranceReceived ***************************

// ********** Begin Class AInsimulAICharacter ******************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_AInsimulAICharacter;
UClass* AInsimulAICharacter::GetPrivateStaticClass()
{
	using TClass = AInsimulAICharacter;
	if (!Z_Registration_Info_UClass_AInsimulAICharacter.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulAICharacter"),
			Z_Registration_Info_UClass_AInsimulAICharacter.InnerSingleton,
			StaticRegisterNativesAInsimulAICharacter,
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
	return Z_Registration_Info_UClass_AInsimulAICharacter.InnerSingleton;
}
UClass* Z_Construct_UClass_AInsimulAICharacter_NoRegister()
{
	return AInsimulAICharacter::GetPrivateStaticClass();
}
struct Z_Construct_UClass_AInsimulAICharacter_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "HideCategories", "Navigation" },
		{ "IncludePath", "InsimulAICharacter.h" },
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_InsimulConversationComponent_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** The Insimul conversation component */" },
#endif
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "The Insimul conversation component" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_InteractionSphere_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Sphere trigger for player interaction detection */" },
#endif
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Sphere trigger for player interaction detection" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DialogueWidgetClass_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Widget class to instantiate when the player interacts with this NPC.\n\x09 * Set this to your WBP_InsimulDialogue Blueprint in the NPC's Blueprint class defaults.\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Widget class to instantiate when the player interacts with this NPC.\nSet this to your WBP_InsimulDialogue Blueprint in the NPC's Blueprint class defaults." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OnPlayerInteract_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Fired when a player enters the interaction sphere. Bind to this in your game to open dialogue. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Fired when a player enters the interaction sphere. Bind to this in your game to open dialogue." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SpeechAudioComponent_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Audio component for playing TTS speech */" },
#endif
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Audio component for playing TTS speech" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ActiveDialogueWidget_MetaData[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Currently displayed dialogue widget */" },
#endif
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulAICharacter.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Currently displayed dialogue widget" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class AInsimulAICharacter constinit property declarations **********************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_InsimulConversationComponent;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_InteractionSphere;
	static const UECodeGen_Private::FClassPropertyParams NewProp_DialogueWidgetClass;
	static const UECodeGen_Private::FMulticastDelegatePropertyParams NewProp_OnPlayerInteract;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_SpeechAudioComponent;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_ActiveDialogueWidget;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class AInsimulAICharacter constinit property declarations ************************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("HandlePlayerInteract"), .Pointer = &AInsimulAICharacter::execHandlePlayerInteract },
		{ .NameUTF8 = UTF8TEXT("OnAudioChunkReceived"), .Pointer = &AInsimulAICharacter::execOnAudioChunkReceived },
		{ .NameUTF8 = UTF8TEXT("OnConversationEnded"), .Pointer = &AInsimulAICharacter::execOnConversationEnded },
		{ .NameUTF8 = UTF8TEXT("OnConversationStarted"), .Pointer = &AInsimulAICharacter::execOnConversationStarted },
		{ .NameUTF8 = UTF8TEXT("OnInteractionSphereBeginOverlap"), .Pointer = &AInsimulAICharacter::execOnInteractionSphereBeginOverlap },
		{ .NameUTF8 = UTF8TEXT("OnUtteranceReceived"), .Pointer = &AInsimulAICharacter::execOnUtteranceReceived },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_AInsimulAICharacter_HandlePlayerInteract, "HandlePlayerInteract" }, // 1857245357
		{ &Z_Construct_UFunction_AInsimulAICharacter_OnAudioChunkReceived, "OnAudioChunkReceived" }, // 863392648
		{ &Z_Construct_UFunction_AInsimulAICharacter_OnConversationEnded, "OnConversationEnded" }, // 1483802478
		{ &Z_Construct_UFunction_AInsimulAICharacter_OnConversationStarted, "OnConversationStarted" }, // 2060310986
		{ &Z_Construct_UFunction_AInsimulAICharacter_OnInteractionSphereBeginOverlap, "OnInteractionSphereBeginOverlap" }, // 232343890
		{ &Z_Construct_UFunction_AInsimulAICharacter_OnUtteranceReceived, "OnUtteranceReceived" }, // 2849766967
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<AInsimulAICharacter>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_AInsimulAICharacter_Statics

// ********** Begin Class AInsimulAICharacter Property Definitions *********************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_InsimulConversationComponent = { "InsimulConversationComponent", nullptr, (EPropertyFlags)0x00100000000a001d, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulAICharacter, InsimulConversationComponent), Z_Construct_UClass_UInsimulConversationComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_InsimulConversationComponent_MetaData), NewProp_InsimulConversationComponent_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_InteractionSphere = { "InteractionSphere", nullptr, (EPropertyFlags)0x00100000000a001d, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulAICharacter, InteractionSphere), Z_Construct_UClass_USphereComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_InteractionSphere_MetaData), NewProp_InteractionSphere_MetaData) };
const UECodeGen_Private::FClassPropertyParams Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_DialogueWidgetClass = { "DialogueWidgetClass", nullptr, (EPropertyFlags)0x0014000000010015, UECodeGen_Private::EPropertyGenFlags::Class, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulAICharacter, DialogueWidgetClass), Z_Construct_UClass_UClass_NoRegister, Z_Construct_UClass_UInsimulDialogueWidget_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DialogueWidgetClass_MetaData), NewProp_DialogueWidgetClass_MetaData) };
const UECodeGen_Private::FMulticastDelegatePropertyParams Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_OnPlayerInteract = { "OnPlayerInteract", nullptr, (EPropertyFlags)0x0010000010080000, UECodeGen_Private::EPropertyGenFlags::InlineMulticastDelegate, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulAICharacter, OnPlayerInteract), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OnPlayerInteract_MetaData), NewProp_OnPlayerInteract_MetaData) }; // 740181326
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_SpeechAudioComponent = { "SpeechAudioComponent", nullptr, (EPropertyFlags)0x00400000000a0009, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulAICharacter, SpeechAudioComponent), Z_Construct_UClass_UAudioComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SpeechAudioComponent_MetaData), NewProp_SpeechAudioComponent_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_ActiveDialogueWidget = { "ActiveDialogueWidget", nullptr, (EPropertyFlags)0x0040000000082008, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulAICharacter, ActiveDialogueWidget), Z_Construct_UClass_UInsimulDialogueWidget_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ActiveDialogueWidget_MetaData), NewProp_ActiveDialogueWidget_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_AInsimulAICharacter_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_InsimulConversationComponent,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_InteractionSphere,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_DialogueWidgetClass,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_OnPlayerInteract,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_SpeechAudioComponent,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulAICharacter_Statics::NewProp_ActiveDialogueWidget,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulAICharacter_Statics::PropPointers) < 2048);
// ********** End Class AInsimulAICharacter Property Definitions ***********************************
UObject* (*const Z_Construct_UClass_AInsimulAICharacter_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_ACharacter,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulAICharacter_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_AInsimulAICharacter_Statics::ClassParams = {
	&AInsimulAICharacter::StaticClass,
	"Game",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_AInsimulAICharacter_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulAICharacter_Statics::PropPointers),
	0,
	0x009000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulAICharacter_Statics::Class_MetaDataParams), Z_Construct_UClass_AInsimulAICharacter_Statics::Class_MetaDataParams)
};
void AInsimulAICharacter::StaticRegisterNativesAInsimulAICharacter()
{
	UClass* Class = AInsimulAICharacter::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_AInsimulAICharacter_Statics::Funcs));
}
UClass* Z_Construct_UClass_AInsimulAICharacter()
{
	if (!Z_Registration_Info_UClass_AInsimulAICharacter.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_AInsimulAICharacter.OuterSingleton, Z_Construct_UClass_AInsimulAICharacter_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_AInsimulAICharacter.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, AInsimulAICharacter);
AInsimulAICharacter::~AInsimulAICharacter() {}
// ********** End Class AInsimulAICharacter ********************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_AInsimulAICharacter, AInsimulAICharacter::StaticClass, TEXT("AInsimulAICharacter"), &Z_Registration_Info_UClass_AInsimulAICharacter, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(AInsimulAICharacter), 3719857338U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h__Script_InsimulRuntime_362510461{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
