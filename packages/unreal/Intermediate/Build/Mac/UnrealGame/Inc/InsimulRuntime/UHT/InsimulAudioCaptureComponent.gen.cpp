// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulAudioCaptureComponent.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulAudioCaptureComponent() {}

// ********** Begin Cross Module References ********************************************************
AUDIOCAPTURE_API UClass* Z_Construct_UClass_UAudioCaptureComponent_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_UActorComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulAudioCaptureComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulAudioCaptureComponent_NoRegister();
INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Delegate FOnInsimulCaptureEvent ************************************************
struct Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics
{
	struct _Script_InsimulRuntime_eventOnInsimulCaptureEvent_Parms
	{
		FString Message;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Message_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Delegate FOnInsimulCaptureEvent constinit property declarations ****************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Message;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Delegate FOnInsimulCaptureEvent constinit property declarations ******************
	static const UECodeGen_Private::FDelegateFunctionParams FuncParams;
};

// ********** Begin Delegate FOnInsimulCaptureEvent Property Definitions ***************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::NewProp_Message = { "Message", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(_Script_InsimulRuntime_eventOnInsimulCaptureEvent_Parms, Message), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Message_MetaData), NewProp_Message_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::NewProp_Message,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::PropPointers) < 2048);
// ********** End Delegate FOnInsimulCaptureEvent Property Definitions *****************************
const UECodeGen_Private::FDelegateFunctionParams Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UPackage__Script_InsimulRuntime, nullptr, "OnInsimulCaptureEvent__DelegateSignature", 	Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::PropPointers), 
sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulCaptureEvent_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x00130000, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::Function_MetaDataParams), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::_Script_InsimulRuntime_eventOnInsimulCaptureEvent_Parms) < MAX_uint16);
UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUDelegateFunction(&ReturnFunction, Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature_Statics::FuncParams);
	}
	return ReturnFunction;
}
void FOnInsimulCaptureEvent_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulCaptureEvent, const FString& Message)
{
	struct _Script_InsimulRuntime_eventOnInsimulCaptureEvent_Parms
	{
		FString Message;
	};
	_Script_InsimulRuntime_eventOnInsimulCaptureEvent_Parms Parms;
	Parms.Message=Message;
	OnInsimulCaptureEvent.ProcessMulticastDelegate<UObject>(&Parms);
}
// ********** End Delegate FOnInsimulCaptureEvent **************************************************

// ********** Begin Class UInsimulAudioCaptureComponent Function ClearBuffer ***********************
struct Z_Construct_UFunction_UInsimulAudioCaptureComponent_ClearBuffer_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul|Audio" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Clear the captured audio buffer */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Clear the captured audio buffer" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function ClearBuffer constinit property declarations ***************************
// ********** End Function ClearBuffer constinit property declarations *****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_ClearBuffer_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulAudioCaptureComponent, nullptr, "ClearBuffer", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_ClearBuffer_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulAudioCaptureComponent_ClearBuffer_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulAudioCaptureComponent_ClearBuffer()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulAudioCaptureComponent_ClearBuffer_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulAudioCaptureComponent::execClearBuffer)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ClearBuffer();
	P_NATIVE_END;
}
// ********** End Class UInsimulAudioCaptureComponent Function ClearBuffer *************************

// ********** Begin Class UInsimulAudioCaptureComponent Function GetCapturedAudio ******************
struct Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics
{
	struct InsimulAudioCaptureComponent_eventGetCapturedAudio_Parms
	{
		TArray<uint8> ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul|Audio" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Get the current captured audio buffer (for streaming while recording) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get the current captured audio buffer (for streaming while recording)" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetCapturedAudio constinit property declarations **********************
	static const UECodeGen_Private::FBytePropertyParams NewProp_ReturnValue_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetCapturedAudio constinit property declarations ************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetCapturedAudio Property Definitions *********************************
const UECodeGen_Private::FBytePropertyParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::NewProp_ReturnValue_Inner = { "ReturnValue", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAudioCaptureComponent_eventGetCapturedAudio_Parms, ReturnValue), EArrayPropertyFlags::None, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::NewProp_ReturnValue_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::PropPointers) < 2048);
// ********** End Function GetCapturedAudio Property Definitions ***********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulAudioCaptureComponent, nullptr, "GetCapturedAudio", 	Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::InsimulAudioCaptureComponent_eventGetCapturedAudio_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::InsimulAudioCaptureComponent_eventGetCapturedAudio_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulAudioCaptureComponent::execGetCapturedAudio)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(TArray<uint8>*)Z_Param__Result=P_THIS->GetCapturedAudio();
	P_NATIVE_END;
}
// ********** End Class UInsimulAudioCaptureComponent Function GetCapturedAudio ********************

// ********** Begin Class UInsimulAudioCaptureComponent Function IsCapturing ***********************
struct Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics
{
	struct InsimulAudioCaptureComponent_eventIsCapturing_Parms
	{
		bool ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul|Audio" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Check if currently recording */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Check if currently recording" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function IsCapturing constinit property declarations ***************************
	static void NewProp_ReturnValue_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function IsCapturing constinit property declarations *****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function IsCapturing Property Definitions **************************************
void Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::NewProp_ReturnValue_SetBit(void* Obj)
{
	((InsimulAudioCaptureComponent_eventIsCapturing_Parms*)Obj)->ReturnValue = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulAudioCaptureComponent_eventIsCapturing_Parms), &Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::NewProp_ReturnValue_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::PropPointers) < 2048);
// ********** End Function IsCapturing Property Definitions ****************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulAudioCaptureComponent, nullptr, "IsCapturing", 	Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::InsimulAudioCaptureComponent_eventIsCapturing_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::InsimulAudioCaptureComponent_eventIsCapturing_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulAudioCaptureComponent::execIsCapturing)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(bool*)Z_Param__Result=P_THIS->IsCapturing();
	P_NATIVE_END;
}
// ********** End Class UInsimulAudioCaptureComponent Function IsCapturing *************************

// ********** Begin Class UInsimulAudioCaptureComponent Function StartCapture **********************
struct Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics
{
	struct InsimulAudioCaptureComponent_eventStartCapture_Parms
	{
		bool ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul|Audio" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Start capturing audio from the default microphone */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Start capturing audio from the default microphone" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function StartCapture constinit property declarations **************************
	static void NewProp_ReturnValue_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function StartCapture constinit property declarations ****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function StartCapture Property Definitions *************************************
void Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::NewProp_ReturnValue_SetBit(void* Obj)
{
	((InsimulAudioCaptureComponent_eventStartCapture_Parms*)Obj)->ReturnValue = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulAudioCaptureComponent_eventStartCapture_Parms), &Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::NewProp_ReturnValue_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::PropPointers) < 2048);
// ********** End Function StartCapture Property Definitions ***************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulAudioCaptureComponent, nullptr, "StartCapture", 	Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::InsimulAudioCaptureComponent_eventStartCapture_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::InsimulAudioCaptureComponent_eventStartCapture_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulAudioCaptureComponent::execStartCapture)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(bool*)Z_Param__Result=P_THIS->StartCapture();
	P_NATIVE_END;
}
// ********** End Class UInsimulAudioCaptureComponent Function StartCapture ************************

// ********** Begin Class UInsimulAudioCaptureComponent Function StopCapture ***********************
struct Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics
{
	struct InsimulAudioCaptureComponent_eventStopCapture_Parms
	{
		TArray<uint8> ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul|Audio" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Stop capturing and return the recorded audio buffer */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Stop capturing and return the recorded audio buffer" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function StopCapture constinit property declarations ***************************
	static const UECodeGen_Private::FBytePropertyParams NewProp_ReturnValue_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function StopCapture constinit property declarations *****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function StopCapture Property Definitions **************************************
const UECodeGen_Private::FBytePropertyParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::NewProp_ReturnValue_Inner = { "ReturnValue", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Byte, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, nullptr, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulAudioCaptureComponent_eventStopCapture_Parms, ReturnValue), EArrayPropertyFlags::None, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::NewProp_ReturnValue_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::PropPointers) < 2048);
// ********** End Function StopCapture Property Definitions ****************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulAudioCaptureComponent, nullptr, "StopCapture", 	Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::InsimulAudioCaptureComponent_eventStopCapture_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::InsimulAudioCaptureComponent_eventStopCapture_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulAudioCaptureComponent::execStopCapture)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(TArray<uint8>*)Z_Param__Result=P_THIS->StopCapture();
	P_NATIVE_END;
}
// ********** End Class UInsimulAudioCaptureComponent Function StopCapture *************************

// ********** Begin Class UInsimulAudioCaptureComponent ********************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulAudioCaptureComponent;
UClass* UInsimulAudioCaptureComponent::GetPrivateStaticClass()
{
	using TClass = UInsimulAudioCaptureComponent;
	if (!Z_Registration_Info_UClass_UInsimulAudioCaptureComponent.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulAudioCaptureComponent"),
			Z_Registration_Info_UClass_UInsimulAudioCaptureComponent.InnerSingleton,
			StaticRegisterNativesUInsimulAudioCaptureComponent,
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
	return Z_Registration_Info_UClass_UInsimulAudioCaptureComponent.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulAudioCaptureComponent_NoRegister()
{
	return UInsimulAudioCaptureComponent::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintSpawnableComponent", "" },
		{ "ClassGroupNames", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * UInsimulAudioCaptureComponent \xe2\x80\x94 Wraps platform microphone APIs\n * for push-to-talk voice input to the Insimul conversation service.\n *\n * Attach alongside UInsimulConversationComponent on the player character.\n */" },
#endif
		{ "IncludePath", "InsimulAudioCaptureComponent.h" },
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "UInsimulAudioCaptureComponent \xe2\x80\x94 Wraps platform microphone APIs\nfor push-to-talk voice input to the Insimul conversation service.\n\nAttach alongside UInsimulConversationComponent on the player character." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SampleRate_MetaData[] = {
		{ "Category", "Insimul|Audio" },
		{ "ClampMax", "48000" },
		{ "ClampMin", "8000" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Audio sample rate for capture (default 16000 Hz) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Audio sample rate for capture (default 16000 Hz)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_NumChannels_MetaData[] = {
		{ "Category", "Insimul|Audio" },
		{ "ClampMax", "2" },
		{ "ClampMin", "1" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Number of audio channels (1 = mono, recommended for speech) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Number of audio channels (1 = mono, recommended for speech)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OnCaptureStarted_MetaData[] = {
		{ "Category", "Insimul|Audio|Events" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Fired when audio capture starts */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Fired when audio capture starts" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_OnCaptureStopped_MetaData[] = {
		{ "Category", "Insimul|Audio|Events" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Fired when audio capture stops */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Fired when audio capture stops" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_PlatformCapture_MetaData[] = {
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulAudioCaptureComponent.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulAudioCaptureComponent constinit property declarations ************
	static const UECodeGen_Private::FIntPropertyParams NewProp_SampleRate;
	static const UECodeGen_Private::FIntPropertyParams NewProp_NumChannels;
	static const UECodeGen_Private::FMulticastDelegatePropertyParams NewProp_OnCaptureStarted;
	static const UECodeGen_Private::FMulticastDelegatePropertyParams NewProp_OnCaptureStopped;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_PlatformCapture;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulAudioCaptureComponent constinit property declarations **************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("ClearBuffer"), .Pointer = &UInsimulAudioCaptureComponent::execClearBuffer },
		{ .NameUTF8 = UTF8TEXT("GetCapturedAudio"), .Pointer = &UInsimulAudioCaptureComponent::execGetCapturedAudio },
		{ .NameUTF8 = UTF8TEXT("IsCapturing"), .Pointer = &UInsimulAudioCaptureComponent::execIsCapturing },
		{ .NameUTF8 = UTF8TEXT("StartCapture"), .Pointer = &UInsimulAudioCaptureComponent::execStartCapture },
		{ .NameUTF8 = UTF8TEXT("StopCapture"), .Pointer = &UInsimulAudioCaptureComponent::execStopCapture },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulAudioCaptureComponent_ClearBuffer, "ClearBuffer" }, // 2548224925
		{ &Z_Construct_UFunction_UInsimulAudioCaptureComponent_GetCapturedAudio, "GetCapturedAudio" }, // 3215137663
		{ &Z_Construct_UFunction_UInsimulAudioCaptureComponent_IsCapturing, "IsCapturing" }, // 3727009221
		{ &Z_Construct_UFunction_UInsimulAudioCaptureComponent_StartCapture, "StartCapture" }, // 2032234490
		{ &Z_Construct_UFunction_UInsimulAudioCaptureComponent_StopCapture, "StopCapture" }, // 3531405272
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulAudioCaptureComponent>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics

// ********** Begin Class UInsimulAudioCaptureComponent Property Definitions ***********************
const UECodeGen_Private::FIntPropertyParams Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_SampleRate = { "SampleRate", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulAudioCaptureComponent, SampleRate), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SampleRate_MetaData), NewProp_SampleRate_MetaData) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_NumChannels = { "NumChannels", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulAudioCaptureComponent, NumChannels), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_NumChannels_MetaData), NewProp_NumChannels_MetaData) };
const UECodeGen_Private::FMulticastDelegatePropertyParams Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_OnCaptureStarted = { "OnCaptureStarted", nullptr, (EPropertyFlags)0x0010000010080000, UECodeGen_Private::EPropertyGenFlags::InlineMulticastDelegate, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulAudioCaptureComponent, OnCaptureStarted), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OnCaptureStarted_MetaData), NewProp_OnCaptureStarted_MetaData) }; // 1398525702
const UECodeGen_Private::FMulticastDelegatePropertyParams Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_OnCaptureStopped = { "OnCaptureStopped", nullptr, (EPropertyFlags)0x0010000010080000, UECodeGen_Private::EPropertyGenFlags::InlineMulticastDelegate, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulAudioCaptureComponent, OnCaptureStopped), Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_OnCaptureStopped_MetaData), NewProp_OnCaptureStopped_MetaData) }; // 1398525702
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_PlatformCapture = { "PlatformCapture", nullptr, (EPropertyFlags)0x0144000000080008, UECodeGen_Private::EPropertyGenFlags::Object | UECodeGen_Private::EPropertyGenFlags::ObjectPtr, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulAudioCaptureComponent, PlatformCapture), Z_Construct_UClass_UAudioCaptureComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_PlatformCapture_MetaData), NewProp_PlatformCapture_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_SampleRate,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_NumChannels,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_OnCaptureStarted,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_OnCaptureStopped,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::NewProp_PlatformCapture,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::PropPointers) < 2048);
// ********** End Class UInsimulAudioCaptureComponent Property Definitions *************************
UObject* (*const Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UActorComponent,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::ClassParams = {
	&UInsimulAudioCaptureComponent::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::PropPointers),
	0,
	0x00B000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::Class_MetaDataParams)
};
void UInsimulAudioCaptureComponent::StaticRegisterNativesUInsimulAudioCaptureComponent()
{
	UClass* Class = UInsimulAudioCaptureComponent::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulAudioCaptureComponent()
{
	if (!Z_Registration_Info_UClass_UInsimulAudioCaptureComponent.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulAudioCaptureComponent.OuterSingleton, Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulAudioCaptureComponent.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulAudioCaptureComponent);
UInsimulAudioCaptureComponent::~UInsimulAudioCaptureComponent() {}
// ********** End Class UInsimulAudioCaptureComponent **********************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulAudioCaptureComponent, UInsimulAudioCaptureComponent::StaticClass, TEXT("UInsimulAudioCaptureComponent"), &Z_Registration_Info_UClass_UInsimulAudioCaptureComponent, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulAudioCaptureComponent), 2510365159U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h__Script_InsimulRuntime_3695743311{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
